"use client";

import React, { useEffect } from "react";
import { useEditorStore } from "@/store/editor";
import { HermesChatSidebar } from "../HermesChatSidebar";

interface EditorLayoutProps {
  toolbar: React.ReactNode;
  pageTree: React.ReactNode;
  canvas: React.ReactNode;
  propertiesPanel: React.ReactNode;
  projectId: string;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  toolbar,
  pageTree,
  canvas,
  propertiesPanel,
  projectId,
}) => {
  const {
    isSidebarCollapsed,
    isPropertiesCollapsed,
    activeRightPanel,
    switchRightPanel,
    selectedPageId,
    setProjectId,
    mobileView,
    setMobileView,
    reset,
  } = useEditorStore();

  useEffect(() => {
    setProjectId(projectId);
    return () => reset(); // Cleanup on unmount
  }, [projectId, setProjectId, reset]);

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-zinc-950 text-foreground overflow-hidden font-sans">
      {/* Top Toolbar */}
      <div className="shrink-0 z-50">
        {toolbar}
      </div>

      <main className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar (Desktop) / Pages View (Mobile) */}
        <aside
          className={`
            ${mobileView === "pages" ? "flex" : "hidden lg:flex"} 
            ${isSidebarCollapsed ? "lg:hidden" : "lg:flex"}
            flex-col w-full lg:w-72 shrink-0 bg-zinc-900 border-r border-zinc-800 z-10 transition-transform duration-300
          `}
        >
          {pageTree}
        </aside>

        {/* Center Canvas (Preview) */}
        <section 
          className={`
            ${mobileView === "canvas" ? "flex" : "hidden lg:flex"} 
            flex-1 flex-col overflow-hidden relative bg-zinc-950/50
          `}
        >
          {canvas}
        </section>

        {/* Right Sidebar (Properties / AI) */}
        <aside
          className={`
            ${mobileView === "ai" ? "flex" : "hidden lg:flex"} 
            ${isPropertiesCollapsed ? "lg:hidden" : "lg:flex"}
            flex-col w-full lg:w-80 shrink-0 bg-zinc-900 border-l border-zinc-800 z-10 transition-transform duration-300
          `}
        >
          <div className="flex flex-col h-full">
            <div className="flex bg-zinc-900 border-b border-zinc-800">
              <button
                type="button"
                className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors border-b-2 ${
                  activeRightPanel === "properties"
                    ? "text-primary border-primary bg-primary/5"
                    : "text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/5"
                }`}
                onClick={() => switchRightPanel("properties")}
              >
                Propriétés
              </button>
              <button
                type="button"
                className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors border-b-2 ${
                  activeRightPanel === "hermes"
                    ? "text-primary border-primary bg-primary/5"
                    : "text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/5"
                }`}
                onClick={() => switchRightPanel("hermes")}
              >
                Assistant IA ✨
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {activeRightPanel === "properties" ? (
                propertiesPanel
              ) : (
                <HermesChatSidebar
                  pageId={selectedPageId}
                  onClose={() => useEditorStore.getState().toggleProperties()}
                />
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden shrink-0 bg-zinc-900 border-t border-zinc-800 flex items-center justify-around pb-safe">
        <button
          onClick={() => setMobileView("pages")}
          className={`flex flex-col items-center justify-center py-3 flex-1 ${
            mobileView === "pages" ? "text-primary" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span className="text-[10px] font-medium uppercase tracking-wider">Pages</span>
        </button>
        <button
          onClick={() => setMobileView("canvas")}
          className={`flex flex-col items-center justify-center py-3 flex-1 ${
            mobileView === "canvas" ? "text-primary" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <span className="text-[10px] font-medium uppercase tracking-wider">Canevas</span>
        </button>
        <button
          onClick={() => setMobileView("ai")}
          className={`flex flex-col items-center justify-center py-3 flex-1 ${
            mobileView === "ai" ? "text-primary" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[10px] font-medium uppercase tracking-wider">IA & Props</span>
        </button>
      </div>
    </div>
  );
};
