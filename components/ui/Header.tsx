'use client';

import React, { useState } from 'react';
import { Network, Plus, Trash2, Info, Key, Check, AlertCircle } from 'lucide-react';
import { UserSettings } from '@/lib/types';

interface HeaderProps {
  onNewChat: () => void;
  onClearChat: () => void;
  onOpenArchitecture: () => void;
  onOpenInfo: () => void;
  onOpenSettings: () => void;
  settings: UserSettings;
  hasServerKey?: boolean;
  hasMessages: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onNewChat,
  onClearChat,
  onOpenArchitecture,
  onOpenInfo,
  onOpenSettings,
  settings,
  hasServerKey = false,
  hasMessages,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const confirmClear = () => {
    onClearChat();
    setShowClearConfirm(false);
  };

  const hasGroqKey = Boolean((settings.groqApiKey && settings.groqApiKey.trim() !== '') || hasServerKey);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#ededed] bg-[#ffffff]/95 backdrop-blur-md">
      {/* Top tiny sunset stripe accent */}
      <div className="sunset-stripe-bar" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            {/* Brand Logo */}
            <img
              src="/logo.svg"
              alt="NEXUSCIENCE Logo"
              className="w-8 h-8 rounded-[8px] object-contain shrink-0"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#1f1f1f]">
                NEXUS<span className="text-[#fa520f]">CIENCE</span>
              </span>
              <span className="text-[10px] text-[#6a6a6a] uppercase tracking-wider font-semibold -mt-1 hidden sm:block">
                ReAct Frontier Agent
              </span>
            </div>
          </div>

          {/* Model Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-[#fff8e0] border border-[#e6d5a8] text-[#1f1f1f]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#fa520f]" />
            <span className="truncate max-w-[150px]">{settings.model}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* API Keys & Model Configuration Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium border transition-colors shadow-sm ${
              hasGroqKey
                ? 'bg-[#ffffff] hover:bg-[#fafafa] border-[#c7c7c7] text-[#1f1f1f]'
                : 'bg-[#fff8e0] hover:bg-[#fff0c2] border-[#fa520f] text-[#fa520f]'
            }`}
            title="Configure API Keys and Model"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="font-semibold">API Keys & Model</span>
            {hasGroqKey ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Key set" />
            ) : (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#fa520f] text-white">
                Set Key
              </span>
            )}
          </button>

          {/* Architecture / How it Works Button */}
          <button
            type="button"
            onClick={onOpenArchitecture}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium text-[#1f1f1f] hover:bg-[#fafafa] border border-[#c7c7c7] transition-colors"
            title="System Architecture & Flow"
          >
            <Network className="w-3.5 h-3.5 text-[#fa520f]" />
            <span className="hidden sm:inline">Architecture</span>
          </button>

          {/* Info Button */}
          <button
            type="button"
            onClick={onOpenInfo}
            className="p-2 rounded-[8px] text-[#6a6a6a] hover:text-[#1f1f1f] hover:bg-[#fafafa] border border-transparent hover:border-[#ededed] transition-colors"
            title="Product Info"
          >
            <Info className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-[#ededed] mx-0.5 sm:mx-1" />

          {/* New Chat Button (Mistral primary orange CTA) */}
          <button
            type="button"
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] text-xs font-medium text-white bg-[#fa520f] hover:bg-[#cc3a05] transition-colors shadow-sm"
            title="Start new conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>

          {/* Clear Chat Button */}
          {hasMessages && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="p-2 rounded-[8px] text-[#8a8a8a] hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div
            className="relative w-full max-w-sm rounded-[12px] border border-[#e5e5e5] bg-[#ffffff] p-5 text-[#1f1f1f] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-bold text-[#1f1f1f] mb-1.5">Reset Conversation?</h4>
            <p className="text-xs text-[#6a6a6a] mb-5 leading-relaxed">
              This will clear the current dialogue and reset conversation buffer memory.
            </p>
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-[8px] text-[#6a6a6a] hover:bg-[#ededed] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmClear}
                className="px-3.5 py-1.5 rounded-[8px] bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors shadow-sm"
              >
                Reset Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
