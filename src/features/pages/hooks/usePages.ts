import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pagesApi } from "../services/pagesApi";
import type { CreatePageBody, UpdatePageBody, ReorderPagesBody } from "@/types";
import { toast } from "@/store/toast";

export const usePages = (projectId: string | null) => {
  return useQuery({
    queryKey: ["pages", projectId],
    queryFn: () => pagesApi.getAll(projectId!),
    enabled: !!projectId,
  });
};

export const useCreatePage = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePageBody) => pagesApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", projectId] });
      toast.success("Page created successfully");
    },
    onError: () => toast.error("Failed to create page"),
  });
};

export const useUpdatePage = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pageId, data }: { pageId: string; data: UpdatePageBody }) => 
      pagesApi.update(projectId, pageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", projectId] });
    },
    onError: () => toast.error("Failed to update page"),
  });
};

export const useDeletePage = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pageId: string) => pagesApi.delete(projectId, pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", projectId] });
      toast.success("Page deleted successfully");
    },
    onError: () => toast.error("Failed to delete page"),
  });
};

export const useReorderPages = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderPagesBody) => pagesApi.reorder(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", projectId] });
    },
    onError: () => toast.error("Failed to reorder pages"),
  });
};
