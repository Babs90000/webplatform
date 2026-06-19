import React from "react";
import { AlertCircle } from "lucide-react";
import styles from "./ErrorMessage.module.css";
import { Icon } from "@/shared/components/Icon";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = "An error occurred",
  message,
  onRetry,
  className,
}) => {
  return (
    <div className={`${styles.container} ${className ?? ""}`} role="alert">
      <Icon icon={AlertCircle} size="lg" className={styles.icon} />
      <div className={styles.content}>
        <h4 className={styles.title}>{title}</h4>
        <p className={styles.message}>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className={styles.retryButton}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
};
