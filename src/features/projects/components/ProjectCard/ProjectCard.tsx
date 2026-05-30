import React from "react";
import Link from "next/link";
import styles from "./ProjectCard.module.css";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const formattedDate = new Date(project.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const getBadgeClass = (status: Project["status"]) => {
    switch (status) {
      case "published": return styles.badgePublished;
      case "archived": return styles.badgeArchived;
      default: return styles.badgeDraft;
    }
  };

  const domain = project.custom_domain || `${project.subdomain}.kdevs.io`;

  return (
    <Link href={`/projects/${project.id}/editor`} className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title} title={project.name}>{project.name}</h3>
          <div className={styles.url}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 13A5 5 0 0 0 18 13V13A5 5 0 0 0 10 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11A5 5 0 0 0 6 11V11A5 5 0 0 0 14 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {domain}
          </div>
        </div>
        <span className={`${styles.badge} ${getBadgeClass(project.status)}`}>
          {project.status}
        </span>
      </div>
      
      <div className={styles.footer}>
        <span className={styles.date}>Updated {formattedDate}</span>
        <svg className={styles.arrow} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </Link>
  );
};
