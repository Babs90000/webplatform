import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ArchitectPlan, ProjectFile } from "../services/codegenApi";
import type { ReviewExpertScores } from "../lib/creativeCommittee";

export type StudioPhase =
  | "idle"
  | "architect"
  | "generating"
  | "editing"
  | "ready"
  | "error";

interface StudioState {
  studioProjectId: string | null;
  files: ProjectFile[];
  selectedPath: string | null;
  previewPage: string;
  previewHtml: string;
  phase: StudioPhase;
  statusMessage: string;
  progressPercent: number;
  progressDone: string[];
  progressPending: string[];
  plan: ArchitectPlan | null;
  streamingPaths: Record<string, string>;
  chatMessages: Array<{ role: "user" | "assistant"; content: string }>;
  visualEditMode: boolean;
  codeVisible: boolean;
  committeeReviewActive: boolean;
  expertScores: ReviewExpertScores | null;

  setStudioProjectId: (projectId: string) => void;
  setFiles: (files: ProjectFile[]) => void;
  upsertFile: (path: string, content: string) => void;
  appendFileChunk: (path: string, chunk: string) => void;
  selectPath: (path: string | null) => void;
  setPreviewPage: (page: string) => void;
  setPreviewHtml: (html: string) => void;
  setPhase: (phase: StudioPhase) => void;
  setStatusMessage: (msg: string) => void;
  setProgress: (percent: number, done: string[], pending: string[]) => void;
  setPlan: (plan: ArchitectPlan | null) => void;
  addChatMessage: (role: "user" | "assistant", content: string) => void;
  resetStreaming: () => void;
  setVisualEditMode: (on: boolean) => void;
  setCodeVisible: (visible: boolean) => void;
  setCommitteeReviewActive: (active: boolean) => void;
  setExpertScores: (scores: ReviewExpertScores | null) => void;
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      studioProjectId: null,
      files: [],
      selectedPath: null,
      previewPage: "index.html",
      previewHtml: "",
      phase: "idle",
      statusMessage: "",
      progressPercent: 0,
      progressDone: [],
      progressPending: [],
      plan: null,
      streamingPaths: {},
      chatMessages: [],
      visualEditMode: false,
      codeVisible: false,
      committeeReviewActive: false,
      expertScores: null,

      setStudioProjectId: (projectId) => {
        const prev = get().studioProjectId;
        if (prev && prev !== projectId) {
          set({
            studioProjectId: projectId,
            files: [],
            previewHtml: "",
            phase: "idle",
            statusMessage: "",
            progressPercent: 0,
            progressDone: [],
            progressPending: [],
            plan: null,
            streamingPaths: {},
            chatMessages: [],
            visualEditMode: false,
            committeeReviewActive: false,
            expertScores: null,
          });
          return;
        }
        set({ studioProjectId: projectId });
      },
      setFiles: (files) => set({ files }),
      upsertFile: (path, content) => {
        const existing = get().files;
        const idx = existing.findIndex((f) => f.path === path);
        if (idx >= 0) {
          const next = [...existing];
          next[idx] = {
            ...next[idx],
            content,
            updated_at: new Date().toISOString(),
          };
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
      setProgress: (percent, done, pending) =>
        set({ progressPercent: percent, progressDone: done, progressPending: pending }),
      setPlan: (plan) => set({ plan }),
      addChatMessage: (role, content) =>
        set({ chatMessages: [...get().chatMessages, { role, content }] }),
      resetStreaming: () => set({ streamingPaths: {} }),
      setVisualEditMode: (on) => set({ visualEditMode: on }),
      setCodeVisible: (visible) => set({ codeVisible: visible }),
      setCommitteeReviewActive: (active) => set({ committeeReviewActive: active }),
      setExpertScores: (scores) => set({ expertScores: scores }),
    }),
    {
      name: "wp-studio-ui",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        studioProjectId: state.studioProjectId,
        chatMessages: state.chatMessages,
        selectedPath: state.selectedPath,
        previewPage: state.previewPage,
        codeVisible: state.codeVisible,
      }),
    },
  ),
);
