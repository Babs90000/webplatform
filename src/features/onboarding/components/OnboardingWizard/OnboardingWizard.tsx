"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./OnboardingWizard.module.css";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Spinner } from "@/shared/components/Spinner";
import { toast } from "@/store/toast";
import { ApiError } from "@/lib/api";
import { AI_ASSISTANT_NAME } from "@/lib/branding";
import {
  useStartOnboarding,
  useSubmitBaseAnswers,
  useSubmitDynamicAnswers,
  useGenerateSite,
} from "../../hooks/useOnboarding";
import type { OnboardingQuestion } from "../../services/onboardingApi";

export const OnboardingWizard: React.FC = () => {
  const router = useRouter();

  // Wizard States
  const [phase, setPhase] = useState<
    "welcome" | "base" | "thinking" | "dynamic" | "generating"
  >("welcome");
  const [sessionId, setSessionId] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [baseQuestions, setBaseQuestions] = useState<OnboardingQuestion[]>([]);
  const [dynamicQuestions, setDynamicQuestions] = useState<OnboardingQuestion[]>(
    [],
  );
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [fakeStatusIndex, setFakeStatusIndex] = useState<number>(0);
  const [startError, setStartError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  // TanStack Query Mutations
  const startOnboarding = useStartOnboarding();
  const submitBase = useSubmitBaseAnswers();
  const submitDynamic = useSubmitDynamicAnswers();
  const generateSite = useGenerateSite();

  // Simulated status messages for the generation overlay
  const statusMessages = [
    "Analyse de vos réponses et du brief...",
    "Planification des pages optimales...",
    "Création de la structure et du menu...",
    "Génération du bloc de navigation principal...",
    "Conception du Hero banner principal avec l'IA...",
    "Ajout des sections services et témoignages...",
    "Ajustement du design et des harmonies de couleurs...",
    "Finalisation de votre espace de travail...",
  ];

  // Effect to rotate simulated status messages in generate overlay
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phase === "generating") {
      interval = setInterval(() => {
        setFakeStatusIndex((prev) => {
          // Si on a atteint la dernière étape (4 étapes * 2 = 8), on reste dessus
          if (prev >= 8) return 8;
          return prev + 1;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  const handleStart = async () => {
    setStartError(null);
    try {
      const res = await startOnboarding.mutateAsync(undefined);
      setSessionId(res.session_id);
      setProjectId(res.project_id);
      setBaseQuestions(res.questions);
      setAnswers({});
      setCurrentStep(0);
      setPhase("base");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 401
            ? "Session expirée — reconnectez-vous pour continuer."
            : err.message
          : "Impossible de démarrer l'assistant. Réessayez.";
      setStartError(message);
      console.error(err);
    }
  };

  const handleSkipToHermes = async () => {
    setStartError(null);
    try {
      const res = await startOnboarding.mutateAsync(undefined);
      const { pagesApi } = await import("@/features/pages/services/pagesApi");
      await pagesApi.create(res.project_id, {
        title: "Accueil",
        slug: "accueil",
        order_index: 0,
      });
      toast.success(`Projet prêt — décrivez votre site à ${AI_ASSISTANT_NAME}`);
      router.push(`/projects/${res.project_id}/editor?hermes=1`);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Impossible de créer le projet. Réessayez.";
      setStartError(message);
      console.error(err);
    }
  };

  const currentQuestionsList =
    phase === "base" ? baseQuestions : dynamicQuestions;
  const currentQuestion = currentQuestionsList[currentStep];

  // Helper to check if the current question is answered validly
  const isCurrentStepValid = () => {
    if (!currentQuestion) return false;
    if (!currentQuestion.required) return true;

    const val = answers[currentQuestion.id];
    if (val === undefined || val === null || val === "") return false;
    if (currentQuestion.type === "multiselect" && Array.isArray(val)) {
      return val.length > 0;
    }
    return true;
  };

  const handleValueChange = (val: any) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: val,
    }));
  };

  const handleNext = async () => {
    setStepError(null);
    if (!isCurrentStepValid()) {
      toast.error("Veuillez répondre à cette question obligatoire.");
      return;
    }

    if (currentStep < currentQuestionsList.length - 1) {
      // Advance to next question in this phase
      setCurrentStep((prev) => prev + 1);
    } else {
      // Current phase completed
      if (phase === "base") {
        try {
          setPhase("thinking");
          const res = await submitBase.mutateAsync({
            sessionId,
            answers,
          });

          if (res.dynamic_questions && res.dynamic_questions.length > 0) {
            setDynamicQuestions(res.dynamic_questions);
            setCurrentStep(0);
            setPhase("dynamic");
          } else {
            // No dynamic questions, go straight to generating
            handleFinalize(answers);
          }
        } catch (err) {
          setPhase("base");
          const message =
            err instanceof ApiError
              ? err.message
              : "Impossible d'enregistrer vos réponses. Réessayez.";
          setStepError(message);
          toast.error(message);
          console.error(err);
        }
      } else if (phase === "dynamic") {
        handleFinalize(answers);
      }
    }
  };

  const handleFinalize = async (allAnswers: Record<string, any>) => {
    try {
      setPhase("generating");
      // Separate base and dynamic answers
      const basePayload: Record<string, any> = {};
      const dynamicPayload: Record<string, any> = {};

      baseQuestions.forEach((q) => {
        if (allAnswers[q.id] !== undefined) {
          basePayload[q.id] = allAnswers[q.id];
        }
      });

      dynamicQuestions.forEach((q) => {
        if (allAnswers[q.id] !== undefined) {
          dynamicPayload[q.id] = allAnswers[q.id];
        }
      });

      // Submit dynamic answers to finish onboarding session
      await submitDynamic.mutateAsync({
        sessionId,
        answers: dynamicPayload,
      });

      // Trigger the AI site generation (pages + real blocks)
      const result = await generateSite.mutateAsync({
        sessionId,
        projectId,
      });

      const blocksCreated = result.blocks_created ?? 0;
      if (blocksCreated > 0) {
        toast.success("Site internet généré avec succès !");
        router.push(`/projects/${projectId}/editor`);
      } else {
        // Aucun bloc généré (modèle indisponible ou backend non à jour) :
        // on ouvre directement le chat pour que l'utilisateur construise avec l'IA.
        toast.success(
          `Pages créées — terminez votre site avec ${AI_ASSISTANT_NAME}`,
        );
        router.push(`/projects/${projectId}/editor?hermes=1`);
      }
    } catch (err) {
      // Revert to current step if failed
      setPhase(dynamicQuestions.length > 0 ? "dynamic" : "base");
      console.error(err);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else if (phase === "dynamic") {
      // Allow going back to base answers
      setPhase("base");
      setCurrentStep(baseQuestions.length - 1);
    }
  };

  // Render question inputs based on type
  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case "choice":
        return (
          <div className={styles.choiceGrid}>
            {currentQuestion.options?.map((opt) => {
              const active = answers[currentQuestion.id] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`${styles.choiceCard} ${active ? styles.choiceCardActive : ""}`}
                  onClick={() => handleValueChange(opt.value)}
                >
                  {opt.emoji && <span className={styles.emoji}>{opt.emoji}</span>}
                  <span className={styles.choiceLabel}>{opt.label}</span>
                  {opt.description && (
                    <span className={styles.choiceDesc}>{opt.description}</span>
                  )}
                </button>
              );
            })}
          </div>
        );

      case "multiselect":
        return (
          <div className={styles.chipsContainer}>
            {currentQuestion.options?.map((opt) => {
              const currentVal = answers[currentQuestion.id] || [];
              const active = currentVal.includes(opt.value);
              const toggleOption = () => {
                if (active) {
                  handleValueChange(currentVal.filter((v: string) => v !== opt.value));
                } else {
                  handleValueChange([...currentVal, opt.value]);
                }
              };
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                  onClick={toggleOption}
                >
                  {opt.emoji && <span>{opt.emoji}</span>}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        );

      case "textarea":
        return (
          <textarea
            className={styles.textarea}
            value={answers[currentQuestion.id] || ""}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={currentQuestion.placeholder || "Saisissez votre réponse ici..."}
            maxLength={currentQuestion.max_length}
          />
        );

      case "scale":
        return (
          <div className={styles.scaleContainer}>
            {[1, 2, 3, 4, 5].map((val) => {
              const active = answers[currentQuestion.id] === val;
              return (
                <button
                  key={val}
                  type="button"
                  className={`${styles.scaleButton} ${active ? styles.scaleButtonActive : ""}`}
                  onClick={() => handleValueChange(val)}
                >
                  {val}
                </button>
              );
            })}
          </div>
        );

      case "text":
      case "url":
      case "color":
      default:
        return (
          <Input
            type={
              currentQuestion.type === "url"
                ? "url"
                : currentQuestion.type === "color"
                  ? "color"
                  : "text"
            }
            value={answers[currentQuestion.id] || ""}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={currentQuestion.placeholder || "Réponse..."}
          />
        );
    }
  };

  if (phase === "welcome") {
    return (
      <div className={styles.container}>
        <div className={styles.wizardCard}>
          <div className={styles.welcomeCard}>
            <span className={styles.welcomeIcon}>✨</span>
            <h1 className={styles.title}>Créons votre site internet idéal</h1>
            <p className={styles.subtitle} style={{ marginBottom: "var(--space-2xl)" }}>
              Notre IA {AI_ASSISTANT_NAME} va vous guider à travers quelques questions simples pour
              concevoir un site ultra-performant et personnalisé pour votre activité.
            </p>
            {startError && (
              <div className={styles.errorBanner} role="alert">
                <strong>Erreur</strong>
                <p>{startError}</p>
              </div>
            )}
            <Button
              onClick={handleStart}
              isLoading={startOnboarding.isPending}
              fullWidth
            >
              C&apos;est parti !
            </Button>
            <button
              type="button"
              className={styles.skipLink}
              onClick={handleSkipToHermes}
              disabled={startOnboarding.isPending}
            >
              Ignorer et construire avec l&apos;IA →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "thinking") {
    return (
      <div className={styles.container}>
        <div className={styles.wizardCard} style={{ alignItems: "center", padding: "var(--space-3xl)" }}>
          <Spinner size="lg" />
          <h2 className={styles.title} style={{ marginTop: "var(--space-xl)", textAlign: "center" }}>
            Réponses enregistrées !
          </h2>
          <p className={styles.subtitle} style={{ textAlign: "center", maxWidth: "400px" }}>
            {AI_ASSISTANT_NAME} est en train d'analyser vos objectifs pour générer des questions d'approfondissement sur mesure...
          </p>
        </div>
      </div>
    );
  }

  if (phase === "generating") {
    return (
      <div className={styles.overlay}>
        <div className={styles.overlayGlow} />
        <div className={styles.overlayContent}>
          <Spinner size="lg" />
          <div className={styles.aiStatus}>
            <h2 className={styles.aiTitle}>Création de votre site web</h2>
            <p className={styles.aiSub}>{statusMessages[fakeStatusIndex]}</p>
          </div>
          <div className={styles.generationSteps}>
            {[
              "Analyse de vos réponses et objectifs",
              "Création de l'architecture du site",
              "Rédaction du contenu percutant",
              "Application du design premium"
            ].map((step, idx) => {
              // 8 status messages total. Let's divide by 2 to map to 4 steps.
              const isCompleted = fakeStatusIndex >= (idx + 1) * 2;
              const isActive = !isCompleted && fakeStatusIndex >= idx * 2;
              
              return (
                <div key={idx} className={`${styles.generationStep} ${isCompleted ? styles.stepCompleted : isActive ? styles.stepActive : ""}`}>
                  <div className={styles.stepIcon}>
                    {isCompleted ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : isActive ? (
                      <div className={styles.stepSpinner} />
                    ) : (
                      <div className={styles.stepDot} />
                    )}
                  </div>
                  <span className={styles.stepText}>{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active question progress calculation
  const totalQuestions = currentQuestionsList.length;
  const progressPercent = ((currentStep + 1) / totalQuestions) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.wizardCard}>
        <div className={styles.header}>
          <div className={styles.progressBarContainer}>
            <div
              className={styles.progressBar}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className={styles.stepNumber}>
            {phase === "dynamic" ? "AI Follow-up: " : ""}
            {currentStep + 1} / {totalQuestions}
          </span>
        </div>

        <div className={styles.titleArea}>
          <h2 className={styles.title}>{currentQuestion?.question}</h2>
          {currentQuestion?.subtitle && (
            <p className={styles.subtitle}>{currentQuestion.subtitle}</p>
          )}
        </div>

        <div className={styles.questionBody}>
          {stepError && (
            <div className={styles.errorBanner} role="alert">
              <strong>Erreur</strong>
              <p>{stepError}</p>
            </div>
          )}
          {renderQuestionInput()}
        </div>

        <div className={styles.footerActions}>
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0 && phase === "base"}
            className={styles.navBtn}
            style={{
              background: "transparent",
              border: "none",
              color: currentStep === 0 && phase === "base" ? "var(--color-text-muted)" : "var(--color-text-secondary)",
              cursor: currentStep === 0 && phase === "base" ? "not-allowed" : "pointer",
              fontWeight: 500,
              fontSize: "0.95rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "var(--space-xs)" }}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Retour
          </button>

          <Button
            onClick={handleNext}
            disabled={!isCurrentStepValid()}
            isLoading={submitBase.isPending || submitDynamic.isPending || generateSite.isPending}
          >
            {currentStep === totalQuestions - 1
              ? phase === "base"
                ? "Continuer"
                : "Créer mon site web"
              : "Suivant"}
            {currentStep < totalQuestions - 1 && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginLeft: "var(--space-xs)", display: "inline-block", verticalAlign: "middle" }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
