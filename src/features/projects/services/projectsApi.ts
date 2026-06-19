import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { Project, CreateProjectBody, UpdateProjectBody } from "@/types";

const getToken = () => useAuthStore.getState().token || undefined;

interface ProjectsListResponse {
  projects: Project[];
}

interface ProjectResponse {
  project: Project;
}

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const data = await api.get<ProjectsListResponse>("/projects", getToken());
    return data.projects;
  },

  getById: async (id: string): Promise<Project> => {
    const data = await api.get<ProjectResponse>(`/projects/${id}`, getToken());
    return data.project;
  },

  create: async (data: CreateProjectBody): Promise<Project> => {
    const res = await api.post<ProjectResponse>("/projects", data, getToken());
    return res.project;
  },

  update: async (id: string, data: UpdateProjectBody): Promise<Project> => {
    const res = await api.put<ProjectResponse>(`/projects/${id}`, data, getToken());
    return res.project;
  },

  delete: (id: string): Promise<void> => {
    return api.delete(`/projects/${id}`, getToken());
  },

  publish: async (
    id: string,
    data: { custom_domain?: string; subdomain?: string },
  ): Promise<{ project: Project; published_url: string }> => {
    return api.post<{ project: Project; published_url: string }>(
      `/projects/${id}/publish`,
      data,
      getToken(),
    );
  },

  updateSettings: async (
    id: string,
    data: { contact_email?: string },
  ): Promise<Project> => {
    const res = await api.put<ProjectResponse>(
      `/projects/${id}/settings`,
      data,
      getToken(),
    );
    return res.project;
  },
};
