export type Role = 'user' | 'assistant' | 'system';

export type ToolType = 'calculator' | 'wikipedia_search' | 'web_search';

export interface ToolEvent {
  id: string;
  tool: ToolType;
  toolInput: string;
  toolOutput?: string;
  status: 'running' | 'completed' | 'error';
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  toolEvents?: ToolEvent[];
  error?: string;
  timestamp: number;
}

export type AgentStatusType =
  | 'idle'
  | 'thinking'
  | 'using_calculator'
  | 'searching_wikipedia'
  | 'searching_web'
  | 'preparing_answer'
  | 'error';

export interface AgentStep {
  thought: string;
  action?: ToolType;
  actionInput?: string;
  observation?: string;
}

export interface ChatApiRequest {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  groqApiKey?: string;
  tavilyApiKey?: string;
}

export type SSEEvent =
  | { type: 'status'; message: string; status: AgentStatusType }
  | { type: 'tool_start'; id: string; tool: ToolType; input: string }
  | { type: 'tool_end'; id: string; tool: ToolType; input: string; output: string }
  | { type: 'token'; token: string }
  | { type: 'final'; output: string; steps: AgentStep[] }
  | { type: 'error'; message: string; code?: string };

export interface UserSettings {
  groqApiKey: string;
  tavilyApiKey: string;
  model: string;
}
