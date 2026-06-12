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
    return <div className="p-6 text-sm text-zinc-400 font-medium animate-pulse">Chargement des pages...</div>;
  }

  if (isError) {
    return (
      <div className="p-6 text-sm">
        <p className="text-red-500 mb-2 font-medium">Erreur lors du chargement.</p>
        <button 
          type="button" 
          className="text-indigo-600 font-semibold hover:underline" 
          onClick={() => refetch()}
        >
          Réessayer
        </button>
      </div>
    );
  }

  const sortedPages = pages ? [...pages].sort((a, b) => a.order_index - b.order_index) : [];

  return (
    <div className="flex flex-col h-full bg-white text-zinc-900 font-sans">
      <div className="flex items-center justify-between px-5 py-4 shrink-0">
        <span className="font-bold text-[15px] tracking-tight text-zinc-800">Pages du site</span>
        <button
          type="button"
          className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
          onClick={() => setIsAdding(true)}
          title="Ajouter une page"
          aria-label="Ajouter une page"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
        {isAdding && (
          <div className="mb-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl shadow-sm">
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-[14px] text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-3 transition-all"
              placeholder="Ex: Contact, À propos..."
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
                className="flex-1 bg-zinc-900 text-white text-[13px] font-semibold py-2 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
                onClick={submitNewPage}
                disabled={isCreating || !newTitle.trim()}
              >
                {isCreating ? "..." : "Ajouter"}
              </button>
              <button 
                type="button" 
                className="flex-1 bg-white border border-zinc-200 text-zinc-600 text-[13px] font-medium py-2 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-colors" 
                onClick={cancelAdd}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {sortedPages.length === 0 ? (
          <div className="p-4 text-[14px] text-zinc-500 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
            Aucune page pour l'instant.
          </div>
        ) : (
          <ul className="space-y-1">
            {sortedPages.map((page) => {
              const isSelected = selectedPageId === page.id;
              return (
                <li key={page.id}>
                  <button
                    type="button"
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                      isSelected 
                        ? "bg-indigo-50/80 text-indigo-900 shadow-sm border border-indigo-100" 
                        : "text-zinc-600 hover:bg-zinc-50 border border-transparent hover:border-zinc-200/60"
                    }`}
                    onClick={() => {
                      selectPage(page.id);
                      if (window.innerWidth < 1024) setMobileView("canvas");
                    }}
                  >
                    <div className={`p-1.5 rounded-lg ${isSelected ? "bg-indigo-100 text-indigo-600" : "bg-white border border-zinc-200 text-zinc-400 shadow-sm"}`}>
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"
                      >
                        <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M13 2V9H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className={`text-[14px] truncate ${isSelected ? "font-semibold" : "font-medium"}`}>
                      {page.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
