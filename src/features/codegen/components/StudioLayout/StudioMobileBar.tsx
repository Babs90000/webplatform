"use client";

import React from "react";
import { FolderOpen, MessageSquare } from "lucide-react";
import { Icon } from "@/shared/components/Icon";
import styles from "./StudioMobileBar.module.css";

export type StudioMobilePanel = "none" | "files" | "chat";

interface StudioMobileBarProps {
  activePanel: StudioMobilePanel;
  onOpenFiles: () => void;
  onOpenChat: () => void;
}

export const StudioMobileBar: React.FC<StudioMobileBarProps> = ({
  activePanel,
  onOpenFiles,
  onOpenChat,
}) => (
  <nav
    className={styles.bar}
    data-testid="studio-mobile-bar"
    aria-label="Navigation studio mobile"
  >
    <button
      type="button"
      className={`${styles.btn} ${activePanel === "files" ? styles.btnActive : ""}`}
      data-testid="studio-mobile-files-btn"
      aria-pressed={activePanel === "files"}
      onClick={onOpenFiles}
    >
      <Icon icon={FolderOpen} size="sm" />
      <span>Fichiers</span>
    </button>
    <button
      type="button"
      className={`${styles.btn} ${activePanel === "chat" ? styles.btnActive : ""}`}
      data-testid="studio-mobile-chat-btn"
      aria-pressed={activePanel === "chat"}
      onClick={onOpenChat}
    >
      <Icon icon={MessageSquare} size="sm" />
      <span>Chat</span>
    </button>
  </nav>
);
