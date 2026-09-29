'use client';

import React, { useRef, useEffect } from 'react';
import { ArrowUp, Square } from 'lucide-react';

interface ChatComposerProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (text: string) => void;
  onStop?: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  input,
  setInput,
  onSend,
  onStop,
  isLoading,
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSend(input);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading && onStop) {
      onStop();
      return;
    }
    if (!isLoading && input.trim()) {
      onSend(input);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 sm:pb-6">
      <form
        onSubmit={handleSubmit}
        className="relative rounded-[12px] border border-[#c7c7c7] bg-[#ffffff] shadow-lg transition-all duration-150 focus-within:border-[#fa520f] focus-within:ring-2 focus-within:ring-[#fa520f]/20"
      >
        <div className="flex items-end p-2.5 sm:p-3 gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask NEXUSCIENCE anything... (e.g. math calculation, Wikipedia query, or live web search)"
            className="w-full bg-transparent text-[#1f1f1f] placeholder:text-[#8a8a8a] text-sm sm:text-[14.5px] leading-relaxed resize-none outline-none px-2 py-1 max-h-[160px] overflow-y-auto"
            aria-label="Ask NEXUSCIENCE query"
          />

          <div className="flex items-center gap-1.5 shrink-0">
            {isLoading ? (
              <button
                type="button"
                onClick={onStop}
                className="flex items-center justify-center w-9 h-9 rounded-[8px] bg-[#1f1f1f] hover:bg-[#3d3d3d] text-white transition-colors shadow-xs"
                title="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || disabled}
                className={`flex items-center justify-center w-9 h-9 rounded-[8px] transition-all duration-150 shadow-xs ${
                  input.trim() && !disabled
                    ? 'bg-[#fa520f] hover:bg-[#cc3a05] text-white active:scale-95'
                    : 'bg-[#ededed] text-[#a8a8a8] cursor-not-allowed'
                }`}
                title="Send query"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-4 pb-2 pt-0.5 text-[11px] text-[#8a8a8a] border-t border-[#ededed]/60">
          <span className="hidden sm:inline">
            Press <kbd className="px-1 py-0.5 rounded-[4px] bg-[#fafafa] border border-[#e5e5e5] font-mono text-[10px] text-[#4a4a4a]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded-[4px] bg-[#fafafa] border border-[#e5e5e5] font-mono text-[10px] text-[#4a4a4a]">Shift + Enter</kbd> for newline
          </span>
          <span className="text-[10px] text-[#8a8a8a] ml-auto font-mono">
            {input.length > 0 ? `${input.length} chars` : 'ReAct Autonomous Reasoning'}
          </span>
        </div>
      </form>
    </div>
  );
};
