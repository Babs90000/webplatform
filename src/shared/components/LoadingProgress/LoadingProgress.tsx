import React from "react";
import { Check } from "lucide-react";
import { LoadingDots } from "../LoadingDots";
import { Icon } from "../Icon";
import styles from "./LoadingProgress.module.css";

interface LoadingProgressProps {
  percent: number;
  message?: string;
  completedSteps?: string[];
  remainingSteps?: string[];
  showStepLists?: boolean;
  footer?: React.ReactNode;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  percent,
  message,
  completedSteps = [],
  remainingSteps = [],
  showStepLists = true,
  footer,
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
                  <Icon icon={Check} size="sm" className={styles.stepCheck} />
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

      {footer}
    </div>
  );
};
