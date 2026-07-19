import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../services/projectsApi";
import type { CreateProjectBody, UpdateProjectBody } from "@/types";
import type { ProjectListFilter } from "../services/projectsApi";
import { toast } from "@/store/toast";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export const useProjects = (filter: ProjectListFilter = "active") => {
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  return useQuery({
    queryKey: ["projects", filter],
    queryFn: () => projectsApi.getAll(filter),
    enabled: isHydrated && !!token,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectBody) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created successfully");
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Failed to create project";
      toast.error(message);
    },
  });
};

export const useUpdateProject = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProjectBody) => projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", id] });
      toast.success("Project updated successfully");
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Failed to update project";
      toast.error(message);
    },
  });
};

export const useArchiveProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Projet archivé");
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Impossible d'archiver le projet";
      toast.error(message);
    },
  });
};

export const useTrashProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsApi.trash(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Projet déplacé dans la corbeille (30 jours)");
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Impossible de mettre le projet à la corbeille";
      toast.error(message);
    },
  });
};

export const useRestoreProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsApi.restore(id),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(
        project.status === "published"
          ? "Projet restauré et remis en ligne"
          : "Projet restauré en brouillon",
      );
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Impossible de restaurer le projet";
      toast.error(message);
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Projet supprimé définitivement");
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Impossible de supprimer le projet";
      toast.error(message);
    },
  });
};
