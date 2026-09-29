import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasGroqKey = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '');
  const hasTavilyKey = Boolean(process.env.TAVILY_API_KEY && process.env.TAVILY_API_KEY.trim() !== '');
  const defaultModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  return NextResponse.json({
    hasGroqKey,
    hasTavilyKey,
    defaultModel,
  });
}
