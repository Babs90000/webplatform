import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { Page, CreatePageBody, UpdatePageBody, ReorderPagesBody } from "@/types";

const getToken = () => useAuthStore.getState().token || undefined;

export const pagesApi = {
  getAll: (projectId: string): Promise<Page[]> => {
    return api.get<Page[]>(`/projects/${projectId}/pages`, getToken());
  },

  getById: (projectId: string, pageId: string): Promise<Page> => {
    return api.get<Page>(`/projects/${projectId}/pages/${pageId}`, getToken());
  },

  create: (projectId: string, data: CreatePageBody): Promise<Page> => {
    return api.post<Page>(`/projects/${projectId}/pages`, data, getToken());
  },

  update: (projectId: string, pageId: string, data: UpdatePageBody): Promise<Page> => {
    return api.put<Page>(`/projects/${projectId}/pages/${pageId}`, data, getToken());
  },

  delete: (projectId: string, pageId: string): Promise<void> => {
    return api.delete(`/projects/${projectId}/pages/${pageId}`, getToken());
  },

  reorder: (projectId: string, data: ReorderPagesBody): Promise<void> => {
    return api.post(`/projects/${projectId}/pages/reorder`, data, getToken());
  },
};
