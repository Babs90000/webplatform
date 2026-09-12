import type { Metadata } from "next";
import { LegalPageLayout } from "@/features/legal";
import styles from "@/features/legal/LegalPage.module.css";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation | WebPlatform",
  description: "Conditions générales d'utilisation de WebPlatform par KDevs.",
};

const CguPage: React.FC = () => {
  return (
    <LegalPageLayout title="Conditions générales d'utilisation" updatedAt="12 septembre 2026">
      <section>
        <h2 className={styles.sectionTitle}>1. Objet</h2>
        <p className={styles.paragraph}>
          Les présentes conditions générales d&apos;utilisation (CGU) régissent
          l&apos;accès et l&apos;utilisation de la plateforme WebPlatform,
          éditée par KDevs (ci-après « l&apos;Éditeur »). En créant un compte
          ou en utilisant le service, vous acceptez ces CGU.
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>2. Service</h2>
        <p className={styles.paragraph}>
          WebPlatform permet de concevoir, générer et publier des sites web
          assistés par intelligence artificielle. Les fonctionnalités exactes
          dépendent de votre abonnement et peuvent évoluer.
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>3. Compte utilisateur</h2>
        <p className={styles.paragraph}>
          Vous êtes responsable de la confidentialité de vos identifiants et
          de toute activité réalisée via votre compte. Vous devez fournir des
          informations exactes lors de l&apos;inscription.
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>4. Contenu et responsabilité</h2>
        <p className={styles.paragraph}>
          Vous restez propriétaire du contenu que vous fournissez (textes,
          images, briefs). Vous garantissez disposer des droits nécessaires.
          L&apos;Éditeur ne peut être tenu responsable des contenus générés
          ou publiés par les utilisateurs.
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>5. Abonnement et résiliation</h2>
        <p className={styles.paragraph}>
          Certaines fonctionnalités sont soumises à abonnement. Les conditions
          tarifaires et d&apos;engagement sont indiquées sur le tableau de bord.
          Vous pouvez résilier selon les modalités de votre offre.
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>6. Contact</h2>
        <p className={styles.paragraph}>
          Pour toute question relative aux CGU :{" "}
          <a href="mailto:contact@kdevs.io" className={styles.link}>
            contact@kdevs.io
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default CguPage;
