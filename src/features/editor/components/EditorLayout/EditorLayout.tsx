"use client";

import React, { useEffect } from "react";
import { useEditorStore } from "@/store/editor";
import { HermesChatSidebar } from "../HermesChatSidebar";
import styles from "./EditorLayout.module.css";

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
  const {
    isSidebarCollapsed,
    isPropertiesCollapsed,
    activeRightPanel,
    switchRightPanel,
    selectedPageId,
    setProjectId,
    mobileView,
    setMobileView,
    reset,
  } = useEditorStore();

  useEffect(() => {
    setProjectId(projectId);
    return () => reset();
  }, [projectId, setProjectId, reset]);

  const leftSidebarClass = [
    styles.sidebarLeft,
    mobileView === "pages" ? styles.sidebarLeftMobileVisible : "",
    !isSidebarCollapsed ? styles.sidebarLeftDesktopExpanded : "",
  ]
    .filter(Boolean)
    .join(" ");

  const canvasClass = [
    styles.canvas,
    mobileView === "canvas" ? styles.canvasMobileVisible : "",
  ]
    .filter(Boolean)
    .join(" ");

  const rightSidebarClass = [
    styles.sidebarRight,
    mobileView === "ai" ? styles.sidebarRightMobileVisible : "",
    !isPropertiesCollapsed ? styles.sidebarRightDesktopExpanded : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.root}>
      <div className={styles.toolbarWrap}>{toolbar}</div>

      <main className={styles.main}>
        <aside className={leftSidebarClass}>{pageTree}</aside>

        <section className={canvasClass}>{canvas}</section>

        <aside className={rightSidebarClass}>
          <div className={styles.rightPanel}>
            <div className={styles.rightTabs}>
              <button
                type="button"
                className={`${styles.tab} ${activeRightPanel === "properties" ? styles.tabActive : ""}`}
                onClick={() => switchRightPanel("properties")}
              >
                Propriétés
              </button>
              <button
                type="button"
                className={`${styles.tab} ${styles.tabAi} ${activeRightPanel === "hermes" ? styles.tabActive : ""}`}
                onClick={() => switchRightPanel("hermes")}
              >
                <span>✨</span>
                Assistant
              </button>
            </div>
            <div className={styles.rightContent}>
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
        </aside>
      </main>

      <div className={styles.mobileNav}>
        <button
          type="button"
          onClick={() => setMobileView("pages")}
          className={`${styles.mobileBtn} ${mobileView === "pages" ? styles.mobileBtnActive : ""}`}
        >
          <svg className={styles.mobileIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span className={styles.mobileLabel}>PAGES</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileView("canvas")}
          className={`${styles.mobileBtn} ${mobileView === "canvas" ? styles.mobileBtnActive : ""}`}
        >
          <svg className={styles.mobileIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <span className={styles.mobileLabel}>CANEVAS</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileView("ai")}
          className={`${styles.mobileBtn} ${mobileView === "ai" ? styles.mobileBtnActive : ""}`}
        >
          <svg className={styles.mobileIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <span className={styles.mobileLabel}>IA & PROPS</span>
        </button>
      </div>
    </div>
  );
};
