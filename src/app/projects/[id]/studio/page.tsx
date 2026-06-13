"use client";

import React, { use, useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthGuard } from "@/shared/components/AuthGuard";
import { useProject } from "@/features/projects/hooks/useProjects";
import { StudioLayout } from "@/features/codegen/components/StudioLayout";
import { StudioToolbar } from "@/features/codegen/components/StudioToolbar";
import { FileTree } from "@/features/codegen/components/FileTree";
import { CodeView } from "@/features/codegen/components/CodeView";
import { LivePreview } from "@/features/codegen/components/LivePreview";
import { BuilderChat } from "@/features/codegen/components/BuilderChat";
import { ImageReplaceModal } from "@/features/codegen/components/ImageReplaceModal";
import { useProjectFiles } from "@/features/codegen/hooks/useProjectFiles";
import { useCodegenStream } from "@/features/codegen/hooks/useCodegenStream";
import { useStudioStore } from "@/features/codegen/store/studioStore";
import {
  saveProjectFile,
  fetchPreviewHtml,
  uploadProjectAsset,
} from "@/features/codegen/services/codegenApi";
import { applyVisualEdit } from "@/features/codegen/lib/visualEditor";
import { toast } from "@/store/toast";

interface StudioPageProps {
  params: Promise<{ id: string }>;
}

const StudioContent: React.FC<{ projectId: string }> = ({ projectId }) => {
  const searchParams = useSearchParams();
  const { data: project } = useProject(projectId);
  const { data: serverFiles, refetch } = useProjectFiles(projectId);
  const { generate, edit, isBusy, refreshPreview } = useCodegenStream(projectId);
  const [isSaving, setIsSaving] = useState(false);
  const [autoGenerateStarted, setAutoGenerateStarted] = useState(false);

  const {
    files,
    selectedPath,
    previewHtml,
    previewPage,
    phase,
    statusMessage,
    chatMessages,
    visualEditMode,
    setFiles,
    selectPath,
    setPreviewPage,
    setPreviewHtml,
    upsertFile,
    setVisualEditMode,
  } = useStudioStore();

  const [pendingImageSelector, setPendingImageSelector] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (serverFiles) {
      setFiles(serverFiles);
      if (!selectedPath && serverFiles.length > 0) {
        selectPath(serverFiles[0].path);
      }
    }
  }, [serverFiles, setFiles, selectPath, selectedPath]);

  useEffect(() => {
    const loadPreview = async () => {
      if (files.length === 0) return;
      try {
        const html = await fetchPreviewHtml(projectId, previewPage);
        setPreviewHtml(html);
      } catch {
        // ignore
      }
    };
    void loadPreview();
  }, [files.length, projectId, previewPage, setPreviewHtml]);

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

  const selectedFile = files.find((f) => f.path === selectedPath) ?? null;

  const handleSaveFile = useCallback(async () => {
    if (!selectedPath || !selectedFile) return;
    setIsSaving(true);
    try {
      await saveProjectFile(projectId, selectedPath, selectedFile.content);
      await refetch();
      await refreshPreview();
      toast.success("Fichier enregistré");
    } catch {
      toast.error("Échec de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  }, [selectedPath, selectedFile, projectId, refetch, refreshPreview]);

  const handlePreviewNavigate = useCallback(
    async (path: string) => {
      setPreviewPage(path);
      try {
        const html = await fetchPreviewHtml(projectId, path);
        setPreviewHtml(html);
      } catch {
        toast.error("Page introuvable dans l'aperçu");
      }
    },
    [projectId, setPreviewPage, setPreviewHtml],
  );

  const persistPageEdit = useCallback(
    async (
      kind: "text" | "image",
      selector: string,
      value: string,
      alt?: string,
    ) => {
      const pageFile = files.find((f) => f.path === previewPage) ?? null;
      if (!pageFile) {
        toast.error("Page introuvable pour l'édition");
        return;
      }

      const updated = applyVisualEdit(pageFile.content, {
        kind,
        selector,
        value,
        alt,
      });
      if (!updated) {
        toast.error("Élément introuvable — actualisez l'aperçu");
        return;
      }

      upsertFile(previewPage, updated);
      try {
        await saveProjectFile(projectId, previewPage, updated);
        await refreshPreview();
      } catch {
        toast.error("Échec de l'enregistrement de la modification");
      }
    },
    [files, previewPage, projectId, upsertFile, refreshPreview],
  );

  const handleEditText = useCallback(
    (selector: string, value: string) => {
      void persistPageEdit("text", selector, value);
    },
    [persistPageEdit],
  );

  const handleImageConfirm = useCallback(
    async (url: string, alt?: string) => {
      if (!pendingImageSelector) return;
      const selector = pendingImageSelector;
      setPendingImageSelector(null);
      await persistPageEdit("image", selector, url, alt);
    },
    [pendingImageSelector, persistPageEdit],
  );

  return (
    <>
    <StudioLayout
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
          onToggleVisualEdit={() => setVisualEditMode(!visualEditMode)}
        />
      }
      fileTree={
        <FileTree
          files={files}
          selectedPath={selectedPath}
          onSelect={selectPath}
        />
      }
      codeView={
        <CodeView
          path={selectedPath}
          content={selectedFile?.content ?? ""}
          onChange={(content) => {
            if (selectedPath) upsertFile(selectedPath, content);
          }}
          onSave={() => void handleSaveFile()}
          isSaving={isSaving}
        />
      }
      preview={
        <LivePreview
          html={previewHtml}
          isLoading={phase === "generating" || phase === "architect" || phase === "editing"}
          editable={visualEditMode}
          onNavigate={(path) => void handlePreviewNavigate(path)}
          onEditText={handleEditText}
          onEditImageRequest={(selector) => setPendingImageSelector(selector)}
        />
      }
      chat={
        <BuilderChat
          messages={chatMessages}
          isBusy={isBusy}
          statusMessage={statusMessage}
          onSend={(instruction) => void edit(instruction)}
        />
      }
    />
    <ImageReplaceModal
      isOpen={pendingImageSelector !== null}
      onClose={() => setPendingImageSelector(null)}
      onConfirm={(url, alt) => void handleImageConfirm(url, alt)}
      onUpload={(file) => uploadProjectAsset(projectId, file)}
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
