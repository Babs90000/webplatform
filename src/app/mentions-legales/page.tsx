import type { Metadata } from "next";
import { LegalPageLayout } from "@/features/legal";
import styles from "@/features/legal/LegalPage.module.css";

export const metadata: Metadata = {
  title: "Mentions légales | WebPlatform",
  description: "Mentions légales de WebPlatform — édité par KDevs.",
};

const MentionsLegalesPage: React.FC = () => {
  return (
    <LegalPageLayout title="Mentions légales" updatedAt="12 septembre 2026">
      <section>
        <h2 className={styles.sectionTitle}>Éditeur</h2>
        <p className={styles.paragraph}>
          WebPlatform est édité par <strong>KDevs</strong>.
        </p>
        <ul className={styles.list}>
          <li>Raison sociale : KDevs (placeholder)</li>
          <li>Forme juridique : à compléter</li>
          <li>Siège social : à compléter</li>
          <li>SIRET : à compléter</li>
          <li>
            Email :{" "}
            <a href="mailto:contact@kdevs.io" className={styles.link}>
              contact@kdevs.io
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Directeur de la publication</h2>
        <p className={styles.paragraph}>
          Le directeur de la publication est le représentant légal de KDevs.
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Hébergement</h2>
        <p className={styles.paragraph}>
          L&apos;application et les sites générés sont hébergés sur
          l&apos;infrastructure exploitée par KDevs (détails d&apos;hébergeur
          à compléter selon l&apos;environnement de production).
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Propriété intellectuelle</h2>
        <p className={styles.paragraph}>
          L&apos;ensemble des éléments de la plateforme (marques, logos,
          interface, code) est protégé. Toute reproduction non autorisée est
          interdite. Les contenus créés par les utilisateurs restent leur
          propriété, sous réserve des licences nécessaires aux modèles d&apos;IA
          utilisés.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default MentionsLegalesPage;
