import { test, expect } from "./fixtures";
import { gotoStudio, isDesktopProject, isMobileOrTabletProject } from "./helpers/api-mocks";

test.describe("Studio — drawers mobile/tablette", () => {
  test("ouvre et ferme le drawer fichiers", async ({ authedPage: page }, testInfo) => {
    test.skip(
      isDesktopProject(testInfo.project.name),
      "Les drawers overlay ne s’appliquent qu’en dessous de 900px",
    );

    await gotoStudio(page);

    const mobileBar = page.getByTestId("studio-mobile-bar");
    await expect(mobileBar).toBeVisible();

    const filesDrawer = page.getByTestId("studio-drawer-files");
    await expect(filesDrawer).toHaveAttribute("aria-hidden", "true");

    await page.getByTestId("studio-mobile-files-btn").click();
    await expect(page.getByTestId("studio-layout")).toHaveAttribute("data-mobile-drawer", "files");
    await expect(filesDrawer).toHaveAttribute("aria-hidden", "false");
    await expect(page.getByTestId("studio-drawer-backdrop")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("studio-layout")).toHaveAttribute("data-mobile-drawer", "none");
    await expect(filesDrawer).toHaveAttribute("aria-hidden", "true");
  });

  test("bascule entre fichiers et chat", async ({ authedPage: page }, testInfo) => {
    test.skip(!isMobileOrTabletProject(testInfo.project.name), "Test drawer mobile/tablette");

    await gotoStudio(page);

    await page.getByTestId("studio-mobile-chat-btn").click();
    await expect(page.getByTestId("studio-layout")).toHaveAttribute("data-mobile-drawer", "chat");

    await page.getByTestId("studio-mobile-files-btn").click();
    await expect(page.getByTestId("studio-layout")).toHaveAttribute("data-mobile-drawer", "files");
  });

  test("desktop — barre mobile masquée, panneaux inline", async ({ authedPage: page }, testInfo) => {
    test.skip(!isDesktopProject(testInfo.project.name), "Test layout desktop");

    await gotoStudio(page);

    await expect(page.getByTestId("studio-mobile-bar")).toBeHidden();
    await expect(page.getByTestId("studio-drawer-backdrop")).toBeHidden();
    await expect(page.getByTestId("studio-drawer-files")).toBeVisible();
    await expect(page.getByTestId("studio-drawer-chat")).toBeVisible();
  });
});
