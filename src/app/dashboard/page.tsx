"use client";

import React, { Suspense } from "react";
import { Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./Dashboard.module.css";
import { AuthGuard } from "@/shared/components/AuthGuard";
import { Button } from "@/shared/components/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { ProjectList } from "@/features/projects/components/ProjectList";
import { BillingCard } from "@/features/billing/components/BillingCard";
import { Icon } from "@/shared/components/Icon";
import { useCheckoutReturnToast } from "@/features/billing/hooks/useCheckoutReturnToast";

const DashboardContent: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data: projects, isLoading, error, refetch } = useProjects();

  useCheckoutReturnToast();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Mes projets</h1>
          <p className={styles.subtitle}>
            Bon retour{user?.email ? `, ${user.email.split("@")[0]}` : ""}
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/onboarding")}
          >
            <Icon icon={Sparkles} size="sm" />
            Assistant
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            Déconnexion
          </Button>
          <Button size="sm" onClick={() => router.push("/onboarding")}>
            <Icon icon={Plus} size="sm" />
            Nouveau
          </Button>
        </div>
      </header>

      <div className={styles.main}>
        <BillingCard />

        <ProjectList
          projects={projects}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          onCreateProject={() => router.push("/onboarding")}
        />
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => (
  <AuthGuard>
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  </AuthGuard>
);

export default DashboardPage;
