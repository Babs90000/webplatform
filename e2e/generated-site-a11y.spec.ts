import { test, expect } from "./fixtures";
import { expectFrameA11yClean } from "./helpers/a11y";
import { getPreviewFrame, gotoStudio, isDesktopProject } from "./helpers/api-mocks";
import {
  expectMobileNavVisible,
  expectPrimaryHeadingVisible,
  getSiteExpectations,
  tryOpenMobileMenu,
} from "./helpers/site-expectations";

test.describe("Accessibilité — site généré (iframe studio)", () => {
  test("aucune violation serious/critical dans l’aperçu", async ({ authedPage: page }) => {
    await gotoStudio(page);

    const frame = getPreviewFrame(page);
    if (!frame) throw new Error("Iframe studio introuvable");

    await expectPrimaryHeadingVisible(frame, getSiteExpectations());
    await expectFrameA11yClean(page);
  });

  test("menu mobile ouvert reste accessible", async ({ authedPage: page }, testInfo) => {
    test.skip(
      isDesktopProject(testInfo.project.name),
      "Interaction menu mobile en viewport compact",
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
    await expectFrameA11yClean(page);
  });
});
