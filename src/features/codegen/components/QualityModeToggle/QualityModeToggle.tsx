"use client";

import React from "react";
import styles from "./QualityModeToggle.module.css";

export type QualityMode = "fast" | "premium";

interface QualityModeToggleProps {
  value: QualityMode;
  onChange: (mode: QualityMode) => void;
  disabled?: boolean;
}

export const QualityModeToggle: React.FC<QualityModeToggleProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div
      className={styles.toggle}
      role="group"
      aria-label="Mode de qualité de génération"
    >
      <button
        type="button"
        className={`${styles.option} ${value === "fast" ? styles.active : ""}`}
        aria-pressed={value === "fast"}
        disabled={disabled}
        onClick={() => onChange("fast")}
        title="Génération rapide"
      >
        Rapide
      </button>
      <button
        type="button"
        className={`${styles.option} ${value === "premium" ? styles.active : ""}`}
        aria-pressed={value === "premium"}
        disabled={disabled}
        onClick={() => onChange("premium")}
        title="Génération premium (revue créative approfondie)"
      >
        Premium
      </button>
    </div>
  );
};
