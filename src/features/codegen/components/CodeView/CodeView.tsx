"use client";

import React, { memo, useEffect, useState } from "react";
import styles from "./CodeView.module.css";

interface CodeViewProps {
  path: string | null;
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  isSaving?: boolean;
}

export const CodeView: React.FC<CodeViewProps> = memo(({
  path,
  content,
  onChange,
  onSave,
  isSaving = false,
}) => {
  const [local, setLocal] = useState(content);

  useEffect(() => {
    setLocal(content);
  }, [content, path]);

  if (!path) {
    return (
      <div className={styles.empty}>
        Sélectionnez un fichier dans l&apos;arborescence
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <span className={styles.path}>{path}</span>
        <button
          type="button"
          className={styles.saveBtn}
          onClick={() => {
            onChange(local);
            onSave();
          }}
          disabled={isSaving}
        >
          {isSaving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
      <textarea
        className={styles.editor}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        spellCheck={false}
        aria-label={`Éditeur ${path}`}
      />
    </div>
  );
});
