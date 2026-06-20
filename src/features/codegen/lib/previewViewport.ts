export type PreviewViewport =
  | "full"
  | "mobile"
  | "tablet"
  | "desktop1280"
  | "desktop1440";

export interface PreviewViewportConfig {
  width: number;
  height: number;
  label: string;
  shortLabel: string;
  category: "device" | "desktop";
}

export const PREVIEW_VIEWPORT_ORDER: PreviewViewport[] = [
  "full",
  "mobile",
  "tablet",
  "desktop1280",
  "desktop1440",
];

export const PREVIEW_VIEWPORT_CONFIG: Record<
  PreviewViewport,
  PreviewViewportConfig | null
> = {
  full: null,
  mobile: {
    width: 375,
    height: 667,
    label: "Mobile 375px",
    shortLabel: "375px",
    category: "device",
  },
  tablet: {
    width: 768,
    height: 1024,
    label: "Tablette 768px",
    shortLabel: "768px",
    category: "device",
  },
  desktop1280: {
    width: 1280,
    height: 800,
    label: "Desktop 1280px",
    shortLabel: "1280px",
    category: "desktop",
  },
  desktop1440: {
    width: 1440,
    height: 900,
    label: "Desktop 1440px",
    shortLabel: "1440px",
    category: "desktop",
  },
};

export const PREVIEW_VIEWPORT_PRESETS = PREVIEW_VIEWPORT_ORDER.filter(
  (v): v is Exclude<PreviewViewport, "full"> => v !== "full",
).map((id) => ({
  id,
  ...PREVIEW_VIEWPORT_CONFIG[id]!,
}));

export const cyclePreviewViewport = (
  current: PreviewViewport,
): PreviewViewport => {
  const idx = PREVIEW_VIEWPORT_ORDER.indexOf(current);
  return PREVIEW_VIEWPORT_ORDER[(idx + 1) % PREVIEW_VIEWPORT_ORDER.length];
};

export const isDevicePreview = (viewport: PreviewViewport): boolean =>
  viewport !== "full";

export const getPreviewViewportLabel = (viewport: PreviewViewport): string => {
  if (viewport === "full") return "Responsive";
  return PREVIEW_VIEWPORT_CONFIG[viewport]?.label ?? "Responsive";
};

export const STUDIO_SHORTCUTS_SEEN_KEY = "wp-studio-shortcuts-seen";

export interface StudioShortcut {
  keys: string[];
  label: string;
  description: string;
}

export const STUDIO_SHORTCUTS: StudioShortcut[] = [
  {
    keys: ["M"],
    label: "Aperçu responsive",
    description:
      "Cycle les tailles : plein écran → mobile 375px → tablette 768px → desktop 1280px → desktop 1440px",
  },
  {
    keys: ["F"],
    label: "Aperçu seul",
    description: "Affiche ou masque la sidebar, le chat et le code",
  },
  {
    keys: ["C"],
    label: "Éditeur de code",
    description:
      "Affiche ou masque le panneau code (indisponible en mode aperçu seul)",
  },
  {
    keys: ["?"],
    label: "Aide raccourcis",
    description: "Ouvre ce guide des raccourcis et des tailles d'aperçu",
  },
  {
    keys: ["Échap"],
    label: "Quitter / fermer",
    description:
      "Ferme l'aide, revient au plein écran ou quitte l'aperçu seul",
  },
];
