import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  fetchPreviewHtml,
  streamAuditSite,
  streamEditSite,
  streamGenerateSite,
  type CodegenSseEvent,
} from "../services/codegenApi";
import { bundlePreviewHtml } from "../lib/previewBundler";
import { useStudioStore } from "../store/studioStore";
import { toast } from "@/store/toast";

const GENERATION_TASKS = [
  "Analyse du brief",
  "Architecture & design system",
  "Feuille de styles CSS",
  "Scripts interactifs",
  "Pages HTML",
  "Revue créative (6 experts)",
  "Finitions premium",
  "Finalisation",
] as const;

const AUDIT_TASKS = [
  "Préparation de l'audit",
  "Revue créative (6 experts)",
  "Finitions premium",
  "Finalisation",
] as const;

type ReviewExpertScores = {
  directeur_artistique: number;
  designer_ux: number;
  redacteur: number;
  seo: number;
  cro: number;
  accessibilite: number;
};

const formatExpertScores = (e: ReviewExpertScores): string =>
  `DA ${e.directeur_artistique} · UX ${e.designer_ux} · Réd ${e.redacteur} · SEO ${e.seo} · CRO ${e.cro} · A11y ${e.accessibilite}`;

const taskProgress = (
  doneCount: number,
  currentLabel?: string,
): { percent: number; done: string[]; pending: string[] } => {
  const total = GENERATION_TASKS.length;
  const done = GENERATION_TASKS.slice(0, doneCount).map(String);
  const pending = GENERATION_TASKS.slice(doneCount).map(String);
  if (currentLabel && pending[0]) {
    pending[0] = currentLabel;
  }
  const percent = Math.min(
    98,
    Math.round((doneCount / total) * 100 + (currentLabel ? 8 : 0)),
  );
  return { percent, done, pending };
};

