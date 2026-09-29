import { formatToolsForPrompt, getToolNames } from '@/lib/tools';

export function buildReactPrompt(
  currentQuestion: string,
  scratchpad: string = '',
  conversationContext: string = ''
): string {
  const toolsFormatted = formatToolsForPrompt();
  const toolNames = getToolNames().join(', ');

  const contextSection = conversationContext.trim()
    ? `\nRelevant Prior Conversation History:\n${conversationContext.trim()}\n`
    : '';

  return `You are a helpful AI assistant. Answer the question using the tools available.

You have access to these tools:
${toolsFormatted}

Use EXACTLY this format:

Question: the input question
Thought: think about what to do
Action: one of [${toolNames}]
Action Input: input to the action
Observation: result of the action
... (repeat Thought/Action/Action Input/Observation as needed)
Thought: I now know the final answer
Final Answer: the final answer to the question

Important rules:
- Always start with Thought:
- Action must be exactly one of the tool names listed: ${toolNames}
- Always end with Final Answer:
- When using tools, produce ONLY ONE Thought and Action per step and wait for the Observation
${contextSection}
Begin!

Question: ${currentQuestion}
Thought:${scratchpad}`;
}
