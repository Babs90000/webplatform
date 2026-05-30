import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { Block, CreateBlockBody, UpdateBlockBody, ReorderBlocksBody } from "@/types";

const getToken = () => useAuthStore.getState().token || undefined;

export const blocksApi = {
  getAll: (pageId: string): Promise<Block[]> => {
    return api.get<Block[]>(`/pages/${pageId}/blocks`, getToken());
  },

  getById: (pageId: string, blockId: string): Promise<Block> => {
    return api.get<Block>(`/pages/${pageId}/blocks/${blockId}`, getToken());
  },

  create: (pageId: string, data: CreateBlockBody): Promise<Block> => {
    return api.post<Block>(`/pages/${pageId}/blocks`, data, getToken());
  },

  update: (pageId: string, blockId: string, data: UpdateBlockBody): Promise<Block> => {
    return api.put<Block>(`/pages/${pageId}/blocks/${blockId}`, data, getToken());
  },

  delete: (pageId: string, blockId: string): Promise<void> => {
    return api.delete(`/pages/${pageId}/blocks/${blockId}`, getToken());
  },

  reorder: (pageId: string, data: ReorderBlocksBody): Promise<void> => {
    return api.post(`/pages/${pageId}/blocks/reorder`, data, getToken());
  },
};
