"use client";

import React, { useEffect, useState } from "react";
import styles from "./Toast.module.css";
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
      setTimeout(() => removeToast(toast.id), 200); // wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, duration, removeToast]);

  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(() => removeToast(toast.id), 200);
  };

  return (
    <div
      className={`${styles.toast} ${styles[toast.type]} ${
        isRemoving ? styles.removing : ""
      }`}
    >
      <div className={styles.icon}>
        {toast.type === "success" && (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
            <path
              d="M7.75 12L10.58 14.83L16.25 9.17"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        )}
        {toast.type === "error" && (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
            <path
              d="M12 8V12"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
            <path
              d="M12 16H12.01"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        )}
        {toast.type === "info" && (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
            <path
              d="M12 16V12"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
            <path
              d="M12 8H12.01"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      
      <div className={styles.message}>{toast.message}</div>
      
      <button onClick={handleClose} className={styles.close} aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
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
