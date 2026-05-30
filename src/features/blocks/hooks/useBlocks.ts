import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blocksApi } from "../services/blocksApi";
import type { CreateBlockBody, UpdateBlockBody, ReorderBlocksBody } from "@/types";
import { toast } from "@/store/toast";

export const useBlocks = (pageId: string | null) => {
  return useQuery({
    queryKey: ["blocks", pageId],
    queryFn: () => blocksApi.getAll(pageId!),
    enabled: !!pageId,
  });
};

export const useCreateBlock = (pageId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBlockBody) => {
      if (!pageId) throw new Error("No page selected");
      return blocksApi.create(pageId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocks", pageId] });
    },
    onError: () => toast.error("Failed to add block"),
  });
};

export const useUpdateBlock = (pageId: string | null) => {
  return useMutation({
    mutationFn: ({ blockId, data }: { blockId: string; data: UpdateBlockBody }) => {
      if (!pageId) throw new Error("No page selected");
      return blocksApi.update(pageId, blockId, data);
    },
    // We don't invalidate here by default to prevent UI flashing during typing
    // The component using this hook can optionally invalidate on settle if needed
    onError: () => toast.error("Failed to update block"),
  });
};

export const useDeleteBlock = (pageId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blockId: string) => {
      if (!pageId) throw new Error("No page selected");
      return blocksApi.delete(pageId, blockId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocks", pageId] });
      toast.success("Block removed");
    },
    onError: () => toast.error("Failed to delete block"),
  });
};

export const useReorderBlocks = (pageId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderBlocksBody) => {
      if (!pageId) throw new Error("No page selected");
      return blocksApi.reorder(pageId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocks", pageId] });
    },
    onError: () => toast.error("Failed to reorder blocks"),
  });
};
