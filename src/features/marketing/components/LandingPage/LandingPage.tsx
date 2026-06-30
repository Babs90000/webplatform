"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import styles from "./LandingPage.module.css";
import { Button } from "@/shared/components/Button";
import { Icon } from "@/shared/components/Icon";
import { AI_ASSISTANT_NAME } from "@/lib/branding";

const LogoIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
    <rect width="28" height="28" rx="8" fill="url(#logoGrad)" />
    <path
      d="M8 18V10l6 4.5L20 10v8"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
        <stop stopColor="#6366f1" />
        <stop offset="1" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
  </svg>
);

const IconBrief: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 3L2 8l10 5 10-5-10-5zM2 16l10 5 10-5M2 12l10 5 10-5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconStudio: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
    <path d="M8 20h8M12 18v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

const IconExport: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 3v12m0 0l4-4m-4 4l-4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const STEPS = [
  { num: "01", title: "Brief guidé", desc: "Répondez à quelques questions sur votre activité et vos objectifs." },
  { num: "02", title: "Architecture IA", desc: `${AI_ASSISTANT_NAME} conçoit le plan, les pages et le design system.` },
  { num: "03", title: "Studio & export", desc: "Affinez en chat, prévisualisez en live et exportez en ZIP." },
] as const;

const STATS = [
  { value: "< 2 min", label: "Brief → premier aperçu" },
  { value: "100%", label: "Code HTML/CSS/JS libre" },
  { value: "0", label: "Dépendance build requise" },
] as const;

