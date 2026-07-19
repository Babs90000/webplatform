import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ArchitectPlan, ProjectFile } from "../services/codegenApi";
import type { ReviewExpertScores } from "../lib/creativeCommittee";
import {
  cancelStreamingFlush,
  scheduleStreamingFlush,
} from "./studioStreamingFlush";
import type { PreviewViewport, PreviewZoomMode } from "../lib/previewViewport";

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
  previewFocus: boolean;
  previewViewport: PreviewViewport;
  previewZoom: PreviewZoomMode;
  viewportMenuOpen: boolean;
  activeCustomPresetId: string | null;
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
  setPreviewFocus: (on: boolean) => void;
  setPreviewViewport: (viewport: PreviewViewport) => void;
  setActiveCustomPresetId: (id: string | null) => void;
  setPreviewZoom: (zoom: PreviewZoomMode) => void;
  setViewportMenuOpen: (open: boolean) => void;
  setCommitteeReviewActive: (active: boolean) => void;
  setExpertScores: (scores: ReviewExpertScores | null) => void;
  flushStreamingToFiles: () => void;
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
      previewFocus: false,
      previewViewport: "full",
      previewZoom: "fit",
      viewportMenuOpen: false,
      activeCustomPresetId: null,
      committeeReviewActive: false,
      expertScores: null,

      setStudioProjectId: (projectId) => {
        const prev = get().studioProjectId;
        if (prev && prev !== projectId) {
          set({
            studioProjectId: projectId,
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
            previewFocus: false,
            previewViewport: "full",
            previewZoom: "fit",
            viewportMenuOpen: false,
            activeCustomPresetId: null,
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
        set((state) => ({
          streamingPaths: {
            ...state.streamingPaths,
            [path]: (state.streamingPaths[path] ?? "") + chunk,
          },
        }));
        scheduleStreamingFlush();
      },
      flushStreamingToFiles: () => {
        const { streamingPaths, files } = get();
        const paths = Object.keys(streamingPaths);
        if (paths.length === 0) return;

        const next = [...files];
        let changed = false;

        for (const path of paths) {
          const content = streamingPaths[path] ?? "";
          const idx = next.findIndex((f) => f.path === path);
          if (idx >= 0) {
            if (next[idx].content === content) continue;
            next[idx] = {
              ...next[idx],
              content,
              updated_at: new Date().toISOString(),
            };
            changed = true;
          } else {
            next.push({
              id: `temp-${path}`,
              project_id: "",
              tenant_id: "",
              path,
              content,
              updated_at: new Date().toISOString(),
            });
            changed = true;
          }
        }

        if (changed) set({ files: next });
      },
      selectPath: (path) => set({ selectedPath: path }),
      setPreviewPage: (page) => set({ previewPage: page }),
      setPreviewHtml: (html) => {
        if (get().previewHtml === html) return;
        set({ previewHtml: html });
      },
      setPhase: (phase) => set({ phase }),
      setStatusMessage: (msg) => set({ statusMessage: msg }),
      setProgress: (percent, done, pending) =>
        set({ progressPercent: percent, progressDone: done, progressPending: pending }),
      setPlan: (plan) => set({ plan }),
      addChatMessage: (role, content) =>
        set({ chatMessages: [...get().chatMessages, { role, content }] }),
      resetStreaming: () => {
        cancelStreamingFlush();
        set({ streamingPaths: {} });
      },
      setVisualEditMode: (on) => set({ visualEditMode: on }),
      setCodeVisible: (visible) => set({ codeVisible: visible }),
      setPreviewFocus: (on) =>
        set({
          previewFocus: on,
          ...(on ? { codeVisible: false } : {}),
        }),
      setPreviewViewport: (viewport) =>
        set({
          previewViewport: viewport,
          previewZoom: "fit",
          ...(viewport !== "custom" ? { activeCustomPresetId: null } : {}),
        }),
      setActiveCustomPresetId: (id) => set({ activeCustomPresetId: id }),
      setPreviewZoom: (zoom) => set({ previewZoom: zoom }),
      setViewportMenuOpen: (open) => set({ viewportMenuOpen: open }),
      setCommitteeReviewActive: (active) => set({ committeeReviewActive: active }),
      setExpertScores: (scores) => set({ expertScores: scores }),
    }),
    {
      name: "wp-studio-ui",
      version: 2,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        studioProjectId: state.studioProjectId,
        chatMessages: state.chatMessages,
        selectedPath: state.selectedPath,
        previewPage: state.previewPage,
        previewViewport: state.previewViewport,
        activeCustomPresetId: state.activeCustomPresetId,
      }),
      // version 2 : supprime l'ancienne entrée sessionStorage qui pouvait
      // contenir files/previewHtml/streamingPaths (potentiellement > 1 Mo).
      migrate: () => ({
        studioProjectId: null,
        chatMessages: [],
        selectedPath: null,
        previewPage: "index.html",
        previewViewport: "full",
        activeCustomPresetId: null,
      }),
    },
  ),
);
