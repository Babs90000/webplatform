import { test, expect, isMockMode } from "./fixtures";
import { gotoDashboard } from "./helpers/api-mocks";
import { getFixtureProjectName } from "./helpers/project-fixture";

test.describe("Dashboard", () => {
  test("affiche la liste des projets mockés", async ({ authedPage: page }) => {
    await gotoDashboard(page);

    await expect(page.getByRole("heading", { name: "Mes projets" })).toBeVisible();

    if (isMockMode()) {
      await expect(page.getByText(getFixtureProjectName())).toBeVisible();
    } else {
      await expect(page.getByRole("link").filter({ hasText: /.+/ }).first()).toBeVisible({
        timeout: 30_000,
      });
    }
    await expect(page.getByRole("button", { name: "Actifs" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Archivés" })).toBeVisible();
  });

  test("actions header accessibles", async ({ authedPage: page }, testInfo) => {
    await gotoDashboard(page);

    await expect(page.getByRole("button", { name: /assistant/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /nouveau/i })).toBeVisible();

    if (testInfo.project.name === "mobile") {
      await expect(page.getByRole("button", { name: /déconnexion/i })).toBeVisible();
    }
  });
});
