import type { Metadata } from "next";
import { LegalPageLayout } from "@/features/legal";
import styles from "@/features/legal/LegalPage.module.css";

export const metadata: Metadata = {
  title: "Politique de confidentialité | WebPlatform",
  description: "Politique de confidentialité WebPlatform — KDevs.",
};

const PrivacyPage: React.FC = () => {
  return (
    <LegalPageLayout title="Politique de confidentialité" updatedAt="12 septembre 2026">
      <section>
        <h2 className={styles.sectionTitle}>1. Responsable du traitement</h2>
        <p className={styles.paragraph}>
          KDevs, éditeur de WebPlatform, est responsable du traitement des
          données personnelles collectées via le service.
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>2. Données collectées</h2>
        <p className={styles.paragraph}>Nous pouvons collecter :</p>
        <ul className={styles.list}>
          <li>Identifiants de compte (email, nom)</li>
          <li>Données de facturation via notre prestataire de paiement</li>
          <li>Contenus de projets (briefs, fichiers, paramètres de site)</li>
          <li>Données techniques (logs, adresse IP, cookies de session)</li>
        </ul>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>3. Finalités</h2>
        <p className={styles.paragraph}>
          Les données sont traitées pour fournir le service, sécuriser les
          comptes, facturer les abonnements, améliorer la plateforme et
          répondre aux obligations légales.
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>4. Conservation</h2>
        <p className={styles.paragraph}>
          Les données sont conservées pendant la durée nécessaire aux finalités
          ci-dessus, puis archivées ou supprimées selon la réglementation
          applicable.
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>5. Vos droits</h2>
        <p className={styles.paragraph}>
          Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès,
          de rectification, d&apos;effacement, de limitation et de portabilité.
          Contact :{" "}
          <a href="mailto:privacy@kdevs.io" className={styles.link}>
            privacy@kdevs.io
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>6. Cookies</h2>
        <p className={styles.paragraph}>
          WebPlatform utilise des cookies techniques indispensables à la
          session authentifiée. Aucun cookie publicitaire n&apos;est déposé
          sans consentement.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default PrivacyPage;
