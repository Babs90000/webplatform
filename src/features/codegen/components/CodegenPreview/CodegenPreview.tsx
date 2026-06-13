"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import styles from "./CodegenPreview.module.css";
import {
  fetchCodegenPages,
  fetchPreviewHtml,
} from "@/features/codegen/services/codegenApi";
import { getProjectEditorPath } from "@/lib/projectRoutes";

interface CodegenPreviewProps {
  projectId: string;
}

export const CodegenPreview: React.FC<CodegenPreviewProps> = ({ projectId }) => {
  const [pages, setPages] = useState<string[]>(["index.html"]);
  const [selectedPage, setSelectedPage] = useState("index.html");
  const [html, setHtml] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPages = async () => {
      const list = await fetchCodegenPages(projectId);
      setPages(list.length > 0 ? list : ["index.html"]);
    };
    void loadPages();
  }, [projectId]);

  const loadPreview = useCallback(async (page: string) => {
    setIsLoading(true);
    try {
      const content = await fetchPreviewHtml(projectId, page);
      setHtml(content);
    } catch {
      setHtml("");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadPreview(selectedPage);
  }, [selectedPage, loadPreview]);

  return (
    <div className={styles.root}>
      <header className={styles.toolbar}>
        <Link href={getProjectEditorPath(projectId)} className={styles.backLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Retour au Studio
        </Link>

        <select
          className={styles.pageSelect}
          value={selectedPage}
          onChange={(e) => setSelectedPage(e.target.value)}
        >
          {pages.map((page) => (
            <option key={page} value={page}>
              {page}
            </option>
          ))}
        </select>
      </header>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loading}>Chargement de l&apos;aperçu…</div>
        ) : html ? (
          <iframe
            title="Aperçu plein écran"
            className={styles.frame}
            sandbox="allow-scripts allow-same-origin"
            srcDoc={html}
          />
        ) : (
          <div className={styles.empty}>
            Aucun fichier généré — ouvrez le Studio pour lancer la génération.
          </div>
        )}
      </div>
    </div>
  );
};
