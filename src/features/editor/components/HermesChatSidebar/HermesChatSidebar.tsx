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
    <div className="flex flex-col h-full bg-white text-zinc-800 font-sans">
      <header className="flex items-center justify-between px-5 py-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
            <span className="text-sm">✨</span>
          </div>
          <span className="font-bold text-[15px] tracking-tight text-zinc-800">{AI_ASSISTANT_NAME}</span>
          {hermesIsThinking && (
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse ml-1" />
          )}
        </div>
        <div className="flex items-center gap-1">
          {hermesMessages.length > 0 && (
            <button
              onClick={clearHermesMessages}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors"
              title="Effacer le chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
              </svg>
            </button>
          )}
          {onClose && (
            <button 
              onClick={onClose} 
              className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors" 
              title="Fermer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
        {hermesMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center mt-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-white rounded-2xl flex items-center justify-center shadow-sm border border-indigo-50 mb-4">
              <span className="text-3xl">👋</span>
            </div>
            <h3 className="text-lg font-bold text-zinc-800 mb-2">Bonjour !</h3>
            <p className="text-[14px] text-zinc-500 max-w-[240px] leading-relaxed mb-8">
              Que souhaitez-vous ajouter ou modifier sur votre site aujourd'hui ?
            </p>
            
            <div className="flex flex-col gap-2 w-full max-w-[260px]">
              {defaultSuggestions.map((sug, i) => (
                <button
                  key={i}
                  className="text-[13px] bg-white border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-zinc-600 px-4 py-3 rounded-xl text-left transition-all shadow-sm truncate w-full"
                  onClick={() => handleSend(sug)}
                  disabled={hermesIsThinking}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {hermesMessages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={index}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              {!isUser && (
                <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                  <span className="text-sm">✨</span>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{AI_ASSISTANT_NAME}</span>
                </div>
              )}
              <div
                className={`max-w-[90%] px-4 py-3 text-[14px] leading-relaxed break-words shadow-sm ${
                  isUser 
                    ? "bg-zinc-900 text-white rounded-2xl rounded-tr-sm" 
                    : "bg-white border border-zinc-200 text-zinc-700 rounded-2xl rounded-tl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {hermesIsThinking && (
          <div className="flex flex-col items-start animate-in fade-in duration-300">
            <div className="flex items-center gap-1.5 mb-1.5 ml-1">
              <span className="text-sm">✨</span>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{AI_ASSISTANT_NAME} réfléchit...</span>
            </div>
            <div className="bg-white border border-zinc-200 px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-10">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} className="h-1" />
      </div>

      <div className="p-4 shrink-0 bg-white border-t border-zinc-100">
        <form onSubmit={handleSubmit} className="relative flex items-end">
          <textarea
            ref={inputRef}
            rows={1}
            className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-2xl px-4 py-3 pr-12 text-[14px] text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none max-h-32 transition-all shadow-sm"
            placeholder="Écrivez un message... (Ctrl+K)"
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
            className={`absolute right-2 bottom-2 p-2 rounded-xl transition-all ${
              inputValue.trim() && !hermesIsThinking
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                : "bg-zinc-100 text-zinc-400"
            }`}
            disabled={!inputValue.trim() || hermesIsThinking}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
        <div className="text-center mt-2.5">
          <span className="text-[11px] text-zinc-400">L'IA peut faire des erreurs. Vérifiez le rendu.</span>
        </div>
      </div>
    </div>
  );
};
