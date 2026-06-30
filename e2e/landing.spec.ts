import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("affiche le hero et la navigation", async ({ page }, testInfo) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/site pro/i);

    const isCompactNav = testInfo.project.name === "mobile";

    if (!isCompactNav) {
      await expect(page.getByRole("navigation", { name: "Navigation principale" })).toBeVisible();
      await expect(page.getByRole("button", { name: /ouvrir le menu/i })).toBeHidden();
      return;
    }

    const menuBtn = page.getByRole("button", { name: /ouvrir le menu/i });
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();
    const mobileNav = page.getByRole("navigation", { name: "Navigation mobile" });
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "Connexion" })).toBeVisible();
  });
});
