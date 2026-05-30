"use client";

import React, { useState } from "react";
import styles from "./Dashboard.module.css";
import { AuthGuard } from "@/shared/components/AuthGuard";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { ProjectList } from "@/features/projects/components/ProjectList";
import { CreateProjectForm } from "@/features/projects/components/CreateProjectForm";

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { data: projects, isLoading, error, refetch } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AuthGuard>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Projects</h1>
            <p className={styles.subtitle}>
              Welcome back, {user?.email}
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button variant="ghost" onClick={logout}>
              Sign out
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <svg 
                width="20" height="20" viewBox="0 0 24 24" fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginRight: '4px' }}
              >
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              New Project
            </Button>
          </div>
        </header>

        <main>
          <ProjectList 
            projects={projects} 
            isLoading={isLoading} 
            error={error} 
            onRetry={refetch}
            onCreateProject={() => setIsModalOpen(true)}
          />
        </main>

        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title="Create a New Project"
        >
          <CreateProjectForm 
            onSuccess={() => setIsModalOpen(false)}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      </div>
    </AuthGuard>
  );
};

export default DashboardPage;
