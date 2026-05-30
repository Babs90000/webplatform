"use client";

import React from "react";
import styles from "./Toast.module.css";
import { useToastStore } from "@/store/toast";
import { Toast } from "./Toast";

export const ToastProvider: React.FC = () => {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className={styles.provider}>
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} />
      ))}
    </div>
  );
};
