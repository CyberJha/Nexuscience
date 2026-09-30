'use client';

import React, { useState } from 'react';
import { User, Copy, Check, RotateCcw, AlertTriangle } from 'lucide-react';
import { ChatMessage } from '@/lib/types';
import { ToolActivityCard } from '@/components/tools/ToolActivityCard';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageItemProps {
  message: ChatMessage;
  isLast: boolean;
  isStreaming?: boolean;
  onRetry?: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isLast,
  isStreaming,
  onRetry,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isUser) {
    return (
      <div className="flex justify-end mb-6 group">
        <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%]">
          <div className="flex flex-col items-end">
            <div className="px-4 py-3 rounded-[12px] bg-[#1f1f1f] text-white text-[14.5px] leading-relaxed shadow-sm">
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
            <span className="text-[10px] text-[#8a8a8a] mt-1 px-1 font-mono">
              {formattedTime}
            </span>
          </div>
          <div className="w-8 h-8 rounded-[8px] bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-center shrink-0 text-[#1f1f1f] shadow-xs">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex justify-start mb-6 group">
      <div className="flex items-start gap-2.5 max-w-full sm:max-w-[90%] w-full">
        {/* Assistant Avatar */}
        <img
          src="/logo.svg"
          alt="NEXUSCIENCE"
          className="w-8 h-8 rounded-[8px] object-contain shrink-0"
        />

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          <div className="p-4 sm:p-5 rounded-[12px] bg-[#ffffff] border border-[#ededed] shadow-xs text-[#1f1f1f]">
            {/* Tool activity indicators if any tools were called */}
            {message.toolEvents && message.toolEvents.length > 0 && (
              <div className="mb-3 space-y-1.5">
                {message.toolEvents.map((toolEv) => (
                  <ToolActivityCard key={toolEv.id} event={toolEv} />
                ))}
              </div>
            )}

            {/* Error banner if message failed */}
            {message.error && (
              <div className="p-3 mb-3 rounded-[8px] border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block mb-0.5">Execution Alert</span>
                  <span>{message.error}</span>
                </div>
              </div>
            )}

            {/* Main response text with Markdown */}
            {message.content ? (
              <MarkdownRenderer content={message.content} />
            ) : isStreaming ? (
              <span className="inline-block w-2 h-4 bg-[#fa520f] animate-pulse rounded-xs" />
            ) : null}
          </div>

          {/* Assistant Action Bar */}
          <div className="flex items-center gap-3 mt-1.5 px-2 text-[11px] text-[#8a8a8a]">
            <span className="font-mono">{formattedTime}</span>

            {message.content && !isStreaming && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 hover:text-[#fa520f] transition-colors"
                title="Copy response"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}

            {isLast && onRetry && !isStreaming && (
              <button
                type="button"
                onClick={onRetry}
                className="flex items-center gap-1 hover:text-[#fa520f] transition-colors"
                title="Retry response"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
