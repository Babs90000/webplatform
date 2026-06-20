"use client";

import { useEffect } from "react";
import type { PreviewViewport } from "../lib/previewViewport";

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
  previewViewport: PreviewViewport;
  previewFocus: boolean;
  onCycleViewport: () => void;
  onTogglePreviewFocus: () => void;
  onToggleCode: () => void;
  onOpenHelp: () => void;
  onCloseHelp: () => void;
  onSetViewportFull: () => void;
  onExitPreviewFocus: () => void;
}

export const useStudioShortcuts = ({
  enabled = true,
  shortcutsOpen,
  previewViewport,
  previewFocus,
  onCycleViewport,
  onTogglePreviewFocus,
  onToggleCode,
  onOpenHelp,
  onCloseHelp,
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
    previewViewport,
    previewFocus,
    onCycleViewport,
    onTogglePreviewFocus,
    onToggleCode,
    onOpenHelp,
    onCloseHelp,
    onSetViewportFull,
    onExitPreviewFocus,
  ]);
};
