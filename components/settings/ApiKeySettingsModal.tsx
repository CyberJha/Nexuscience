'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, Cpu, Eye, EyeOff, Check, ExternalLink, ShieldAlert } from 'lucide-react';
import { UserSettings } from '@/lib/types';

interface ApiKeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
}

const POPULAR_MODELS = [
  { id: 'openai/gpt-oss-120b', label: 'gpt-oss-120b (Notebook Default)', desc: '120B parameter reasoning model' },
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile', desc: 'State-of-the-art general reasoning' },
  { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant', desc: 'Ultra-fast low latency inference' },
  { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B 32k', desc: 'Mistral high-context sparse MoE' },
];

export const ApiKeySettingsModal: React.FC<ApiKeySettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [groqKey, setGroqKey] = useState(settings.groqApiKey);
  const [tavilyKey, setTavilyKey] = useState(settings.tavilyApiKey);
  const [model, setModel] = useState(settings.model);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showTavilyKey, setShowTavilyKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setGroqKey(settings.groqApiKey);
    setTavilyKey(settings.tavilyApiKey);
    setModel(settings.model);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      groqApiKey: groqKey.trim(),
      tavilyApiKey: tavilyKey.trim(),
      model: model.trim() || 'openai/gpt-oss-120b',
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-xl rounded-[12px] border border-[#e5e5e5] bg-[#ffffff] text-[#1f1f1f] shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ededed] bg-[#fff8e0]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[8px] bg-[#fa520f]/10 text-[#fa520f]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[#1f1f1f]">
                API Keys & Model Configuration
              </h2>
              <p className="text-xs text-[#6a6a6a]">
                Configure your inference keys and model selection
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

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5 text-sm">
          {/* Groq API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[#1f1f1f] flex items-center gap-1.5">
                <span>Groq API Key</span>
                <span className="text-xs text-[#fa520f] font-medium">*required</span>
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#fa520f] hover:underline flex items-center gap-1"
              >
                <span>Get free Groq key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showGroqKey ? 'text' : 'password'}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full h-11 px-3.5 pr-10 text-xs sm:text-sm font-mono rounded-[8px] border border-[#c7c7c7] bg-[#ffffff] text-[#1f1f1f] placeholder:text-[#a8a8a8] outline-none focus:border-[#fa520f] focus:ring-1 focus:ring-[#fa520f] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowGroqKey(!showGroqKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8a8a] hover:text-[#1f1f1f]"
              >
                {showGroqKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-[#6a6a6a]">
              Powers the ReAct agent reasoning and tool selection. If left empty, the server environment key will be used if configured.
            </p>
          </div>

          {/* Tavily API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[#1f1f1f] flex items-center gap-1.5">
                <span>Tavily Search API Key</span>
                <span className="text-xs text-[#6a6a6a] font-normal">(for web search tool)</span>
              </label>
              <a
                href="https://app.tavily.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#fa520f] hover:underline flex items-center gap-1"
              >
                <span>Get free Tavily key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showTavilyKey ? 'text' : 'password'}
                value={tavilyKey}
                onChange={(e) => setTavilyKey(e.target.value)}
                placeholder="tvly-..."
                className="w-full h-11 px-3.5 pr-10 text-xs sm:text-sm font-mono rounded-[8px] border border-[#c7c7c7] bg-[#ffffff] text-[#1f1f1f] placeholder:text-[#a8a8a8] outline-none focus:border-[#fa520f] focus:ring-1 focus:ring-[#fa520f] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowTavilyKey(!showTavilyKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8a8a] hover:text-[#1f1f1f]"
              >
                {showTavilyKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-[#6a6a6a]">
              Required for the Live Web Search tool. Calculator and Wikipedia tools work without this key.
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="font-semibold text-[#1f1f1f] flex items-center gap-1.5 text-xs">
              <Cpu className="w-4 h-4 text-[#fa520f]" />
              <span>Groq Model Selection</span>
            </label>

            {/* Quick model selection cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {POPULAR_MODELS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setModel(item.id)}
                  className={`p-2.5 rounded-[8px] text-left border transition-all text-xs ${
                    model === item.id
                      ? 'border-[#fa520f] bg-[#fff8e0] shadow-sm'
                      : 'border-[#ededed] bg-[#fafafa] hover:border-[#c7c7c7]'
                  }`}
                >
                  <div className="font-medium text-[#1f1f1f] flex items-center justify-between">
                    <span className="font-mono text-[11px]">{item.id}</span>
                    {model === item.id && <Check className="w-3.5 h-3.5 text-[#fa520f]" />}
                  </div>
                  <div className="text-[10px] text-[#6a6a6a] mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>

            {/* Custom Model input */}
            <div className="pt-1">
              <label className="text-[11px] font-medium text-[#6a6a6a] block mb-1">
                Or type custom Groq model name:
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. openai/gpt-oss-120b"
                className="w-full h-10 px-3 text-xs font-mono rounded-[8px] border border-[#c7c7c7] bg-[#ffffff] text-[#1f1f1f] outline-none focus:border-[#fa520f]"
              />
            </div>
          </div>

          {/* Security Note */}
          <div className="p-3 rounded-[8px] border border-[#e6d5a8] bg-[#fff8e0] text-[#1f1f1f] text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-[#fa520f] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#3d3d3d] leading-relaxed">
              Your API keys are stored locally in your browser storage and transmitted directly to the serverless chat endpoint over HTTPS. They are never recorded or shared.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#ededed]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[8px] border border-[#c7c7c7] text-[#1f1f1f] hover:bg-[#ededed] text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-[8px] bg-[#fa520f] hover:bg-[#cc3a05] text-white text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Configuration</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
