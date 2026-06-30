import { test, expect, isLiveMode } from "./fixtures";
import { getPreviewFrame, gotoStudio, isDesktopProject } from "./helpers/api-mocks";
import { getFixtureSlug } from "./helpers/project-fixture";
import {
  expectMobileNavVisible,
  expectPrimaryHeadingVisible,
  getSiteExpectations,
  tryOpenMobileMenu,
} from "./helpers/site-expectations";

test.describe("Sites générés — aperçu studio (iframe)", () => {
  test("affiche le HTML bundlé dans l’iframe", async ({ authedPage: page }) => {
    await gotoStudio(page);

    const frame = getPreviewFrame(page);
    if (!frame) throw new Error("Iframe studio introuvable");

    const expectations = getSiteExpectations();
    await expectPrimaryHeadingVisible(frame, expectations);

    const bodyText = (await frame.locator("body").innerText()).trim();
    expect(bodyText.length).toBeGreaterThan(10);

    if (expectations.bodyTextSample) {
      const snippet = expectations.bodyTextSample.slice(0, 40);
      await expect(frame.locator("body")).toContainText(snippet, { ignoreCase: true });
    }
  });

  test("navigation mobile du site dans l’iframe", async ({ authedPage: page }, testInfo) => {
    test.skip(
      isDesktopProject(testInfo.project.name),
      "Menu burger testé en viewport mobile/tablette studio",
    );

    await gotoStudio(page);

    const frame = getPreviewFrame(page);
    if (!frame) throw new Error("Iframe studio introuvable");

    const expectations = getSiteExpectations();
    await expectPrimaryHeadingVisible(frame, expectations);

    test.skip(
      !expectations.mobileMenu.available,
      "Ce site exporté n’expose pas de menu mobile détectable",
    );

    const opened = await tryOpenMobileMenu(frame, expectations);
    test.skip(!opened, "Bouton menu mobile non interactif dans l’iframe");

    await expectMobileNavVisible(frame, expectations);
    await expect(frame.getByRole("link").first()).toBeVisible();
  });

  test("capture visuelle du site généré dans l’iframe", async ({ authedPage: page }, testInfo) => {
    test.skip(isLiveMode(), "Snapshots visuels réservés au mode mock (fixture exportée)");
    await gotoStudio(page);

    const preview = page.getByTestId("studio-preview-iframe");
    await preview.waitFor({ state: "visible" });

    const frame = getPreviewFrame(page);
    if (!frame) throw new Error("Iframe studio introuvable");

    const expectations = getSiteExpectations();
    await expectPrimaryHeadingVisible(frame, expectations);

    const fixtureSuffix = getFixtureSlug();
    await expect(preview).toHaveScreenshot(
      `generated-site${fixtureSuffix}-${testInfo.project.name}.png`,
      { animations: "disabled" },
    );
  });
});
