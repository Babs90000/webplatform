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

const consumeSseStream = async (
  url: string,
  method: "POST" | "GET",
  body: unknown | undefined,
  onEvent: (event: CodegenSseEvent) => void,
): Promise<void> => {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
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

  if (!res.body) throw new Error("Flux SSE indisponible");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        const line = part
          .split("\n")
          .map((l) => l.trim())
          .find((l) => l.startsWith("data:"));
        if (!line) continue;
        try {
          const event = JSON.parse(line.slice(5).trim()) as CodegenSseEvent;
          onEvent(event);
        } catch {
          // ignorer
        }
      }
    }
  } catch {
    throw new Error(
      "Connexion interrompue pendant la génération — réessayez (l'IA peut mettre 1 à 2 minutes).",
    );
  }
};

export const streamGenerateSite = async (
  projectId: string,
  onEvent: (event: CodegenSseEvent) => void,
): Promise<void> =>
  consumeSseStream(
    `${BASE}/projects/${projectId}/codegen/generate`,
    "POST",
    {},
    onEvent,
  );

export const streamEditSite = async (
  projectId: string,
  instruction: string,
  onEvent: (event: CodegenSseEvent) => void,
): Promise<void> =>
  consumeSseStream(
    `${BASE}/projects/${projectId}/codegen/edit`,
    "POST",
    { instruction },
    onEvent,
  );

export const streamAuditSite = async (
  projectId: string,
  onEvent: (event: CodegenSseEvent) => void,
): Promise<void> =>
  consumeSseStream(
    `${BASE}/projects/${projectId}/codegen/audit`,
    "POST",
    {},
    onEvent,
  );
