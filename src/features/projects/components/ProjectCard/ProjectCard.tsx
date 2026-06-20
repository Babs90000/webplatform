"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Link2, Trash2 } from "lucide-react";
import styles from "./ProjectCard.module.css";
import { Icon } from "@/shared/components/Icon";
import type { Project } from "@/types";
import { getProjectEditorPath } from "@/lib/projectRoutes";

interface ProjectCardProps {
  project: Project;
  onDelete: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const formattedDate = new Date(project.updated_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const statusLabel: Record<Project["status"], string> = {
    draft: "Brouillon",
    published: "En ligne",
    archived: "Archivé",
  };

  const getBadgeClass = (status: Project["status"]) => {
    switch (status) {
      case "published":
        return styles.badgePublished;
      case "archived":
        return styles.badgeArchived;
      default:
        return styles.badgeDraft;
    }
  };

  const domain = project.custom_domain || `${project.subdomain}.kdevs.io`;

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    onDelete(project);
  };

  return (
    <div className={styles.card}>
      <button
        type="button"
        className={styles.deleteBtn}
        aria-label={`Supprimer ${project.name}`}
        onClick={handleDeleteClick}
      >
        <Icon icon={Trash2} size="sm" />
      </button>

      <Link href={getProjectEditorPath(project.id)} className={styles.cardLink}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title} title={project.name}>
              {project.name}
            </h3>
            <div className={styles.url}>
              <Icon icon={Link2} size="xs" />
              {domain}
            </div>
          </div>
          <span className={`${styles.badge} ${getBadgeClass(project.status)}`}>
            {statusLabel[project.status]}
          </span>
        </div>

        <div className={styles.footer}>
          <span className={styles.date}>Modifié le {formattedDate}</span>
          <Icon icon={ArrowRight} size="md" className={styles.arrow} />
        </div>
      </Link>
    </div>
  );
};
