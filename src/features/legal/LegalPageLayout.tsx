import React from "react";
import Link from "next/link";
import styles from "./LegalPage.module.css";

interface LegalPageLayoutProps {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  title,
  updatedAt,
  children,
}) => {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand}>
          WebPlatform
        </Link>

        <h1 className={styles.title}>{title}</h1>
        <p className={styles.updated}>Dernière mise à jour : {updatedAt}</p>

        <div className={styles.content}>{children}</div>

        <nav className={styles.footer} aria-label="Pages légales">
          <Link href="/cgu" className={styles.link}>
            CGU
          </Link>
          <Link href="/privacy" className={styles.link}>
            Confidentialité
          </Link>
          <Link href="/mentions-legales" className={styles.link}>
            Mentions légales
          </Link>
          <Link href="/login" className={styles.link}>
            Connexion
          </Link>
        </nav>
      </div>
    </main>
  );
};
