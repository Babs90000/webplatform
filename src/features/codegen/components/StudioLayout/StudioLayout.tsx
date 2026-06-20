import React, { memo } from "react";
import styles from "./StudioLayout.module.css";

interface StudioLayoutProps {
  toolbar: React.ReactNode;
  fileTree: React.ReactNode;
  codeView: React.ReactNode;
  preview: React.ReactNode;
  chat: React.ReactNode;
  showCode?: boolean;
  previewFocus?: boolean;
}

export const StudioLayout: React.FC<StudioLayoutProps> = memo(({
  toolbar,
  fileTree,
  codeView,
  preview,
  chat,
  showCode = true,
  previewFocus = false,
}) => (
  <div className={styles.root}>
    {toolbar}
    <div
      className={`${styles.body} ${previewFocus ? styles.bodyPreviewFocus : ""}`}
    >
      {!previewFocus && <aside className={styles.sidebar}>{fileTree}</aside>}
      <main
        className={`${styles.center} ${showCode && !previewFocus ? "" : styles.centerPreviewOnly}`}
      >
        {showCode && !previewFocus && (
          <div className={styles.codePanel}>{codeView}</div>
        )}
        <div className={styles.previewPanel}>{preview}</div>
      </main>
      {!previewFocus && <aside className={styles.chatPanel}>{chat}</aside>}
    </div>
  </div>
));
