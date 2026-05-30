"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./HermesChatSidebar.module.css";
import { useEditorStore } from "@/store/editor";
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Suggestions for rapid user building
  const defaultSuggestions = [
    "Ajoute une section témoignages",
    "Remplace le titre du Hero",
    "Ajoute une section tarifs (pricing)",
    "Créer une section FAQ à la fin",
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

  return (
    <div className={styles.sidebar}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.emoji}>✨</span>
          <span className={styles.title}>Assistant IA Hermes</span>
          <span
            className={`${styles.statusIndicator} ${hermesIsThinking ? styles.statusIndicatorPulse : ""}`}
          />
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {hermesMessages.length > 0 && (
            <button
              onClick={clearHermesMessages}
              className={styles.closeBtn}
              title="Effacer l'historique"
            >
              🗑️
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className={styles.closeBtn} title="Fermer">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </header>

      <div className={styles.chatArea}>
        {hermesMessages.length === 0 && (
          <div className={`${styles.bubbleAssistant} ${styles.bubble}`}>
            Bonjour ! Je suis Hermes. Je peux éditer et construire votre site en temps réel.
            Dites-moi simplement quoi faire : ajouter des blocs, modifier le texte, changer le layout ou le design.
          </div>
        )}

        {hermesMessages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={index}
              className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`}
            >
              {msg.content}
            </div>
          );
        })}

        {hermesIsThinking && (
          <div className={styles.typingBubble}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className={styles.suggestionsSection}>
        {defaultSuggestions.map((sug, i) => (
          <button
            key={i}
            className={styles.suggestionChip}
            onClick={() => handleSend(sug)}
            disabled={hermesIsThinking}
          >
            {sug}
          </button>
        ))}
      </div>

      <div className={styles.inputArea}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Demandez à l'IA d'éditer la page... (Ctrl+K)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={hermesIsThinking}
          />
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={!inputValue.trim() || hermesIsThinking}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};
