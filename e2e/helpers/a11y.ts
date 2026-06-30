import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export type A11yImpact = "minor" | "moderate" | "serious" | "critical";

const DEFAULT_BLOCKED_IMPACTS: A11yImpact[] = ["serious", "critical"];

export interface ScanFrameA11yOptions {
  /** Sélecteur CSS de l'iframe (défaut : studio preview). */
  iframeSelector?: string;
  /** Niveaux d'impact qui font échouer le test. */
  blockedImpacts?: A11yImpact[];
  /** Règles axe à ignorer (ex. couleur contraste sur mock). */
  disabledRules?: string[];
  /** Sélecteurs à exclure du scan (décorations, mocks visuels). */
  excludeSelectors?: string[];
}

export const scanFrameA11y = async (
  page: Page,
  options: ScanFrameA11yOptions = {},
) => {
  const iframeSelector =
    options.iframeSelector ?? '[data-testid="studio-preview-iframe"]';
  const blockedImpacts = options.blockedImpacts ?? DEFAULT_BLOCKED_IMPACTS;

  let builder = new AxeBuilder({ page }).include(iframeSelector);

  if (options.disabledRules?.length) {
    builder = builder.disableRules(options.disabledRules);
  }

  for (const selector of options.excludeSelectors ?? []) {
    builder = builder.exclude(selector);
  }

  const results = await builder.analyze();

  const violations = results.violations.filter((v) =>
    blockedImpacts.includes(v.impact as A11yImpact),
  );

  return { results, violations };
};

export const expectFrameA11yClean = async (
  page: Page,
  options?: ScanFrameA11yOptions,
): Promise<void> => {
  const { violations } = await scanFrameA11y(page, options);

  if (violations.length > 0) {
    const summary = violations
      .map(
        (v) =>
          `[${v.impact}] ${v.id} — ${v.description} (${v.nodes.length} nœud(s))`,
      )
      .join("\n");
    expect(violations, `Violations a11y dans l'iframe :\n${summary}`).toEqual(
      [],
    );
  }
};

export const scanPageA11y = async (
  page: Page,
  options: Omit<ScanFrameA11yOptions, "iframeSelector"> = {},
) => {
  const blockedImpacts = options.blockedImpacts ?? DEFAULT_BLOCKED_IMPACTS;
  let builder = new AxeBuilder({ page });

  if (options.disabledRules?.length) {
    builder = builder.disableRules(options.disabledRules);
  }

  for (const selector of options.excludeSelectors ?? []) {
    builder = builder.exclude(selector);
  }

  const results = await builder.analyze();
  const violations = results.violations.filter((v) =>
    blockedImpacts.includes(v.impact as A11yImpact),
  );

  return { results, violations };
};

export const expectPageA11yClean = async (
  page: Page,
  options?: Omit<ScanFrameA11yOptions, "iframeSelector">,
): Promise<void> => {
  const { violations } = await scanPageA11y(page, options);

  if (violations.length > 0) {
    const summary = violations
      .map(
        (v) =>
          `[${v.impact}] ${v.id} — ${v.description} (${v.nodes.length} nœud(s))`,
      )
      .join("\n");
    expect(violations, `Violations a11y page :\n${summary}`).toEqual([]);
  }
};
