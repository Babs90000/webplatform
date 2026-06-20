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
import {
  useArchiveProject,
  useDeleteProject,
  useRestoreProject,
} from "../../hooks/useProjects";
import type { ProjectListFilter } from "../../services/projectsApi";
import type { Project } from "@/types";

interface ProjectListProps {
  projects: Project[] | undefined;
  isLoading: boolean;
  error: Error | null;
  filter: ProjectListFilter;
  onFilterChange: (filter: ProjectListFilter) => void;
  onRetry?: () => void;
  onCreateProject?: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  isLoading,
  error,
  filter,
  onFilterChange,
  onRetry,
  onCreateProject,
}) => {
  const [actionTarget, setActionTarget] = useState<Project | null>(null);
  const archiveProject = useArchiveProject();
  const restoreProject = useRestoreProject();
  const deleteProject = useDeleteProject();

  const isPending =
    archiveProject.isPending ||
    restoreProject.isPending ||
    deleteProject.isPending;

  const handleActionRequest = useCallback((project: Project) => {
    setActionTarget(project);
  }, []);

  const handleClose = useCallback(() => {
    if (isPending) return;
    setActionTarget(null);
  }, [isPending]);

  const handleArchive = useCallback(() => {
    if (!actionTarget) return;
    archiveProject.mutate(actionTarget.id, {
      onSuccess: () => setActionTarget(null),
    });
  }, [actionTarget, archiveProject]);

  const handleRestore = useCallback(() => {
    if (!actionTarget) return;
    restoreProject.mutate(actionTarget.id, {
      onSuccess: () => setActionTarget(null),
    });
  }, [actionTarget, restoreProject]);

  const handleDeletePermanent = useCallback(() => {
    if (!actionTarget) return;
    deleteProject.mutate(actionTarget.id, {
      onSuccess: () => setActionTarget(null),
    });
  }, [actionTarget, deleteProject]);

  if (error) {
    return (
      <ErrorMessage
        title="Impossible de charger les projets"
        message={error.message}
        onRetry={onRetry}
      />
    );
  }

  return (
    <>
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${filter === "active" ? styles.tabActive : ""}`}
          onClick={() => onFilterChange("active")}
        >
          Actifs
        </button>
        <button
          type="button"
          className={`${styles.tab} ${filter === "archived" ? styles.tabActive : ""}`}
          onClick={() => onFilterChange("archived")}
        >
          Archivés
        </button>
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonCard}>
              <Skeleton className={styles.skeletonTitle} height={24} />
              <Skeleton className={styles.skeletonUrl} height={16} />
              <Skeleton className={styles.skeletonFooter} height={12} />
            </div>
          ))}
        </div>
      ) : !projects || projects.length === 0 ? (
        <EmptyState
          title={filter === "archived" ? "Aucun projet archivé" : "Aucun projet"}
          description={
            filter === "archived"
              ? "Les projets archivés apparaissent ici et peuvent être restaurés."
              : "Créez votre premier site avec l'assistant guidé ou Koala Codeur."
          }
          actionLabel={filter === "active" ? "Créer un projet" : undefined}
          onAction={filter === "active" ? onCreateProject : undefined}
          icon={filter === "active" ? <Icon icon={Plus} size="lg" /> : undefined}
        />
      ) : (
        <div className={styles.grid}>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onManage={handleActionRequest}
            />
          ))}
        </div>
      )}

      <DeleteProjectModal
        isOpen={actionTarget !== null}
        projectName={actionTarget?.name ?? ""}
        isArchived={actionTarget?.status === "archived"}
        isPending={isPending}
        onClose={handleClose}
        onArchive={handleArchive}
        onRestore={handleRestore}
        onDeletePermanent={handleDeletePermanent}
      />
    </>
  );
};
