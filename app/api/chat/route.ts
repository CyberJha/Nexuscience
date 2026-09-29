import { NextRequest } from 'next/server';
import { runReactAgent } from '@/lib/agent/reactAgent';
import { SSEEvent, ChatApiRequest } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatApiRequest;
    const { messages = [], model, groqApiKey, tavilyApiKey } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one message is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user' || !lastMessage.content.trim()) {
      return new Response(
        JSON.stringify({ error: 'The latest message must be a non-empty user prompt.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Separate current question from conversation history
    const currentQuestion = lastMessage.content.trim();
    const history = messages.slice(0, -1);

    // Validate GROQ_API_KEY presence (either user provided or server-side env)
    const effectiveGroqKey = (groqApiKey && groqApiKey.trim() !== '') ? groqApiKey.trim() : process.env.GROQ_API_KEY;
    if (!effectiveGroqKey) {
      return new Response(
        JSON.stringify({
          error:
            'GROQ API Key is missing. Please click "API Keys & Model" in the top bar to enter your key.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a streaming SSE response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        function sendEvent(event: SSEEvent) {
          const payload = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        }

        try {
          await runReactAgent({
            currentQuestion,
            history,
            model,
            groqApiKey: effectiveGroqKey,
            tavilyApiKey,
            onEvent: sendEvent,
            signal: req.signal,
          });
        } catch (error: unknown) {
          const errMsg = error instanceof Error ? error.message : String(error);
          console.error('[API /api/chat error]:', error);

          // Deliver safe error event to frontend
          sendEvent({
            type: 'error',
            message: sanitizeErrorMessage(errMsg),
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error('[API /api/chat Top-Level Error]:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return new Response(
      JSON.stringify({ error: sanitizeErrorMessage(msg) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Strips raw internal stack traces, API keys, or sensitive details before returning to users.
 */
function sanitizeErrorMessage(raw: string): string {
  if (raw.includes('GROQ') || raw.includes('TAVILY')) {
    return raw;
  }
  if (raw.includes('401') || raw.toLowerCase().includes('unauthorized') || raw.toLowerCase().includes('invalid api key')) {
    return 'Authentication failed with the AI service. Please verify your Groq API key in API Settings.';
  }
  if (raw.includes('429') || raw.toLowerCase().includes('rate limit')) {
    return 'Rate limit exceeded on the AI service. Please wait a moment and try again.';
  }
  if (raw.toLowerCase().includes('timeout') || raw.toLowerCase().includes('econnrefused')) {
    return 'Connection to the AI service timed out. Please check your network connection and retry.';
  }
  if (raw.includes('aborted')) {
    return 'Request was stopped.';
  }
  return raw;
}
