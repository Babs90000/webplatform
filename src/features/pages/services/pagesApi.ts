import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { Page, CreatePageBody, UpdatePageBody, ReorderPagesBody } from "@/types";

const getToken = () => useAuthStore.getState().token || undefined;

interface PagesListResponse {
  pages: Page[];
}

interface PageResponse {
  page: Page;
}

export const pagesApi = {
  getAll: async (projectId: string): Promise<Page[]> => {
    const data = await api.get<PagesListResponse>(
      `/projects/${projectId}/pages`,
      getToken(),
    );
    return data.pages;
  },

  getById: async (projectId: string, pageId: string): Promise<Page> => {
    const data = await api.get<PageResponse>(
      `/projects/${projectId}/pages/${pageId}`,
      getToken(),
    );
    return data.page;
  },

  create: async (projectId: string, data: CreatePageBody): Promise<Page> => {
    const res = await api.post<PageResponse>(
      `/projects/${projectId}/pages`,
      data,
      getToken(),
    );
    return res.page;
  },

  update: async (
    projectId: string,
    pageId: string,
    data: UpdatePageBody,
  ): Promise<Page> => {
    const res = await api.put<PageResponse>(
      `/projects/${projectId}/pages/${pageId}`,
      data,
      getToken(),
    );
    return res.page;
  },

  delete: (projectId: string, pageId: string): Promise<void> => {
    return api.delete(`/projects/${projectId}/pages/${pageId}`, getToken());
  },

  reorder: (projectId: string, data: ReorderPagesBody): Promise<void> => {
    return api.post(`/projects/${projectId}/pages/reorder`, data, getToken());
  },
};
