import { test } from "@playwright/test";
import { expectPageA11yClean } from "./helpers/a11y";

test.describe("Accessibilité — pages produit", () => {
  test("landing / sans violation serious/critical", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("heading", { level: 1 }).waitFor({ state: "visible" });
    await expectPageA11yClean(page, {
      excludeSelectors: ['[data-testid="landing-hero-decorative"]'],
    });
  });

  test("login /login sans violation serious/critical", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-form").waitFor({ state: "visible" });
    await expectPageA11yClean(page);
  });
});
