import React from "react";
import styles from "./StudioLayout.module.css";

interface StudioLayoutProps {
  toolbar: React.ReactNode;
  fileTree: React.ReactNode;
  codeView: React.ReactNode;
  preview: React.ReactNode;
  chat: React.ReactNode;
}

export const StudioLayout: React.FC<StudioLayoutProps> = ({
  toolbar,
  fileTree,
  codeView,
  preview,
  chat,
}) => (
  <div className={styles.root}>
    {toolbar}
    <div className={styles.body}>
      <aside className={styles.sidebar}>{fileTree}</aside>
      <main className={styles.center}>
        <div className={styles.codePanel}>{codeView}</div>
        <div className={styles.previewPanel}>{preview}</div>
      </main>
      <aside className={styles.chatPanel}>{chat}</aside>
    </div>
  </div>
);
