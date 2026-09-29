'use client';

import React, { useState } from 'react';
import { Calculator, BookOpen, Globe, ChevronDown, ChevronUp, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { ToolEvent, ToolType } from '@/lib/types';

interface ToolActivityCardProps {
  event: ToolEvent;
}

export const ToolActivityCard: React.FC<ToolActivityCardProps> = ({ event }) => {
  const [expanded, setExpanded] = useState(false);

  const getToolConfig = (type: ToolType) => {
    switch (type) {
      case 'calculator':
        return {
          name: 'Calculator Tool',
          icon: <Calculator className="w-3.5 h-3.5 text-[#fa520f]" />,
          color: 'text-[#fa520f]',
          borderColor: 'border-[#fa520f]/20',
          bgColor: 'bg-[#fff8e0]/60',
          badgeBg: 'bg-[#fa520f]/10 text-[#fa520f]',
        };
      case 'wikipedia_search':
        return {
          name: 'Wikipedia Lookup',
          icon: <BookOpen className="w-3.5 h-3.5 text-[#ffa110]" />,
          color: 'text-[#d97706]',
          borderColor: 'border-[#ffa110]/20',
          bgColor: 'bg-[#fff8e0]/60',
          badgeBg: 'bg-[#ffa110]/10 text-[#d97706]',
        };
      case 'web_search':
        return {
          name: 'Tavily Web Search',
          icon: <Globe className="w-3.5 h-3.5 text-[#ff8105]" />,
          color: 'text-[#ea580c]',
          borderColor: 'border-[#ff8105]/20',
          bgColor: 'bg-[#fff8e0]/60',
          badgeBg: 'bg-[#ff8105]/10 text-[#ea580c]',
        };
    }
  };

  const config = getToolConfig(event.tool);
  const isRunning = event.status === 'running';
  const isError = event.status === 'error';

  const cleanOutput = event.toolOutput
    ? event.toolOutput.replace(/\[TOOL USED:[^\]]+\]\s*/g, '').trim()
    : '';

  return (
    <div
      className={`my-2 rounded-[8px] border ${config.borderColor} ${config.bgColor} transition-all duration-150 overflow-hidden text-xs`}
    >
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-black/[0.02]"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center w-5 h-5 rounded-[6px] bg-white border border-[#e5e5e5] shrink-0">
            {config.icon}
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className={`font-semibold tracking-tight text-[11px] ${config.color}`}>
              {config.name}
            </span>
            <span className="text-[#a8a8a8]">•</span>
            <span className="text-[#4a4a4a] truncate max-w-[200px] sm:max-w-md font-mono text-[11px]">
              {event.toolInput}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          {isRunning && (
            <span className="flex items-center gap-1 text-[#4a4a4a] bg-white px-2 py-0.5 rounded-full border border-[#e5e5e5] text-[10px] font-medium">
              <Loader2 className="w-3 h-3 animate-spin text-[#fa520f]" />
              Running
            </span>
          )}
          {!isRunning && !isError && (
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px] font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Observation Ready
            </span>
          )}
          {isError && (
            <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 text-[10px] font-medium">
              <AlertCircle className="w-3 h-3 text-rose-600" />
              Failed
            </span>
          )}

          {cleanOutput && (
            <button
              type="button"
              className="p-0.5 rounded text-[#8a8a8a] hover:text-[#1f1f1f]"
              aria-label={expanded ? 'Collapse output' : 'Expand output'}
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded tool output inside dark IDE code canvas {colors.surface-code} */}
      {expanded && cleanOutput && (
        <div className="px-3 pb-3 pt-1 border-t border-[#ededed] bg-[#1c1c1e] text-white">
          <div className="text-[10px] text-[#a8a8a8] uppercase tracking-wider font-semibold py-1">
            Tool Observation Data
          </div>
          <pre className="p-2.5 rounded-[6px] bg-[#121214] border border-white/10 text-[#ededed] font-mono text-[11px] leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap select-text">
            {cleanOutput}
          </pre>
        </div>
      )}
    </div>
  );
};