export const LandingPage: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = (): void => setMobileNavOpen(false);

  return (
  <div className={styles.page}>
    <div className={styles.gridBg} aria-hidden />
    <div className={styles.glowPrimary} aria-hidden />
    <div className={styles.glowSecondary} aria-hidden />

    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.logo}>
          <LogoIcon />
          <span className={styles.logoText}>WebPlatform</span>
        </Link>
        <nav className={styles.navDesktop} aria-label="Navigation principale">
          <a href="#features" className={styles.navLink}>Fonctionnalités</a>
          <a href="#how" className={styles.navLink}>Comment ça marche</a>
          <Link href="/login" className={styles.navLink}>Connexion</Link>
          <Link href="/register">
            <Button size="sm">Commencer gratuitement</Button>
          </Link>
        </nav>
        <button
          type="button"
          className={styles.menuBtn}
          aria-label={mobileNavOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          <Icon icon={mobileNavOpen ? X : Menu} size="md" />
        </button>
      </div>
      {mobileNavOpen && (
        <nav className={styles.mobileNav} aria-label="Navigation mobile">
          <a href="#features" className={styles.mobileNavLink} onClick={closeMobileNav}>
            Fonctionnalités
          </a>
          <a href="#how" className={styles.mobileNavLink} onClick={closeMobileNav}>
            Comment ça marche
          </a>
          <Link href="/login" className={styles.mobileNavLink} onClick={closeMobileNav}>
            Connexion
          </Link>
          <Link href="/register" onClick={closeMobileNav}>
            <Button size="md" fullWidth>Commencer gratuitement</Button>
          </Link>
        </nav>
      )}
    </header>

    <main>
      <section className={styles.heroSection}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              Propulsé par {AI_ASSISTANT_NAME}
            </div>
            <h1 className={styles.heroTitle}>
              Créez un site pro
              <span className={styles.heroAccent}> en quelques minutes</span>
            </h1>
            <p className={styles.heroSubtitle}>
              De votre brief à des fichiers HTML, CSS et JavaScript exportables —
              avec un studio live pour itérer par chat, sans lock-in.
            </p>
            <div className={styles.heroActions}>
              <Link href="/register" className={styles.ctaLink}>
                <Button size="lg" variant="cta" fullWidth>
                  Démarrer mon projet
                </Button>
              </Link>
              <Link href="/login" className={styles.ctaLink}>
                <Button size="lg" variant="secondary" fullWidth>
                  Se connecter
                </Button>
              </Link>
            </div>
            <ul className={styles.trustList}>
              <li>Sans carte bancaire</li>
              <li>Export ZIP inclus</li>
              <li>Hébergement libre</li>
            </ul>
          </div>

          <div
            className={styles.heroVisual}
            aria-hidden
            data-testid="landing-hero-decorative"
          >
            <div className={styles.studioMock}>
              <div className={styles.mockChrome}>
                <span className={styles.mockDotRed} />
                <span className={styles.mockDotYellow} />
                <span className={styles.mockDotGreen} />
                <span className={styles.mockUrl}>studio.webplatform.app</span>
              </div>
              <div className={styles.mockLayout}>
                <div className={styles.mockFiles}>
                  <span className={styles.mockFileActive}>index.html</span>
                  <span className={styles.mockFile}>css/style.css</span>
                  <span className={styles.mockFile}>js/app.js</span>
                </div>
                <div className={styles.mockCenter}>
                  <div className={styles.mockCode}>
                    <span className={styles.mockCodeTag}>&lt;section&gt;</span>
                    <span className={styles.mockCodeLine}>Votre marque, en ligne.</span>
                    <span className={styles.mockCodeTag}>&lt;/section&gt;</span>
                  </div>
                  <div className={styles.mockPreviewFrame}>
                    <div className={styles.mockPreviewNav} />
                    <div className={styles.mockPreviewHero} />
                    <div className={styles.mockPreviewGrid}>
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
                <div className={styles.mockChat}>
                  <p className={styles.mockChatBubble}>Change le hero en dégradé violet</p>
                  <p className={styles.mockChatReply}>Fichiers mis à jour ✓</p>
                </div>
              </div>
            </div>
            <div className={styles.visualBadge}>
              <span className={styles.visualBadgeIcon}>✨</span>
              Génération en streaming
            </div>
          </div>
        </div>
      </section>

      <section className={styles.statsSection} aria-label="Chiffres clés">
        <div className={styles.statsInner}>
          {STATS.map((s) => (
            <div key={s.label} className={styles.statItem}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Fonctionnalités</p>
          <h2 className={styles.sectionTitle}>Tout pour lancer vite, sans compromis</h2>
          <p className={styles.sectionDesc}>
            Un workflow pensé pour les indépendants, PME et créateurs qui veulent
            un site crédible sans agence ni stack complexe.
          </p>
        </div>
        <div className={styles.featuresGrid}>
          <article className={styles.featureCard}>
            <div className={styles.featureIconWrap}><IconBrief /></div>
            <h3 className={styles.featureTitle}>Onboarding intelligent</h3>
            <p className={styles.featureDesc}>
              Questions ciblées sur votre secteur, votre audience et votre ton.
              Le brief alimente directement l&apos;architecte IA.
            </p>
          </article>
          <article className={`${styles.featureCard} ${styles.featureCardHighlight}`}>
            <div className={styles.featureIconWrap}><IconStudio /></div>
            <h3 className={styles.featureTitle}>Studio live</h3>
            <p className={styles.featureDesc}>
              Arborescence de fichiers, éditeur, aperçu iframe et chat {AI_ASSISTANT_NAME}
              — le tout synchronisé en temps réel.
            </p>
          </article>
          <article className={styles.featureCard}>
            <div className={styles.featureIconWrap}><IconExport /></div>
            <h3 className={styles.featureTitle}>Export propriétaire</h3>
            <p className={styles.featureDesc}>
              Téléchargez un ZIP prêt à déployer sur n&apos;importe quel hébergeur
              statique. Votre code, vos règles.
            </p>
          </article>
        </div>
      </section>

      <section id="how" className={styles.stepsSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Comment ça marche</p>
          <h2 className={styles.sectionTitle}>Trois étapes, un site en ligne</h2>
        </div>
        <ol className={styles.stepsList}>
          {STEPS.map((step) => (
            <li key={step.num} className={styles.stepItem}>
              <span className={styles.stepNum}>{step.num}</span>
              <div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>Prêt à lancer votre site ?</h2>
          <p className={styles.ctaDesc}>
            Créez un compte, répondez au brief et laissez {AI_ASSISTANT_NAME}
            générer votre première version en quelques minutes.
          </p>
          <Link href="/register">
            <Button size="lg" variant="cta">Créer mon compte gratuitement</Button>
          </Link>
        </div>
      </section>
    </main>

    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          <LogoIcon />
          <span>WebPlatform</span>
        </div>
        <p className={styles.footerCopy}>
          © {new Date().getFullYear()} WebPlatform · Assistant {AI_ASSISTANT_NAME}
        </p>
        <div className={styles.footerLinks}>
          <Link href="/login">Connexion</Link>
          <Link href="/register">Inscription</Link>
        </div>
      </div>
    </footer>
  </div>
  );
};
