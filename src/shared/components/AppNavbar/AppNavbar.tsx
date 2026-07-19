"use client";

import React, { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, Plus, Sparkles, X } from "lucide-react";
import styles from "./AppNavbar.module.css";
import { Button } from "@/shared/components/Button";
import { Icon } from "@/shared/components/Icon";
import { useAuth } from "@/features/auth/hooks/useAuth";

const LogoMark: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
    <rect width="28" height="28" rx="8" fill="url(#appNavLogo)" />
    <path
      d="M8 18V10l6 4.5L20 10v8"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="appNavLogo" x1="0" y1="0" x2="28" y2="28">
        <stop stopColor="#6366f1" />
        <stop offset="1" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
  </svg>
);

export const AppNavbar: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = (): void => setMenuOpen(false);

  const goOnboarding = (): void => {
    closeMenu();
    router.push("/onboarding");
  };

  const handleLogout = (): void => {
    closeMenu();
    logout();
  };

  const displayName = user?.email?.split("@")[0] ?? "Compte";

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link href="/dashboard" className={styles.brand} onClick={closeMenu}>
          <LogoMark />
          <span className={styles.brandText}>WebPlatform</span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/onboarding")}
          >
            <Icon icon={Sparkles} size="sm" />
            Assistant
          </Button>
          <div className={styles.userChip} title={user?.email ?? undefined}>
            <span className={styles.userName}>{displayName}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <Icon icon={LogOut} size="sm" />
            Déconnexion
          </Button>
          <div className={styles.divider} aria-hidden="true" />
          <Button size="sm" onClick={() => router.push("/onboarding")}>
            <Icon icon={Plus} size="sm" />
            Nouveau
          </Button>
        </nav>

        <div className={styles.mobileActions}>
          <Button
            size="sm"
            onClick={() => router.push("/onboarding")}
            ariaLabel="Nouveau projet"
          >
            <Icon icon={Plus} size="sm" />
            <span className={styles.newLabel}>Nouveau</span>
          </Button>
          <button
            type="button"
            className={styles.menuBtn}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Icon icon={menuOpen ? X : Menu} size="md" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            className={styles.backdrop}
            aria-label="Fermer le menu"
            onClick={closeMenu}
          />
          <nav
            id={menuId}
            className={styles.mobilePanel}
            aria-label="Menu compte"
          >
            <p className={styles.mobileEmail}>{user?.email ?? "Compte"}</p>
            <button type="button" className={styles.mobileItem} onClick={goOnboarding}>
              <Icon icon={Sparkles} size="sm" />
              Assistant guidé
            </button>
            <button type="button" className={styles.mobileItem} onClick={goOnboarding}>
              <Icon icon={Plus} size="sm" />
              Nouveau projet
            </button>
            <button
              type="button"
              className={`${styles.mobileItem} ${styles.mobileDanger}`}
              onClick={handleLogout}
            >
              <Icon icon={LogOut} size="sm" />
              Déconnexion
            </button>
          </nav>
        </>
      )}
    </header>
  );
};
