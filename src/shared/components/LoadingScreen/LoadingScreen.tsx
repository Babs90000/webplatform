import React from "react";
import { LoadingDots } from "../LoadingDots";
import styles from "./LoadingScreen.module.css";

interface LoadingScreenProps {
  message?: string;
  showBrand?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Préparation de l'interface…",
  showBrand = true,
}) => {
  return (
    <div className={styles.screen} role="status" aria-live="polite">
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.content}>
        {showBrand && <span className={styles.brand}>WebPlatform</span>}
        <LoadingDots size="lg" label={message} />
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};
