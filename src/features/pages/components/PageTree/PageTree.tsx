"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const { selectedPageId, selectPage, setMobileView } = useEditorStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-select first page
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
    return <div className="p-4 text-sm text-zinc-500 animate-pulse">Chargement des pages...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 text-sm">
        <p className="text-red-400 mb-2">Impossible de charger les pages.</p>
        <button 
          type="button" 
          className="text-primary hover:underline" 
          onClick={() => refetch()}
        >
          Réessayer
        </button>
      </div>
    );
  }

  const sortedPages = pages ? [...pages].sort((a, b) => a.order_index - b.order_index) : [];

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-100 font-sans">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <span className="font-semibold text-sm tracking-wide text-zinc-200 uppercase">Pages</span>
        <button
          type="button"
          className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
          onClick={() => setIsAdding(true)}
          title="Ajouter une page"
          aria-label="Ajouter une page"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {isAdding && (
          <div className="mb-2 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent mb-2"
              placeholder="Nom de la page"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitNewPage();
                if (e.key === "Escape") cancelAdd();
              }}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex-1 bg-primary text-primary-foreground text-xs font-semibold py-1.5 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                onClick={submitNewPage}
                disabled={isCreating || !newTitle.trim()}
              >
                {isCreating ? "..." : "Ajouter"}
              </button>
              <button 
                type="button" 
                className="flex-1 bg-zinc-800 text-zinc-300 text-xs font-medium py-1.5 rounded hover:bg-zinc-700 transition-colors" 
                onClick={cancelAdd}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {sortedPages.length === 0 ? (
          <div className="p-4 text-sm text-zinc-500 text-center">Aucune page pour l'instant.</div>
        ) : (
          <ul className="space-y-0.5">
            {sortedPages.map((page) => (
              <li key={page.id}>
                <button
                  type="button"
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left ${
                    selectedPageId === page.id 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                  }`}
                  onClick={() => {
                    selectPage(page.id);
                    if (window.innerWidth < 1024) setMobileView("canvas");
                  }}
                  aria-current={selectedPageId === page.id ? "page" : undefined}
                >
                  <svg
                    className={selectedPageId === page.id ? "text-primary" : "text-zinc-500"}
                    width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"
                  >
                    <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13 2V9H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="truncate">{page.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
