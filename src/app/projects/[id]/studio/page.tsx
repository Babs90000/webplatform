"use client";

import React, { use, useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { AuthGuard } from "@/shared/components/AuthGuard";
import { useProject } from "@/features/projects/hooks/useProjects";
import { StudioLayout } from "@/features/codegen/components/StudioLayout";
import { StudioToolbar } from "@/features/codegen/components/StudioToolbar";
import { FileTree } from "@/features/codegen/components/FileTree";
import { CodeView } from "@/features/codegen/components/CodeView";
import { StudioPreviewPanel } from "@/features/codegen/components/StudioPreviewPanel";
import { BuilderChat } from "@/features/codegen/components/BuilderChat";
import { ImageReplaceModal } from "@/features/codegen/components/ImageReplaceModal";
import { SiteSettingsModal } from "@/features/codegen/components/SiteSettingsModal";
import { PublishModal } from "@/features/projects/components/PublishModal";
import { StudioShortcutsModal } from "@/features/codegen/components/StudioShortcutsModal";
import { useProjectFiles } from "@/features/codegen/hooks/useProjectFiles";
import { useCodegenStream } from "@/features/codegen/hooks/useCodegenStream";
import { usePreviewBundle } from "@/features/codegen/hooks/usePreviewBundle";
import { useStudioShortcuts } from "@/features/codegen/hooks/useStudioShortcuts";
import { useStudioStore } from "@/features/codegen/store/studioStore";
import { cyclePreviewViewport } from "@/features/codegen/lib/previewViewport";
import type { PreviewViewport } from "@/features/codegen/lib/previewViewport";
import {
  saveProjectFile,
  uploadProjectAsset,
} from "@/features/codegen/services/codegenApi";
import {
  getCachedPreviewHtml,
  mergeFilesForPreview,
} from "@/features/codegen/lib/previewBundleCache";
import { applyVisualEdit, applyVisualMove, type VisualMovePosition } from "@/features/codegen/lib/visualEditor";
import { toast } from "@/store/toast";

interface StudioPageProps {
  params: Promise<{ id: string }>;
}

const StudioContent: React.FC<{ projectId: string }> = ({ projectId }) => {
  const searchParams = useSearchParams();
  const { data: project, refetch: refetchProject } = useProject(projectId);
  const { data: serverFiles, refetch } = useProjectFiles(projectId);
  const { generate, edit, auditQuality, isBusy, refreshPreview } = useCodegenStream(projectId);
  const [isSaving, setIsSaving] = useState(false);
  const [autoGenerateStarted, setAutoGenerateStarted] = useState(false);

  usePreviewBundle(projectId, isBusy);

  const {
    files,
    streamingPaths,
    selectedPath,
    previewPage,
    statusMessage,
    chatMessages,
    visualEditMode,
    codeVisible,
    previewFocus,
    previewViewport,
    viewportMenuOpen,
    committeeReviewActive,
    expertScores,
    setStudioProjectId,
    setFiles,
    selectPath,
    setPreviewPage,
    setPreviewHtml,
    upsertFile,
    setVisualEditMode,
    setCodeVisible,
    setPreviewFocus,
    setPreviewViewport,
    setViewportMenuOpen,
  } = useStudioStore(
    useShallow((state) => ({
      files: state.files,
      streamingPaths: state.streamingPaths,
      selectedPath: state.selectedPath,
      previewPage: state.previewPage,
      statusMessage: state.statusMessage,
      chatMessages: state.chatMessages,
      visualEditMode: state.visualEditMode,
      codeVisible: state.codeVisible,
      previewFocus: state.previewFocus,
      previewViewport: state.previewViewport,
      viewportMenuOpen: state.viewportMenuOpen,
      committeeReviewActive: state.committeeReviewActive,
      expertScores: state.expertScores,
      setStudioProjectId: state.setStudioProjectId,
      setFiles: state.setFiles,
      selectPath: state.selectPath,
      setPreviewPage: state.setPreviewPage,
      setPreviewHtml: state.setPreviewHtml,
      upsertFile: state.upsertFile,
      setVisualEditMode: state.setVisualEditMode,
      setCodeVisible: state.setCodeVisible,
      setPreviewFocus: state.setPreviewFocus,
      setPreviewViewport: state.setPreviewViewport,
      setViewportMenuOpen: state.setViewportMenuOpen,
    })),
  );

  const [pendingImage, setPendingImage] = useState<{
    path: string;
    mode: "image" | "background";
    current?: string;
  } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useEffect(() => {
    setStudioProjectId(projectId);
  }, [projectId, setStudioProjectId]);

  useEffect(() => {
    if (serverFiles && serverFiles.length > 0) {
      setFiles(serverFiles);
      if (!selectedPath) {
        selectPath(serverFiles[0].path);
      }
    }
  }, [serverFiles, setFiles, selectPath, selectedPath]);

  useEffect(() => {
    if (
      searchParams.get("generate") === "1" &&
      !autoGenerateStarted &&
      project &&
      files.length === 0
    ) {
      setAutoGenerateStarted(true);
      void generate();
    }
  }, [searchParams, autoGenerateStarted, project, files.length, generate]);

  const selectedFile = useMemo(
    () => files.find((f) => f.path === selectedPath) ?? null,
    [files, selectedPath],
  );

  const selectedContent = useMemo(() => {
    if (!selectedPath) return "";
    return streamingPaths[selectedPath] ?? selectedFile?.content ?? "";
  }, [selectedPath, streamingPaths, selectedFile?.content]);

  const handleSaveFile = useCallback(async () => {
    if (!selectedPath || !selectedFile) return;
    setIsSaving(true);
    try {
      await saveProjectFile(projectId, selectedPath, selectedContent);
      await refetch();
      await refreshPreview();
      toast.success("Fichier enregistré");
    } catch {
      toast.error("Échec de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  }, [selectedPath, selectedFile, selectedContent, projectId, refetch, refreshPreview]);

  const handlePreviewNavigate = useCallback(
    (path: string) => {
      setPreviewPage(path);
      const state = useStudioStore.getState();
      state.flushStreamingToFiles();
      const merged = mergeFilesForPreview(state.files, state.streamingPaths);
      const html = getCachedPreviewHtml(merged, path, projectId);
      if (html) {
        setPreviewHtml(html);
      } else {
        toast.error("Page introuvable dans l'aperçu");
      }
    },
    [projectId, setPreviewPage, setPreviewHtml],
  );

  const persistPageEdit = useCallback(
    async (
      kind: "text" | "image" | "background",
      path: string,
      value: string,
      alt?: string,
      current?: string,
    ) => {
      const pageFile = files.find((f) => f.path === previewPage) ?? null;
      const pageContent = streamingPaths[previewPage] ?? pageFile?.content ?? "";
      if (!pageContent) {
        toast.error("Page introuvable pour l'édition");
        return;
      }

      const updated = applyVisualEdit(pageContent, {
        kind,
        path,
        value,
        alt,
        current,
      });
      if (!updated) {
        toast.error("Élément introuvable — actualisez l'aperçu");
        return;
      }

      upsertFile(previewPage, updated);
      try {
        await saveProjectFile(projectId, previewPage, updated);
        if (kind === "image" || kind === "background") await refreshPreview();
      } catch {
        toast.error("Échec de l'enregistrement de la modification");
      }
    },
    [files, streamingPaths, previewPage, projectId, upsertFile, refreshPreview],
  );

  const handleEditText = useCallback(
    (path: string, value: string) => {
      void persistPageEdit("text", path, value);
    },
    [persistPageEdit],
  );

  const handleMoveElement = useCallback(
    async (
      fromPath: string,
      toPath: string,
      position: VisualMovePosition,
    ) => {
      const pageFile = files.find((f) => f.path === previewPage) ?? null;
      const pageContent = streamingPaths[previewPage] ?? pageFile?.content ?? "";
      if (!pageContent) {
        toast.error("Page introuvable pour le déplacement");
        return;
      }

      const updated = applyVisualMove(pageContent, {
        fromPath,
        toPath,
        position,
      });
      if (!updated) {
        toast.error(
          "Déplacement impossible — vérifiez le type de bloc (section vs carte) et évitez nav/footer",
        );
        return;
      }

      upsertFile(previewPage, updated);
      try {
        await saveProjectFile(projectId, previewPage, updated);
        await refreshPreview();
        toast.success("Bloc déplacé");
      } catch {
        toast.error("Échec de l'enregistrement du déplacement");
      }
    },
    [files, streamingPaths, previewPage, projectId, upsertFile, refreshPreview],
  );

  const handleImageConfirm = useCallback(
    async (url: string, alt?: string) => {
      if (!pendingImage) return;
      const { path, mode, current } = pendingImage;
      setPendingImage(null);
      await persistPageEdit(mode, path, url, alt, current);
    },
    [pendingImage, persistPageEdit],
  );

  const handleSelectFile = useCallback(
    (path: string) => {
      selectPath(path);
      setCodeVisible(true);
    },
    [selectPath, setCodeVisible],
  );

  const handleCodeChange = useCallback(
    (content: string) => {
      if (selectedPath) upsertFile(selectedPath, content);
    },
    [selectedPath, upsertFile],
  );

  const handleToggleVisualEdit = useCallback(() => {
    setVisualEditMode(!visualEditMode);
  }, [visualEditMode, setVisualEditMode]);

  const handleTogglePreviewFocus = useCallback(() => {
    setPreviewFocus(!previewFocus);
  }, [previewFocus, setPreviewFocus]);

  const handleSelectPreviewViewport = useCallback(
    (viewport: PreviewViewport) => {
      setPreviewViewport(viewport);
      if (viewport !== "full") setPreviewFocus(true);
    },
    [setPreviewViewport, setPreviewFocus],
  );

  const handleCyclePreviewViewport = useCallback(() => {
    const next = cyclePreviewViewport(previewViewport);
    handleSelectPreviewViewport(next);
  }, [previewViewport, handleSelectPreviewViewport]);

  const handleSetViewportFull = useCallback(() => {
    setPreviewViewport("full");
  }, [setPreviewViewport]);

  const handleExitPreviewFocus = useCallback(() => {
    setPreviewFocus(false);
  }, [setPreviewFocus]);

  const handleToggleCode = useCallback(() => {
    if (previewFocus) return;
    setCodeVisible(!codeVisible);
  }, [codeVisible, previewFocus, setCodeVisible]);

  useStudioShortcuts({
    enabled: files.length > 0,
    shortcutsOpen,
    viewportMenuOpen,
    previewViewport,
    previewFocus,
    onSelectViewport: handleSelectPreviewViewport,
    onCycleViewport: handleCyclePreviewViewport,
    onTogglePreviewFocus: handleTogglePreviewFocus,
    onToggleCode: handleToggleCode,
    onOpenHelp: () => setShortcutsOpen(true),
    onCloseHelp: () => setShortcutsOpen(false),
    onCloseViewportMenu: () => setViewportMenuOpen(false),
    onSetViewportFull: handleSetViewportFull,
    onExitPreviewFocus: handleExitPreviewFocus,
  });

  return (
    <>
    <StudioLayout
      showCode={codeVisible}
      previewFocus={previewFocus}
      toolbar={
        <StudioToolbar
          projectId={projectId}
          projectName={project?.name ?? "Chargement…"}
          statusMessage={statusMessage}
          isBusy={isBusy}
          onGenerate={() => void generate()}
          onRefreshPreview={() => void refreshPreview()}
          hasFiles={files.length > 0}
          visualEditMode={visualEditMode}
          onToggleVisualEdit={handleToggleVisualEdit}
          codeVisible={codeVisible}
          onToggleCode={handleToggleCode}
          previewFocus={previewFocus}
          onTogglePreviewFocus={handleTogglePreviewFocus}
          previewViewport={previewViewport}
          viewportMenuOpen={viewportMenuOpen}
          onSelectPreviewViewport={handleSelectPreviewViewport}
          onViewportMenuOpenChange={setViewportMenuOpen}
          onOpenShortcuts={() => setShortcutsOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenPublish={() => setPublishOpen(true)}
          onAuditQuality={() => void auditQuality()}
          committeeReviewActive={committeeReviewActive}
          expertScores={expertScores}
        />
      }
      fileTree={
        <FileTree
          files={files}
          selectedPath={selectedPath}
          onSelect={handleSelectFile}
        />
      }
      codeView={
        <CodeView
          path={selectedPath}
          content={selectedContent}
          onChange={handleCodeChange}
          onSave={() => void handleSaveFile()}
          isSaving={isSaving}
        />
      }
      preview={
        <StudioPreviewPanel
          onNavigate={handlePreviewNavigate}
          onEditText={handleEditText}
          onEditImageRequest={(path, current) =>
            setPendingImage({ path, mode: "image", current })
          }
          onEditBgRequest={(path) =>
            setPendingImage({ path, mode: "background" })
          }
          onMoveElement={(fromPath, toPath, position) =>
            void handleMoveElement(fromPath, toPath, position)
          }
          onOpenShortcuts={() => setShortcutsOpen(true)}
          onOpenViewportMenu={() => setViewportMenuOpen(true)}
        />
      }
      chat={
        <BuilderChat
          messages={chatMessages}
          isBusy={isBusy}
          statusMessage={statusMessage}
          onSend={(instruction) => void edit(instruction)}
          onUploadImage={(file) => uploadProjectAsset(projectId, file)}
          committeeReviewActive={committeeReviewActive}
          expertScores={expertScores}
        />
      }
    />
    <ImageReplaceModal
      isOpen={pendingImage !== null}
      onClose={() => setPendingImage(null)}
      onConfirm={(url, alt) => void handleImageConfirm(url, alt)}
      onUpload={(file) => uploadProjectAsset(projectId, file)}
      title={
        pendingImage?.mode === "background"
          ? "Changer le fond"
          : "Remplacer l'image ou le logo"
      }
    />
    <SiteSettingsModal
      isOpen={settingsOpen}
      onClose={() => setSettingsOpen(false)}
      projectId={projectId}
      initialContactEmail={project?.settings?.contact_email ?? ""}
      onSaved={() => void refetchProject()}
    />
    <PublishModal
      isOpen={publishOpen}
      onClose={() => setPublishOpen(false)}
      projectId={projectId}
      initialSubdomain={project?.subdomain ?? project?.slug ?? ""}
      initialCustomDomain={project?.custom_domain ?? ""}
    />
    <StudioShortcutsModal
      isOpen={shortcutsOpen}
      onClose={() => setShortcutsOpen(false)}
    />
    </>
  );
};

const StudioPage: React.FC<StudioPageProps> = ({ params }) => {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  return (
    <AuthGuard>
      <Suspense fallback={null}>
        <StudioContent projectId={projectId} />
      </Suspense>
    </AuthGuard>
  );
};

export default StudioPage;
