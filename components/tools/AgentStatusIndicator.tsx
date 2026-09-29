'use client';

import React from 'react';
import { Sparkles, Calculator, BookOpen, Globe, Cpu } from 'lucide-react';
import { AgentStatusType } from '@/lib/types';

interface AgentStatusIndicatorProps {
  status: AgentStatusType;
  message?: string;
}

export const AgentStatusIndicator: React.FC<AgentStatusIndicatorProps> = ({
  status,
  message,
}) => {
  if (status === 'idle') return null;

  const getStatusDisplay = () => {
    switch (status) {
      case 'using_calculator':
        return {
          icon: <Calculator className="w-3.5 h-3.5 text-[#fa520f] animate-pulse" />,
          title: 'Using Calculator',
        };
      case 'searching_wikipedia':
        return {
          icon: <BookOpen className="w-3.5 h-3.5 text-[#ffa110] animate-pulse" />,
          title: 'Searching Wikipedia',
        };
      case 'searching_web':
        return {
          icon: <Globe className="w-3.5 h-3.5 text-[#ff8105] animate-pulse" />,
          title: 'Searching Web',
        };
      case 'preparing_answer':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-[#fa520f] animate-pulse" />,
          title: 'Synthesizing Answer',
        };
      case 'thinking':
      default:
        return {
          icon: <Cpu className="w-3.5 h-3.5 text-[#fa520f] animate-spin" />,
          title: 'Reasoning',
        };
    }
  };

  const display = getStatusDisplay();

  return (
    <div className="flex items-center gap-2 py-1.5 px-3 rounded-full border border-[#e6d5a8] bg-[#fff8e0] shadow-sm text-xs w-fit my-1.5 animate-fade-in text-[#1f1f1f]">
      <div className="relative flex items-center justify-center">
        <span className="w-2 h-2 rounded-full bg-[#fa520f] animate-ping absolute opacity-75" />
        <span className="w-2 h-2 rounded-full bg-[#fa520f]" />
      </div>

      <div className="flex items-center gap-1.5 font-semibold text-[#1f1f1f] text-[11px]">
        {display.icon}
        <span>{display.title}</span>
      </div>

      {message && (
        <span className="text-[#6a6a6a] truncate max-w-[200px] sm:max-w-xs font-normal border-l border-[#e6d5a8] pl-2 text-[11px]">
          {message}
        </span>
      )}
    </div>
  );
};
