import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { Block, CreateBlockBody, UpdateBlockBody, ReorderBlocksBody } from "@/types";

const getToken = () => useAuthStore.getState().token || undefined;

interface BlocksListResponse {
  blocks: Block[];
}

interface BlockResponse {
  block: Block;
}

export const blocksApi = {
  getAll: async (pageId: string): Promise<Block[]> => {
    const data = await api.get<BlocksListResponse>(
      `/pages/${pageId}/blocks`,
      getToken(),
    );
    return data.blocks;
  },

  getById: async (pageId: string, blockId: string): Promise<Block> => {
    const data = await api.get<BlockResponse>(
      `/pages/${pageId}/blocks/${blockId}`,
      getToken(),
    );
    return data.block;
  },

  create: async (pageId: string, data: CreateBlockBody): Promise<Block> => {
    const res = await api.post<BlockResponse>(
      `/pages/${pageId}/blocks`,
      data,
      getToken(),
    );
    return res.block;
  },

  update: async (
    pageId: string,
    blockId: string,
    data: UpdateBlockBody,
  ): Promise<Block> => {
    const res = await api.put<BlockResponse>(
      `/pages/${pageId}/blocks/${blockId}`,
      data,
      getToken(),
    );
    return res.block;
  },

  delete: (pageId: string, blockId: string): Promise<void> => {
    return api.delete(`/pages/${pageId}/blocks/${blockId}`, getToken());
  },

  reorder: (pageId: string, data: ReorderBlocksBody): Promise<void> => {
    return api.post(`/pages/${pageId}/blocks/reorder`, data, getToken());
  },
};