export const useCodegenStream = (projectId: string) => {
  const queryClient = useQueryClient();
  const [isBusy, setIsBusy] = useState(false);
  const auditFlowRef = useRef(false);
  const {
    setPhase,
    setStatusMessage,
    setProgress,
    setPlan,
    appendFileChunk,
    resetStreaming,
    addChatMessage,
    setPreviewHtml,
    progressPercent,
    progressDone,
    progressPending,
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
        case "architect_start": {
          setPhase("architect");
          setStatusMessage("Koala Codeur conçoit l'architecture…");
          const p = taskProgress(0, GENERATION_TASKS[0]);
          setProgress(p.percent, p.done, p.pending);
          break;
        }
        case "architect_done": {
          setPlan(event.plan);
          setStatusMessage(`${event.plan.pages.length} page(s) planifiée(s)`);
          const p = taskProgress(2, GENERATION_TASKS[2]);
          setProgress(p.percent, p.done, p.pending);
          break;
        }
        case "codegen_start": {
          setPhase("generating");
          setStatusMessage("Génération des fichiers…");
          resetStreaming();
          const p = taskProgress(2, GENERATION_TASKS[2]);
          setProgress(p.percent, p.done, p.pending);
          break;
        }
        case "file_start": {
          setStatusMessage(`Écriture de ${event.path}…`);
          if (event.path.endsWith(".css")) {
            const p = taskProgress(2, "Feuille de styles CSS");
            setProgress(p.percent, p.done, p.pending);
          } else if (event.path.endsWith(".js")) {
            const p = taskProgress(3, "Scripts interactifs");
            setProgress(p.percent, p.done, p.pending);
          } else if (event.path.endsWith(".html")) {
            const p = taskProgress(4, `Page ${event.path}`);
            setProgress(p.percent, p.done, p.pending);
          }
          break;
        }
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
        case "audit_start": {
          auditFlowRef.current = true;
          setPhase("generating");
          setStatusMessage(
            event.mode === "auto"
              ? "Édition substantielle — audit qualité automatique…"
              : "Audit qualité — comité créatif (6 experts)…",
          );
          const p = taskProgress(1, AUDIT_TASKS[1]);
          setProgress(p.percent, p.done, p.pending);
          break;
        }
        case "review_start": {
          setPhase("generating");
          setStatusMessage(
            event.round > 1
              ? "Re-contrôle qualité après finitions…"
              : "Comité créatif : 6 experts (DA, UX, rédaction, SEO, CRO, a11y)…",
          );
          const p = auditFlowRef.current
            ? taskProgress(1, AUDIT_TASKS[1])
            : taskProgress(5, GENERATION_TASKS[5]);
          setProgress(p.percent, p.done, p.pending);
          break;
        }
        case "review_done": {
          setStatusMessage(
            event.pass
              ? `Qualité validée — ${event.score}/100 (${formatExpertScores(event.expert_scores)})`
              : `Score ${event.score}/100 — ${event.issues_count} point(s) à peaufiner`,
          );
          const p = taskProgress(
            event.pass ? 7 : 5,
            event.pass ? GENERATION_TASKS[7] : GENERATION_TASKS[6],
          );
          setProgress(p.percent, p.done, p.pending);
          break;
        }
        case "polish_start": {
          setPhase("generating");
          setStatusMessage(
            `Finitions ${event.pass}/${event.max_passes} — score ${event.score}/100, ${event.issues_count} point(s) à corriger…`,
          );
          const p = auditFlowRef.current
            ? taskProgress(2, AUDIT_TASKS[2])
            : taskProgress(6, GENERATION_TASKS[6]);
          setProgress(p.percent, p.done, p.pending);
          break;
        }
        case "polish_done": {
          setStatusMessage(
            `Finitions ${event.pass}/${event.max_passes} appliquées — re-contrôle qualité…`,
          );
          break;
        }
        case "review_quality_warning": {
          setStatusMessage(
            `Qualité ${event.score}/100 après ${3} passes — relecture manuelle conseillée`,
          );
          toast.error(
            `Score qualité ${event.score}/100 — vérifiez le site dans le studio`,
          );
          break;
        }
        case "done": {
          const isAudit = auditFlowRef.current;
          auditFlowRef.current = false;
          setPhase("ready");
          const scoreLabel =
            typeof event.review_score === "number"
              ? ` · Qualité ${event.review_score}/100`
              : "";
          setStatusMessage(
            `${event.files_created} fichier(s) enregistré(s)${scoreLabel}`,
          );
          setProgress(
            100,
            isAudit ? [...AUDIT_TASKS] : [...GENERATION_TASKS],
            [],
          );
          await queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
          await refreshPreview();
          if (event.client_ready === false) {
            toast.error(
              typeof event.review_score === "number"
                ? `Site généré — qualité ${event.review_score}/100, relecture recommandée`
                : "Site généré — relecture qualité recommandée",
            );
          } else {
            toast.success(
              typeof event.review_score === "number"
                ? `Site prêt client — qualité ${event.review_score}/100`
                : "Site mis à jour",
            );
          }
          break;
        }
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
      setProgress,
      setStatusMessage,
      upsertFile,
    ],
  );

  const generate = useCallback(async () => {
    setIsBusy(true);
    setProgress(5, [], [...GENERATION_TASKS]);
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
  }, [projectId, handleEvent, setPhase, setProgress, setStatusMessage]);

  const edit = useCallback(
    async (instruction: string) => {
      setIsBusy(true);
      addChatMessage("user", instruction);
      setPhase("editing");
      setStatusMessage("Modification en cours…");
      setProgress(20, ["Analyse de la demande"], ["Application des modifications", "Finalisation"]);
      resetStreaming();

      try {
        let doneMeta: {
          review_score?: number;
          client_ready?: boolean;
        } = {};

        const onEditEvent = (event: CodegenSseEvent) => {
          if (event.type === "done") {
            doneMeta = {
              review_score: event.review_score,
              client_ready: event.client_ready,
            };
          }
          void handleEvent(event);
        };

        await streamEditSite(projectId, instruction, onEditEvent);

        if (typeof doneMeta.review_score === "number") {
          addChatMessage(
            "assistant",
            doneMeta.client_ready === false
              ? `Modifications appliquées. Audit qualité : ${doneMeta.review_score}/100 — relecture recommandée.`
              : `Modifications appliquées. Audit qualité : ${doneMeta.review_score}/100.`,
          );
        } else {
          addChatMessage("assistant", "Modifications appliquées.");
        }
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
      setProgress,
      setStatusMessage,
      resetStreaming,
    ],
  );

  const auditQuality = useCallback(async () => {
    setIsBusy(true);
    auditFlowRef.current = true;
    setPhase("generating");
    setStatusMessage("Audit qualité en cours…");
    setProgress(5, [], [...AUDIT_TASKS]);
    resetStreaming();

    try {
      await streamAuditSite(projectId, handleEvent);
    } catch (err) {
      auditFlowRef.current = false;
      const msg = err instanceof Error ? err.message : "Erreur d'audit qualité";
      setPhase("error");
      setStatusMessage(msg);
      toast.error(msg);
    } finally {
      setIsBusy(false);
    }
  }, [
    projectId,
    handleEvent,
    setPhase,
    setProgress,
    setStatusMessage,
    resetStreaming,
  ]);

  return {
    generate,
    edit,
    auditQuality,
    isBusy,
    refreshPreview,
    progressPercent,
    progressDone,
    progressPending,
  };
};
