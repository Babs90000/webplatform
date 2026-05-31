"use client";

import React from "react";
import styles from "./BlockPicker.module.css";
import { PHASE_1_BLOCKS, PHASE_2_BLOCKS, type BlockType } from "@/types";

interface BlockPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: BlockType) => void;
}

interface BlockMeta {
  icon: string;
  label: string;
  description: string;
}

/** Libellés et icônes lisibles pour chaque type de bloc. */
const BLOCK_META: Record<BlockType, BlockMeta> = {
  navbar: { icon: "🧭", label: "Navigation", description: "Barre de menu en haut de page" },
  hero: { icon: "🚀", label: "Hero", description: "Grande bannière d'accroche" },
  features: { icon: "✨", label: "Fonctionnalités", description: "Liste d'atouts ou services" },
  testimonials: { icon: "💬", label: "Témoignages", description: "Avis clients" },
  faq: { icon: "❓", label: "FAQ", description: "Questions fréquentes" },
  footer: { icon: "📎", label: "Pied de page", description: "Liens et mentions en bas" },
  cta: { icon: "📣", label: "Appel à l'action", description: "Bouton de conversion" },
  text: { icon: "📝", label: "Texte", description: "Paragraphe libre" },
  pricing: { icon: "💳", label: "Tarifs", description: "Grille de prix" },
  about: { icon: "ℹ️", label: "À propos", description: "Présentation de l'activité" },
  team: { icon: "👥", label: "Équipe", description: "Membres et rôles" },
  gallery: { icon: "🖼️", label: "Galerie", description: "Grille d'images" },
  form: { icon: "✉️", label: "Formulaire", description: "Contact ou inscription" },
  blog_post: { icon: "📰", label: "Article", description: "Contenu de blog" },
  code: { icon: "💻", label: "Code", description: "Bloc de code" },
  booking: { icon: "📅", label: "Réservation", description: "Prise de rendez-vous" },
  ecommerce_product: { icon: "🛍️", label: "Produit", description: "Fiche produit" },
  ecommerce_cart: { icon: "🛒", label: "Panier", description: "Panier e-commerce" },
  auth_login: { icon: "🔑", label: "Connexion", description: "Formulaire de connexion" },
  auth_register: { icon: "🆕", label: "Inscription", description: "Création de compte" },
  dashboard: { icon: "📊", label: "Tableau de bord", description: "Vue de données" },
  table: { icon: "🗂️", label: "Tableau", description: "Données tabulaires" },
  chart: { icon: "📈", label: "Graphique", description: "Visualisation" },
};

export const BlockPicker: React.FC<BlockPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  if (!isOpen) return null;

  const handleSelect = (type: BlockType): void => {
    onSelect(type);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>Ajouter un bloc</h2>
            <p className={styles.subtitle}>Choisissez un élément à insérer dans la page</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className={styles.body}>
          <h3 className={styles.sectionLabel}>Disponibles</h3>
          <div className={styles.grid}>
            {PHASE_1_BLOCKS.map((type) => {
              const meta = BLOCK_META[type];
              return (
                <button
                  key={type}
                  className={styles.card}
                  onClick={() => handleSelect(type)}
                >
                  <span className={styles.cardIcon}>{meta.icon}</span>
                  <span className={styles.cardLabel}>{meta.label}</span>
                  <span className={styles.cardDesc}>{meta.description}</span>
                </button>
              );
            })}
          </div>

          <h3 className={styles.sectionLabel}>Bientôt disponibles</h3>
          <div className={styles.grid}>
            {PHASE_2_BLOCKS.map((type) => {
              const meta = BLOCK_META[type];
              return (
                <div key={type} className={`${styles.card} ${styles.cardDisabled}`} aria-disabled="true">
                  <span className={styles.cardIcon}>{meta.icon}</span>
                  <span className={styles.cardLabel}>{meta.label}</span>
                  <span className={styles.badge}>Phase 2</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
