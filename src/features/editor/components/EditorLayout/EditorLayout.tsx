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

import { HermesChatSidebar } from "../HermesChatSidebar";

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  toolbar,
  pageTree,
  canvas,
  propertiesPanel,
  projectId,
}) => {
  const {
    isSidebarCollapsed,
    isPropertiesCollapsed,
    activeRightPanel,
    switchRightPanel,
    selectedPageId,
    setProjectId,
    reset,
  } = useEditorStore();

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

        <section className={styles.canvas}>{canvas}</section>

        <aside
          className={`${styles.sidebarRight} ${isPropertiesCollapsed ? styles.sidebarRightCollapsed : ""}`}
        >
          {!isPropertiesCollapsed && (
            <div className={styles.rightPanelContainer}>
              <div className={styles.tabHeaders}>
                <button
                  type="button"
                  className={`${styles.tabHeader} ${activeRightPanel === "properties" ? styles.tabHeaderActive : ""}`}
                  onClick={() => switchRightPanel("properties")}
                >
                  Propriétés
                </button>
                <button
                  type="button"
                  className={`${styles.tabHeader} ${activeRightPanel === "hermes" ? styles.tabHeaderActive : ""}`}
                  onClick={() => switchRightPanel("hermes")}
                >
                  Assistant IA ✨
                </button>
              </div>
              <div className={styles.tabContent}>
                {activeRightPanel === "properties" ? (
                  propertiesPanel
                ) : (
                  <HermesChatSidebar
                    pageId={selectedPageId}
                    onClose={() => useEditorStore.getState().toggleProperties()}
                  />
                )}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};
