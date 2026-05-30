import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { Project, CreateProjectBody, UpdateProjectBody } from "@/types";

const getToken = () => useAuthStore.getState().token || undefined;

export const projectsApi = {
  getAll: (): Promise<Project[]> => {
    return api.get<Project[]>("/projects", getToken());
  },

  getById: (id: string): Promise<Project> => {
    return api.get<Project>(`/projects/${id}`, getToken());
  },

  create: (data: CreateProjectBody): Promise<Project> => {
    return api.post<Project>("/projects", data, getToken());
  },

  update: (id: string, data: UpdateProjectBody): Promise<Project> => {
    return api.put<Project>(`/projects/${id}`, data, getToken());
  },

  delete: (id: string): Promise<void> => {
    return api.delete(`/projects/${id}`, getToken());
  },
};
