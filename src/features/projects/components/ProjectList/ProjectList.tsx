import React from "react";
import { Plus } from "lucide-react";
import styles from "./ProjectList.module.css";
import { Skeleton } from "@/shared/components/Skeleton";
import { Icon } from "@/shared/components/Icon";
import { ProjectCard } from "../ProjectCard";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
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
    <div className={styles.grid}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};
