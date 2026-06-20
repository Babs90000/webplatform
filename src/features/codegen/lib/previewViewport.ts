import type { LucideIcon } from "lucide-react";
import { Monitor, Smartphone, Tablet } from "lucide-react";

export type PreviewViewport =
  | "full"
  | "mobile"
  | "tablet"
  | "desktop1280"
  | "desktop1440";

export type PreviewViewportShortcutKey = "1" | "2" | "3" | "4" | "5";

export type PreviewZoomMode = "fit" | number;

export interface PreviewViewportConfig {
  width: number;
  height: number;
  label: string;
  shortLabel: string;
  category: "full" | "device" | "desktop";
  shortcutKey: PreviewViewportShortcutKey;
  menuGroup: "full" | "device" | "desktop";
}

export interface PreviewViewportOption {
  id: PreviewViewport;
  label: string;
  shortLabel: string;
  width: number | null;
  height: number | null;
  shortcutKey: PreviewViewportShortcutKey;
  menuGroup: PreviewViewportConfig["menuGroup"];
  icon: LucideIcon;
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
  PreviewViewportConfig
> = {
  full: {
    width: 0,
    height: 0,
    label: "Plein écran",
    shortLabel: "Plein écran",
    category: "full",
    shortcutKey: "1",
    menuGroup: "full",
  },
  mobile: {
    width: 375,
    height: 667,
    label: "Mobile 375px",
    shortLabel: "375px",
    category: "device",
    shortcutKey: "2",
    menuGroup: "device",
  },
  tablet: {
    width: 768,
    height: 1024,
    label: "Tablette 768px",
    shortLabel: "768px",
    category: "device",
    shortcutKey: "3",
    menuGroup: "device",
  },
  desktop1280: {
    width: 1280,
    height: 800,
    label: "Desktop 1280px",
    shortLabel: "1280px",
    category: "desktop",
    shortcutKey: "4",
    menuGroup: "desktop",
  },
  desktop1440: {
    width: 1440,
    height: 900,
    label: "Desktop 1440px",
    shortLabel: "1440px",
    category: "desktop",
    shortcutKey: "5",
    menuGroup: "desktop",
  },
};

const VIEWPORT_ICONS: Record<PreviewViewport, LucideIcon> = {
  full: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  desktop1280: Monitor,
  desktop1440: Monitor,
};

export const PREVIEW_VIEWPORT_OPTIONS: PreviewViewportOption[] =
  PREVIEW_VIEWPORT_ORDER.map((id) => {
    const cfg = PREVIEW_VIEWPORT_CONFIG[id];
    return {
      id,
      label: cfg.label,
      shortLabel: cfg.shortLabel,
      width: id === "full" ? null : cfg.width,
      height: id === "full" ? null : cfg.height,
      shortcutKey: cfg.shortcutKey,
      menuGroup: cfg.menuGroup,
      icon: VIEWPORT_ICONS[id],
    };
  });

export const PREVIEW_VIEWPORT_PRESETS = PREVIEW_VIEWPORT_OPTIONS.filter(
  (opt) => opt.id !== "full",
);

export const VIEWPORT_MENU_GROUPS: Array<{
  id: PreviewViewportConfig["menuGroup"];
  label: string;
}> = [
  { id: "full", label: "Plein écran" },
  { id: "device", label: "Mobile & tablette" },
  { id: "desktop", label: "Desktop QA" },
];

const SHORTCUT_TO_VIEWPORT = new Map<string, PreviewViewport>(
  PREVIEW_VIEWPORT_OPTIONS.map((opt) => [opt.shortcutKey, opt.id]),
);

export const getViewportByShortcut = (key: string): PreviewViewport | null =>
  SHORTCUT_TO_VIEWPORT.get(key) ?? null;

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

export const getPreviewViewportIcon = (viewport: PreviewViewport): LucideIcon =>
  VIEWPORT_ICONS[viewport];

export const computeDeviceScale = (
  containerWidth: number,
  deviceWidth: number,
  zoomMode: PreviewZoomMode,
): number => {
  if (zoomMode === "fit") {
    const padding = 32;
    const available = Math.max(containerWidth - padding, 200);
    return Math.min(1, available / deviceWidth);
  }
  return zoomMode / 100;
};

export const STUDIO_SHORTCUTS_SEEN_KEY = "wp-studio-shortcuts-seen";

export interface StudioShortcut {
  keys: string[];
  label: string;
  description: string;
}

export const STUDIO_SHORTCUTS: StudioShortcut[] = [
  {
    keys: ["1", "2", "3", "4", "5"],
    label: "Preset direct",
    description:
      "1 plein écran · 2 mobile 375px · 3 tablette 768px · 4 desktop 1280px · 5 desktop 1440px",
  },
  {
    keys: ["M"],
    label: "Cycle responsive",
    description: "Passe au preset suivant dans l'ordre (comme le menu déroulant)",
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
    label: "Guide du studio",
    description: "Ouvre le guide des raccourcis et des tailles d'aperçu",
  },
  {
    keys: ["Échap"],
    label: "Quitter / fermer",
    description:
      "Ferme l'aide, revient au plein écran ou quitte l'aperçu seul",
  },
];
