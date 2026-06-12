"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useIsMutating } from "@tanstack/react-query";
import { useEditorStore } from "@/store/editor";
import { AI_ASSISTANT_NAME } from "@/lib/branding";
import { PublishModal } from "@/features/projects/components/PublishModal";

interface EditorToolbarProps {
  projectName?: string;
  projectId: string;
  saveStatus?: "saved" | "saving" | "error";
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  projectName = "Chargement...",
  projectId,
  saveStatus,
}) => {
  const {
    isSidebarCollapsed,
    isPropertiesCollapsed,
    activeRightPanel,
    switchRightPanel,
    toggleSidebar,
    toggleProperties,
    setMobileView,
  } = useEditorStore();

  const [showPublish, setShowPublish] = useState(false);

  const mutatingCount = useIsMutating();
  const effectiveStatus: "saved" | "saving" | "error" =
    saveStatus ?? (mutatingCount > 0 ? "saving" : "saved");

  const handleToggleHermes = () => {
    if (window.innerWidth < 1024) {
      setMobileView("ai");
      return;
    }
    if (isPropertiesCollapsed) {
      switchRightPanel("hermes");
    } else if (activeRightPanel === "properties") {
      switchRightPanel("hermes");
    } else {
      toggleProperties();
    }
  };

  const handleToggleProperties = () => {
    if (window.innerWidth < 1024) {
      setMobileView("ai");
      return;
    }
    if (isPropertiesCollapsed) {
      switchRightPanel("properties");
    } else if (activeRightPanel === "hermes") {
      switchRightPanel("properties");
    } else {
      toggleProperties();
    }
  };

  return (
    <header className="flex items-center justify-between h-14 px-4 bg-white border-b border-zinc-200 text-zinc-700">
      <div className="flex items-center gap-2">
        <Link 
          href="/dashboard" 
          aria-label="Back to dashboard"
          className="p-2 rounded-md hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        {/* Sidebar Toggle (Desktop only) */}
        <button
          className={`hidden lg:flex p-2 rounded-md transition-colors ${!isSidebarCollapsed ? "bg-zinc-100 text-zinc-900" : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900"}`}
          onClick={toggleSidebar}
          aria-label="Toggle pages sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex items-center ml-2 border-l border-zinc-200 pl-4 h-6">
          <span className="font-semibold text-[14px] text-zinc-800 truncate max-w-[120px] sm:max-w-xs">{projectName}</span>
          
          <div className="hidden sm:flex items-center ml-4 gap-1.5 px-2.5 py-1 rounded-full bg-zinc-50 border border-zinc-200">
            <div 
              className={`w-1.5 h-1.5 rounded-full ${
                effectiveStatus === "saving" ? "bg-amber-400 animate-pulse" :
                effectiveStatus === "error" ? "bg-red-500" : "bg-emerald-500"
              }`} 
            />
            <span className="text-[11px] font-medium text-zinc-500">
              {effectiveStatus === "saving" ? "Sauvegarde..." :
               effectiveStatus === "error" ? "Erreur" : "À jour"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Assistant AI Toggle */}
        <button
          className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            !isPropertiesCollapsed && activeRightPanel === "hermes" 
              ? "bg-indigo-50 text-indigo-600 border border-indigo-100" 
              : "text-zinc-600 hover:bg-zinc-100 border border-transparent"
          }`}
          onClick={handleToggleHermes}
          title={`Assistant IA ${AI_ASSISTANT_NAME}`}
        >
          <span className="text-lg">✨</span>
          <span>Demander à l'IA</span>
        </button>

        <div className="hidden lg:block w-px h-6 bg-zinc-200 mx-1"></div>

        <Link
          href={`/projects/${projectId}/preview`}
          target="_blank"
          className="hidden sm:flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-md bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Aperçu
        </Link>

        <button
          onClick={() => setShowPublish(true)}
          className="h-9 px-4 sm:px-5 text-sm font-semibold rounded-md bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-sm"
        >
          Publier
        </button>

        {/* Properties Sidebar Toggle (Desktop only) */}
        <button
          className={`hidden lg:flex p-2 rounded-md transition-colors ml-1 ${
            !isPropertiesCollapsed && activeRightPanel === "properties" ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          }`}
          onClick={handleToggleProperties}
          title="Panneau de propriétés"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6V18M18 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <PublishModal
        isOpen={showPublish}
        onClose={() => setShowPublish(false)}
        projectId={projectId}
      />
    </header>
  );
};
