"use client";

import React, { useState, useRef, useEffect } from "react";
import { useEditorStore } from "@/store/editor";
import { AI_ASSISTANT_NAME } from "@/lib/branding";
import { useSendHermesMessage } from "../../hooks/useHermesChat";

interface HermesChatSidebarProps {
  pageId: string | null;
  onClose?: () => void;
}

export const HermesChatSidebar: React.FC<HermesChatSidebarProps> = ({
  pageId,
  onClose,
}) => {
  const { hermesMessages, hermesIsThinking, clearHermesMessages } =
    useEditorStore();
  const sendHermesMessage = useSendHermesMessage(pageId);
  const [inputValue, setInputValue] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Suggestions for rapid user building
  const defaultSuggestions = [
    "Crée un site complet pour un restaurant italien",
    "Ajoute une section témoignages",
    "Remplace le titre du Hero",
    "Ajoute une section tarifs (pricing)",
  ];

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [hermesMessages, hermesIsThinking]);

  // Focus shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSend = async (text: string) => {
    if (!text.trim() || hermesIsThinking) return;
    setInputValue("");
    await sendHermesMessage.mutateAsync(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-100 font-sans">
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <span className="font-semibold text-sm">Assistant {AI_ASSISTANT_NAME}</span>
          {hermesIsThinking && (
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse ml-2" />
          )}
        </div>
        <div className="flex items-center gap-1">
          {hermesMessages.length > 0 && (
            <button
              onClick={clearHermesMessages}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
              title="Effacer l'historique"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
              </svg>
            </button>
          )}
          {onClose && (
            <button 
              onClick={onClose} 
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors" 
              title="Fermer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {hermesMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-zinc-400">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center shadow-inner">
              <span className="text-3xl">🤖</span>
            </div>
            <p className="text-sm max-w-[250px] leading-relaxed">
              Bonjour ! Je suis l'assistant <strong className="text-zinc-200">{AI_ASSISTANT_NAME}</strong>. Décrivez-moi ce que vous souhaitez accomplir.
            </p>
          </div>
        )}

        {hermesMessages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={index}
              className={`flex ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  isUser 
                    ? "bg-primary text-primary-foreground rounded-tr-sm" 
                    : "bg-zinc-800 text-zinc-100 rounded-tl-sm border border-zinc-700/50"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {hermesIsThinking && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-zinc-800 text-zinc-100 px-4 py-3 rounded-2xl rounded-tl-sm border border-zinc-700/50 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} className="h-1" />
      </div>

      <div className="p-3 bg-zinc-900 border-t border-zinc-800 shrink-0">
        {hermesMessages.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {defaultSuggestions.map((sug, i) => (
              <button
                key={i}
                className="text-[11px] bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 text-zinc-300 px-2.5 py-1.5 rounded-lg text-left transition-colors truncate max-w-full"
                onClick={() => handleSend(sug)}
                disabled={hermesIsThinking}
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative group flex items-end">
          <textarea
            ref={inputRef}
            rows={1}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 pr-12 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none max-h-32 transition-shadow"
            placeholder="Demandez à l'IA... (Ctrl+K)"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              // Auto-resize
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
            }}
            onKeyDown={handleKeyDown}
            disabled={hermesIsThinking}
          />
          <button
            type="submit"
            className="absolute right-2 bottom-2 p-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            disabled={!inputValue.trim() || hermesIsThinking}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[10px] text-zinc-600">L'IA peut faire des erreurs. Vérifiez son travail.</span>
        </div>
      </div>
    </div>
  );
};
