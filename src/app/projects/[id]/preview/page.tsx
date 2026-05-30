"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { usePages } from "@/features/pages/hooks/usePages";
import { useBlocks } from "@/features/blocks/hooks/useBlocks";
import { BlockRenderer } from "@/features/blocks/components/BlockRenderer";

// A simple component to render the blocks for a specific page
const PagePreview: React.FC<{ pageId: string }> = ({ pageId }) => {
  const { data: blocks, isLoading } = useBlocks(pageId);

  if (isLoading) {
    return <div style={{ padding: "100px 20px", textAlign: "center", color: "#64748b" }}>Loading page content...</div>;
  }

  if (!blocks || blocks.length === 0) {
    return <div style={{ padding: "100px 20px", textAlign: "center", color: "#64748b" }}>This page is empty.</div>;
  }

  // Sort blocks by order_index
  const sortedBlocks = [...blocks].sort((a, b) => a.order_index - b.order_index);

  return (
    <div style={{ width: "100%", minHeight: "100vh", backgroundColor: "var(--color-bg-primary)" }}>
      {sortedBlocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
};

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

const PreviewPage: React.FC<PreviewPageProps> = ({ params }) => {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  
  const { data: pages, isLoading } = usePages(projectId);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  // Derive effective page ID
  const firstPageId = pages && pages.length > 0 ? [...pages].sort((a, b) => a.order_index - b.order_index)[0].id : null;
  const effectivePageId = selectedPageId || firstPageId;

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--color-bg-primary)" }}>
        <div style={{ color: "var(--color-text-secondary)" }}>Loading project preview...</div>
      </div>
    );
  }

  if (!pages || pages.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--color-bg-primary)" }}>
        <div style={{ color: "var(--color-text-secondary)" }}>No pages found in this project.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Top Bar Navigation (Only visible on hover or persistent depending on preference, let's make it persistent but minimal) */}
      <div 
        style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          right: 0, 
          height: "56px", 
          background: "var(--glass-bg)", 
          backdropFilter: "blur(var(--glass-blur))",
          borderBottom: "1px solid var(--glass-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 var(--space-xl)",
          zIndex: 1000
        }}
      >
        <Link 
          href={`/projects/${projectId}/editor`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--color-text-secondary)",
            fontSize: "0.875rem",
            fontWeight: 500,
            textDecoration: "none",
            transition: "color var(--transition-fast)"
          }}
          onMouseOver={(e) => e.currentTarget.style.color = "var(--color-text-primary)"}
          onMouseOut={(e) => e.currentTarget.style.color = "var(--color-text-secondary)"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Editor
        </Link>

        <div>
          <select 
            value={effectivePageId || ""} 
            onChange={(e) => setSelectedPageId(e.target.value)}
            style={{
              background: "var(--color-bg-elevated)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "6px 12px",
              fontSize: "0.875rem",
              outline: "none",
              cursor: "pointer"
            }}
          >
            {pages.sort((a, b) => a.order_index - b.order_index).map(p => (
              <option key={p.id} value={p.id}>
                {p.title} (/{p.slug})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area - padded top to account for fixed header */}
      <div style={{ paddingTop: "56px", flex: 1 }}>
        {effectivePageId && <PagePreview pageId={effectivePageId} />}
      </div>
    </div>
  );
};

export default PreviewPage;
