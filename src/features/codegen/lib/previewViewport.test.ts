import { describe, it, expect } from "vitest";
import {
  computeDeviceScale,
  cyclePreviewViewport,
  getViewportByShortcut,
  PREVIEW_VIEWPORT_ORDER,
} from "@/features/codegen/lib/previewViewport";

describe("previewViewport", () => {
  it("maps shortcut keys 1-5 to presets", () => {
    expect(getViewportByShortcut("1")).toBe("full");
    expect(getViewportByShortcut("2")).toBe("mobile");
    expect(getViewportByShortcut("3")).toBe("tablet");
    expect(getViewportByShortcut("4")).toBe("desktop1280");
    expect(getViewportByShortcut("5")).toBe("desktop1440");
    expect(getViewportByShortcut("6")).toBeNull();
  });

  it("cycles through all presets with M order", () => {
    let current = PREVIEW_VIEWPORT_ORDER[0];
    const seen = new Set<string>();

    for (let i = 0; i < PREVIEW_VIEWPORT_ORDER.length; i++) {
      seen.add(current);
      current = cyclePreviewViewport(current);
    }

    expect(seen.size).toBe(PREVIEW_VIEWPORT_ORDER.length);
    expect(current).toBe(PREVIEW_VIEWPORT_ORDER[0]);
  });

  it("computes fit scale for wide desktop in narrow panel", () => {
    const scale = computeDeviceScale(600, 1280, "fit");
    expect(scale).toBeLessThan(1);
    expect(scale).toBeGreaterThan(0.4);
  });

  it("uses explicit zoom percentage when not fit", () => {
    expect(computeDeviceScale(600, 1280, 75)).toBe(0.75);
    expect(computeDeviceScale(600, 1280, 100)).toBe(1);
  });
});
