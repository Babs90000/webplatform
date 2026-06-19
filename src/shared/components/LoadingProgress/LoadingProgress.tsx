import React from "react";
import { LoadingDots } from "../LoadingDots";
import styles from "./LoadingProgress.module.css";

interface LoadingProgressProps {
  percent: number;
  message?: string;
  completedSteps?: string[];
  remainingSteps?: string[];
  showStepLists?: boolean;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  percent,
  message,
  completedSteps = [],
  remainingSteps = [],
  showStepLists = true,
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));
  const doneCount = completedSteps.length;
  const totalCount = doneCount + remainingSteps.length;

  return (
    <div
      className={`${styles.root} wp-loading-animate`}
      role="status"
      aria-live="polite"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={styles.percentRow}>
        <div>
          <div className={styles.percentLabel}>Progression</div>
          <div className={styles.percentValue}>{clamped}%</div>
        </div>
        <LoadingDots size="lg" label={message ?? "Chargement"} />
      </div>

      <div className={styles.barTrack}>
        <div className={styles.barFill} style={{ width: `${clamped}%` }} />
        <div className={styles.barGlow} aria-hidden="true" />
      </div>

      {message && <p className={styles.message}>{message}</p>}

      {showStepLists && totalCount > 0 && (
        <>
          <div className={styles.steps}>
            {completedSteps.map((step) => (
              <div key={`done-${step}`} className={`${styles.stepRow} ${styles.stepDone}`}>
                <span className={styles.stepIcon} aria-hidden="true">
                  <svg
                    className={styles.stepCheck}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span>{step}</span>
              </div>
            ))}
            {remainingSteps.length > 0 && (
              <div className={`${styles.stepRow} ${styles.stepCurrent}`}>
                <span className={styles.stepIcon}>
                  <LoadingDots size="sm" label={remainingSteps[0]} />
                </span>
                <span>{remainingSteps[0]}</span>
              </div>
            )}
            {remainingSteps.slice(1).map((step) => (
              <div key={`pending-${step}`} className={`${styles.stepRow} ${styles.stepPending}`}>
                <span className={styles.stepIcon}>
                  <span className={styles.stepDot} />
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
          <div className={styles.summary}>
            <span>
              Réalisé :{" "}
              <span className={styles.summaryCount}>
                {doneCount}/{totalCount}
              </span>
            </span>
            <span>
              Reste :{" "}
              <span className={styles.summaryCount}>{remainingSteps.length}</span>
            </span>
          </div>
        </>
      )}
    </div>
  );
};
