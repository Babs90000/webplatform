"use client";

import { create } from "zustand";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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

  setProjectId: (id: string) => void;
  selectPage: (id: string) => void;
  selectBlock: (id: string | null) => void;
  togglePreview: () => void;
  toggleSidebar: () => void;
  toggleProperties: () => void;
  
  // Hermes V2 Chat Actions
  addHermesMessage: (message: ChatMessage) => void;
  setHermesIsThinking: (isThinking: boolean) => void;
  switchRightPanel: (panel: "properties" | "hermes") => void;
  clearHermesMessages: () => void;
  
  reset: () => void;
}

const INITIAL_STATE = {
  projectId: null,
  selectedPageId: null,
  selectedBlockId: null,
  isPreviewMode: false,
  isSidebarCollapsed: false,
  isPropertiesCollapsed: false,
  hermesMessages: [] as ChatMessage[],
  hermesIsThinking: false,
  activeRightPanel: "properties" as "properties" | "hermes",
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

  reset: (): void => {
    set(INITIAL_STATE);
  },
}));
