"use client";

import React, { useEffect } from "react";
import styles from "./EditorLayout.module.css";
import { useEditorStore } from "@/store/editor";

interface EditorLayoutProps {
  toolbar: React.ReactNode;
  pageTree: React.ReactNode;
  canvas: React.ReactNode;
  propertiesPanel: React.ReactNode;
  projectId: string;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  toolbar,
  pageTree,
  canvas,
  propertiesPanel,
  projectId,
}) => {
  const { isSidebarCollapsed, isPropertiesCollapsed, setProjectId, reset } = useEditorStore();

  useEffect(() => {
    setProjectId(projectId);
    return () => reset(); // Cleanup on unmount
  }, [projectId, setProjectId, reset]);

  return (
    <div className={styles.layout}>
      {toolbar}
      <main className={styles.main}>
        <aside 
          className={`${styles.sidebarLeft} ${isSidebarCollapsed ? styles.sidebarLeftCollapsed : ""}`}
        >
          {pageTree}
        </aside>
        
        <section className={styles.canvas}>
          {canvas}
        </section>
        
        <aside 
          className={`${styles.sidebarRight} ${isPropertiesCollapsed ? styles.sidebarRightCollapsed : ""}`}
        >
          {propertiesPanel}
        </aside>
      </main>
    </div>
  );
};
