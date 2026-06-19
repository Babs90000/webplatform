"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./OnboardingWizard.module.css";
import { OnboardingShell } from "../OnboardingShell";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { LoadingProgress } from "@/shared/components/LoadingProgress";
import {
  isQuestionAnswerValid,
  isOtherSelected,
  otherFieldKey,
  resolveAnswersForSubmit,
  withOtherOption,
} from "../../lib/questionOther";
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
import { isStudioEnabled } from "@/lib/features";
import {
  getProjectStudioGeneratePath,
  getProjectStudioPath,
} from "@/lib/projectRoutes";

const WELCOME_STEPS = [
  { num: "1", title: "Brief express", desc: "Quelques questions sur votre activité et vos objectifs." },
  { num: "2", title: "Approfondissement IA", desc: `${AI_ASSISTANT_NAME} affine le brief si nécessaire.` },
  { num: "3", title: "Studio", desc: "Génération HTML/CSS/JS et aperçu live en quelques minutes." },
] as const;

export const OnboardingWizard: React.FC = () => {
  const router = useRouter();

  const [phase, setPhase] = useState<
    "welcome" | "base" | "thinking" | "dynamic" | "generating"
  >("welcome");
  const [sessionId, setSessionId] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [baseQuestions, setBaseQuestions] = useState<OnboardingQuestion[]>([]);
  const [dynamicQuestions, setDynamicQuestions] = useState<OnboardingQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [fakeStatusIndex, setFakeStatusIndex] = useState<number>(0);
  const [startError, setStartError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  const startOnboarding = useStartOnboarding();
  const submitBase = useSubmitBaseAnswers();
  const submitDynamic = useSubmitDynamicAnswers();
  const generateSite = useGenerateSite();

  const statusMessages = isStudioEnabled()
    ? [
        "Enregistrement de votre brief...",
        "Analyse de vos objectifs...",
        "Préparation de l'architecte IA...",
        "Planification de l'architecture du site...",
        "Configuration du Studio...",
        "Lancement de la génération de code...",
        "Préparation des fichiers HTML/CSS/JS...",
        "Redirection vers votre espace de travail...",
      ]
    : [
        "Analyse de vos réponses et du brief...",
        "Planification des pages optimales...",
        "Création de la structure et du menu...",
        "Génération du bloc de navigation principal...",
        "Conception du Hero banner principal avec l'IA...",
        "Ajout des sections services et témoignages...",
        "Ajustement du design et des harmonies de couleurs...",
        "Finalisation de votre espace de travail...",
      ];

  const generationSteps = isStudioEnabled()
    ? [
        "Analyse de vos réponses",
        "Architecture & design system",
        "Génération du code",
        "Ouverture du Studio",
      ]
    : [
        "Analyse de vos réponses et objectifs",
        "Création de l'architecture du site",
        "Rédaction du contenu percutant",
        "Application du design premium",
      ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phase === "generating") {
      interval = setInterval(() => {
        setFakeStatusIndex((prev) => (prev >= 8 ? 8 : prev + 1));
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
      if (isStudioEnabled()) {
        toast.success(`Projet prêt — décrivez votre site à ${AI_ASSISTANT_NAME}`);
        router.push(getProjectStudioPath(res.project_id));
        return;
      }
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
        err instanceof ApiError ? err.message : "Impossible de créer le projet. Réessayez.";
      setStartError(message);
      console.error(err);
    }
  };

  const currentQuestionsList = phase === "base" ? baseQuestions : dynamicQuestions;
  const currentQuestion = currentQuestionsList[currentStep];
  const displayQuestion = currentQuestion
    ? withOtherOption(currentQuestion)
    : undefined;

  const isCurrentStepValid = (): boolean => {
    if (!displayQuestion) return false;
    return isQuestionAnswerValid(displayQuestion, answers);
  };

  const handleValueChange = (val: unknown) => {
    if (!displayQuestion) return;
    setAnswers((prev) => ({ ...prev, [displayQuestion.id]: val }));
  };

  const renderOtherInput = () => {
    if (!displayQuestion || !isOtherSelected(displayQuestion, answers)) {
      return null;
    }
    return (
      <Input
        type="text"
        value={String(answers[otherFieldKey(displayQuestion.id)] ?? "")}
        onChange={(e) =>
          setAnswers((prev) => ({
            ...prev,
            [otherFieldKey(displayQuestion.id)]: e.target.value,
          }))
        }
        placeholder="Précisez votre réponse…"
      />
    );
  };

  const handleNext = async () => {
    setStepError(null);
    if (!isCurrentStepValid()) {
      toast.error("Veuillez répondre à cette question obligatoire.");
      return;
    }

    if (currentStep < currentQuestionsList.length - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    if (phase === "base") {
      try {
        setPhase("thinking");
        const resolvedBase = resolveAnswersForSubmit(
          answers,
          baseQuestions.map(withOtherOption),
        );
        const res = await submitBase.mutateAsync({ sessionId, answers: resolvedBase });

        if (res.dynamic_questions && res.dynamic_questions.length > 0) {
          setDynamicQuestions(res.dynamic_questions);
          setCurrentStep(0);
          setPhase("dynamic");
        } else {
          void handleFinalize(answers);
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
      void handleFinalize(answers);
    }
  };

  const handleFinalize = async (allAnswers: Record<string, unknown>) => {
    try {
      setPhase("generating");
      const dynamicPayload: Record<string, unknown> = {};
      const resolved = resolveAnswersForSubmit(
        allAnswers,
        dynamicQuestions.map(withOtherOption),
      );

      dynamicQuestions.forEach((q) => {
        if (resolved[q.id] !== undefined) {
          dynamicPayload[q.id] = resolved[q.id];
        }
      });

      await submitDynamic.mutateAsync({ sessionId, answers: dynamicPayload });

      if (isStudioEnabled()) {
        toast.success(`Brief enregistré — ${AI_ASSISTANT_NAME} génère votre site`);
        router.push(getProjectStudioGeneratePath(projectId));
        return;
      }

      const result = await generateSite.mutateAsync({ sessionId, projectId });
      const blocksCreated = result.blocks_created ?? 0;
      if (blocksCreated > 0) {
        toast.success("Site internet généré avec succès !");
        router.push(`/projects/${projectId}/editor`);
      } else {
        toast.success(`Pages créées — terminez votre site avec ${AI_ASSISTANT_NAME}`);
        router.push(`/projects/${projectId}/editor?hermes=1`);
      }
    } catch (err) {
      setPhase(dynamicQuestions.length > 0 ? "dynamic" : "base");
      console.error(err);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else if (phase === "dynamic") {
      setPhase("base");
      setCurrentStep(baseQuestions.length - 1);
    }
  };

  const renderQuestionInput = () => {
    if (!displayQuestion) return null;

    switch (displayQuestion.type) {
      case "choice":
        return (
          <>
            <div className={styles.choiceGrid}>
              {displayQuestion.options?.map((opt) => {
                const active = answers[displayQuestion.id] === opt.value;
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
            <div className={styles.otherInputWrap}>{renderOtherInput()}</div>
          </>
        );

      case "multiselect":
        return (
          <>
            <div className={styles.chipsContainer}>
              {displayQuestion.options?.map((opt) => {
                const currentVal = (answers[displayQuestion.id] as string[]) || [];
                const active = currentVal.includes(opt.value);
                const toggleOption = () => {
                  if (active) {
                    handleValueChange(currentVal.filter((v) => v !== opt.value));
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
            <div className={styles.otherInputWrap}>{renderOtherInput()}</div>
          </>
        );

      case "textarea":
        return (
          <textarea
            className={styles.textarea}
            value={(answers[displayQuestion.id] as string) || ""}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={displayQuestion.placeholder || "Saisissez votre réponse ici..."}
            maxLength={displayQuestion.max_length}
          />
        );

      case "scale":
        return (
          <div className={styles.scaleContainer}>
            {[1, 2, 3, 4, 5].map((val) => {
              const active = answers[displayQuestion.id] === val;
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
              displayQuestion.type === "url"
                ? "url"
                : displayQuestion.type === "color"
                  ? "color"
                  : "text"
            }
            value={(answers[displayQuestion.id] as string) || ""}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={displayQuestion.placeholder || "Réponse..."}
          />
        );
    }
  };

  const phaseBadge =
    phase === "base"
      ? "Étape 1 · Brief"
      : phase === "dynamic"
        ? "Étape 2 · Approfondissement"
        : undefined;

  if (phase === "welcome") {
    return (
      <OnboardingShell badge="Nouveau projet">
        <div className={styles.welcomeLayout}>
          <aside className={styles.welcomeAside}>
            <div className={styles.welcomeEyebrow}>
              <span className={styles.welcomeEyebrowDot} />
              Assistant {AI_ASSISTANT_NAME}
            </div>
            <h1 className={styles.welcomeHeading}>
              Construisons
              <span className={styles.welcomeAccent}> votre site idéal</span>
            </h1>
            <p className={styles.welcomeLead}>
              Un parcours guidé en quelques minutes — de vos réponses à un site
              généré en code libre, prêt à personnaliser dans le Studio.
            </p>
            <ol className={styles.welcomeSteps}>
              {WELCOME_STEPS.map((step) => (
                <li key={step.num} className={styles.welcomeStep}>
                  <span className={styles.welcomeStepNum}>{step.num}</span>
                  <p className={styles.welcomeStepText}>
                    <strong>{step.title}</strong>
                    {step.desc}
                  </p>
                </li>
              ))}
            </ol>
          </aside>

          <div className={styles.wizardCard}>
            <div className={styles.welcomeCard}>
              <div className={styles.welcomeIconWrap}>✨</div>
              <h2 className={styles.title}>Prêt à commencer ?</h2>
              <p className={styles.subtitleSpaced}>
                {AI_ASSISTANT_NAME} vous pose quelques questions pour créer un
                site sur mesure, adapté à votre activité.
              </p>
              {startError && (
                <div className={styles.errorBanner} role="alert">
                  <strong>Erreur</strong>
                  <p>{startError}</p>
                </div>
              )}
              <Button onClick={handleStart} isLoading={startOnboarding.isPending} fullWidth>
                C&apos;est parti !
              </Button>
              <button
                type="button"
                className={styles.skipLink}
                onClick={handleSkipToHermes}
                disabled={startOnboarding.isPending}
              >
                Ignorer le brief — ouvrir le Studio directement →
              </button>
            </div>
          </div>
        </div>
      </OnboardingShell>
    );
  }

  if (phase === "thinking") {
    return (
      <OnboardingShell badge="Analyse en cours">
        <div className={styles.thinkingCard}>
          <LoadingProgress
            percent={35}
            message={`${AI_ASSISTANT_NAME} analyse vos objectifs…`}
            completedSteps={["Réponses enregistrées"]}
            remainingSteps={[
              "Questions personnalisées",
              "Préparation du brief",
            ]}
          />
          <h2 className={styles.thinkingTitle}>Réponses enregistrées</h2>
          <p className={styles.thinkingSubtitle}>
            {AI_ASSISTANT_NAME} analyse vos objectifs pour préparer des questions
            d&apos;approfondissement sur mesure…
          </p>
        </div>
      </OnboardingShell>
    );
  }

  if (phase === "generating") {
    const generatingPercent = Math.min(
      95,
      Math.round((fakeStatusIndex / Math.max(statusMessages.length - 1, 1)) * 100),
    );
    const completedGenSteps = generationSteps.filter(
      (_, idx) => fakeStatusIndex >= (idx + 1) * 2,
    );
    const remainingGenSteps = generationSteps.filter(
      (_, idx) => fakeStatusIndex < (idx + 1) * 2,
    );

    return (
      <OnboardingShell showBack={false}>
        <div className={styles.overlay}>
          <div className={styles.overlayGlow} aria-hidden />
          <div className={styles.overlayContent}>
            <LoadingProgress
              percent={generatingPercent}
              message={statusMessages[fakeStatusIndex]}
              completedSteps={completedGenSteps}
              remainingSteps={remainingGenSteps}
            />
            <div className={styles.aiStatus}>
              <h2 className={styles.aiTitle}>
                {isStudioEnabled() ? "Préparation de votre Studio" : "Création de votre site"}
              </h2>
            </div>
          </div>
        </div>
      </OnboardingShell>
    );
  }

  const totalQuestions = currentQuestionsList.length;
  const progressPercent = ((currentStep + 1) / totalQuestions) * 100;
  const backDisabled = currentStep === 0 && phase === "base";

  return (
    <OnboardingShell badge={phaseBadge}>
      <div className={`${styles.wizardCard} ${styles.wizardCardWide}`}>
        <div className={styles.header}>
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar} style={{ width: `${progressPercent}%` }} />
          </div>
          <span className={styles.stepNumber}>
            {currentStep + 1} / {totalQuestions}
          </span>
        </div>

        <div className={styles.titleArea}>
          {phase === "dynamic" && (
            <span className={styles.phaseTag}>Question personnalisée</span>
          )}
          <h2 className={styles.title}>{displayQuestion?.question}</h2>
          {displayQuestion?.subtitle && (
            <p className={styles.subtitle}>{displayQuestion.subtitle}</p>
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
            disabled={backDisabled}
            className={`${styles.navBtn} ${backDisabled ? styles.navBtnDisabled : ""}`}
          >
            <svg className={styles.navBtnIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                : "Créer mon site"
              : "Suivant"}
            {currentStep < totalQuestions - 1 && (
              <svg className={styles.btnIconRight} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
};
