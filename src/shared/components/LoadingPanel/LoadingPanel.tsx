import React from "react";
import { LoadingDots } from "../LoadingDots";
import styles from "./LoadingPanel.module.css";

interface LoadingPanelProps {
  message?: string;
  variant?: "inline" | "preview" | "centered";
}

export const LoadingPanel: React.FC<LoadingPanelProps> = ({
  message = "Chargement…",
  variant = "centered",
}) => {
  if (variant === "inline") {
    return (
      <div className={styles.inline} role="status" aria-live="polite">
        <LoadingDots size="sm" label={message} />
        <span className={styles.message}>{message}</span>
      </div>
    );
  }

  return (
    <div className={styles.panel} role="status" aria-live="polite">
      {variant === "preview" && (
        <div className={styles.previewMock} aria-hidden="true">
          <div className={styles.previewChrome}>
            <span className={styles.previewDot} />
            <span className={styles.previewDot} />
            <span className={styles.previewDot} />
            <div className={styles.previewUrl} />
          </div>
          <div className={styles.previewBody}>
            <div className={`${styles.shimmerBlock} ${styles.heroBlock}`} />
            <div className={`${styles.shimmerBlock} ${styles.lineBlock}`} />
            <div
              className={`${styles.shimmerBlock} ${styles.lineBlock} ${styles.lineBlockMedium}`}
            />
            <div className={styles.cardRow}>
              <div className={`${styles.shimmerBlock} ${styles.cardBlock}`} />
              <div className={`${styles.shimmerBlock} ${styles.cardBlock}`} />
              <div className={`${styles.shimmerBlock} ${styles.cardBlock}`} />
            </div>
          </div>
        </div>
      )}
      <div className={styles.message}>
        <LoadingDots size="md" label={message} />
        <span>{message}</span>
      </div>
    </div>
  );
};
