import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { injectE2ESession } from "./helpers/auth";
import { expectFrameA11yClean } from "./helpers/a11y";
import {
  getPreviewFrame,
  gotoStudio,
  isDesktopProject,
  setupApiMocks,
} from "./helpers/api-mocks";
import { isLiveMode } from "./helpers/e2e-mode";
import {
  getFixtureSlug,
  resetProjectFixtureCache,
} from "./helpers/project-fixture";
import {
  expectMobileNavVisible,
  expectPrimaryHeadingVisible,
  getSiteExpectations,
  tryOpenMobileMenu,
} from "./helpers/site-expectations";

import { fixtureManifestSchema } from "./types/fixture-manifest";

const fixturesDir = path.join(process.cwd(), "e2e/fixtures/projects");
const manifestPath = path.join(fixturesDir, "manifest.json");
const manifestRaw = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as unknown;
const manifest = fixtureManifestSchema.parse(manifestRaw);

for (const entry of manifest.fixtures) {
  const file = entry.file;
  const fixturePath = `e2e/fixtures/projects/${file}`;

  test.describe(`Fixture ${entry.slug} (${file})`, () => {
    test.beforeEach(async ({ page, baseURL }) => {
      process.env.E2E_PROJECT_FIXTURE = fixturePath;
      resetProjectFixtureCache();
      await injectE2ESession(page, baseURL);
      await setupApiMocks(page);
    });

    test("aperçu iframe — contenu principal", async ({ page }) => {
      await gotoStudio(page);

      const frame = getPreviewFrame(page);
      if (!frame) throw new Error("Iframe studio introuvable");

      const expectations = getSiteExpectations();
      await expectPrimaryHeadingVisible(frame, expectations);

      const bodyText = (await frame.locator("body").innerText()).trim();
      expect(bodyText.length).toBeGreaterThan(10);
    });

    test("aperçu iframe — navigation mobile", async ({ page }, testInfo) => {
      test.skip(
        isDesktopProject(testInfo.project.name),
        "Menu burger testé en viewport mobile/tablette studio",
      );

      await gotoStudio(page);

      const frame = getPreviewFrame(page);
      if (!frame) throw new Error("Iframe studio introuvable");

      const expectations = getSiteExpectations();
      test.skip(
        !expectations.mobileMenu.available,
        "Ce site exporté n’expose pas de menu mobile détectable",
      );

      const opened = await tryOpenMobileMenu(frame, expectations);
      test.skip(!opened, "Bouton menu mobile non interactif dans l’iframe");

      await expectMobileNavVisible(frame, expectations);
    });

    test("aperçu iframe — a11y", async ({ page }) => {
      await gotoStudio(page);

      const frame = getPreviewFrame(page);
      if (!frame) throw new Error("Iframe studio introuvable");

      await expectPrimaryHeadingVisible(frame, getSiteExpectations());
      await expectFrameA11yClean(page);
    });

    test("capture visuelle iframe", async ({ page }, testInfo) => {
      test.skip(isLiveMode(), "Snapshots visuels réservés au mode mock");

      await gotoStudio(page);

      const preview = page.getByTestId("studio-preview-iframe");
      await preview.waitFor({ state: "visible" });

      const frame = getPreviewFrame(page);
      if (!frame) throw new Error("Iframe studio introuvable");

      await expectPrimaryHeadingVisible(frame, getSiteExpectations());

      const fixtureSuffix = getFixtureSlug();
      await expect(preview).toHaveScreenshot(
        `generated-site${fixtureSuffix}-${testInfo.project.name}.png`,
        { animations: "disabled" },
      );
    });
  });
}
