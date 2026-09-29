'use client';

import React from 'react';
import { X, Info, CheckCircle, ShieldCheck } from 'lucide-react';

interface SystemInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemInfoModal: React.FC<SystemInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-[12px] border border-[#e5e5e5] bg-[#ffffff] text-[#1f1f1f] shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#ededed]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-[8px] bg-[#fa520f]/10 text-[#fa520f]">
              <Info className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#1f1f1f] tracking-tight">
              About NEXUSCIENCE
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[6px] text-[#8a8a8a] hover:text-[#1f1f1f] hover:bg-[#ededed] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs sm:text-[13px] leading-relaxed text-[#3d3d3d]">
          <p>
            <strong className="text-[#1f1f1f]">NEXUSCIENCE</strong> is an intelligent tool-using AI assistant powered by a ReAct agent architecture, designed in the warm editorial design system of Mistral AI.
          </p>

          <div className="space-y-2 rounded-[12px] bg-[#fff8e0] border border-[#e6d5a8] p-4">
            <span className="text-[11px] font-semibold text-[#fa520f] uppercase tracking-wider block">
              Core Capabilities
            </span>
            <ul className="space-y-1.5 text-[#1f1f1f]">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#fa520f] shrink-0" />
                <span><strong>Mathematical reasoning</strong> through safe Python-grade Calculator</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#ffa110] shrink-0" />
                <span><strong>Knowledge retrieval</strong> through Wikipedia encyclopedia API</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#ff8105] shrink-0" />
                <span><strong>Current information</strong> through live Tavily web search</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#fa520f] shrink-0" />
                <span><strong>Conversational context</strong> adapted for serverless deployment</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>Client-managed API keys</strong> and model customization</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-2 text-[#6a6a6a] text-[11px] bg-[#fafafa] p-2.5 rounded-[8px] border border-[#ededed]">
            <ShieldCheck className="w-4 h-4 text-[#fa520f] shrink-0" />
            <span>API keys are stored locally in your browser and sent securely over HTTPS.</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#ededed] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[8px] bg-[#fa520f] hover:bg-[#cc3a05] text-white text-xs font-medium transition-colors shadow-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
