import { test, expect, isLiveMode } from "./fixtures";
import { getPreviewFrame, gotoStudio } from "./helpers/api-mocks";
import { expectPrimaryHeadingVisible, getSiteExpectations } from "./helpers/site-expectations";

test.describe("Live API — smoke studio", () => {
  test.beforeEach(() => {
    test.skip(
      !isLiveMode(),
      "Nécessite E2E_MODE=live, WEBPLATFORM_TOKEN et E2E_LIVE_PROJECT_ID",
    );
  });

  test("charge le studio et affiche un site généré réel", async ({ authedPage: page }) => {
    await gotoStudio(page);

    await expect(page.getByTestId("studio-layout")).toBeVisible();
    await expect(page.getByTestId("studio-preview-iframe")).toBeVisible();

    const frame = getPreviewFrame(page);
    if (!frame) throw new Error("Iframe studio introuvable");

    await expectPrimaryHeadingVisible(frame, getSiteExpectations());

    const bodyText = (await frame.locator("body").innerText()).trim();
    expect(bodyText.length).toBeGreaterThan(10);
  });

  test("pas de débordement horizontal dans l’iframe", async ({ authedPage: page }) => {
    await gotoStudio(page);

    const frame = getPreviewFrame(page);
    if (!frame) throw new Error("Iframe studio introuvable");

    await expectPrimaryHeadingVisible(frame, getSiteExpectations());

    const overflow = await frame.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 2;
    });
    expect(overflow).toBe(false);
  });
});
