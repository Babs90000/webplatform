import { useStudioStore } from "./studioStore";

const FLUSH_MS = 400;

let flushTimer: number | null = null;

/** Regroupe les chunks SSE en une seule mise à jour du store files. */
export const scheduleStreamingFlush = (): void => {
  if (flushTimer !== null) return;
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    useStudioStore.getState().flushStreamingToFiles();
  }, FLUSH_MS);
};

export const cancelStreamingFlush = (): void => {
  if (flushTimer === null) return;
  window.clearTimeout(flushTimer);
  flushTimer = null;
};
