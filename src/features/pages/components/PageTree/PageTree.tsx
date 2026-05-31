"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./PageTree.module.css";
import { usePages, useCreatePage } from "../../hooks/usePages";
import { useEditorStore } from "@/store/editor";

interface PageTreeProps {
  projectId: string;
}

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export const PageTree: React.FC<PageTreeProps> = ({ projectId }) => {
  const { data: pages, isLoading, isError, refetch } = usePages(projectId);
  const { mutate: createPage, isPending: isCreating } = useCreatePage(projectId);
  const { selectedPageId, selectPage } = useEditorStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-select first page si aucune page sélectionnée OU si la sélection
  // courante n'appartient pas au projet (cas d'une navigation entre projets).
  useEffect(() => {
    if (!pages || pages.length === 0) return;
    const selectionIsValid =
      selectedPageId !== null && pages.some((p) => p.id === selectedPageId);
    if (!selectionIsValid) {
      const sorted = [...pages].sort((a, b) => a.order_index - b.order_index);
      selectPage(sorted[0].id);
    }
  }, [pages, selectedPageId, selectPage]);

  useEffect(() => {
    if (isAdding) inputRef.current?.focus();
  }, [isAdding]);

  const submitNewPage = () => {
    const title = newTitle.trim();
    if (!title) return;
    const order_index = pages ? pages.length : 0;
    createPage(
      { title, slug: slugify(title), order_index },
      {
        onSuccess: () => {
          setNewTitle("");
          setIsAdding(false);
        },
      },
    );
  };

  const cancelAdd = () => {
    setNewTitle("");
    setIsAdding(false);
  };

  if (isLoading) {
    return <div className={styles.statusMessage}>Chargement des pages…</div>;
  }

  if (isError) {
    return (
      <div className={styles.statusMessage}>
        <p>Impossible de charger les pages.</p>
        <button type="button" className={styles.retryButton} onClick={() => refetch()}>
          Réessayer
        </button>
      </div>
    );
  }

  const sortedPages = pages ? [...pages].sort((a, b) => a.order_index - b.order_index) : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Pages</span>
        <button
          type="button"
          className={styles.addButton}
          onClick={() => setIsAdding(true)}
          title="Ajouter une page"
          aria-label="Ajouter une page"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {isAdding && (
        <div className={styles.addForm}>
          <input
            ref={inputRef}
            type="text"
            className={styles.addInput}
            placeholder="Nom de la page"
            value={newTitle}
            aria-label="Nom de la nouvelle page"
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitNewPage();
              if (e.key === "Escape") cancelAdd();
            }}
          />
          <div className={styles.addFormActions}>
            <button
              type="button"
              className={styles.addConfirm}
              onClick={submitNewPage}
              disabled={isCreating || !newTitle.trim()}
            >
              {isCreating ? "…" : "Ajouter"}
            </button>
            <button type="button" className={styles.addCancel} onClick={cancelAdd}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {sortedPages.length === 0 ? (
        <div className={styles.statusMessage}>Aucune page pour l'instant.</div>
      ) : (
        <ul className={styles.list}>
          {sortedPages.map((page) => (
            <li key={page.id}>
              <button
                type="button"
                className={`${styles.pageItem} ${selectedPageId === page.id ? styles.pageItemActive : ""}`}
                onClick={() => selectPage(page.id)}
                aria-current={selectedPageId === page.id ? "page" : undefined}
              >
                <svg
                  className={styles.pageIcon}
                  width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"
                >
                  <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13 2V9H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className={styles.pageName}>{page.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
