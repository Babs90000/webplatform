/** Métadonnées des 6 experts du comité créatif (labels courts + détail au survol).
 *  Revue IA : intégrée à la génération/audit (events review_start / review_done).
 *  Garde-fous E2E : e2e/helpers/committee-quality.ts (mêmes axes, sans second LLM).
 */

export type ReviewExpertId =
  | "directeur_artistique"
  | "designer_ux"
  | "redacteur"
  | "seo"
  | "cro"
  | "accessibilite";

export type ReviewExpertScores = Record<ReviewExpertId, number>;

export interface CreativeCommitteeExpert {
  id: ReviewExpertId;
  short: string;
  title: string;
  detail: string;
}

export const CREATIVE_COMMITTEE_EXPERTS: CreativeCommitteeExpert[] = [
  {
    id: "directeur_artistique",
    short: "DA",
    title: "Direction artistique",
    detail: "Palette, ombres, profondeur visuelle, typographie",
  },
  {
    id: "designer_ux",
    short: "UX",
    title: "Designer UX",
    detail: "Layout, responsive, navigation, flux de lecture",
  },
  {
    id: "redacteur",
    short: "Réd",
    title: "Rédacteur",
    detail: "Ton, clarté, ancrage secteur, cohérence marque",
  },
  {
    id: "seo",
    short: "SEO",
    title: "SEO",
    detail: "Titres, meta, structure sémantique, indexabilité",
  },
  {
    id: "cro",
    short: "CRO",
    title: "Conversion",
    detail: "CTA, preuves sociales, parcours d'engagement",
  },
  {
    id: "accessibilite",
    short: "A11y",
    title: "Accessibilité",
    detail: "Contraste, focus, aria, navigation clavier",
  },
];

export const formatExpertScoresCompact = (scores: ReviewExpertScores): string =>
  CREATIVE_COMMITTEE_EXPERTS.map((e) => `${e.short} ${scores[e.id]}`).join(" · ");
