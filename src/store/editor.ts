"use client";

import { create } from "zustand";

interface EditorState {
  projectId: string | null;
  selectedPageId: string | null;
  selectedBlockId: string | null;
  isPreviewMode: boolean;
  isSidebarCollapsed: boolean;
  isPropertiesCollapsed: boolean;

  setProjectId: (id: string) => void;
  selectPage: (id: string) => void;
  selectBlock: (id: string | null) => void;
  togglePreview: () => void;
  toggleSidebar: () => void;
  toggleProperties: () => void;
  reset: () => void;
}

const INITIAL_STATE = {
  projectId: null,
  selectedPageId: null,
  selectedBlockId: null,
  isPreviewMode: false,
  isSidebarCollapsed: false,
  isPropertiesCollapsed: false,
};

export const useEditorStore = create<EditorState>((set) => ({
  ...INITIAL_STATE,

  setProjectId: (id: string): void => {
    set({ projectId: id });
  },

  selectPage: (id: string): void => {
    set({ selectedPageId: id, selectedBlockId: null });
  },

  selectBlock: (id: string | null): void => {
    set({ selectedBlockId: id });
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

  reset: (): void => {
    set(INITIAL_STATE);
  },
}));
