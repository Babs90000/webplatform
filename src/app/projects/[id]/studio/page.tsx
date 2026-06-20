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
import { SiteSettingsModal } from "@/features/codegen/components/SiteSettingsModal";
import { PublishModal } from "@/features/projects/components/PublishModal";
import { useProjectFiles } from "@/features/codegen/hooks/useProjectFiles";
import { useCodegenStream } from "@/features/codegen/hooks/useCodegenStream";
import { useStudioStore } from "@/features/codegen/store/studioStore";
import {
  saveProjectFile,
  uploadProjectAsset,
} from "@/features/codegen/services/codegenApi";
import { bundlePreviewHtml } from "@/features/codegen/lib/previewBundler";
import { applyVisualEdit, applyVisualMove, type VisualMovePosition } from "@/features/codegen/lib/visualEditor";
import { toast } from "@/store/toast";

interface StudioPageProps {
  params: Promise<{ id: string }>;
}

const StudioContent: React.FC<{ projectId: string }> = ({ projectId }) => {
  const searchParams = useSearchParams();
  const { data: project, refetch: refetchProject } = useProject(projectId);
  const { data: serverFiles, refetch } = useProjectFiles(projectId);
  const { generate, edit, auditQuality, isBusy, refreshPreview, progressPercent, progressDone, progressPending } = useCodegenStream(projectId);
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
    codeVisible,
    setStudioProjectId,
    setFiles,
    selectPath,
    setPreviewPage,
    setPreviewHtml,
    upsertFile,
    setVisualEditMode,
    setCodeVisible,
  } = useStudioStore();

  const [pendingImage, setPendingImage] = useState<{
    path: string;
    mode: "image" | "background";
    current?: string;
  } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

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
    if (files.length === 0) return;
    const html = bundlePreviewHtml(
      files.map((f) => ({ path: f.path, content: f.content })),
      previewPage,
      projectId,
    );
    if (html) {
      setPreviewHtml(html);
    }
  }, [files, previewPage, projectId, setPreviewHtml]);

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
    (path: string) => {
      setPreviewPage(path);
      const state = useStudioStore.getState();
      const html = bundlePreviewHtml(
        state.files.map((f) => ({ path: f.path, content: f.content })),
        path,
        projectId,
      );
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
      if (!pageFile) {
        toast.error("Page introuvable pour l'édition");
        return;
      }

      const updated = applyVisualEdit(pageFile.content, {
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
        // Texte : déjà visible dans l'iframe. Image / fond / logo : recharger l'aperçu.
        if (kind === "image" || kind === "background") await refreshPreview();
      } catch {
        toast.error("Échec de l'enregistrement de la modification");
      }
    },
    [files, previewPage, projectId, upsertFile, refreshPreview],
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
      if (!pageFile) {
        toast.error("Page introuvable pour le déplacement");
        return;
      }

      const updated = applyVisualMove(pageFile.content, {
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
    [files, previewPage, projectId, upsertFile, refreshPreview],
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

  return (
    <>
    <StudioLayout
      showCode={codeVisible}
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
          codeVisible={codeVisible}
          onToggleCode={() => setCodeVisible(!codeVisible)}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenPublish={() => setPublishOpen(true)}
          onAuditQuality={() => void auditQuality()}
        />
      }
      fileTree={
        <FileTree
          files={files}
          selectedPath={selectedPath}
          onSelect={(path) => {
            selectPath(path);
            setCodeVisible(true);
          }}
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
          loadingMessage={statusMessage || "Génération en cours…"}
          progressPercent={progressPercent}
          progressDone={progressDone}
          progressPending={progressPending}
          editable={visualEditMode}
          onNavigate={(path) => void handlePreviewNavigate(path)}
          onEditText={handleEditText}
          onEditImageRequest={(path, current) =>
            setPendingImage({ path, mode: "image", current })
          }
          onEditBgRequest={(path) => setPendingImage({ path, mode: "background" })}
          onMoveElement={(fromPath, toPath, position) =>
            void handleMoveElement(fromPath, toPath, position)
          }
        />
      }
      chat={
        <BuilderChat
          messages={chatMessages}
          isBusy={isBusy}
          statusMessage={statusMessage}
          onSend={(instruction) => void edit(instruction)}
          onUploadImage={(file) => uploadProjectAsset(projectId, file)}
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
