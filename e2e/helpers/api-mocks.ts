import type { Page, Route } from "@playwright/test";
import { MOCK_API_ORIGIN } from "./constants";
import { E2E_ONBOARDING_SESSION_ID } from "./auth";
import { getTargetProjectId } from "./e2e-mode";
import { loadProjectFixture } from "./project-fixture";

const mockBillingStatus = {
  status: "trial",
  trial_active: true,
  subscription: null,
};

const buildMockState = () => {
  const fixture = loadProjectFixture();
  const fixtureProjectId = fixture.project.id;

  const mockProject = { project: fixture.project };
  const mockFiles = {
    files: fixture.files.map((file, index) => ({
      id: `fixture-file-${index + 1}`,
      project_id: fixture.project.id,
      tenant_id: fixture.project.tenant_id,
      path: file.path,
      content: file.content,
      updated_at: fixture.project.updated_at,
    })),
  };

  const primaryHtml =
    fixture.files.find((file) => file.path.endsWith(".html"))?.content ??
    fixture.files[0]?.content ??
    "";

  const mockOnboardingStart = {
    session_id: E2E_ONBOARDING_SESSION_ID,
    project_id: fixtureProjectId,
    questions: [
      {
        id: "activity",
        question: "Quelle est votre activité ?",
        type: "text" as const,
        required: true,
        placeholder: "Ex. Studio photo, restaurant…",
      },
    ],
  };

  const mockOnboardingBaseAnswers = {
    session_id: E2E_ONBOARDING_SESSION_ID,
    dynamic_questions: [
      {
        id: "goal",
        question: "Quel est votre objectif principal ?",
        type: "choice" as const,
        required: true,
        options: [
          { value: "leads", label: "Obtenir des contacts" },
          { value: "brand", label: "Renforcer ma marque" },
        ],
      },
    ],
  };

  return {
    fixture,
    fixtureProjectId,
    mockProject,
    mockFiles,
    primaryHtml,
    mockOnboardingStart,
    mockOnboardingBaseAnswers,
  };
};

const fulfillJson = async (
  route: Route,
  body: unknown,
  status = 200,
): Promise<void> => {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
};

const apiPath = (url: string): string | null => {
  if (!url.startsWith(MOCK_API_ORIGIN)) return null;
  const pathname = new URL(url).pathname;
  const marker = "/api/v1";
  const index = pathname.indexOf(marker);
  if (index === -1) return null;
  return pathname.slice(index + marker.length) || "/";
};

export const setupApiMocks = async (page: Page): Promise<void> => {
  const mocks = buildMockState();

  await page.route(`${MOCK_API_ORIGIN}/api/v1/**`, async (route) => {
    const path = apiPath(route.request().url());
    const method = route.request().method();

    if (!path) {
      await route.continue();
      return;
    }

    if (method === "OPTIONS") {
      await route.fulfill({ status: 204 });
      return;
    }

    if (method === "POST" && path === "/onboarding/start") {
      await fulfillJson(route, mocks.mockOnboardingStart);
      return;
    }

    if (
      method === "POST" &&
      path === `/onboarding/${E2E_ONBOARDING_SESSION_ID}/base-answers`
    ) {
      await fulfillJson(route, mocks.mockOnboardingBaseAnswers);
      return;
    }

    if (
      method === "POST" &&
      path.startsWith("/onboarding/") &&
      (path.endsWith("/dynamic-answers") || path.endsWith("/generate"))
    ) {
      await fulfillJson(route, {
        session_id: E2E_ONBOARDING_SESSION_ID,
        project_id: mocks.fixtureProjectId,
        brief: "Brief E2E",
        pages: [],
        blocks_created: 0,
      });
      return;
    }

    if (method === "GET" && path.startsWith("/onboarding/")) {
      await fulfillJson(route, {
        session_id: E2E_ONBOARDING_SESSION_ID,
        project_id: mocks.fixtureProjectId,
        status: "in_progress",
        base_answers: {},
        dynamic_questions: mocks.mockOnboardingBaseAnswers.dynamic_questions,
        dynamic_answers: {},
        structured_brief: null,
        remaining_base_questions: [],
        remaining_dynamic_questions: [],
      });
      return;
    }

    if (method === "GET" && path === `/projects/${mocks.fixtureProjectId}`) {
      await fulfillJson(route, mocks.mockProject);
      return;
    }

    if (method === "GET" && path === `/projects/${mocks.fixtureProjectId}/files`) {
      await fulfillJson(route, mocks.mockFiles);
      return;
    }

    if (
      method === "GET" &&
      path === `/projects/${mocks.fixtureProjectId}/codegen/pages`
    ) {
      await fulfillJson(route, {
        pages: mocks.fixture.files
          .filter((file) => file.path.endsWith(".html"))
          .map((file) => ({
            path: file.path,
            title: file.path.replace(/\.html$/, ""),
          })),
      });
      return;
    }

    if (
      method === "GET" &&
      path.startsWith(`/projects/${mocks.fixtureProjectId}/codegen/preview`)
    ) {
      await fulfillJson(route, { html: mocks.primaryHtml });
      return;
    }

    if (
      method === "GET" &&
      path === `/projects/${mocks.fixtureProjectId}/codegen/jobs/active`
    ) {
      await fulfillJson(route, { job: null });
      return;
    }

    if (method === "GET" && path.startsWith("/projects")) {
      await fulfillJson(route, { projects: [mocks.mockProject.project] });
      return;
    }

    if (path.startsWith("/billing")) {
      await fulfillJson(route, mockBillingStatus);
      return;
    }

    if (path.startsWith("/exports")) {
      await fulfillJson(route, { status: "ready", download_url: null });
      return;
    }

    if (method === "POST" || method === "PUT" || method === "PATCH") {
      await fulfillJson(route, { ok: true });
      return;
    }

    await fulfillJson(route, {});
  });
};

/** @deprecated Utiliser setupApiMocks */
export const setupStudioApiMocks = setupApiMocks;

export const gotoDashboard = async (page: Page): Promise<void> => {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await page.getByTestId("dashboard-page").waitFor({ state: "visible", timeout: 30_000 });
};

export const gotoOnboarding = async (page: Page): Promise<void> => {
  await page.goto("/onboarding", { waitUntil: "domcontentloaded" });
  await page.getByTestId("onboarding-welcome").waitFor({ state: "visible", timeout: 30_000 });
};

export const gotoStudio = async (page: Page): Promise<void> => {
  const projectId = getTargetProjectId();
  await page.goto(`/projects/${projectId}/studio`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("studio-layout").waitFor({ state: "visible", timeout: 30_000 });
};

export const getPreviewFrame = (page: Page) =>
  page.getByTestId("studio-preview-iframe").contentFrame();

export const isMobileOrTabletProject = (projectName: string): boolean =>
  projectName === "mobile" || projectName === "tablet";

export const isDesktopProject = (projectName: string): boolean =>
  projectName === "desktop";

export const snapshotName = (slug: string, projectName: string): string =>
  `${slug}-${projectName}.png`;
