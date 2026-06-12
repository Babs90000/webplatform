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
    <div className="flex flex-col h-[100dvh] w-full bg-zinc-50 text-zinc-900 overflow-hidden font-sans selection:bg-primary/20">
      {/* Top Toolbar */}
      <div className="shrink-0 z-50 shadow-sm relative">
        {toolbar}
      </div>

      <main className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar (Desktop) / Pages View (Mobile) */}
        <aside
          className={`
            ${mobileView === "pages" ? "flex" : "hidden lg:flex"} 
            ${isSidebarCollapsed ? "lg:hidden" : "lg:flex"}
            flex-col w-full lg:w-72 shrink-0 bg-white border-r border-zinc-200 z-10 transition-transform duration-300 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)]
          `}
        >
          {pageTree}
        </aside>

        {/* Center Canvas (Editor Area) */}
        <section 
          className={`
            ${mobileView === "canvas" ? "flex" : "hidden lg:flex"} 
            flex-1 flex-col overflow-hidden relative bg-zinc-50/80
          `}
        >
          {canvas}
        </section>

        {/* Right Sidebar (Properties / AI) */}
        <aside
          className={`
            ${mobileView === "ai" ? "flex" : "hidden lg:flex"} 
            ${isPropertiesCollapsed ? "lg:hidden" : "lg:flex"}
            flex-col w-full lg:w-80 shrink-0 bg-white border-l border-zinc-200 z-10 transition-transform duration-300 shadow-[-2px_0_8px_-4px_rgba(0,0,0,0.05)]
          `}
        >
          <div className="flex flex-col h-full">
            <div className="flex bg-zinc-50/50 border-b border-zinc-200 p-1.5 gap-1 shrink-0">
              <button
                type="button"
                className={`flex-1 py-2 px-3 text-[13px] font-medium rounded-md transition-all duration-200 ${
                  activeRightPanel === "properties"
                    ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/60"
                    : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
                }`}
                onClick={() => switchRightPanel("properties")}
              >
                Propriétés
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-3 text-[13px] font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  activeRightPanel === "hermes"
                    ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/60"
                    : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
                }`}
                onClick={() => switchRightPanel("hermes")}
              >
                <span className="text-sm">✨</span>
                Assistant
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
      <div className="lg:hidden shrink-0 bg-white border-t border-zinc-200 flex items-center justify-around pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
        <button
          onClick={() => setMobileView("pages")}
          className={`flex flex-col items-center justify-center py-3 flex-1 transition-colors ${
            mobileView === "pages" ? "text-primary" : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span className="text-[10px] font-semibold tracking-wide">PAGES</span>
        </button>
        <button
          onClick={() => setMobileView("canvas")}
          className={`flex flex-col items-center justify-center py-3 flex-1 transition-colors ${
            mobileView === "canvas" ? "text-primary" : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <span className="text-[10px] font-semibold tracking-wide">CANEVAS</span>
        </button>
        <button
          onClick={() => setMobileView("ai")}
          className={`flex flex-col items-center justify-center py-3 flex-1 transition-colors ${
            mobileView === "ai" ? "text-primary" : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <span className="text-[10px] font-semibold tracking-wide">IA & PROPS</span>
        </button>
      </div>
    </div>
  );
};
