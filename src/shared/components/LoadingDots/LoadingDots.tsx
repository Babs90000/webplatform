import React from "react";
import styles from "./LoadingDots.module.css";

interface LoadingDotsProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = "md",
  className = "",
  label = "Chargement en cours",
}) => {
  return (
    <span
      className={`${styles.dots} ${styles[size]} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.dot} aria-hidden="true" />
    </span>
  );
};
