"use client";

import React, { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { LoadingDots } from "@/shared/components/LoadingDots";
import { Icon } from "@/shared/components/Icon";
import styles from "./BuilderChat.module.css";
import { AI_ASSISTANT_NAME } from "@/lib/branding";
import { toast } from "@/store/toast";

interface BuilderChatProps {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  isBusy: boolean;
  statusMessage: string;
  onSend: (instruction: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
}

export const BuilderChat: React.FC<BuilderChatProps> = ({
  messages,
  isBusy,
  statusMessage,
  onSend,
  onUploadImage,
}) => {
  const [input, setInput] = useState("");
  const [attachedUrl, setAttachedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttach = async (file: File): Promise<void> => {
    if (!onUploadImage) return;
    setIsUploading(true);
    try {
      const url = await onUploadImage(file);
      setAttachedUrl(url);
      toast.success("Image importée");
    } catch {
      toast.error("Import de l'image impossible — réessayez");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if ((!text && !attachedUrl) || isBusy) return;
    const instruction = attachedUrl
      ? `${text || "Utilise cette image dans le site."}\n\nImage importée (utilise cette URL exacte) : ${attachedUrl}`
      : text;
    setInput("");
    setAttachedUrl(null);
    onSend(instruction);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>{AI_ASSISTANT_NAME}</span>
        {(statusMessage || isBusy) && (
          <span
            className={`${styles.statusBadge} ${isBusy ? styles.statusBadgeActive : ""}`}
          >
            {isBusy && <LoadingDots size="sm" label={statusMessage || "En cours"} />}
            {statusMessage || (isBusy ? "Koala Codeur réfléchit…" : "")}
          </span>
        )}
      </div>

      <div className={styles.messages}>
        {messages.length === 0 ? (
          <p className={styles.hint}>
            Demandez une modification : couleurs, textes, sections, layout…
            Pour changer le fond du hero, importez une image puis décrivez le
            rendu voulu.
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
        {attachedUrl && (
          <div className={styles.attachment}>
            <img src={attachedUrl} alt="Image importée" className={styles.attachmentThumb} />
            <span className={styles.attachmentLabel}>Image prête à utiliser</span>
            <button
              type="button"
              className={styles.attachmentRemove}
              onClick={() => setAttachedUrl(null)}
              aria-label="Retirer l'image"
            >
              ×
            </button>
          </div>
        )}
        <textarea
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex : mets cette image en fond du hero avec un voile sombre"
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
        <div className={styles.actions}>
          {onUploadImage && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleAttach(file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                className={styles.attachBtn}
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy || isUploading}
              >
                <Icon icon={ImagePlus} size="sm" />
                {isUploading ? "Import…" : "Importer une image"}
              </button>
            </>
          )}
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={isBusy || (!input.trim() && !attachedUrl)}
          >
            Envoyer
          </button>
        </div>
      </form>
    </div>
  );
};
