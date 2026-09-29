'use client';

import React from 'react';
import { Calculator, BookOpen, Globe, ArrowUpRight, Sparkles, Key } from 'lucide-react';
import { UserSettings } from '@/lib/types';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
  onOpenSettings: () => void;
  settings: UserSettings;
  hasServerKey?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onSelectPrompt,
  onOpenSettings,
  settings,
  hasServerKey = false,
}) => {
  const examplePrompts = [
    {
      category: 'Mathematical Reasoning',
      title: 'Calculate square root',
      prompt: 'Calculate the square root of 144.',
      icon: <Calculator className="w-4 h-4 text-[#fa520f]" />,
      toolTag: 'calculator',
    },
    {
      category: 'Knowledge Retrieval',
      title: 'Wikipedia encyclopedia',
      prompt: 'Explain who Alan Turing was using Wikipedia.',
      icon: <BookOpen className="w-4 h-4 text-[#ffa110]" />,
      toolTag: 'wikipedia_search',
    },
    {
      category: 'Live Web Discovery',
      title: 'Tavily web intelligence',
      prompt: 'Search the web for the latest developments in artificial intelligence.',
      icon: <Globe className="w-4 h-4 text-[#ff8105]" />,
      toolTag: 'web_search',
    },
  ];

  const hasGroqKey = Boolean((settings.groqApiKey && settings.groqApiKey.trim() !== '') || hasServerKey);

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] max-w-3xl mx-auto px-4 text-center my-auto animate-fade-in select-none">
      {/* Eyebrow badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#e6d5a8] bg-[#fff8e0] text-[#1f1f1f] text-xs font-medium mb-5 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-[#fa520f]" />
        <span className="font-semibold uppercase tracking-wider text-[11px] text-[#fa520f]">
          ReAct Autonomous Agent
        </span>
        <span className="text-[#a8a8a8]">•</span>
        <span className="font-mono text-[11px] text-[#3d3d3d]">{settings.model}</span>
      </div>

      {/* Hero Display in Editorial Serif Typography */}
      <h1 className="font-editorial text-4xl sm:text-6xl font-normal tracking-tight text-[#1f1f1f] mb-4 leading-[1.08]">
        Frontier reasoning. <br className="hidden sm:inline" />
        <span className="italic text-[#fa520f]">In your hands.</span>
      </h1>

      <p className="text-base sm:text-lg text-[#4a4a4a] max-w-xl mb-3 leading-relaxed font-normal">
        An intelligent AI assistant that reasons through complex questions by dynamically executing specialized tools: math calculation, Wikipedia encyclopedia lookup, and live web discovery.
      </p>

      {/* API Key prompt if not configured */}
      {!hasGroqKey && (
        <div className="mb-8 p-3 rounded-[12px] bg-[#fff8e0] border border-[#e6d5a8] flex items-center gap-3 text-left max-w-md w-full shadow-sm">
          <div className="p-2 rounded-[8px] bg-[#fa520f] text-white shrink-0">
            <Key className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[#1f1f1f]">Configure your Groq API Key</div>
            <div className="text-[11px] text-[#6a6a6a]">Enter your key to start executing autonomous reasoning</div>
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            className="px-3 py-1.5 rounded-[8px] bg-[#fa520f] hover:bg-[#cc3a05] text-white text-xs font-medium transition-colors shrink-0 shadow-xs"
          >
            Enter Key
          </button>
        </div>
      )}

      {/* 3 Mistral Cream Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full text-left mt-2">
        {examplePrompts.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(item.prompt)}
            className="group flex flex-col justify-between p-4.5 rounded-[12px] border border-[#e6d5a8] bg-[#fff8e0] hover:bg-[#fff0c2] hover:border-[#fa520f] transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-[10px] font-semibold bg-[#ffffff] border border-[#e6d5a8] text-[#1f1f1f]">
                  {item.icon}
                  {item.category}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#8a8a8a] group-hover:text-[#fa520f] transition-colors" />
              </div>
              <p className="text-xs text-[#1f1f1f] font-medium leading-relaxed">
                &ldquo;{item.prompt}&rdquo;
              </p>
            </div>
            <span className="text-[11px] text-[#fa520f] font-medium mt-4 flex items-center gap-1">
              Load prompt →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
