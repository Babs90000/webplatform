"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { History } from "@/lib/history";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface EditorSnapshot {
  selectedBlockId: string | null;
  blockOrder: Record<string, string[]>; // pageId -> blockIds
}

interface EditorState {
  projectId: string | null;
  selectedPageId: string | null;
  selectedBlockId: string | null;
  isPreviewMode: boolean;
  isSidebarCollapsed: boolean;
  isPropertiesCollapsed: boolean;
  
  // Hermes V2 Chat State
  hermesMessages: ChatMessage[];
  hermesIsThinking: boolean;
  activeRightPanel: "properties" | "hermes";

  // History for undo/redo
  history: History<EditorSnapshot> | null;
  canUndo: boolean;
  canRedo: boolean;

  // Auto-save tracking
  isDirty: boolean;
  isSaving: boolean;
  lastSaveTime: number | null;

  // Responsive UI tracking
  mobileView: "pages" | "canvas" | "ai";

  setProjectId: (id: string) => void;
  selectPage: (id: string) => void;
  selectBlock: (id: string | null) => void;
  togglePreview: () => void;
  toggleSidebar: () => void;
  toggleProperties: () => void;
  setMobileView: (view: "pages" | "canvas" | "ai") => void;
  
  // Hermes V2 Chat Actions
  addHermesMessage: (message: ChatMessage) => void;
  setHermesIsThinking: (isThinking: boolean) => void;
  switchRightPanel: (panel: "properties" | "hermes") => void;
  clearHermesMessages: () => void;

  // History actions
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Auto-save actions
  markDirty: () => void;
  clearDirty: () => void;
  setSaving: (saving: boolean) => void;
  
  reset: () => void;
}

const INITIAL_SNAPSHOT: EditorSnapshot = {
  selectedBlockId: null,
  blockOrder: {},
};

const INITIAL_STATE = {
  projectId: null,
  selectedPageId: null,
  selectedBlockId: null,
  isPreviewMode: false,
  isSidebarCollapsed: false,
  isPropertiesCollapsed: false,
  mobileView: "canvas" as "pages" | "canvas" | "ai",
  hermesMessages: [] as ChatMessage[],
  hermesIsThinking: false,
  activeRightPanel: "properties" as "properties" | "hermes",
  history: null as History<EditorSnapshot> | null,
  canUndo: false,
  canRedo: false,
  isDirty: false,
  isSaving: false,
  lastSaveTime: null,
};

export const useEditorStore = create<EditorState>()(
  devtools(
    (set, get) => ({
      ...INITIAL_STATE,

      setProjectId: (id: string): void => {
        set({ projectId: id, history: new History(INITIAL_SNAPSHOT) });
      },

      selectPage: (id: string): void => {
        set({ selectedPageId: id, selectedBlockId: null, mobileView: "canvas" });
        get().markDirty();
      },

      selectBlock: (id: string | null): void => {
        set({ selectedBlockId: id });
        get().markDirty();
      },

      togglePreview: (): void => {
        set((state) => ({ isPreviewMode: !state.isPreviewMode }));
      },

      toggleSidebar: (): void => {
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }));
      },

      toggleProperties: (): void => {
        set((state) => ({ isPropertiesCollapsed: !state.isPropertiesCollapsed }));
      },

      setMobileView: (view: "pages" | "canvas" | "ai"): void => {
        set({ mobileView: view });
        if (view === "ai") set({ activeRightPanel: "hermes", isPropertiesCollapsed: false });
      },

      addHermesMessage: (message: ChatMessage): void => {
        set((state) => ({ hermesMessages: [...state.hermesMessages, message] }));
      },

      setHermesIsThinking: (isThinking: boolean): void => {
        set({ hermesIsThinking: isThinking });
      },

      switchRightPanel: (panel: "properties" | "hermes"): void => {
        set({ activeRightPanel: panel, isPropertiesCollapsed: false });
      },

      clearHermesMessages: (): void => {
        set({ hermesMessages: [] });
      },

      pushHistory: (): void => {
        const { history, selectedBlockId } = get();
        if (history) {
          const blockOrder = history.getState().present.blockOrder;
          history.push({ selectedBlockId, blockOrder });
          set({
            canUndo: history.canUndo(),
            canRedo: history.canRedo(),
            isDirty: false,
          });
        }
      },

      undo: (): void => {
        const { history, selectedBlockId } = get();
        if (!history) return;

        const blockOrder = history.getState().present.blockOrder;
        const live: EditorSnapshot = { selectedBlockId, blockOrder };
        const { present } = history.getState();

        if (JSON.stringify(live) !== JSON.stringify(present)) {
          history.recordFuture(live);
          set({
            selectedBlockId: present.selectedBlockId,
            canUndo: history.canUndo(),
            canRedo: history.canRedo(),
          });
          return;
        }

        if (!history.canUndo()) return;

        const snapshot = history.undo();
        if (snapshot) {
          set({
            selectedBlockId: snapshot.selectedBlockId,
            canUndo: history.canUndo(),
            canRedo: history.canRedo(),
          });
        }
      },

      redo: (): void => {
        const { history } = get();
        if (!history) return;

        if (!history.canRedo()) return;

        const snapshot = history.redo();
        if (snapshot) {
          set({
            selectedBlockId: snapshot.selectedBlockId,
            canUndo: history.canUndo(),
            canRedo: history.canRedo(),
          });
        }
      },

      markDirty: (): void => {
        set({ isDirty: true });
      },

      clearDirty: (): void => {
        set({ isDirty: false });
      },

      setSaving: (saving: boolean): void => {
        set({ isSaving: saving, lastSaveTime: saving ? null : Date.now() });
      },
      
      reset: (): void => {
        set(INITIAL_STATE);
      },
    }),
    { name: "EditorStore" }
  )
);

