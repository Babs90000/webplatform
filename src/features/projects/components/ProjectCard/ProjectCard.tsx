"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Archive, Link2, Trash2 } from "lucide-react";
import styles from "./ProjectCard.module.css";
import { Icon } from "@/shared/components/Icon";
import type { Project } from "@/types";
import { getProjectEditorPath } from "@/lib/projectRoutes";

interface ProjectCardProps {
  project: Project;
  onManage: (project: Project) => void;
}

const TRASH_RETENTION_DAYS = 30;

const daysRemainingInTrash = (deletedAt: string): number => {
  const purge = new Date(deletedAt);
  purge.setUTCDate(purge.getUTCDate() + TRASH_RETENTION_DAYS);
  return Math.max(0, Math.ceil((purge.getTime() - Date.now()) / 86_400_000));
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onManage,
}) => {
  const isTrashed = project.status === "trashed";
  const formattedDate = new Date(
    isTrashed && project.deleted_at ? project.deleted_at : project.updated_at,
  ).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const statusLabel: Record<Project["status"], string> = {
    draft: "Brouillon",
    published: "En ligne",
    archived: "Archivé",
    trashed: "Corbeille",
  };

  const getBadgeClass = (status: Project["status"]) => {
    switch (status) {
      case "published":
        return styles.badgePublished;
      case "archived":
        return styles.badgeArchived;
      case "trashed":
        return styles.badgeTrashed;
      default:
        return styles.badgeDraft;
    }
  };

  const domain = project.custom_domain || `${project.subdomain}.kdevs.io`;

  const handleManageClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    event.preventDefault();
    event.stopPropagation();
    onManage(project);
  };

  const manageLabel =
    project.status === "trashed"
      ? `Gérer la corbeille — ${project.name}`
      : project.status === "archived"
        ? `Gérer ${project.name}`
        : `Archiver ou supprimer ${project.name}`;

  const footerLabel = isTrashed
    ? project.deleted_at
      ? `Suppression dans ${daysRemainingInTrash(project.deleted_at)} j`
      : `Supprimé le ${formattedDate}`
    : `Modifié le ${formattedDate}`;

  const cardInner = (
    <>
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
        <span className={styles.date}>{footerLabel}</span>
        {!isTrashed && (
          <Icon icon={ArrowRight} size="md" className={styles.arrow} />
        )}
      </div>
    </>
  );

  return (
    <div className={`${styles.card} ${isTrashed ? styles.cardTrashed : ""}`}>
      <button
        type="button"
        className={styles.deleteBtn}
        aria-label={manageLabel}
        title={
          isTrashed
            ? "Restaurer ou supprimer définitivement"
            : project.status === "archived"
              ? "Restaurer ou mettre à la corbeille"
              : "Archiver ou mettre à la corbeille"
        }
        onClick={handleManageClick}
      >
        <Icon icon={isTrashed ? Trash2 : Archive} size="sm" />
      </button>

      {isTrashed ? (
        <div className={styles.cardStatic}>{cardInner}</div>
      ) : (
        <Link
          href={getProjectEditorPath(project.id)}
          className={styles.cardLink}
        >
          {cardInner}
        </Link>
      )}
    </div>
  );
};
