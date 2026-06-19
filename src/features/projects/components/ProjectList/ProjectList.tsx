import React from "react";
import styles from "./ProjectList.module.css";
import { Skeleton } from "@/shared/components/Skeleton";
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
        title="Failed to load projects" 
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
        title="No projects yet"
        description="Create your first project to start building your website."
        actionLabel="Create Project"
        onAction={onCreateProject}
        icon={
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        }
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
