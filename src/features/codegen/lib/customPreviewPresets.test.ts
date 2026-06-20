import { describe, it, expect } from "vitest";
import {
  resolveViewportConfig,
  cyclePreviewViewport,
} from "@/features/codegen/lib/previewViewport";
import {
  validateViewportSize,
  COMMON_DEVICE_PRESETS,
} from "@/features/codegen/lib/customPreviewPresets";

describe("customPreviewPresets", () => {
  it("validates viewport bounds", () => {
    expect(validateViewportSize(390, 844)).toBeNull();
    expect(validateViewportSize(100, 844)).toMatch(/Largeur/);
    expect(validateViewportSize(390, 200)).toMatch(/Hauteur/);
  });

  it("includes iPhone 14 Pro in common presets", () => {
    expect(COMMON_DEVICE_PRESETS.some((p) => p.width === 390)).toBe(true);
  });
});

describe("resolveViewportConfig custom", () => {
  it("returns custom dimensions when viewport is custom", () => {
    const cfg = resolveViewportConfig("custom", {
      id: "x",
      label: "iPhone 14 Pro",
      width: 390,
      height: 844,
    });
    expect(cfg.width).toBe(390);
    expect(cfg.height).toBe(844);
    expect(cfg.label).toBe("iPhone 14 Pro");
  });

  it("skips custom in M cycle", () => {
    expect(cyclePreviewViewport("custom")).toBe("mobile");
  });
});
