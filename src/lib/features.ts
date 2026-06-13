/** Feature flags — bascule entre l'éditeur blocs (legacy) et le studio code libre. */
export const isBlockEditorEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_USE_BLOCK_EDITOR === "true";

export const isStudioEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_USE_BLOCK_EDITOR !== "true";
