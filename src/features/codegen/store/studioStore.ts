import { create } from "zustand";
import type { ArchitectPlan, ProjectFile } from "../services/codegenApi";

export type StudioPhase =
  | "idle"
  | "architect"
  | "generating"
  | "editing"
  | "ready"
  | "error";

interface StudioState {
  files: ProjectFile[];
  selectedPath: string | null;
  previewPage: string;
  previewHtml: string;
  phase: StudioPhase;
  statusMessage: string;
  plan: ArchitectPlan | null;
  streamingPaths: Record<string, string>;
  chatMessages: Array<{ role: "user" | "assistant"; content: string }>;
  visualEditMode: boolean;
  codeVisible: boolean;

  setFiles: (files: ProjectFile[]) => void;
  upsertFile: (path: string, content: string) => void;
  appendFileChunk: (path: string, chunk: string) => void;
  selectPath: (path: string | null) => void;
  setPreviewPage: (page: string) => void;
  setPreviewHtml: (html: string) => void;
  setPhase: (phase: StudioPhase) => void;
  setStatusMessage: (msg: string) => void;
  setPlan: (plan: ArchitectPlan | null) => void;
  addChatMessage: (role: "user" | "assistant", content: string) => void;
  resetStreaming: () => void;
  setVisualEditMode: (on: boolean) => void;
  setCodeVisible: (visible: boolean) => void;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  files: [],
  selectedPath: null,
  previewPage: "index.html",
  previewHtml: "",
  phase: "idle",
  statusMessage: "",
  plan: null,
  streamingPaths: {},
  chatMessages: [],
  visualEditMode: false,
  codeVisible: false,

  setFiles: (files) => set({ files }),
  upsertFile: (path, content) => {
    const existing = get().files;
    const idx = existing.findIndex((f) => f.path === path);
    if (idx >= 0) {
      const next = [...existing];
      next[idx] = { ...next[idx], content, updated_at: new Date().toISOString() };
      set({ files: next });
    } else {
      set({
        files: [
          ...existing,
          {
            id: `temp-${path}`,
            project_id: "",
            tenant_id: "",
            path,
            content,
            updated_at: new Date().toISOString(),
          },
        ],
      });
    }
  },
  appendFileChunk: (path, chunk) => {
    const streaming = { ...get().streamingPaths };
    streaming[path] = (streaming[path] ?? "") + chunk;
    set({ streamingPaths: streaming });
    get().upsertFile(path, streaming[path]);
  },
  selectPath: (path) => set({ selectedPath: path }),
  setPreviewPage: (page) => set({ previewPage: page }),
  setPreviewHtml: (html) => set({ previewHtml: html }),
  setPhase: (phase) => set({ phase }),
  setStatusMessage: (msg) => set({ statusMessage: msg }),
  setPlan: (plan) => set({ plan }),
  addChatMessage: (role, content) =>
    set({ chatMessages: [...get().chatMessages, { role, content }] }),
  resetStreaming: () => set({ streamingPaths: {} }),
  setVisualEditMode: (on) => set({ visualEditMode: on }),
  setCodeVisible: (visible) => set({ codeVisible: visible }),
}));
