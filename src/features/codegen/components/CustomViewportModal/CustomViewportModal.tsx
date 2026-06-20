"use client";

import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import styles from "./CustomViewportModal.module.css";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Icon } from "@/shared/components/Icon";
import {
  COMMON_DEVICE_PRESETS,
  validateViewportSize,
  type CustomPreviewPreset,
} from "../../lib/customPreviewPresets";

interface CustomViewportModalProps {
  isOpen: boolean;
  presets: CustomPreviewPreset[];
  onClose: () => void;
  onApply: (preset: CustomPreviewPreset) => void;
  onSave: (
    input: Omit<CustomPreviewPreset, "id"> & { id?: string },
  ) => CustomPreviewPreset;
  onDelete: (id: string) => void;
}

export const CustomViewportModal: React.FC<CustomViewportModalProps> = ({
  isOpen,
  presets,
  onClose,
  onApply,
  onSave,
  onDelete,
}) => {
  const [label, setLabel] = useState("");
  const [width, setWidth] = useState("390");
  const [height, setHeight] = useState("844");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLabel("");
    setWidth("390");
    setHeight("844");
    setError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const parseAndValidate = (): CustomPreviewPreset | null => {
    const w = Number.parseInt(width, 10);
    const h = Number.parseInt(height, 10);
    const validationError = validateViewportSize(w, h);
    if (validationError) {
      setError(validationError);
      return null;
    }
    setError(null);
    return onSave({
      label: label.trim() || `${w} × ${h}`,
      width: w,
      height: h,
    });
  };

  const handleApply = (): void => {
    const preset = parseAndValidate();
    if (!preset) return;
    onApply(preset);
    onClose();
  };

  const handleQuickPick = (preset: Omit<CustomPreviewPreset, "id">): void => {
    setLabel(preset.label);
    setWidth(String(preset.width));
    setHeight(String(preset.height));
    setError(null);
  };

  const handleApplySaved = (preset: CustomPreviewPreset): void => {
    onApply(preset);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h3 className={styles.title}>Preset personnalisé</h3>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            ×
          </button>
        </header>

        <div className={styles.body}>
          <div>
            <div className={styles.sectionLabel}>Appareils courants</div>
            <div className={styles.chips}>
              {COMMON_DEVICE_PRESETS.map((preset) => {
                const active =
                  width === String(preset.width) &&
                  height === String(preset.height);
                return (
                  <button
                    key={`${preset.label}-${preset.width}`}
                    type="button"
                    className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                    onClick={() => handleQuickPick(preset)}
                  >
                    {preset.label} ({preset.width}×{preset.height})
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Nom du preset"
            name="preset_label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex. iPhone 14 Pro"
          />

          <div className={styles.row}>
            <Input
              label="Largeur (px)"
              name="preset_width"
              type="number"
              min={280}
              max={2560}
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
            <Input
              label="Hauteur (px)"
              name="preset_height"
              type="number"
              min={400}
              max={1600}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          <p className={styles.hint}>
            Les media queries du site utilisent la largeur de l&apos;iframe — idéal
            pour tester le menu burger et le responsive.
          </p>

          {presets.length > 0 && (
            <div>
              <div className={styles.sectionLabel}>Mes presets</div>
              <div className={styles.savedList}>
                {presets.map((preset) => (
                  <div key={preset.id} className={styles.savedItem}>
                    <button
                      type="button"
                      className={styles.savedItemBtn}
                      onClick={() => handleApplySaved(preset)}
                    >
                      <span className={styles.savedLabel}>{preset.label}</span>
                      <span className={styles.savedMeta}>
                        {preset.width} × {preset.height}px
                      </span>
                    </button>
                    <button
                      type="button"
                      className={styles.deleteSaved}
                      aria-label={`Supprimer ${preset.label}`}
                      onClick={() => onDelete(preset.id)}
                    >
                      <Icon icon={Trash2} size="sm" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className={styles.footer}>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" size="sm" onClick={handleApply}>
            Enregistrer et appliquer
          </Button>
        </footer>
      </div>
    </div>
  );
};
