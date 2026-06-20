"use client";

import { useEffect } from "react";
import {
  cyclePreviewViewport,
  getViewportByShortcut,
  type PreviewViewport,
} from "../lib/previewViewport";

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
};

interface UseStudioShortcutsOptions {
  enabled?: boolean;
  shortcutsOpen: boolean;
  viewportMenuOpen: boolean;
  previewViewport: PreviewViewport;
  previewFocus: boolean;
  onSelectViewport: (viewport: PreviewViewport) => void;
  onCycleViewport: () => void;
  onTogglePreviewFocus: () => void;
  onToggleCode: () => void;
  onOpenHelp: () => void;
  onCloseHelp: () => void;
  onCloseViewportMenu: () => void;
  onSetViewportFull: () => void;
  onExitPreviewFocus: () => void;
}

export const useStudioShortcuts = ({
  enabled = true,
  shortcutsOpen,
  viewportMenuOpen,
  previewViewport,
  previewFocus,
  onSelectViewport,
  onCycleViewport,
  onTogglePreviewFocus,
  onToggleCode,
  onOpenHelp,
  onCloseHelp,
  onCloseViewportMenu,
  onSetViewportFull,
  onExitPreviewFocus,
}: UseStudioShortcutsOptions): void => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();

      if (key === "escape") {
        if (shortcutsOpen) {
          event.preventDefault();
          onCloseHelp();
          return;
        }
        if (viewportMenuOpen) {
          event.preventDefault();
          onCloseViewportMenu();
          return;
        }
        if (previewViewport !== "full") {
          event.preventDefault();
          onSetViewportFull();
          return;
        }
        if (previewFocus) {
          event.preventDefault();
          onExitPreviewFocus();
        }
        return;
      }

      if (event.key === "?" || (event.shiftKey && key === "/")) {
        event.preventDefault();
        if (shortcutsOpen) onCloseHelp();
        else onOpenHelp();
        return;
      }

      if (/^[1-5]$/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const viewport = getViewportByShortcut(event.key);
        if (viewport) {
          event.preventDefault();
          onSelectViewport(viewport);
        }
        return;
      }

      if (key === "m") {
        event.preventDefault();
        onCycleViewport();
        return;
      }

      if (key === "f") {
        event.preventDefault();
        onTogglePreviewFocus();
        return;
      }

      if (key === "c") {
        if (previewFocus) return;
        event.preventDefault();
        onToggleCode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    enabled,
    shortcutsOpen,
    viewportMenuOpen,
    previewViewport,
    previewFocus,
    onSelectViewport,
    onCycleViewport,
    onTogglePreviewFocus,
    onToggleCode,
    onOpenHelp,
    onCloseHelp,
    onCloseViewportMenu,
    onSetViewportFull,
    onExitPreviewFocus,
  ]);
};

export { cyclePreviewViewport };
