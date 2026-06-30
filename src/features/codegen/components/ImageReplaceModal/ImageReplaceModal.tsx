"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, X, Link } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { Icon } from "@/shared/components/Icon";
import styles from "./ImageReplaceModal.module.css";

interface ImageReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string, alt?: string) => void;
  onUpload: (file: File) => Promise<string>;
  title?: string;
}

export const ImageReplaceModal: React.FC<ImageReplaceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onUpload,
  title = "Remplacer l'image",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = (): void => {
    setUrl("");
    setAlt("");
    setPreview(null);
    setError(null);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = (): void => {
    reset();
    onClose();
  };

  const handleFile = useCallback(async (file: File): Promise<void> => {
    if (!file.type.startsWith("image/")) {
      setError("Format non supporté — utilisez JPG, PNG, WebP ou GIF.");
      return;
    }
    setError(null);
    setIsUploading(true);
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    try {
      const uploadedUrl = await onUpload(file);
      setUrl(uploadedUrl);
    } catch {
      setError("Import impossible. Réessayez ou collez une URL.");
      setPreview(null);
      URL.revokeObjectURL(localPreview);
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) void handleFile(file);
    },
    [handleFile],
  );

  const handleConfirm = (): void => {
    const finalUrl = url.trim();
    if (!finalUrl) {
      setError("Importez une image ou collez une URL.");
      return;
    }
    onConfirm(finalUrl, alt.trim() || undefined);
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <div className={styles.body}>

        {/* Zone drop */}
        <div
          className={`${styles.dropzone} ${isDragging ? styles.dragging : ""} ${preview ? styles.hasPreview : ""}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !preview && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Zone d'import d'image"
          onKeyDown={(e) => e.key === "Enter" && !preview && fileInputRef.current?.click()}
        >
          {preview ? (
            <div className={styles.previewWrapper}>
              <img src={preview} alt="Aperçu" className={styles.previewImg} />
              {isUploading && (
                <div className={styles.uploadOverlay}>
                  <div className={styles.spinner} />
                </div>
              )}
              <button
                type="button"
                className={styles.removeBtn}
                onClick={(e) => { e.stopPropagation(); reset(); }}
                aria-label="Supprimer l'image"
              >
                <Icon icon={X} size="xs" />
              </button>
            </div>
          ) : (
            <div className={styles.dropContent}>
              <div className={styles.dropIconWrap}>
                <Icon icon={Upload} size="md" />
              </div>
              <div className={styles.dropText}>
                Glissez une image ou <span className={styles.dropLink}>parcourir</span>
              </div>
              <div className={styles.dropHint}>JPG, PNG, WebP, GIF — max 10 Mo</div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />

        {/* Séparateur */}
        <div className={styles.divider}>
          <span>ou coller une URL</span>
        </div>

        {/* URL */}
        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            <Icon icon={Link} size="xs" />
            URL de l&apos;image
          </span>
          <input
            type="url"
            className={styles.input}
            placeholder="https://images.pexels.com/…"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (e.target.value.trim()) setPreview(e.target.value.trim());
              else if (!fileInputRef.current?.files?.length) setPreview(null);
            }}
          />
        </label>

        {/* Alt */}
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Texte alternatif (SEO)</span>
          <input
            type="text"
            className={styles.input}
            placeholder="Description courte de l'image"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={handleClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            isLoading={isUploading}
            disabled={isUploading}
          >
            Remplacer
          </Button>
        </div>
      </div>
    </Modal>
  );
};
