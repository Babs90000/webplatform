import { describe, it, expect, vi } from "vitest";
import { hasSiteNavigation, usesAlpineInProject } from "./navPreviewOffer";
import { offerNavMobilePreviewAfterAudit } from "./offerNavMobilePreview";

vi.mock("@/store/toast", () => ({
  toast: {
    prompt: vi.fn(),
  },
}));

describe("navPreviewOffer", () => {
  it("detects nav in html files", () => {
    expect(
      hasSiteNavigation([
        { path: "index.html", content: '<button class="nav-toggle">' },
      ]),
    ).toBe(true);
    expect(
      hasSiteNavigation([{ path: "index.html", content: "<p>Hello</p>" }]),
    ).toBe(false);
  });

  it("detects alpine directives", () => {
    expect(
      usesAlpineInProject([
        { path: "index.html", content: '<header x-data="{ open: false }">' },
      ]),
    ).toBe(true);
  });
});

describe("offerNavMobilePreviewAfterAudit", () => {
  it("prompts only after audit when full screen and nav present", async () => {
    const { toast } = await import("@/store/toast");
    const onApply = vi.fn();

    offerNavMobilePreviewAfterAudit({
      files: [{ path: "index.html", content: '<nav id="nav-menu">' }],
      previewViewport: "full",
      onApply,
    });

    expect(toast.prompt).toHaveBeenCalledOnce();
  });

  it("skips when already in device preview", async () => {
    const { toast } = await import("@/store/toast");
    vi.mocked(toast.prompt).mockClear();

    offerNavMobilePreviewAfterAudit({
      files: [{ path: "index.html", content: '<nav id="nav-menu">' }],
      previewViewport: "tablet",
      onApply: vi.fn(),
    });

    expect(toast.prompt).not.toHaveBeenCalled();
  });
});
