"use client";

import React, { Suspense } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
        <div>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.subtitle}>
            Welcome back, {user?.email}
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/onboarding" className={styles.onboardingLink}>
            Assistant guidé
          </Link>
          <Button variant="ghost" onClick={logout}>
            Déconnexion
          </Button>
          <Button onClick={() => router.push("/onboarding")} className={styles.newProjectBtn}>
            <Icon icon={Plus} size="sm" />
            New Project
          </Button>
        </div>
      </header>

      <BillingCard />

      <main>
        <ProjectList
          projects={projects}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          onCreateProject={() => router.push("/onboarding")}
        />
      </main>
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
