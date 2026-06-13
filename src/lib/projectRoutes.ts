import { isBlockEditorEnabled } from "./features";

/** Chemin de l'éditeur principal selon le feature flag. */
export const getProjectEditorPath = (projectId: string): string =>
  isBlockEditorEnabled()
    ? `/projects/${projectId}/editor`
    : `/projects/${projectId}/studio`;

/** Chemin studio avec auto-génération après onboarding. */
export const getProjectStudioGeneratePath = (projectId: string): string =>
  `/projects/${projectId}/studio?generate=1`;

/** Chemin studio avec chat ouvert (équivalent legacy hermes=1). */
export const getProjectStudioPath = (projectId: string): string =>
  `/projects/${projectId}/studio`;
