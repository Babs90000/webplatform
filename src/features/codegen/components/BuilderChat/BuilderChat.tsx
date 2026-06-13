"use client";

import React, { useState } from "react";
import styles from "./BuilderChat.module.css";
import { AI_ASSISTANT_NAME } from "@/lib/branding";

interface BuilderChatProps {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  isBusy: boolean;
  statusMessage: string;
  onSend: (instruction: string) => void;
}

export const BuilderChat: React.FC<BuilderChatProps> = ({
  messages,
  isBusy,
  statusMessage,
  onSend,
}) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;
    setInput("");
    onSend(text);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>{AI_ASSISTANT_NAME}</span>
        {statusMessage && (
          <span className={styles.status}>{statusMessage}</span>
        )}
      </div>

      <div className={styles.messages}>
        {messages.length === 0 ? (
          <p className={styles.hint}>
            Demandez une modification : couleurs, textes, sections, layout…
          </p>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.message} ${msg.role === "user" ? styles.user : styles.assistant}`}
            >
              {msg.content}
            </div>
          ))
        )}
        {isBusy && (
          <div className={styles.typing}>
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <textarea
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex : rends le hero plus sombre et ajoute un bouton contact"
          rows={3}
          disabled={isBusy}
          aria-label="Instruction pour Koala Codeur"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button type="submit" className={styles.sendBtn} disabled={isBusy || !input.trim()}>
          Envoyer
        </button>
      </form>
    </div>
  );
};
