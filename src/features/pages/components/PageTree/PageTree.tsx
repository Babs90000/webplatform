"use client";

import React, { useEffect } from "react";
import styles from "./PageTree.module.css";
import { usePages, useCreatePage } from "../../hooks/usePages";
import { useEditorStore } from "@/store/editor";

interface PageTreeProps {
  projectId: string;
}

export const PageTree: React.FC<PageTreeProps> = ({ projectId }) => {
  const { data: pages, isLoading } = usePages(projectId);
  const { mutate: createPage } = useCreatePage(projectId);
  const { selectedPageId, selectPage } = useEditorStore();

  // Auto-select first page if none selected
  useEffect(() => {
    if (pages && pages.length > 0 && !selectedPageId) {
      // Sort by order_index just to be safe
      const sorted = [...pages].sort((a, b) => a.order_index - b.order_index);
      selectPage(sorted[0].id);
    }
  }, [pages, selectedPageId, selectPage]);

  const handleAddPage = () => {
    const title = prompt("Enter page name:");
    if (!title) return;
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const order_index = pages ? pages.length : 0;
    
    createPage({ title, slug, order_index });
  };

  if (isLoading) {
    return <div className="p-4 text-sm text-gray-500">Loading pages...</div>;
  }

  const sortedPages = pages ? [...pages].sort((a, b) => a.order_index - b.order_index) : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Pages</span>
        <button 
          className={styles.addButton} 
          onClick={handleAddPage}
          title="Add Page"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <ul className={styles.list}>
        {sortedPages.map((page) => (
          <li 
            key={page.id}
            className={`${styles.pageItem} ${selectedPageId === page.id ? styles.pageItemActive : ""}`}
            onClick={() => selectPage(page.id)}
          >
            <svg 
              className={styles.pageIcon}
              width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 2V9H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className={styles.pageName}>{page.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
