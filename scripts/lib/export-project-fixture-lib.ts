import fs from "node:fs";
import path from "node:path";
import { parseAuthSession } from "../../src/lib/authToken";
import {
  projectFixtureSchema,
  type ProjectE2EFixture,
} from "../../e2e/types/project-fixture";

export interface ExportProjectFixtureOptions {
  projectId: string;
  token: string;
  apiBase: string;
  out: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  slug: string;
  status: string;
}

const apiFetch = async <T>(
  apiBase: string,
  route: string,
  token: string,
  init?: RequestInit,
): Promise<T> => {
  const res = await fetch(`${apiBase}${route}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${init?.method ?? "GET"} ${route} → HTTP ${res.status}: ${body.slice(0, 300)}`);
  }

  return res.json() as Promise<T>;
};

export const resolveApiBase = (): string => {
  const url =
    process.env.E2E_PROD_API_URL?.trim() ??
    process.env.E2E_FIXTURE_API_URL?.trim() ??
    process.env.E2E_LIVE_API_URL?.trim() ??
    process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!url) {
    throw new Error(
      "URL API requise : E2E_FIXTURE_API_URL, E2E_LIVE_API_URL ou NEXT_PUBLIC_API_URL",
    );
  }

  return url.replace(/\/$/, "");
};

export const loginForToken = async (
  apiBase: string,
  email: string,
  password: string,
): Promise<string> => {
  const res = await fetch(`${apiBase}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`POST /auth/login → HTTP ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as unknown;
  return parseAuthSession(data).token;
};

export const resolveAuthToken = async (apiBase: string): Promise<string> => {
  const direct = process.env.WEBPLATFORM_TOKEN?.trim();
  if (direct) return direct;

  const email =
    process.env.E2E_FIXTURE_EMAIL?.trim() ??
    process.env.E2E_MOCK_USER_EMAIL?.trim();
  const password = process.env.E2E_FIXTURE_PASSWORD?.trim();

  if (email && password) {
    return loginForToken(apiBase, email, password);
  }

  throw new Error(
    "Authentification requise : WEBPLATFORM_TOKEN ou E2E_FIXTURE_EMAIL + E2E_FIXTURE_PASSWORD dans .env.e2e.local",
  );
};

export const listProjects = async (
  apiBase: string,
  token: string,
): Promise<ProjectSummary[]> => {
  const data = await apiFetch<{ projects: ProjectSummary[] }>(
    apiBase,
    "/projects?filter=all",
    token,
  );
  return data.projects ?? [];
};

export const findProjectByHint = (
  projects: ProjectSummary[],
  hint: string,
): ProjectSummary => {
  const normalized = hint.trim().toLowerCase();
  const matches = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(normalized) ||
      project.slug.toLowerCase().includes(normalized),
  );

  if (matches.length === 1) return matches[0]!;

  if (matches.length === 0) {
    throw new Error(
      `Aucun projet ne correspond au hint "${hint}". Projets disponibles :\n${projects
        .map((p) => `  - ${p.name} (${p.id})`)
        .join("\n")}`,
    );
  }

  throw new Error(
    `Plusieurs projets correspondent au hint "${hint}" :\n${matches
      .map((p) => `  - ${p.name} (${p.id})`)
      .join("\n")}\nDéfinissez ${hint.toUpperCase()}_PROJECT_ID explicitement.`,
  );
};

export const exportProjectFixture = async (
  options: ExportProjectFixtureOptions,
): Promise<ProjectE2EFixture> => {
  const apiBase = options.apiBase.replace(/\/$/, "");

  const projectRes = await apiFetch<{
    project: ProjectE2EFixture["project"] & {
      brief?: unknown;
      meta?: unknown;
      settings?: unknown;
    };
  }>(apiBase, `/projects/${options.projectId}`, options.token);

  const filesRes = await apiFetch<{
    files: Array<{
      path: string;
      content: string;
    }>;
  }>(apiBase, `/projects/${options.projectId}/files`, options.token);

  const fixture: ProjectE2EFixture = {
    version: 1,
    exported_at: new Date().toISOString(),
    source: {
      api_base: apiBase,
      project_id: options.projectId,
    },
    project: {
      id: projectRes.project.id,
      tenant_id: projectRes.project.tenant_id,
      name: projectRes.project.name,
      slug: projectRes.project.slug,
      subdomain: projectRes.project.subdomain ?? null,
      custom_domain: projectRes.project.custom_domain ?? null,
      status: projectRes.project.status,
      published_url: projectRes.project.published_url ?? null,
      created_at: projectRes.project.created_at,
      updated_at: projectRes.project.updated_at,
    },
    files: filesRes.files.map((file) => ({
      path: file.path,
      content: file.content,
    })),
  };

  const validated = projectFixtureSchema.parse(fixture);
  const outPath = path.isAbsolute(options.out)
    ? options.out
    : path.join(process.cwd(), options.out);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(validated, null, 2)}\n`, "utf8");

  return validated;
};
