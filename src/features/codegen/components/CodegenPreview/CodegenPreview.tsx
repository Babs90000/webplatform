"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { LoadingPanel } from "@/shared/components/LoadingPanel";
import { Icon } from "@/shared/components/Icon";
import Link from "next/link";
import styles from "./CodegenPreview.module.css";
import {
  fetchCodegenPages,
  fetchPreviewHtml,
  fetchProjectFiles,
} from "@/features/codegen/services/codegenApi";
import { listHtmlPages } from "@/features/codegen/lib/previewBundler";
import { getCachedPreviewHtml } from "@/features/codegen/lib/previewBundleCache";
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
    let cancelled = false;
    const loadPages = async () => {
      try {
        const projectFiles = await fetchProjectFiles(projectId);
        const localPages = listHtmlPages(
          projectFiles.map((f) => ({ path: f.path, content: f.content })),
        );
        if (localPages.length > 0) {
          if (!cancelled) setPages(localPages);
          return;
        }
        const list = await fetchCodegenPages(projectId);
        if (!cancelled) setPages(list.length > 0 ? list : ["index.html"]);
      } catch {
        if (!cancelled) setPages(["index.html"]);
      }
    };
    void loadPages();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;
    const loadPreview = async (page: string): Promise<void> => {
      setIsLoading(true);
      try {
        const projectFiles = await fetchProjectFiles(projectId);
        const localHtml = getCachedPreviewHtml(
          projectFiles.map((f) => ({ path: f.path, content: f.content })),
          page,
          projectId,
        );

        if (localHtml) {
          if (!cancelled) setHtml(localHtml);
          return;
        }

        const content = await fetchPreviewHtml(projectId, page);
        if (cancelled) return;
        setHtml(content.includes("Aucune page HTML") ? "" : content);
      } catch {
        if (!cancelled) setHtml("");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadPreview(selectedPage);
    return () => {
      cancelled = true;
    };
  }, [selectedPage, projectId]);

  return (
    <div className={styles.root}>
      <header className={styles.toolbar}>
        <Link href={getProjectEditorPath(projectId)} className={styles.backLink}>
          <Icon icon={ArrowLeft} size="sm" />
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
          <LoadingPanel
            variant="preview"
            message="Chargement de l'aperçu…"
          />
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
