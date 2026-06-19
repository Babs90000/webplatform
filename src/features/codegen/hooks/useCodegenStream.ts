import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  fetchPreviewHtml,
  streamEditSite,
  streamGenerateSite,
  type CodegenSseEvent,
} from "../services/codegenApi";
import { bundlePreviewHtml } from "../lib/previewBundler";
import { useStudioStore } from "../store/studioStore";
import { toast } from "@/store/toast";

export const useCodegenStream = (projectId: string) => {
  const queryClient = useQueryClient();
  const [isBusy, setIsBusy] = useState(false);
  const {
    setPhase,
    setStatusMessage,
    setPlan,
    appendFileChunk,
    resetStreaming,
    addChatMessage,
    setPreviewHtml,
    previewPage,
    upsertFile,
  } = useStudioStore();

  const refreshPreview = useCallback(async () => {
    const state = useStudioStore.getState();
    const localFiles = state.files.map((f) => ({
      path: f.path,
      content: f.content,
    }));

    const localHtml = bundlePreviewHtml(
      localFiles,
      state.previewPage,
      projectId,
    );

    if (localHtml) {
      setPreviewHtml(localHtml);
      return;
    }

    try {
      const html = await fetchPreviewHtml(projectId, state.previewPage);
      if (!html.includes("Aucune page HTML")) {
        setPreviewHtml(html);
      }
    } catch {
      // preview pas encore prête
    }
  }, [projectId, setPreviewHtml]);

  const handleEvent = useCallback(
    async (event: CodegenSseEvent) => {
      switch (event.type) {
        case "architect_start":
          setPhase("architect");
          setStatusMessage("Koala Codeur conçoit l'architecture…");
          break;
        case "architect_done":
          setPlan(event.plan);
          setStatusMessage(`${event.plan.pages.length} page(s) planifiée(s)`);
          break;
        case "codegen_start":
          setPhase("generating");
          setStatusMessage("Génération des fichiers…");
          resetStreaming();
          break;
        case "file_start":
          setStatusMessage(`Écriture de ${event.path}…`);
          break;
        case "file_chunk":
          appendFileChunk(event.path, event.chunk);
          break;
        case "file_saved": {
          const streamed =
            useStudioStore.getState().streamingPaths[event.path] ??
            useStudioStore.getState().files.find((f) => f.path === event.path)
              ?.content ??
            "";
          upsertFile(event.path, streamed);
          void refreshPreview();
          break;
        }
        case "done":
          setPhase("ready");
          setStatusMessage(`${event.files_created} fichier(s) enregistré(s)`);
          await queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
          await refreshPreview();
          toast.success("Site mis à jour");
          break;
        case "error":
          setPhase("error");
          setStatusMessage(event.message);
          toast.error(event.message);
          break;
      }
    },
    [
      appendFileChunk,
      queryClient,
      projectId,
      refreshPreview,
      resetStreaming,
      setPhase,
      setPlan,
      setStatusMessage,
      upsertFile,
    ],
  );

  const generate = useCallback(async () => {
    setIsBusy(true);
    try {
      await streamGenerateSite(projectId, handleEvent);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur de génération";
      setPhase("error");
      setStatusMessage(msg);
      toast.error(msg);
    } finally {
      setIsBusy(false);
    }
  }, [projectId, handleEvent, setPhase, setStatusMessage]);

  const edit = useCallback(
    async (instruction: string) => {
      setIsBusy(true);
      addChatMessage("user", instruction);
      setPhase("editing");
      setStatusMessage("Modification en cours…");
      resetStreaming();

      try {
        await streamEditSite(projectId, instruction, handleEvent);
        addChatMessage("assistant", "Modifications appliquées.");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erreur d'édition";
        setPhase("error");
        setStatusMessage(msg);
        addChatMessage("assistant", msg);
        toast.error(msg);
      } finally {
        setIsBusy(false);
      }
    },
    [
      projectId,
      handleEvent,
      addChatMessage,
      setPhase,
      setStatusMessage,
      resetStreaming,
    ],
  );

  return { generate, edit, isBusy, refreshPreview };
};
