"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Dashboard.module.css";
import { AppNavbar } from "@/shared/components/AppNavbar";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { ProjectList } from "@/features/projects/components/ProjectList";
import { BillingCard } from "@/features/billing/components/BillingCard";
import { useCheckoutReturnToast } from "@/features/billing/hooks/useCheckoutReturnToast";
import type { ProjectListFilter } from "@/features/projects/services/projectsApi";

export const DashboardContent: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [filter, setFilter] = useState<ProjectListFilter>("active");
  const { data: projects, isLoading, error, refetch } = useProjects(filter);

  useCheckoutReturnToast();

  return (
    <div className={styles.page} data-testid="dashboard-page">
      <AppNavbar />

      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>Mes projets</h1>
            <p className={styles.subtitle}>
              Bon retour{user?.email ? `, ${user.email.split("@")[0]}` : ""}
            </p>
          </div>
        </header>

        <div className={styles.main}>
          <BillingCard />

          <ProjectList
            projects={projects}
            isLoading={isLoading}
            error={error}
            filter={filter}
            onFilterChange={setFilter}
            onRetry={refetch}
            onCreateProject={() => router.push("/onboarding")}
          />
        </div>
      </div>
    </div>
  );
};
