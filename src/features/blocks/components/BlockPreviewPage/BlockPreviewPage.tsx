"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePages } from "@/features/pages/hooks/usePages";
import { useBlocks } from "@/features/blocks/hooks/useBlocks";
import { BlockRenderer } from "@/features/blocks/components/BlockRenderer";
import { getProjectEditorPath } from "@/lib/projectRoutes";
import { LoadingPanel } from "@/shared/components/LoadingPanel";
import styles from "./BlockPreviewPage.module.css";

const PagePreview: React.FC<{ pageId: string }> = ({ pageId }) => {
  const { data: blocks, isLoading } = useBlocks(pageId);

  if (isLoading) {
    return (
      <LoadingPanel variant="centered" message="Chargement du contenu…" />
    );
  }

  if (!blocks || blocks.length === 0) {
    return <div className={styles.empty}>Cette page est vide.</div>;
  }

  const sortedBlocks = [...blocks].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className={styles.pageContent}>
      {sortedBlocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
};

interface BlockPreviewPageProps {
  projectId: string;
}

export const BlockPreviewPage: React.FC<BlockPreviewPageProps> = ({ projectId }) => {
  const { data: pages, isLoading } = usePages(projectId);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  const firstPageId =
    pages && pages.length > 0
      ? [...pages].sort((a, b) => a.order_index - b.order_index)[0].id
      : null;
  const effectivePageId = selectedPageId || firstPageId;

  if (isLoading) {
    return (
      <LoadingPanel variant="preview" message="Chargement de l'aperçu…" />
    );
  }

  if (!pages || pages.length === 0) {
    return <div className={styles.pageLoading}>Aucune page dans ce projet.</div>;
  }

  return (
    <div className={styles.root}>
      <header className={styles.toolbar}>
        <Link href={getProjectEditorPath(projectId)} className={styles.backLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Retour à l&apos;éditeur
        </Link>

        <select
          className={styles.pageSelect}
          value={effectivePageId ?? ""}
          onChange={(e) => setSelectedPageId(e.target.value)}
        >
          {pages
            .sort((a, b) => a.order_index - b.order_index)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} (/{p.slug})
              </option>
            ))}
        </select>
      </header>

      <div className={styles.content}>
        {effectivePageId && <PagePreview pageId={effectivePageId} />}
      </div>
    </div>
  );
};
