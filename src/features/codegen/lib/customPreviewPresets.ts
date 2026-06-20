export interface CustomPreviewPreset {
  id: string;
  label: string;
  width: number;
  height: number;
}

export const CUSTOM_PRESETS_STORAGE_KEY = "wp-custom-viewport-presets";

export const VIEWPORT_SIZE_LIMITS = {
  minWidth: 280,
  maxWidth: 2560,
  minHeight: 400,
  maxHeight: 1600,
} as const;

export const COMMON_DEVICE_PRESETS: ReadonlyArray<
  Omit<CustomPreviewPreset, "id">
> = [
  { label: "iPhone 14 Pro", width: 390, height: 844 },
  { label: "iPhone SE", width: 375, height: 667 },
  { label: "Pixel 7", width: 412, height: 915 },
  { label: "Galaxy S23", width: 360, height: 780 },
  { label: "iPad Mini", width: 768, height: 1024 },
  { label: "iPad Pro 11\"", width: 834, height: 1194 },
];

const createPresetId = (): string =>
  `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const validateViewportSize = (
  width: number,
  height: number,
): string | null => {
  const { minWidth, maxWidth, minHeight, maxHeight } = VIEWPORT_SIZE_LIMITS;
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return "Dimensions invalides";
  }
  if (width < minWidth || width > maxWidth) {
    return `Largeur entre ${minWidth} et ${maxWidth}px`;
  }
  if (height < minHeight || height > maxHeight) {
    return `Hauteur entre ${minHeight} et ${maxHeight}px`;
  }
  return null;
};

export const loadCustomPreviewPresets = (): CustomPreviewPreset[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_PRESETS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CustomPreviewPreset =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as CustomPreviewPreset).id === "string" &&
        typeof (item as CustomPreviewPreset).label === "string" &&
        typeof (item as CustomPreviewPreset).width === "number" &&
        typeof (item as CustomPreviewPreset).height === "number",
    );
  } catch {
    return [];
  }
};

export const saveCustomPreviewPresets = (
  presets: CustomPreviewPreset[],
): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOM_PRESETS_STORAGE_KEY, JSON.stringify(presets));
};

export const upsertCustomPreviewPreset = (
  input: Omit<CustomPreviewPreset, "id"> & { id?: string },
): CustomPreviewPreset => {
  const presets = loadCustomPreviewPresets();
  const preset: CustomPreviewPreset = {
    id: input.id ?? createPresetId(),
    label: input.label.trim() || `${input.width} × ${input.height}`,
    width: Math.round(input.width),
    height: Math.round(input.height),
  };
  const idx = presets.findIndex((p) => p.id === preset.id);
  if (idx >= 0) presets[idx] = preset;
  else presets.unshift(preset);
  saveCustomPreviewPresets(presets.slice(0, 12));
  return preset;
};

export const removeCustomPreviewPreset = (id: string): void => {
  saveCustomPreviewPresets(
    loadCustomPreviewPresets().filter((p) => p.id !== id),
  );
};

export const findCustomPreviewPreset = (
  id: string | null,
): CustomPreviewPreset | null => {
  if (!id) return null;
  return loadCustomPreviewPresets().find((p) => p.id === id) ?? null;
};
