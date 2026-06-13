"use client";

import React, { useRef, useState } from "react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import styles from "./ImageReplaceModal.module.css";

interface ImageReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string, alt?: string) => void;
  onUpload: (file: File) => Promise<string>;
}

export const ImageReplaceModal: React.FC<ImageReplaceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = (): void => {
    setUrl("");
    setAlt("");
    setPreview(null);
    setError(null);
  };

  const handleClose = (): void => {
    reset();
    onClose();
  };

  const handleFile = async (file: File): Promise<void> => {
    setError(null);
    setIsUploading(true);
    setPreview(URL.createObjectURL(file));
    try {
      const uploadedUrl = await onUpload(file);
      setUrl(uploadedUrl);
    } catch {
      setError("Import impossible. Réessayez ou collez une URL.");
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

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
    <Modal isOpen={isOpen} onClose={handleClose} title="Remplacer l'image" size="sm">
      <div className={styles.body}>
        <button
          type="button"
          className={styles.dropzone}
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="Aperçu" className={styles.previewImg} />
          ) : (
            <>
              <span className={styles.dropIcon}>↑</span>
              <span className={styles.dropText}>
                Cliquez pour importer une image
              </span>
              <span className={styles.dropHint}>JPG, PNG, WebP…</span>
            </>
          )}
        </button>
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

        <div className={styles.divider}>
          <span>ou</span>
        </div>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>URL de l&apos;image</span>
          <input
            type="url"
            className={styles.input}
            placeholder="https://…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Texte alternatif (SEO)</span>
          <input
            type="text"
            className={styles.input}
            placeholder="Description de l'image"
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
