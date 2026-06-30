import { test, expect } from "./fixtures";
import { gotoOnboarding } from "./helpers/api-mocks";

test.describe("Onboarding", () => {
  test("écran d’accueil du wizard", async ({ authedPage: page }) => {
    await gotoOnboarding(page);

    await expect(page.getByTestId("onboarding-welcome")).toBeVisible();
    await expect(page.getByRole("heading", { name: /votre site idéal/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /c'est parti/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /ignorer le brief/i }),
    ).toBeVisible();
  });

  test("démarre le brief et affiche la première question", async ({ authedPage: page }) => {
    await gotoOnboarding(page);

    await page.getByRole("button", { name: /c'est parti/i }).click();
    await expect(page.getByText("Quelle est votre activité ?")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByPlaceholder(/studio photo/i)).toBeVisible();
  });
});
