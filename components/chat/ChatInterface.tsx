'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ToolEvent, AgentStatusType, SSEEvent, UserSettings } from '@/lib/types';
import { MessageItem } from './MessageItem';
import { ChatComposer } from './ChatComposer';
import { EmptyState } from './EmptyState';
import { AgentStatusIndicator } from '@/components/tools/AgentStatusIndicator';
import { Header } from '@/components/ui/Header';
import { ArchitectureModal } from '@/components/architecture/ArchitectureModal';
import { SystemInfoModal } from '@/components/ui/SystemInfoModal';
import { ApiKeySettingsModal } from '@/components/settings/ApiKeySettingsModal';

const DEFAULT_SETTINGS: UserSettings = {
  groqApiKey: '',
  tavilyApiKey: '',
  model: 'openai/gpt-oss-120b',
};

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatusType>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  const [serverConfig, setServerConfig] = useState<{ hasGroqKey: boolean; hasTavilyKey: boolean; defaultModel: string }>({
    hasGroqKey: false,
    hasTavilyKey: false,
    defaultModel: 'openai/gpt-oss-120b',
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user settings from localStorage on client mount and check server config
  useEffect(() => {
    try {
      const storedGroq = localStorage.getItem('nexus_groq_key') || '';
      const storedTavily = localStorage.getItem('nexus_tavily_key') || '';
      const storedModel = localStorage.getItem('nexus_model') || 'openai/gpt-oss-120b';

      setSettings({
        groqApiKey: storedGroq,
        tavilyApiKey: storedTavily,
        model: storedModel,
      });
    } catch {
      // localStorage may fail in private mode
    }

    fetch('/api/config')
      .then((r) => r.json())
      .then((cfg) => {
        setServerConfig(cfg);
        if (cfg.defaultModel && !localStorage.getItem('nexus_model')) {
          setSettings((prev) => ({ ...prev, model: cfg.defaultModel }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('nexus_groq_key', newSettings.groqApiKey);
      localStorage.setItem('nexus_tavily_key', newSettings.tavilyApiKey);
      localStorage.setItem('nexus_model', newSettings.model);
    } catch {
      // ignore
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, agentStatus]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    setInput('');

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    const assistantId = `msg_${Date.now()}_assistant`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      toolEvents: [],
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages([...updatedMessages, initialAssistantMessage]);

    setIsLoading(true);
    setAgentStatus('thinking');
    setStatusMessage(`Reasoning with ${settings.model}...`);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: settings.model,
          groqApiKey: settings.groqApiKey,
          tavilyApiKey: settings.tavilyApiKey,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errMessage = `Server error HTTP ${response.status}`;
        try {
          const json = await response.json();
          errMessage = json.error || errMessage;
        } catch {
          // ignore
        }
        // If missing key error, trigger settings modal
        if (errMessage.includes('GROQ API Key is missing')) {
          setIsSettingsOpen(true);
        }
        throw new Error(errMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to acquire response stream reader.');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6);
            try {
              const event: SSEEvent = JSON.parse(dataStr);
              handleSSEEvent(event, assistantId);
            } catch (jsonErr) {
              console.warn('[SSE Parse Error]:', jsonErr, dataStr);
            }
          }
        }
      }
    } catch (error: unknown) {
      if (controller.signal.aborted) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content: msg.content
                    ? `${msg.content}\n\n*(Generation stopped by user)*`
                    : '*(Generation stopped by user)*',
                }
              : msg
          )
        );
      } else {
        const errMsg = error instanceof Error ? error.message : String(error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, error: errMsg }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      setAgentStatus('idle');
      setStatusMessage('');
      abortControllerRef.current = null;
    }
  };

  const handleSSEEvent = (event: SSEEvent, assistantId: string) => {
    switch (event.type) {
      case 'status':
        setAgentStatus(event.status);
        setStatusMessage(event.message);
        break;

      case 'tool_start': {
        const newToolEvent: ToolEvent = {
          id: event.id,
          tool: event.tool,
          toolInput: event.input,
          status: 'running',
          timestamp: Date.now(),
        };
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  toolEvents: [...(msg.toolEvents || []), newToolEvent],
                }
              : msg
          )
        );
        break;
      }

      case 'tool_end':
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  toolEvents: (msg.toolEvents || []).map((t) =>
                    t.id === event.id
                      ? {
                          ...t,
                          status: event.output.includes('Error') || event.output.includes('failed') ? 'error' : 'completed',
                          toolOutput: event.output,
                        }
                      : t
                  ),
                }
              : msg
          )
        );
        break;

      case 'token':
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content: (msg.content || '') + event.token,
                }
              : msg
          )
        );
        break;

      case 'final':
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content: event.output,
                }
              : msg
          )
        );
        break;

      case 'error':
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  error: event.message,
                }
              : msg
          )
        );
        if (event.message.includes('GROQ') || event.message.includes('API key')) {
          setIsSettingsOpen(true);
        }
        break;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleNewChat = () => {
    handleStop();
    setMessages([]);
    setInput('');
  };

  const handleClearChat = () => {
    handleStop();
    setMessages([]);
    setInput('');
  };

  const handleRetry = () => {
    if (isLoading || messages.length === 0) return;

    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex !== -1) {
      const lastUserPrompt = messages[lastUserIndex].content;
      const trimmedHistory = messages.slice(0, lastUserIndex);
      setMessages(trimmedHistory);
      handleSend(lastUserPrompt);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-mistral-sunset-ambient text-[#1f1f1f]">
      {/* Top Header */}
      <Header
        onNewChat={handleNewChat}
        onClearChat={handleClearChat}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        settings={settings}
        hasServerKey={serverConfig.hasGroqKey}
        hasMessages={hasMessages}
      />

      {/* Main Conversation Area */}
      <main className="flex-1 flex flex-col justify-between max-w-5xl w-full mx-auto px-3 sm:px-6">
        <div className="flex-1 py-6">
          {!hasMessages ? (
            <EmptyState
              onSelectPrompt={(prompt) => setInput(prompt)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              settings={settings}
              hasServerKey={serverConfig.hasGroqKey}
            />
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  isLast={index === messages.length - 1}
                  isStreaming={isLoading && index === messages.length - 1}
                  onRetry={handleRetry}
                />
              ))}

              {/* Status Indicator */}
              {isLoading && (
                <div className="pl-10">
                  <AgentStatusIndicator
                    status={agentStatus}
                    message={statusMessage}
                  />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Composer */}
        <div className="sticky bottom-0 bg-gradient-to-t from-[#ffffff] via-[#ffffff]/90 to-transparent pt-3 pb-2 z-30">
          <ChatComposer
            input={input}
            setInput={setInput}
            onSend={handleSend}
            onStop={handleStop}
            isLoading={isLoading}
          />
        </div>
      </main>

      {/* Signature Mistral Sunset Stripe Horizontal Band */}
      <div className="sunset-stripe-bar" />

      {/* Minimal Footer */}
      <footer className="w-full bg-[#fff8e0] border-t border-[#e6d5a8] py-4 px-6 text-center text-xs text-[#6a6a6a]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1f1f1f]">NEXUSCIENCE</span>
            <span>•</span>
            <span>Autonomous Tool-Using ReAct Agent</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-[#fa520f] hover:underline"
            >
              Model: {settings.model}
            </button>
            <span>•</span>
            <button
              onClick={() => setIsArchitectureOpen(true)}
              className="text-[#1f1f1f] hover:underline"
            >
              Architecture
            </button>
          </div>
        </div>
      </footer>

      {/* API Key & Model Settings Modal */}
      <ApiKeySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      {/* Architecture Visual Explanation Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* System Information Modal */}
      <SystemInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />
    </div>
  );
};
