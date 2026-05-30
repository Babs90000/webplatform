import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { ChatMessage } from "@/store/editor";

export interface BlockMutation {
  action: "add" | "update" | "delete";
  block_id?: string;
  type?: string;
  props?: any;
  order_index?: number;
}

export interface HermesChatRequest {
  project_id: string;
  page_id: string;
  messages: ChatMessage[];
  current_blocks: any[];
}

export interface HermesChatResponse {
  reply: string;
  mutations: BlockMutation[];
}

const getToken = () => useAuthStore.getState().token || undefined;

export const hermesApi = {
  chat: (data: HermesChatRequest): Promise<HermesChatResponse> => {
    return api.post<HermesChatResponse>("/hermes/chat", data, getToken());
  },
};
