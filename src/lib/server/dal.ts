/**
 * Data Access Layer — Server Components uniquement.
 * React.cache() garantit l'exécution une seule fois par requête (déduplication).
 */

import { cache } from "react";
import { cookies } from "next/headers";
import { apiServer, ServerApiError } from "./apiServer";
import type { Project } from "@/types";
import type { BillingStatusResponse } from "@/features/billing/services/billingApi";
import type { ProjectListFilter } from "@/features/projects/services/projectsApi";

const TOKEN_COOKIE = "webplatform_token";

/** Lit le JWT depuis le cookie (décodé, sans "undefined"). */
export const getServerToken = cache(async (): Promise<string | null> => {
  const store = await cookies();
  const raw = store.get(TOKEN_COOKIE)?.value;
  if (!raw || raw === "undefined") return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
});

interface ProjectsListResponse {
  projects: Project[];
}

/** Récupère les projets côté serveur. Null si non authentifié ou erreur. */
export const getServerProjects = cache(
  async (filter: ProjectListFilter = "active"): Promise<Project[] | null> => {
    const token = await getServerToken();
    if (!token) return null;
    try {
      const data = await apiServer.get<ProjectsListResponse>(
        `/projects?filter=${filter}`,
        token,
      );
      return data.projects;
    } catch (err) {
      if (err instanceof ServerApiError && err.status === 401) return null;
      // Erreur réseau ou 5xx — on laisse le client retry
      return null;
    }
  },
);

/** Récupère le statut billing côté serveur. Null si non authentifié ou erreur. */
export const getServerBilling = cache(
  async (): Promise<BillingStatusResponse | null> => {
    const token = await getServerToken();
    if (!token) return null;
    try {
      return await apiServer.get<BillingStatusResponse>("/billing/status", token);
    } catch (err) {
      if (err instanceof ServerApiError && err.status === 401) return null;
      return null;
    }
  },
);
