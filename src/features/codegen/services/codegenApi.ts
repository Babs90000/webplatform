import { getAuthToken } from "@/lib/authToken";

const BASE = process.env.NEXT_PUBLIC_API_URL!;

export interface ProjectFile {
  id: string;
  project_id: string;
  tenant_id: string;
  path: string;
  content: string;
  updated_at: string;
}

export interface ArchitectPlan {
  design_system: {
    palette: Record<string, string>;
    fonts: { heading: string; body: string };
    vibe: string;
    css_approach: string;
  };
  pages: Array<{ path: string; title: string; purpose: string }>;
}

export type CodegenSseEvent =
  | { type: "architect_start" }
  | { type: "architect_done"; plan: ArchitectPlan }
  | { type: "codegen_start" }
  | { type: "file_start"; path: string }
  | { type: "file_chunk"; path: string; chunk: string }
  | { type: "file_saved"; path: string }
  | { type: "audit_start"; mode: "manual" | "auto" }
  | { type: "review_start"; round: number }
  | {
      type: "review_done";
      round: number;
      score: number;
      pass: boolean;
      summary: string;
      expert_scores: {
        directeur_artistique: number;
        designer_ux: number;
        redacteur: number;
        seo: number;
        cro: number;
        accessibilite: number;
      };
      issues_count: number;
    }
  | {
      type: "polish_start";
      pass: number;
      max_passes: number;
      score: number;
      issues_count: number;
      high_count: number;
    }
  | { type: "polish_done"; pass: number; max_passes: number }
  | {
      type: "review_quality_warning";
      score: number;
      summary: string;
    }
  | {
      type: "done";
      files_created: number;
      review_score?: number;
      client_ready?: boolean;
    }
  | { type: "error"; message: string };

const authHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export const fetchProjectFiles = async (
  projectId: string,
): Promise<ProjectFile[]> => {
  const res = await fetch(`${BASE}/projects/${projectId}/files`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Impossible de charger les fichiers");
  const data = (await res.json()) as { files: ProjectFile[] };
  return data.files;
};

export const fetchCodegenPages = async (
  projectId: string,
): Promise<string[]> => {
  const res = await fetch(`${BASE}/projects/${projectId}/codegen/pages`, {
    headers: authHeaders(),
  });
  if (!res.ok) return ["index.html"];
  const data = (await res.json()) as { pages: string[] };
  return data.pages;
};

export const fetchPreviewHtml = async (
  projectId: string,
  page = "index.html",
): Promise<string> => {
  const res = await fetch(
    `${BASE}/projects/${projectId}/codegen/preview?page=${encodeURIComponent(page)}`,
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error("Preview indisponible");
  return res.text();
};

export const saveProjectFile = async (
  projectId: string,
  path: string,
  content: string,
): Promise<ProjectFile> => {
  const res = await fetch(`${BASE}/projects/${projectId}/files`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ path, content }),
  });
  if (!res.ok) throw new Error("Échec de la sauvegarde");
  const data = (await res.json()) as { file: ProjectFile };
  return data.file;
};

export const getExportZipUrl = (projectId: string): string =>
  `${BASE}/projects/${projectId}/codegen/export.zip`;

interface UploadedAsset {
  public_url: string;
  filename: string;
}

export const uploadProjectAsset = async (
  projectId: string,
  file: File,
): Promise<string> => {
  const token = getAuthToken();
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/projects/${projectId}/assets`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  if (!res.ok) throw new Error("Échec de l'import de l'image");
  const data = (await res.json()) as { asset: UploadedAsset };
  return data.asset.public_url;
};

export type CodegenJobStatus = "queued" | "running" | "completed" | "failed";
export type CodegenJobType = "generate" | "edit" | "audit";

export interface CodegenJobSnapshot {
  id: string;
  project_id: string;
  type: CodegenJobType;
  status: CodegenJobStatus;
  instruction: string | null;
  progress: Record<string, unknown>;
  result: Record<string, unknown> | null;
  error: string | null;
  event_count: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CodegenJobStartResponse {
  job_id: string;
  status: CodegenJobStatus;
  resumed: boolean;
}

export interface CodegenJobPollResponse {
  job: CodegenJobSnapshot;
  events: CodegenSseEvent[];
  event_count: number;
}

const postCodegenJob = async (
  url: string,
  body?: unknown,
): Promise<CodegenJobStartResponse> => {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: authHeaders(),
      body: body !== undefined ? JSON.stringify(body) : "{}",
    });
  } catch {
    throw new Error(
      "Impossible de joindre l'API — vérifiez votre connexion ou réessayez dans quelques instants.",
    );
  }

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 404) {
      throw new Error(
        "Génération indisponible : redéployez l'API ou vérifiez NEXT_PUBLIC_API_URL.",
      );
    }
    throw new Error(text || `Erreur HTTP ${res.status}`);
  }

  return res.json() as Promise<CodegenJobStartResponse>;
};

export const startGenerateJob = async (
  projectId: string,
): Promise<CodegenJobStartResponse> =>
  postCodegenJob(`${BASE}/projects/${projectId}/codegen/generate`);

export const startEditJob = async (
  projectId: string,
  instruction: string,
): Promise<CodegenJobStartResponse> =>
  postCodegenJob(`${BASE}/projects/${projectId}/codegen/edit`, { instruction });

export const startAuditJob = async (
  projectId: string,
): Promise<CodegenJobStartResponse> =>
  postCodegenJob(`${BASE}/projects/${projectId}/codegen/audit`);

export const fetchActiveCodegenJob = async (
  projectId: string,
): Promise<{ job: CodegenJobSnapshot | null }> => {
  const res = await fetch(
    `${BASE}/projects/${projectId}/codegen/jobs/active`,
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error("Impossible de charger le job actif");
  return res.json() as Promise<{ job: CodegenJobSnapshot | null }>;
};

export const pollCodegenJob = async (
  projectId: string,
  jobId: string,
  after = 0,
): Promise<CodegenJobPollResponse> => {
  const res = await fetch(
    `${BASE}/projects/${projectId}/codegen/jobs/${jobId}?after=${after}`,
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error("Impossible de suivre la génération");
  return res.json() as Promise<CodegenJobPollResponse>;
};

const JOB_POLL_MS = 2_500;

export const followCodegenJob = async (
  projectId: string,
  jobId: string,
  onEvent: (event: CodegenSseEvent) => void | Promise<void>,
  options?: { initialAfter?: number; onAfter?: (cursor: number) => void },
): Promise<CodegenJobSnapshot> => {
  let after = options?.initialAfter ?? 0;

  while (true) {
    const data = await pollCodegenJob(projectId, jobId, after);

    for (const event of data.events) {
      await onEvent(event);
    }
    after = data.event_count;
    options?.onAfter?.(after);

    if (
      data.job.status === "completed" ||
      data.job.status === "failed"
    ) {
      if (data.job.status === "failed" && data.job.error) {
        const hadErrorEvent = data.events.some((e) => e.type === "error");
        if (!hadErrorEvent) {
          await onEvent({ type: "error", message: data.job.error });
        }
      }
      return data.job;
    }

    await new Promise((resolve) => setTimeout(resolve, JOB_POLL_MS));
  }
};
