import { BlockType } from "@/types";

export type FieldType = "text" | "textarea" | "color" | "select" | "number" | "boolean" | "array";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldDefinition {
  name: string; // The property key in block.props
  label: string; // User-facing label
  type: FieldType;
  options?: FieldOption[]; // For 'select' type
  arraySchema?: FieldDefinition[]; // For 'array' type (e.g. lists of links/features)
  defaultValue?: unknown;
}

// Maps each BlockType to its editable fields.
// IMPORTANT : les `name` DOIVENT correspondre aux clés des types dans
// `@/types` (NavbarProps, HeroProps, …) — c'est le contrat unique partagé
// entre le rendu des blocs, l'édition et la génération backend.
export const BLOCK_FIELD_SCHEMAS: Record<BlockType, FieldDefinition[]> = {
  navbar: [
    { name: "logo_text", label: "Texte du logo", type: "text", defaultValue: "WebPlatform" },
    { name: "logo_image", label: "Image du logo (URL)", type: "text" },
    { name: "cta_label", label: "Texte du bouton CTA", type: "text", defaultValue: "Commencer" },
    { name: "cta_url", label: "Lien du bouton CTA", type: "text", defaultValue: "#" },
    {
      name: "style", label: "Style", type: "select", defaultValue: "transparent",
      options: [
        { label: "Simple", value: "simple" },
        { label: "Centré", value: "centered" },
        { label: "Transparent", value: "transparent" },
      ],
    },
    { name: "bg_color", label: "Couleur de fond", type: "color", defaultValue: "var(--color-bg-primary)" },
  ],
  hero: [
    { name: "headline", label: "Titre", type: "text", defaultValue: "Construisez quelque chose d'incroyable" },
    { name: "subheadline", label: "Sous-titre", type: "textarea", defaultValue: "La plateforme la plus puissante pour lancer votre prochaine idée." },
    { name: "badge_text", label: "Badge", type: "text" },
    { name: "cta_label", label: "CTA principal — texte", type: "text", defaultValue: "Commencer" },
    { name: "cta_url", label: "CTA principal — lien", type: "text", defaultValue: "#" },
    { name: "secondary_cta_label", label: "CTA secondaire — texte", type: "text" },
    { name: "secondary_cta_url", label: "CTA secondaire — lien", type: "text" },
    {
      name: "style", label: "Style", type: "select", defaultValue: "centered",
      options: [
        { label: "Centré", value: "centered" },
        { label: "Split", value: "split" },
        { label: "Plein écran", value: "fullscreen" },
      ],
    },
    { name: "background_color", label: "Couleur de fond", type: "color", defaultValue: "transparent" },
  ],
  features: [
    { name: "title", label: "Titre", type: "text", defaultValue: "Pourquoi nous choisir" },
    { name: "subtitle", label: "Sous-titre", type: "textarea" },
    {
      name: "layout", label: "Disposition", type: "select", defaultValue: "grid-3",
      options: [
        { label: "Grille 2 colonnes", value: "grid-2" },
        { label: "Grille 3 colonnes", value: "grid-3" },
        { label: "Grille 4 colonnes", value: "grid-4" },
        { label: "Liste", value: "list" },
        { label: "Alternée", value: "alternating" },
      ],
    },
    {
      name: "items", label: "Éléments", type: "array",
      arraySchema: [
        { name: "icon", label: "Icône", type: "text" },
        { name: "title", label: "Titre", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
      ],
    },
    { name: "bg_color", label: "Couleur de fond", type: "color", defaultValue: "var(--color-bg-secondary)" },
  ],
  text: [
    { name: "title", label: "Titre (optionnel)", type: "text" },
    { name: "body", label: "Contenu", type: "textarea", defaultValue: "Saisissez votre texte ici..." },
    {
      name: "align", label: "Alignement", type: "select", defaultValue: "left",
      options: [{ label: "Gauche", value: "left" }, { label: "Centré", value: "center" }, { label: "Droite", value: "right" }],
    },
    {
      name: "max_width", label: "Largeur", type: "select", defaultValue: "normal",
      options: [{ label: "Étroite", value: "narrow" }, { label: "Normale", value: "normal" }, { label: "Large", value: "wide" }],
    },
  ],
  gallery: [
    { name: "title", label: "Titre", type: "text", defaultValue: "Galerie" },
    { name: "subtitle", label: "Sous-titre", type: "textarea" },
    {
      name: "layout", label: "Disposition", type: "select", defaultValue: "grid",
      options: [{ label: "Grille", value: "grid" }, { label: "Masonry", value: "masonry" }, { label: "Carrousel", value: "carousel" }],
    },
    {
      name: "columns", label: "Colonnes", type: "select", defaultValue: "3",
      options: [{ label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }],
    },
  ],
  testimonials: [
    { name: "title", label: "Titre", type: "text", defaultValue: "Ils nous font confiance" },
    { name: "subtitle", label: "Sous-titre", type: "textarea" },
    {
      name: "layout", label: "Disposition", type: "select", defaultValue: "grid",
      options: [{ label: "Grille", value: "grid" }, { label: "Carrousel", value: "carousel" }, { label: "Citation large", value: "quote-large" }],
    },
  ],
  pricing: [
    { name: "title", label: "Titre", type: "text", defaultValue: "Une tarification simple et transparente" },
    { name: "subtitle", label: "Sous-titre", type: "textarea" },
    {
      name: "layout", label: "Disposition", type: "select", defaultValue: "cards",
      options: [{ label: "Cartes", value: "cards" }, { label: "Tableau", value: "table" }, { label: "Minimal", value: "minimal" }],
    },
  ],
  cta: [
    { name: "headline", label: "Titre", type: "text", defaultValue: "Prêt à vous lancer ?" },
    { name: "subtext", label: "Sous-texte", type: "textarea" },
    { name: "button_label", label: "Texte du bouton", type: "text", defaultValue: "Commencer gratuitement" },
    { name: "button_url", label: "Lien du bouton", type: "text", defaultValue: "#" },
    { name: "secondary_button_label", label: "Bouton secondaire — texte", type: "text" },
    { name: "secondary_button_url", label: "Bouton secondaire — lien", type: "text" },
    { name: "bg_color", label: "Couleur de fond", type: "color" },
    {
      name: "style", label: "Style", type: "select", defaultValue: "banner",
      options: [{ label: "Bannière", value: "banner" }, { label: "Carte", value: "card" }, { label: "Pleine largeur", value: "full-width" }],
    },
  ],
  footer: [
    { name: "company_name", label: "Nom de l'entreprise", type: "text", defaultValue: "WebPlatform" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "copyright", label: "Copyright", type: "text" },
    {
      name: "style", label: "Style", type: "select", defaultValue: "simple",
      options: [{ label: "Simple", value: "simple" }, { label: "Colonnes", value: "columns" }, { label: "Minimal", value: "minimal" }],
    },
  ],
  about: [
    { name: "title", label: "Titre", type: "text", defaultValue: "À propos" },
    { name: "body", label: "Contenu", type: "textarea" },
    { name: "image", label: "Image (URL)", type: "text" },
    {
      name: "image_position", label: "Position de l'image", type: "select", defaultValue: "right",
      options: [{ label: "Gauche", value: "left" }, { label: "Droite", value: "right" }],
    },
  ],
  faq: [
    { name: "title", label: "Titre", type: "text", defaultValue: "Questions fréquentes" },
    { name: "subtitle", label: "Sous-titre", type: "textarea" },
    {
      name: "items", label: "Questions", type: "array",
      arraySchema: [
        { name: "question", label: "Question", type: "text" },
        { name: "answer", label: "Réponse", type: "textarea" },
      ],
    },
  ],
  // Empty definitions for remaining blocks
  team: [],
  form: [],
  blog_post: [],
  code: [],
  booking: [],
  ecommerce_product: [],
  ecommerce_cart: [],
  auth_login: [],
  auth_register: [],
  dashboard: [],
  table: [],
  chart: [],
};
