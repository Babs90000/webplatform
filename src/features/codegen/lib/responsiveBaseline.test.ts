import { describe, it, expect } from "vitest";
import {
  appendResponsiveBaseline,
  hasAuthoredBreakpoints,
  MOBILE_GUARD_MARKER,
  MOBILE_RESCUE_MARKER,
  RESPONSIVE_BASELINE_MARKER,
} from "@/features/codegen/lib/responsiveBaseline";

const RESPONSIVE_CSS = `
.features-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
@media (min-width: 768px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .features-grid { grid-template-columns: repeat(3, 1fr); } }
`.trim();

const FIXED_DESKTOP_CSS = `
.features-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
.hero { display: flex; width: 1200px; }
`.trim();

describe("responsiveBaseline", () => {
  it("detects authored breakpoints from two distinct media queries", () => {
    expect(hasAuthoredBreakpoints(RESPONSIVE_CSS)).toBe(true);
    expect(hasAuthoredBreakpoints(FIXED_DESKTOP_CSS)).toBe(false);
  });

  it("ignores a single breakpoint as insufficient", () => {
    const navOnly = `${FIXED_DESKTOP_CSS}\n@media (min-width: 1024px) { .nav-toggle { display: none; } }`;
    expect(hasAuthoredBreakpoints(navOnly)).toBe(false);
  });

  it("keeps the heavy rescue away from a responsive stylesheet", () => {
    const patched = appendResponsiveBaseline(RESPONSIVE_CSS);

    expect(patched).toContain(RESPONSIVE_BASELINE_MARKER);
    expect(patched).toContain(MOBILE_GUARD_MARKER);
    expect(patched).not.toContain(MOBILE_RESCUE_MARKER);
    expect(patched).toContain(".features-grid");
  });

  it("injects the rescue when the stylesheet has no breakpoint", () => {
    const patched = appendResponsiveBaseline(FIXED_DESKTOP_CSS);

    expect(patched).toContain(MOBILE_GUARD_MARKER);
    expect(patched).toContain(MOBILE_RESCUE_MARKER);
  });

  it("is idempotent across repeated patches", () => {
    const once = appendResponsiveBaseline(RESPONSIVE_CSS);
    const twice = appendResponsiveBaseline(once);

    expect(twice).toBe(once);
  });

  it("drops the rescue once breakpoints are added to an already patched file", () => {
    const rescued = appendResponsiveBaseline(FIXED_DESKTOP_CSS);
    expect(rescued).toContain(MOBILE_RESCUE_MARKER);

    const fixed = appendResponsiveBaseline(
      rescued.replace(
        ".hero { display: flex; width: 1200px; }",
        `.hero { display: flex; }
@media (min-width: 768px) { .hero { gap: 2rem; } }
@media (min-width: 1024px) { .hero { flex-direction: row; } }`,
      ),
    );

    expect(fixed).not.toContain(MOBILE_RESCUE_MARKER);
    expect(fixed).toContain(MOBILE_GUARD_MARKER);
  });
});
