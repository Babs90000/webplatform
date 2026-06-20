import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  fetchActiveCodegenJob,
  fetchPreviewHtml,
  followCodegenJob,
  startAuditJob,
  startEditJob,
  startGenerateJob,
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

const cursorStorageKey = (projectId: string, jobId: string): string =>
  `wp-codegen-cursor-${projectId}-${jobId}`;

const readEventCursor = (projectId: string, jobId: string): number => {
  if (typeof sessionStorage === "undefined") return 0;
  const raw = sessionStorage.getItem(cursorStorageKey(projectId, jobId));
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isNaN(n) ? 0 : n;
};

const writeEventCursor = (
  projectId: string,
  jobId: string,
  after: number,
): void => {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(cursorStorageKey(projectId, jobId), String(after));
};

const clearEventCursor = (projectId: string, jobId: string): void => {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(cursorStorageKey(projectId, jobId));
};

export const useCodegenStream = (projectId: string) => {
  const queryClient = useQueryClient();
  const [isBusy, setIsBusy] = useState(false);
  const auditFlowRef = useRef(false);
  const pollLockRef = useRef(false);
  const resumeCheckedRef = useRef(false);
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

  const syncFilesFromServer = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ["project-files", projectId],
    });
  }, [queryClient, projectId]);

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
          await syncFilesFromServer();
          const streamed =
            useStudioStore.getState().streamingPaths[event.path] ??
            useStudioStore.getState().files.find((f) => f.path === event.path)
              ?.content ??
            "";
          if (streamed) upsertFile(event.path, streamed);
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
          await syncFilesFromServer();
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
      refreshPreview,
      resetStreaming,
      setPhase,
      setPlan,
      setProgress,
      setStatusMessage,
      syncFilesFromServer,
      upsertFile,
    ],
  );

  const runJobFollow = useCallback(
    async (jobId: string, options?: { editInstruction?: string }) => {
      if (pollLockRef.current) return;
      pollLockRef.current = true;
      setIsBusy(true);

      const initialAfter = readEventCursor(projectId, jobId);
      let doneMeta: {
        review_score?: number;
        client_ready?: boolean;
      } = {};

      try {
        await followCodegenJob(
          projectId,
          jobId,
          async (event) => {
            if (event.type === "done") {
              doneMeta = {
                review_score: event.review_score,
                client_ready: event.client_ready,
              };
            }
            await handleEvent(event);
          },
          {
            initialAfter,
            onAfter: (cursor) => writeEventCursor(projectId, jobId, cursor),
          },
        );

        if (options?.editInstruction) {
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
        }

        clearEventCursor(projectId, jobId);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erreur de génération";
        setPhase("error");
        setStatusMessage(msg);
        toast.error(msg);
      } finally {
        pollLockRef.current = false;
        setIsBusy(false);
      }
    },
    [projectId, handleEvent, addChatMessage, setPhase, setStatusMessage],
  );

  const generate = useCallback(async () => {
    setProgress(5, [], [...GENERATION_TASKS]);
    try {
      const { job_id } = await startGenerateJob(projectId);
      await runJobFollow(job_id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur de génération";
      setPhase("error");
      setStatusMessage(msg);
      toast.error(msg);
    }
  }, [projectId, runJobFollow, setPhase, setProgress, setStatusMessage]);

  const edit = useCallback(
    async (instruction: string) => {
      addChatMessage("user", instruction);
      setPhase("editing");
      setStatusMessage("Modification en cours…");
      setProgress(20, ["Analyse de la demande"], [
        "Application des modifications",
        "Finalisation",
      ]);
      resetStreaming();

      try {
        const { job_id } = await startEditJob(projectId, instruction);
        await runJobFollow(job_id, { editInstruction: instruction });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erreur d'édition";
        setPhase("error");
        setStatusMessage(msg);
        addChatMessage("assistant", msg);
        toast.error(msg);
      }
    },
    [
      projectId,
      runJobFollow,
      addChatMessage,
      setPhase,
      setProgress,
      setStatusMessage,
      resetStreaming,
    ],
  );

  const auditQuality = useCallback(async () => {
    auditFlowRef.current = true;
    setPhase("generating");
    setStatusMessage("Audit qualité en cours…");
    setProgress(5, [], [...AUDIT_TASKS]);
    resetStreaming();

    try {
      const { job_id } = await startAuditJob(projectId);
      await runJobFollow(job_id);
    } catch (err) {
      auditFlowRef.current = false;
      const msg = err instanceof Error ? err.message : "Erreur d'audit qualité";
      setPhase("error");
      setStatusMessage(msg);
      toast.error(msg);
    }
  }, [
    projectId,
    runJobFollow,
    setPhase,
    setProgress,
    setStatusMessage,
    resetStreaming,
  ]);

  useEffect(() => {
    if (resumeCheckedRef.current || !projectId) return;
    resumeCheckedRef.current = true;

    void (async () => {
      try {
        const { job } = await fetchActiveCodegenJob(projectId);
        if (
          !job ||
          (job.status !== "queued" && job.status !== "running")
        ) {
          return;
        }

        if (job.type === "audit") auditFlowRef.current = true;

        const progressMsg =
          typeof job.progress.status_message === "string"
            ? job.progress.status_message
            : "Génération en cours (reprise)…";
        setStatusMessage(progressMsg);
        setPhase(job.type === "edit" ? "editing" : "generating");

        toast.success("Génération en cours — reprise automatique");

        await runJobFollow(job.id);
      } catch {
        // pas de job actif ou API indisponible
      }
    })();
  }, [projectId, runJobFollow, setPhase, setStatusMessage]);

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
