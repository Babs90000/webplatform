"use client";

import React, { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import styles from "./ProjectList.module.css";
import { Skeleton } from "@/shared/components/Skeleton";
import { Icon } from "@/shared/components/Icon";
import { ProjectCard } from "../ProjectCard";
import { DeleteProjectModal } from "../DeleteProjectModal";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { useDeleteProject } from "../../hooks/useProjects";
import type { Project } from "@/types";

interface ProjectListProps {
  projects: Project[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
  onCreateProject?: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  isLoading,
  error,
  onRetry,
  onCreateProject,
}) => {
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const deleteProject = useDeleteProject();

  const handleDeleteRequest = useCallback((project: Project) => {
    setDeleteTarget(project);
  }, []);

  const handleCloseDelete = useCallback(() => {
    if (deleteProject.isPending) return;
    setDeleteTarget(null);
  }, [deleteProject.isPending]);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteProject.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }, [deleteTarget, deleteProject]);

  if (error) {
    return (
      <ErrorMessage
        title="Impossible de charger les projets"
        message={error.message}
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    return (
      <div className={styles.grid}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.skeletonCard}>
            <Skeleton className={styles.skeletonTitle} height={24} />
            <Skeleton className={styles.skeletonUrl} height={16} />
            <Skeleton className={styles.skeletonFooter} height={12} />
          </div>
        ))}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <EmptyState
        title="Aucun projet"
        description="Créez votre premier site avec l'assistant guidé ou Koala Codeur."
        actionLabel="Créer un projet"
        onAction={onCreateProject}
        icon={<Icon icon={Plus} size="lg" />}
      />
    );
  }

  return (
    <>
      <div className={styles.grid}>
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDelete={handleDeleteRequest}
          />
        ))}
      </div>

      <DeleteProjectModal
        isOpen={deleteTarget !== null}
        projectName={deleteTarget?.name ?? ""}
        isDeleting={deleteProject.isPending}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};
