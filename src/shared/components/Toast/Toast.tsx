"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import styles from "./Toast.module.css";
import { Icon } from "@/shared/components/Icon";
import { Toast as ToastType, useToastStore } from "@/store/toast";

interface ToastProps {
  toast: ToastType;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  const removeToast = useToastStore((s) => s.removeToast);
  const [isRemoving, setIsRemoving] = useState(false);
  const duration = toast.duration || 4000;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRemoving(true);
      setTimeout(() => removeToast(toast.id), 200);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, duration, removeToast]);

  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(() => removeToast(toast.id), 200);
  };

  const statusIcon =
    toast.type === "success"
      ? CheckCircle2
      : toast.type === "error"
        ? AlertCircle
        : Info;

  return (
    <div
      className={`${styles.toast} ${styles[toast.type]} ${
        isRemoving ? styles.removing : ""
      }`}
    >
      <div className={styles.icon}>
        <Icon icon={statusIcon} size="md" />
      </div>

      <div className={styles.message}>{toast.message}</div>

      <button onClick={handleClose} className={styles.close} aria-label="Fermer">
        <Icon icon={X} size="sm" />
      </button>

      <div className={styles.progress}>
        <div
          className={styles.progressBar}
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  );
};
