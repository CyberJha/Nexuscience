import { buildReactPrompt } from './prompts';
import { formatConversationBuffer, ChatHistoryMessage } from './memory';
import { TOOLS } from '@/lib/tools';
import { ToolType, AgentStep, SSEEvent } from '@/lib/types';

export interface AgentRunOptions {
  currentQuestion: string;
  history?: ChatHistoryMessage[];
  model?: string;
  groqApiKey?: string;
  tavilyApiKey?: string;
  onEvent?: (event: SSEEvent) => void;
  signal?: AbortSignal;
}

export interface AgentRunResult {
  output: string;
  steps: AgentStep[];
}

const DEFAULT_MODEL = 'openai/gpt-oss-120b';
const FALLBACK_MODEL = 'llama-3.3-70b-versatile';
const MAX_ITERATIONS = 6;

/**
 * Executes the ReAct Agent matching LangChain AgentExecutor
 * verbose=True, max_iterations=6, handle_parsing_errors=True
 */
export async function runReactAgent(options: AgentRunOptions): Promise<AgentRunResult> {
  const { currentQuestion, history = [], groqApiKey, tavilyApiKey, onEvent, signal } = options;

  const apiKey = (groqApiKey && groqApiKey.trim() !== '') ? groqApiKey.trim() : process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    const errorMsg =
      'GROQ API Key is missing. Please click "API Keys & Model" at the top to configure your Groq key.';
    onEvent?.({ type: 'error', message: errorMsg, code: 'MISSING_GROQ_KEY' });
    throw new Error(errorMsg);
  }

  let selectedModel = options.model?.trim() || process.env.GROQ_MODEL || DEFAULT_MODEL;

  onEvent?.({
    type: 'status',
    status: 'thinking',
    message: `Analyzing question with ${selectedModel}...`,
  });

  const conversationContext = formatConversationBuffer(history);
  let scratchpad = '';
  const recordedSteps: AgentStep[] = [];
  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    if (signal?.aborted) {
      throw new Error('Request aborted by user.');
    }

    iterations++;

    const prompt = buildReactPrompt(currentQuestion, scratchpad, conversationContext);

    // Call Groq LLM
    let responseText = '';
    try {
      responseText = await callGroqLlm(prompt, apiKey, selectedModel, signal);
    } catch (llmErr: any) {
      // If the specific model returned 404 or model not found, try fallback
      if (
        (llmErr.message?.includes('404') ||
          llmErr.message?.includes('model') ||
          llmErr.message?.includes('not found')) &&
        selectedModel !== FALLBACK_MODEL
      ) {
        console.warn(`[Agent] Model ${selectedModel} failed. Falling back to ${FALLBACK_MODEL}`);
        selectedModel = FALLBACK_MODEL;
        responseText = await callGroqLlm(prompt, apiKey, selectedModel, signal);
      } else {
        throw llmErr;
      }
    }

    // Parse the ReAct output
    const parsed = parseReactResponse(responseText);

    // If Final Answer is reached
    if (parsed.isFinal) {
      onEvent?.({
        type: 'status',
        status: 'preparing_answer',
        message: 'Synthesizing final answer...',
      });

      // Stream the final answer tokens for smooth display
      await streamTextChunks(parsed.finalAnswer, onEvent, signal);

      onEvent?.({
        type: 'final',
        output: parsed.finalAnswer,
        steps: recordedSteps,
      });

      return {
        output: parsed.finalAnswer,
        steps: recordedSteps,
      };
    }

    // If Parsing Error (missing Action or malformed ReAct block)
    if (parsed.isError) {
      scratchpad += `\n${responseText.trim()}\nObservation: Invalid Format: Missing 'Action:' after 'Thought:'. Please provide an Action and Action Input or Final Answer.\nThought:`;
      continue;
    }

    // Tool Execution step
    if (parsed.action && parsed.actionInput !== undefined) {
      const toolName = parsed.action as ToolType;
      const toolDef = TOOLS[toolName];

      if (!toolDef) {
        scratchpad += `\n${responseText.trim()}\nObservation: Error: Tool '${parsed.action}' is not an available tool. Must be one of [calculator, wikipedia_search, web_search].\nThought:`;
        continue;
      }

      const stepRecord: AgentStep = {
        thought: parsed.thought,
        action: toolName,
        actionInput: parsed.actionInput,
      };

      // Emit status event
      const statusType = getStatusForTool(toolName);
      const statusMsg = getStatusMessageForTool(toolName, parsed.actionInput);
      onEvent?.({
        type: 'status',
        status: statusType,
        message: statusMsg,
      });

      const eventId = `tool_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      onEvent?.({
        type: 'tool_start',
        id: eventId,
        tool: toolName,
        input: parsed.actionInput,
      });

      // Run tool with execution context
      let toolObservation = '';
      try {
        toolObservation = await toolDef.execute(parsed.actionInput, { tavilyApiKey });
      } catch (err: unknown) {
        toolObservation = `Error executing tool: ${err instanceof Error ? err.message : String(err)}`;
      }

      stepRecord.observation = toolObservation;
      recordedSteps.push(stepRecord);

      onEvent?.({
        type: 'tool_end',
        id: eventId,
        tool: toolName,
        input: parsed.actionInput,
        output: toolObservation,
      });

      // Append to scratchpad for next iteration
      scratchpad += ` ${parsed.thought}\nAction: ${toolName}\nAction Input: ${parsed.actionInput}\nObservation: ${toolObservation}\nThought:`;
      
      onEvent?.({
        type: 'status',
        status: 'thinking',
        message: 'Reasoning about tool observation...',
      });
    } else {
      // Fallback: If no action was detected, treat as final answer or prompt
      const fallbackAnswer = responseText.replace(/Thought:/i, '').trim();
      onEvent?.({
        type: 'final',
        output: fallbackAnswer,
        steps: recordedSteps,
      });
      return {
        output: fallbackAnswer,
        steps: recordedSteps,
      };
    }
  }

  // If reached max iterations without final answer
  const maxIterMessage =
    'Agent reached maximum reasoning iterations (6). Please try simplifying your question or being more specific.';
  onEvent?.({
    type: 'final',
    output: maxIterMessage,
    steps: recordedSteps,
  });

  return {
    output: maxIterMessage,
    steps: recordedSteps,
  };
}

async function callGroqLlm(
  prompt: string,
  apiKey: string,
  model: string,
  signal?: AbortSignal
): Promise<string> {
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      // We stop at Observation: so the model waits for the actual tool output!
      stop: ['Observation:', '\nObservation:'],
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = `Groq API Error: HTTP ${response.status}`;
    try {
      const json = JSON.parse(errorText);
      message = json.error?.message || message;
    } catch {
      // use raw text
    }
    throw new Error(message);
  }

  const data = await response.json();
  const choice = data.choices?.[0]?.message;
  const content = choice?.content || '';
  const reasoning = choice?.reasoning || '';
  
  // Combine reasoning and content so reasoning models (like gpt-oss-120b) never drop thoughts/actions
  const combined = [reasoning, content].filter(Boolean).join('\n').trim();
  return combined;
}

interface ParsedReAct {
  thought: string;
  action?: string;
  actionInput?: string;
  isFinal: boolean;
  finalAnswer: string;
  isError: boolean;
}

function parseReactResponse(text: string): ParsedReAct {
  const trimmed = text.trim();

  // Check for Final Answer:
  const finalAnswerRegex = /Final Answer:\s*([\s\S]*)$/i;
  const finalMatch = trimmed.match(finalAnswerRegex);
  if (finalMatch) {
    const finalAnswer = finalMatch[1].trim();
    return {
      thought: trimmed.split(/Final Answer:/i)[0].replace(/^Thought:\s*/i, '').trim(),
      isFinal: true,
      finalAnswer,
      isError: false,
    };
  }

  // Parse Action & Action Input
  const actionRegex = /Action:\s*([a-zA-Z0-9_-]+)/i;
  const actionInputRegex = /Action Input:\s*([^\n\r]+)/i;

  const actionMatch = trimmed.match(actionRegex);
  const inputMatch = trimmed.match(actionInputRegex);

  if (actionMatch && inputMatch) {
    const action = actionMatch[1].trim();
    let actionInput = inputMatch[1].trim();

    // Clean trailing notes that reasoning models append without newline
    actionInput = actionInput.replace(/(?:We need to|Now wait|wait for|Observation|Thought).*$/i, '').trim();

    // For calculator, cleanly isolate mathematical expressions
    if (action === 'calculator') {
      const mathMatch = actionInput.match(/^([0-9+\-*/%^().\s]|math\.[a-z]+)+/i);
      if (mathMatch && mathMatch[0].trim()) {
        actionInput = mathMatch[0].trim();
      }
    }

    const thought = trimmed.split(/Action:/i)[0].replace(/^Thought:\s*/i, '').trim();

    return {
      thought,
      action,
      actionInput,
      isFinal: false,
      finalAnswer: '',
      isError: false,
    };
  }

  // If it didn't specify Action: but has Thought:
  if (/Thought:/i.test(trimmed) && !/Action:/i.test(trimmed)) {
    return {
      thought: trimmed.replace(/^Thought:\s*/i, '').trim(),
      isFinal: false,
      finalAnswer: '',
      isError: true,
    };
  }

  // If text starts directly without format, check if it's answer
  let fallbackAnswer = trimmed;
  fallbackAnswer = fallbackAnswer.replace(/^(?:We have|We need to|Based on the observation|Now we|I now have)[^\n]*\n+/i, '').trim();

  return {
    thought: '',
    isFinal: true,
    finalAnswer: fallbackAnswer,
    isError: false,
  };
}

function getStatusForTool(tool: ToolType) {
  switch (tool) {
    case 'calculator':
      return 'using_calculator' as const;
    case 'wikipedia_search':
      return 'searching_wikipedia' as const;
    case 'web_search':
      return 'searching_web' as const;
  }
}

function getStatusMessageForTool(tool: ToolType, input: string) {
  const displayInput = input.length > 40 ? input.slice(0, 37) + '...' : input;
  switch (tool) {
    case 'calculator':
      return `Calculating: ${displayInput}`;
    case 'wikipedia_search':
      return `Searching Wikipedia for "${displayInput}"`;
    case 'web_search':
      return `Searching the web for "${displayInput}"`;
  }
}

async function streamTextChunks(
  text: string,
  onEvent?: (event: SSEEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  if (!onEvent || !text) return;

  const words = text.split(/(\s+)/);
  for (let i = 0; i < words.length; i += 3) {
    if (signal?.aborted) return;
    const chunk = words.slice(i, i + 3).join('');
    onEvent({ type: 'token', token: chunk });
    await new Promise((r) => setTimeout(r, 12));
  }
}
