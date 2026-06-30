"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { LoadingScreen } from "../LoadingScreen";
import styles from "./AuthGuard.module.css";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;

    if (!token) {
      router.replace("/login");
    }
  }, [token, isHydrated, router]);

  if (!isHydrated || !token) {
    return (
      <div className={styles.guard}>
        {fallback ?? <LoadingScreen message="Vérification de la session…" />}
      </div>
    );
  }

  return <>{children}</>;
};
