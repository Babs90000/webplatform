"use client";

import React, { memo, useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Icon } from "@/shared/components/Icon";
import styles from "./StudioLayout.module.css";
import {
  StudioMobileBar,
  type StudioMobilePanel,
} from "./StudioMobileBar";

interface StudioLayoutProps {
  toolbar: React.ReactNode;
  fileTree: React.ReactNode;
  codeView: React.ReactNode;
  preview: React.ReactNode;
  chat: React.ReactNode;
  showCode?: boolean;
  previewFocus?: boolean;
}

const MOBILE_DRAWER_MQ = "(max-width: 900px)";

export const StudioLayout: React.FC<StudioLayoutProps> = memo(({
  toolbar,
  fileTree,
  codeView,
  preview,
  chat,
  showCode = true,
  previewFocus = false,
}) => {
  const [mobileDrawer, setMobileDrawer] = useState<StudioMobilePanel>("none");
  const [isCompactLayout, setIsCompactLayout] = useState(false);

  const closeDrawer = useCallback((): void => {
    setMobileDrawer("none");
  }, []);

  const toggleFilesDrawer = useCallback((): void => {
    setMobileDrawer((current) => (current === "files" ? "none" : "files"));
  }, []);

  const toggleChatDrawer = useCallback((): void => {
    setMobileDrawer((current) => (current === "chat" ? "none" : "chat"));
  }, []);

  useEffect(() => {
    if (previewFocus) {
      setMobileDrawer("none");
    }
  }, [previewFocus]);

  useEffect(() => {
    if (mobileDrawer === "none") return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileDrawer, closeDrawer]);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_DRAWER_MQ);
    const onChange = (): void => {
      setIsCompactLayout(media.matches);
      if (!media.matches) {
        setMobileDrawer("none");
      }
    };

    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const filesDrawerOpen = mobileDrawer === "files";
  const chatDrawerOpen = mobileDrawer === "chat";
  const overlayOpen = mobileDrawer !== "none";

  return (
    <div
      className={styles.root}
      data-mobile-drawer={mobileDrawer}
      data-testid="studio-layout"
    >
      {toolbar}
      <div
        className={`${styles.body} ${previewFocus ? styles.bodyPreviewFocus : ""} ${overlayOpen ? styles.bodyDrawerOpen : ""}`}
      >
        {!previewFocus && (
          <aside
            className={`${styles.sidebar} ${filesDrawerOpen ? styles.sidebarDrawerOpen : ""}`}
            data-testid="studio-drawer-files"
            aria-hidden={isCompactLayout ? !filesDrawerOpen : undefined}
          >
            {filesDrawerOpen && (
              <div className={styles.drawerHeader}>
                <span className={styles.drawerTitle}>Fichiers</span>
                <button
                  type="button"
                  className={styles.drawerClose}
                  aria-label="Fermer les fichiers"
                  onClick={closeDrawer}
                >
                  <Icon icon={X} size="sm" />
                </button>
              </div>
            )}
            <div className={styles.drawerBody}>{fileTree}</div>
          </aside>
        )}
        <main
          className={`${styles.center} ${!showCode || previewFocus ? styles.centerPreviewOnly : styles.centerWithCode}`}
        >
          {showCode && !previewFocus && (
            <div className={styles.codePanel}>{codeView}</div>
          )}
          <div className={styles.previewPanel}>{preview}</div>
        </main>
        {!previewFocus && (
          <aside
            className={`${styles.chatPanel} ${chatDrawerOpen ? styles.chatDrawerOpen : ""}`}
            data-testid="studio-drawer-chat"
            aria-hidden={isCompactLayout ? !chatDrawerOpen : undefined}
          >
            {chatDrawerOpen && (
              <div className={styles.drawerHeader}>
                <span className={styles.drawerTitle}>Chat</span>
                <button
                  type="button"
                  className={styles.drawerClose}
                  aria-label="Fermer le chat"
                  onClick={closeDrawer}
                >
                  <Icon icon={X} size="sm" />
                </button>
              </div>
            )}
            <div className={styles.drawerBody}>{chat}</div>
          </aside>
        )}
      </div>
      {!previewFocus && (
        <>
          {overlayOpen && (
            <button
              type="button"
              className={styles.backdrop}
              data-testid="studio-drawer-backdrop"
              aria-label="Fermer le panneau"
              onClick={closeDrawer}
            />
          )}
          <StudioMobileBar
            activePanel={mobileDrawer}
            onOpenFiles={toggleFilesDrawer}
            onOpenChat={toggleChatDrawer}
          />
        </>
      )}
    </div>
  );
});
