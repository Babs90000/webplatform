import type { ProjectE2EFixture } from "../types/project-fixture";
import { isLiveMode } from "./e2e-mode";
import { loadProjectFixture } from "./project-fixture";

export interface MobileMenuExpectation {
  available: boolean;
  buttonName?: RegExp;
  navLabel?: RegExp;
}

export interface SiteExpectations {
  projectId: string;
  projectName: string;
  primaryHtmlPath: string | null;
  /** null = accepter le premier h1 visible (mode live ou HTML sans h1 parsable). */
  primaryHeading: string | null;
  hasViewportMeta: boolean;
  hasHtmlLang: boolean;
  hasMainLandmark: boolean;
  bodyTextSample: string | null;
  mobileMenu: MobileMenuExpectation;
}

const decodeHtmlEntities = (text: string): string =>
  text
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'");

const extractFirstH1 = (html: string): string | null => {
  const match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  return match?.[1]?.replace(/\s+/g, " ").trim()
    ? decodeHtmlEntities(match[1].replace(/\s+/g, " ").trim())
    : null;
};

const extractBodyTextSample = (html: string): string | null => {
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const scoped = mainMatch?.[1] ?? html;
  const stripped = decodeHtmlEntities(
    scoped
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
  if (stripped.length < 8) return null;
  return stripped.slice(0, 80);
};

const detectMobileMenu = (html: string): MobileMenuExpectation => {
  const ariaMatch = html.match(
    /aria-label=["']([^"']*(?:menu|Menu|navigation|Navigation)[^"']*)["']/i,
  );
  if (ariaMatch?.[1]) {
    const label = ariaMatch[1].trim();
    return {
      available: true,
      buttonName: new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      navLabel: /navigation|nav/i,
    };
  }

  if (
    /(?:menu-btn|nav-toggle|burger|hamburger|wp-nav-toggle|#menu-btn|id=["']menu)/i.test(
      html,
    )
  ) {
    return {
      available: true,
      buttonName: /menu|ouvrir|navigation/i,
      navLabel: /navigation|nav/i,
    };
  }

  return { available: false };
};

export const buildSiteExpectationsFromFixture = (
  fixture: ProjectE2EFixture,
): SiteExpectations => {
  const htmlPages = fixture.files.filter((file) =>
    file.path.toLowerCase().endsWith(".html"),
  );
  const primary =
    htmlPages.find((file) => file.path.toLowerCase() === "index.html") ??
    htmlPages[0];
  const html = primary?.content ?? "";

  return {
    projectId: fixture.project.id,
    projectName: fixture.project.name,
    primaryHtmlPath: primary?.path ?? null,
    primaryHeading: extractFirstH1(html),
    hasViewportMeta: /<meta[^>]+name=["']viewport["']/i.test(html),
    hasHtmlLang: /<html[^>]+lang=["'][a-z]{2}/i.test(html),
    hasMainLandmark: /<main[\s>]/i.test(html),
    bodyTextSample: extractBodyTextSample(html),
    mobileMenu: detectMobileMenu(html),
  };
};

/** Attentes pour les tests : fixture (mock) ou génériques (live). */
export const getSiteExpectations = (): SiteExpectations => {
  if (isLiveMode()) {
    return {
      projectId: "",
      projectName: "",
      primaryHtmlPath: null,
      primaryHeading: null,
      hasViewportMeta: true,
      hasHtmlLang: true,
      hasMainLandmark: false,
      bodyTextSample: null,
      mobileMenu: {
        available: true,
        buttonName: /menu|ouvrir|navigation|burger/i,
        navLabel: /navigation|nav/i,
      },
    };
  }
  return buildSiteExpectationsFromFixture(loadProjectFixture());
};

import type { Frame } from "@playwright/test";
import { expect } from "@playwright/test";

export const expectPrimaryHeadingVisible = async (
  frame: Frame,
  expectations: SiteExpectations,
): Promise<void> => {
  if (expectations.primaryHeading) {
    await expect(
      frame.getByRole("heading", { name: expectations.primaryHeading }),
    ).toBeVisible({ timeout: 20_000 });
    return;
  }

  await expect(frame.locator("h1").first()).toBeVisible({ timeout: 20_000 });
};

/** Tente d’ouvrir le menu mobile ; retourne false si absent ou non interactif. */
export const tryOpenMobileMenu = async (
  frame: Frame,
  expectations: SiteExpectations,
): Promise<boolean> => {
  if (!expectations.mobileMenu.available) return false;

  const buttonName = expectations.mobileMenu.buttonName ?? /menu|navigation|ouvrir/i;
  const menuBtn = frame.getByRole("button", { name: buttonName }).first();

  try {
    await menuBtn.waitFor({ state: "visible", timeout: 5_000 });
    await menuBtn.click();
    return true;
  } catch {
    return false;
  }
};

export const expectMobileNavVisible = async (
  frame: Frame,
  expectations: SiteExpectations,
): Promise<void> => {
  const navLabel = expectations.mobileMenu.navLabel ?? /navigation|nav/i;
  await expect(frame.getByRole("navigation", { name: navLabel }).first()).toBeVisible({
    timeout: 5_000,
  });
};
