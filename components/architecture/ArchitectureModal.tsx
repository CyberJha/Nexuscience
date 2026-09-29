'use client';

import React, { useState } from 'react';
import { X, Network, Cpu, ArrowDown, Calculator, BookOpen, Globe, Sparkles, MessageSquare, Terminal, Layers } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'diagram' | 'pipeline' | 'tools' | 'memory'>('diagram');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-4xl rounded-[12px] border border-[#e5e5e5] bg-[#ffffff] text-[#1f1f1f] shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Signature Sunset Stripe */}
        <div className="sunset-stripe-bar" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ededed] bg-[#fff8e0]/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[8px] bg-[#fa520f]/10 text-[#fa520f]">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#1f1f1f]">
                NEXUSCIENCE System Architecture
              </h2>
              <p className="text-xs text-[#6a6a6a]">
                ReAct (Reasoning + Acting) Autonomous Agent Pipeline
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[8px] text-[#6a6a6a] hover:text-[#1f1f1f] hover:bg-[#ededed] transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Mistral segmented-tab style) */}
        <div className="flex items-center gap-1 px-6 pt-2 border-b border-[#ededed] bg-[#fafafa] text-xs shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('diagram')}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'diagram'
                ? 'border-[#fa520f] text-[#fa520f] font-semibold'
                : 'border-transparent text-[#6a6a6a] hover:text-[#1f1f1f]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            Visual Architecture Diagram
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'border-[#fa520f] text-[#fa520f] font-semibold'
                : 'border-transparent text-[#6a6a6a] hover:text-[#1f1f1f]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            ReAct Execution Loop
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tools')}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tools'
                ? 'border-[#fa520f] text-[#fa520f] font-semibold'
                : 'border-transparent text-[#6a6a6a] hover:text-[#1f1f1f]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Integrated Tool Suite
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('memory')}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'memory'
                ? 'border-[#fa520f] text-[#fa520f] font-semibold'
                : 'border-transparent text-[#6a6a6a] hover:text-[#1f1f1f]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Serverless Buffer Memory
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {activeTab === 'diagram' && (
            <div className="space-y-6">
              {/* Architecture Interactive Flow Graph in Mistral Theme */}
              <div className="p-6 rounded-[12px] border border-[#e5e5e5] bg-[#fafafa] flex flex-col items-center shadow-xs">
                {/* 1. User Query */}
                <div className="px-5 py-2 rounded-[8px] bg-[#ffffff] border border-[#fa520f] text-[#fa520f] font-mono text-xs font-semibold shadow-xs flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[#fa520f]" />
                  USER QUERY
                </div>

                <ArrowDown className="w-4 h-4 text-[#fa520f] my-1.5 animate-bounce" />

                {/* 2. ReAct Agent Engine */}
                <div className="px-6 py-3 rounded-[8px] bg-[#1f1f1f] text-white font-mono text-xs font-bold text-center shadow-md">
                  <span className="text-[#ffd06a]">ReAct Autonomous Agent</span>
                  <div className="text-[10px] text-[#a8a8a8] font-sans font-normal mt-0.5">
                    Analyzes intent & plans tool reasoning
                  </div>
                </div>

                <div className="w-48 h-4 border-b border-l border-r border-[#c7c7c7] mt-2 rounded-b-[4px]" />
                <div className="flex justify-between w-64 text-[#8a8a8a] text-xs">
                  <span>↓</span>
                  <span>↓</span>
                  <span>↓</span>
                </div>

                {/* 3. Three Tools */}
                <div className="grid grid-cols-3 gap-3 w-full max-w-lg mt-1">
                  <div className="p-3 rounded-[8px] border border-[#e6d5a8] bg-[#fff8e0] text-center">
                    <Calculator className="w-4 h-4 text-[#fa520f] mx-auto mb-1" />
                    <span className="text-[#1f1f1f] font-mono text-[11px] font-semibold block">Calculator</span>
                    <span className="text-[10px] text-[#6a6a6a]">Math Parser</span>
                  </div>
                  <div className="p-3 rounded-[8px] border border-[#e6d5a8] bg-[#fff8e0] text-center">
                    <BookOpen className="w-4 h-4 text-[#ffa110] mx-auto mb-1" />
                    <span className="text-[#1f1f1f] font-mono text-[11px] font-semibold block">Wikipedia</span>
                    <span className="text-[10px] text-[#6a6a6a]">MediaWiki API</span>
                  </div>
                  <div className="p-3 rounded-[8px] border border-[#e6d5a8] bg-[#fff8e0] text-center">
                    <Globe className="w-4 h-4 text-[#ff8105] mx-auto mb-1" />
                    <span className="text-[#1f1f1f] font-mono text-[11px] font-semibold block">Web Search</span>
                    <span className="text-[10px] text-[#6a6a6a]">Tavily Engine</span>
                  </div>
                </div>

                <div className="w-48 h-4 border-t border-l border-r border-[#c7c7c7] mt-2 rounded-t-[4px]" />
                <ArrowDown className="w-4 h-4 text-[#fa520f] my-1" />

                {/* 4. Tool Observation */}
                <div className="px-5 py-2 rounded-[8px] bg-[#1c1c1e] text-[#ededed] font-mono text-xs text-center">
                  Tool Observation Feed
                </div>

                <ArrowDown className="w-4 h-4 text-[#fa520f] my-1.5" />

                {/* 5. Groq LLM */}
                <div className="px-6 py-2.5 rounded-[8px] bg-[#fff0c2] border border-[#ffa110] text-[#1f1f1f] font-mono text-xs font-bold text-center">
                  Groq LLM Engine (temp=0)
                </div>

                <ArrowDown className="w-4 h-4 text-[#fa520f] my-1.5" />

                {/* 6. Final Answer */}
                <div className="px-6 py-2.5 rounded-[8px] bg-[#fa520f] text-white font-mono text-xs font-bold shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Synthesized Final Answer
                </div>
              </div>

              {/* Technical Stack Description in Mistral cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-[12px] border border-[#e6d5a8] bg-[#fff8e0]">
                  <span className="font-semibold text-[#1f1f1f] block mb-1">Frontend Layer</span>
                  <p className="text-[#4a4a4a] leading-relaxed">
                    Built with Next.js App Router, React 19, TypeScript, and Tailwind CSS. Implements the Mistral AI aesthetic with warm cream surfaces, saturated orange primary actions, and Server-Sent Events (SSE).
                  </p>
                </div>
                <div className="p-4 rounded-[12px] border border-[#e6d5a8] bg-[#fff8e0]">
                  <span className="font-semibold text-[#1f1f1f] block mb-1">Serverless Backend</span>
                  <p className="text-[#4a4a4a] leading-relaxed">
                    Stateless API routes deployed on Vercel. Supports client-configured API keys or server-side environment secrets with zero credential leakage.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#1f1f1f] tracking-wide">
                The ReAct (Reasoning + Acting) Paradigm
              </h3>
              <p className="text-[#4a4a4a] leading-relaxed text-xs">
                NEXUSCIENCE follows the ReAct framework to overcome hallucinations and math inaccuracies:
              </p>
              
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-[8px] border border-[#e6d5a8] bg-[#fff8e0]">
                  <span className="text-[#fa520f] font-bold block mb-1">1. Thought</span>
                  <span className="text-[#1f1f1f]">The model reasons step-by-step about what information is required to answer the query.</span>
                </div>
                <div className="p-3 rounded-[8px] border border-[#e6d5a8] bg-[#fff8e0]">
                  <span className="text-[#ffa110] font-bold block mb-1">2. Action & Action Input</span>
                  <span className="text-[#1f1f1f]">The model selects exactly one tool from [calculator, wikipedia_search, web_search] with exact parameters.</span>
                </div>
                <div className="p-3 rounded-[8px] border border-[#e6d5a8] bg-[#fff8e0]">
                  <span className="text-[#ff8105] font-bold block mb-1">3. Observation</span>
                  <span className="text-[#1f1f1f]">The backend tool executes and passes structured real-world data back into the agent scratchpad.</span>
                </div>
                <div className="p-3 rounded-[8px] border border-[#c7c7c7] bg-[#ffffff]">
                  <span className="text-[#1f1f1f] font-bold block mb-1">4. Final Answer</span>
                  <span className="text-[#3d3d3d]">Once sufficient observations are gathered (within 6 max iterations), the model synthesizes the final response.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#1f1f1f] tracking-wide">
                Tool Implementations & Configurations
              </h3>

              <div className="space-y-3">
                <div className="p-4 rounded-[12px] border border-[#e6d5a8] bg-[#fff8e0]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Calculator className="w-4 h-4 text-[#fa520f]" />
                    <span className="font-semibold text-[#1f1f1f] text-xs">Calculator</span>
                    <span className="text-[10px] text-[#fa520f] bg-white px-2 py-0.5 rounded-[4px] border border-[#e6d5a8]">Python math equivalent</span>
                  </div>
                  <p className="text-xs text-[#4a4a4a] leading-relaxed">
                    Evaluates mathematical expressions including basic arithmetic, square roots (`math.sqrt(144)`), trigonometry, logarithms, powers, and constants (`pi`, `e`). Employs safe tokenized recursive-descent parsing with zero arbitrary code execution risk.
                  </p>
                </div>

                <div className="p-4 rounded-[12px] border border-[#e6d5a8] bg-[#fff8e0]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <BookOpen className="w-4 h-4 text-[#ffa110]" />
                    <span className="font-semibold text-[#1f1f1f] text-xs">Wikipedia Search</span>
                    <span className="text-[10px] text-[#ffa110] bg-white px-2 py-0.5 rounded-[4px] border border-[#e6d5a8]">MediaWiki API • top_k=2 • 4000 chars</span>
                  </div>
                  <p className="text-xs text-[#4a4a4a] leading-relaxed">
                    Retrieves factual encyclopedic knowledge directly from Wikipedia API, summarizing key historical, scientific, or biographical facts.
                  </p>
                </div>

                <div className="p-4 rounded-[12px] border border-[#e6d5a8] bg-[#fff8e0]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Globe className="w-4 h-4 text-[#ff8105]" />
                    <span className="font-semibold text-[#1f1f1f] text-xs">Web Search</span>
                    <span className="text-[10px] text-[#ff8105] bg-white px-2 py-0.5 rounded-[4px] border border-[#e6d5a8]">Tavily Search API • max_results=3</span>
                  </div>
                  <p className="text-xs text-[#4a4a4a] leading-relaxed">
                    Queries the live internet for recent breaking events, current advancements, and real-time facts not present in static training corpuses.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'memory' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#1f1f1f] tracking-wide">
                Serverless Conversational Memory (Buffer Memory)
              </h3>
              <p className="text-[#4a4a4a] leading-relaxed text-xs">
                In standard serverless environments like Vercel, server processes are stateless and do not persist across requests. NEXUSCIENCE solves this gracefully:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs text-[#4a4a4a]">
                <li>
                  <strong className="text-[#1f1f1f]">Client-Side State:</strong> The browser maintains conversational turns in responsive state.
                </li>
                <li>
                  <strong className="text-[#1f1f1f]">Buffer Memory Adaptation:</strong> On each query, prior turns are serialized and passed to the backend, mirroring LangChain&apos;s <code className="text-[#fa520f] font-mono">ConversationBufferMemory</code>.
                </li>
                <li>
                  <strong className="text-[#1f1f1f]">Pronoun & Reference Resolution:</strong> Questions like &ldquo;Who is Albert Einstein?&rdquo; followed by &ldquo;When was he born?&rdquo; properly resolve &ldquo;he&rdquo; without requiring an external persistent database.
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#ededed] bg-[#fafafa] flex items-center justify-between text-xs text-[#6a6a6a] shrink-0">
          <span>NEXUSCIENCE Academic Project</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-[8px] bg-[#1f1f1f] hover:bg-[#3d3d3d] text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
