import { test as base, expect, type Page } from "@playwright/test";
import { injectE2ESession } from "./helpers/auth";
import { setupApiMocks } from "./helpers/api-mocks";
import { isLiveMode, isMockMode } from "./helpers/e2e-mode";

type E2EFixtures = {
  authedPage: Page;
};

export const test = base.extend<E2EFixtures>({
  authedPage: async ({ page, baseURL }, use) => {
    await injectE2ESession(page, baseURL);

    if (isMockMode()) {
      await setupApiMocks(page);
    }

    await use(page);
  },
});

export { expect, isLiveMode, isMockMode };
