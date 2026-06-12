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
    mobileView,
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
    <header className="flex items-center justify-between h-14 px-4 bg-zinc-950 border-b border-zinc-800 text-zinc-300">
      <div className="flex items-center gap-2">
        <Link 
          href="/dashboard" 
          aria-label="Back to dashboard"
          className="p-2 rounded-md hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        {/* Sidebar Toggle (Desktop only) */}
        <button
          className={`hidden lg:flex p-2 rounded-md transition-colors ${!isSidebarCollapsed ? "bg-zinc-800 text-white" : "hover:bg-zinc-800 hover:text-white"}`}
          onClick={toggleSidebar}
          aria-label="Toggle pages sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex items-center ml-2 border-l border-zinc-800 pl-4 h-6">
          <span className="font-medium text-sm text-zinc-100 truncate max-w-[120px] sm:max-w-xs">{projectName}</span>
          
          <div className="hidden sm:flex items-center ml-3 gap-2">
            <div 
              className={`w-2 h-2 rounded-full ${
                effectiveStatus === "saving" ? "bg-amber-400 animate-pulse" :
                effectiveStatus === "error" ? "bg-red-500" : "bg-emerald-500"
              }`} 
            />
            <span className="text-xs text-zinc-500">
              {effectiveStatus === "saving" ? "Enregistrement..." :
               effectiveStatus === "error" ? "Échec" : "Sauvegardé"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Assistant AI Toggle */}
        <button
          className={`hidden lg:flex p-1.5 text-lg rounded-md transition-colors ${
            !isPropertiesCollapsed && activeRightPanel === "hermes" ? "bg-zinc-800" : "hover:bg-zinc-800"
          }`}
          onClick={handleToggleHermes}
          title={`Assistant IA ${AI_ASSISTANT_NAME}`}
        >
          ✨
        </button>

        <Link
          href={`/projects/${projectId}/preview`}
          target="_blank"
          className="hidden sm:flex items-center gap-2 h-8 px-3 text-sm font-medium rounded-md bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Preview
        </Link>

        <button
          onClick={() => setShowPublish(true)}
          className="h-8 px-3 sm:px-4 text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          Publier
        </button>

        {/* Properties Sidebar Toggle (Desktop only) */}
        <button
          className={`hidden lg:flex p-2 rounded-md transition-colors ${
            !isPropertiesCollapsed && activeRightPanel === "properties" ? "bg-zinc-800 text-white" : "hover:bg-zinc-800 hover:text-white"
          }`}
          onClick={handleToggleProperties}
          title="Panneau de propriétés"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
