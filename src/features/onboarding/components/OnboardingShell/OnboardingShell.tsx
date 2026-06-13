import React from "react";
import Link from "next/link";
import styles from "./OnboardingShell.module.css";

interface OnboardingShellProps {
  children: React.ReactNode;
  badge?: string;
  showBack?: boolean;
}

const LogoIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden>
    <rect width="28" height="28" rx="8" fill="url(#onbLogoGrad)" />
    <path
      d="M8 18V10l6 4.5L20 10v8"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="onbLogoGrad" x1="0" y1="0" x2="28" y2="28">
        <stop stopColor="#6366f1" />
        <stop offset="1" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
  </svg>
);

export const OnboardingShell: React.FC<OnboardingShellProps> = ({
  children,
  badge,
  showBack = true,
}) => (
  <div className={styles.page}>
    <div className={styles.gridBg} aria-hidden />
    <div className={styles.glowPrimary} aria-hidden />
    <div className={styles.glowSecondary} aria-hidden />

    <header className={styles.header}>
      <Link href="/dashboard" className={styles.logo}>
        <LogoIcon />
        <span className={styles.logoText}>WebPlatform</span>
      </Link>
      <div className={styles.headerRight}>
        {badge && <span className={styles.badge}>{badge}</span>}
        {showBack && (
          <Link href="/dashboard" className={styles.backLink}>
            ← Tableau de bord
          </Link>
        )}
      </div>
    </header>

    <div className={styles.content}>{children}</div>
  </div>
);
