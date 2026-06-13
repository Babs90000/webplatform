import React from "react";
import styles from "./FileTree.module.css";
import type { ProjectFile } from "../../services/codegenApi";

interface FileTreeProps {
  files: ProjectFile[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  selectedPath,
  onSelect,
}) => {
  const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));

  return (
    <div className={styles.container}>
      <div className={styles.header}>Fichiers</div>
      <ul className={styles.list}>
        {sorted.length === 0 ? (
          <li className={styles.empty}>Aucun fichier — lancez la génération</li>
        ) : (
          sorted.map((file) => (
            <li key={file.path}>
              <button
                type="button"
                className={`${styles.item} ${selectedPath === file.path ? styles.itemActive : ""}`}
                onClick={() => onSelect(file.path)}
              >
                <span className={styles.icon}>{getFileIcon(file.path)}</span>
                <span className={styles.name}>{file.path}</span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

const getFileIcon = (path: string): string => {
  if (path.endsWith(".html")) return "📄";
  if (path.endsWith(".css")) return "🎨";
  if (path.endsWith(".js")) return "⚡";
  return "📁";
};
