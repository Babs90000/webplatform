import { test, expect } from "@playwright/test";

test.describe("Authentification", () => {
  test("formulaire de connexion visible sur tous les viewports", async ({ page }) => {
    await page.goto("/login");

    await page.getByTestId("login-form").waitFor({ state: "visible", timeout: 15_000 });
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Mot de passe")).toBeVisible();
    await expect(page.getByRole("button", { name: /se connecter/i })).toBeVisible();
  });
});
