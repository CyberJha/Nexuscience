import { executeCalculator } from './calculator';
import { executeWikipediaSearch } from './wikipedia';
import { executeWebSearch } from './tavily';
import { ToolType } from '@/lib/types';

export interface ToolExecutionContext {
  tavilyApiKey?: string;
}

export interface ToolDefinition {
  name: ToolType;
  description: string;
  execute: (input: string, context?: ToolExecutionContext) => Promise<string> | string;
}

export const TOOLS: Record<ToolType, ToolDefinition> = {
  calculator: {
    name: 'calculator',
    description: `Useful for solving math calculations.
Input must be a valid math expression.
Examples: '2 + 2', 'math.sqrt(144)', '15 * 4 / 2'`,
    execute: (input: string) => executeCalculator(input),
  },
  wikipedia_search: {
    name: 'wikipedia_search',
    description: `Search Wikipedia for factual information about a person,
place, historical event, scientific concept, technology,
or other general topic.

Input should be a topic such as 'Albert Einstein',
'Machine Learning', or 'Daniel Radcliffe'.`,
    execute: (input: string) => executeWikipediaSearch(input),
  },
  web_search: {
    name: 'web_search',
    description: `Search the live web for current or recent information.

Use this when the user asks about recent news,
current events, latest information, or information
that may not be available in the local knowledge base.

Input should be a natural-language search query.`,
    execute: (input: string, context?: ToolExecutionContext) => executeWebSearch(input, 3, context?.tavilyApiKey),
  },
};

export function getToolNames(): string[] {
  return Object.keys(TOOLS);
}

export function formatToolsForPrompt(): string {
  return Object.values(TOOLS)
    .map((t) => `${t.name}: ${t.description.replace(/\n/g, ' ')}`)
    .join('\n');
}
