import React from "react";
import { LoadingDots } from "../LoadingDots";
import { LoadingProgress } from "../LoadingProgress";
import styles from "./LoadingPanel.module.css";

interface LoadingPanelProps {
  message?: string;
  variant?: "inline" | "preview" | "centered";
  percent?: number;
  completedSteps?: string[];
  remainingSteps?: string[];
  footer?: React.ReactNode;
}

export const LoadingPanel: React.FC<LoadingPanelProps> = ({
  message = "Chargement…",
  variant = "centered",
  percent,
  completedSteps,
  remainingSteps,
  footer,
}) => {
  if (variant === "inline") {
    return (
      <div className={`${styles.inline} wp-loading-animate`} role="status" aria-live="polite">
        <LoadingDots size="sm" label={message} />
        <span className={styles.message}>{message}</span>
      </div>
    );
  }

  return (
    <div className={`${styles.panel} wp-loading-animate`} role="status" aria-live="polite">
      {typeof percent === "number" && (
        <LoadingProgress
          percent={percent}
          message={message}
          completedSteps={completedSteps}
          remainingSteps={remainingSteps}
          showStepLists={Boolean(completedSteps?.length || remainingSteps?.length)}
          footer={footer}
        />
      )}
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
        {typeof percent !== "number" && (
          <>
            <LoadingDots size="md" label={message} />
            <span>{message}</span>
          </>
        )}
      </div>
    </div>
  );
};
