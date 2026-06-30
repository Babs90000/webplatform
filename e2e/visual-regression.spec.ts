import { test, expect } from "./fixtures";
import {
  gotoDashboard,
  gotoOnboarding,
  gotoStudio,
  snapshotName,
} from "./helpers/api-mocks";

test.describe("Régression visuelle", () => {
  test("landing", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.getByRole("heading", { level: 1 }).waitFor({ state: "visible" });

    await expect(page).toHaveScreenshot(snapshotName("landing", testInfo.project.name), {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("login", async ({ page }, testInfo) => {
    await page.goto("/login");
    await page.getByTestId("login-form").waitFor({ state: "visible" });

    await expect(page).toHaveScreenshot(snapshotName("login", testInfo.project.name), {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("dashboard", async ({ authedPage: page }, testInfo) => {
    await gotoDashboard(page);

    await expect(page).toHaveScreenshot(snapshotName("dashboard", testInfo.project.name), {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("onboarding welcome", async ({ authedPage: page }, testInfo) => {
    await gotoOnboarding(page);

    await expect(page).toHaveScreenshot(snapshotName("onboarding", testInfo.project.name), {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("studio layout", async ({ authedPage: page }, testInfo) => {
    await gotoStudio(page);
    await page.getByTestId("studio-preview-iframe").waitFor({ state: "visible" });

    await expect(page).toHaveScreenshot(snapshotName("studio", testInfo.project.name), {
      fullPage: true,
      animations: "disabled",
      mask: [page.getByTestId("studio-preview-iframe")],
    });
  });
});
