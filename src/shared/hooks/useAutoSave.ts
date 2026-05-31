/**
 * Hook for auto-saving editor changes
 * Triggers save on dirty state with debounce
 */

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/store/editor";
import { createLogger } from "@/lib/logger";

const logger = createLogger("useAutoSave");
const SAVE_DELAY = 3000; // 3 seconds

interface UseAutoSaveOptions {
  onSave: () => Promise<void>;
  enabled?: boolean;
}

export const useAutoSave = ({
  onSave,
  enabled = true,
}: UseAutoSaveOptions) => {
  const { isDirty, isSaving, markDirty, setSaving, clearDirty } =
    useEditorStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !isDirty || isSaving) return;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        setSaving(true);
        logger.debug("Auto-saving...");
        await onSave();
        clearDirty();
        logger.debug("Auto-save completed");
      } catch (error) {
        logger.error({ error, message: "Auto-save failed" });
        markDirty();
      } finally {
        setSaving(false);
      }
    }, SAVE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isDirty, isSaving, enabled, onSave, clearDirty, markDirty, setSaving]);

  return { isDirty, isSaving };
};
