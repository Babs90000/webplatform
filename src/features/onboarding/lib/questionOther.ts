import type { OnboardingQuestion } from "../services/onboardingApi";

export const OTHER_OPTION_VALUE = "__other__";

export const OTHER_OPTION = {
  value: OTHER_OPTION_VALUE,
  label: "Autre",
  emoji: "✏️",
  description: "Précisez votre réponse",
} as const;

export const withOtherOption = (
  question: OnboardingQuestion,
): OnboardingQuestion => {
  if (question.type !== "choice" && question.type !== "multiselect") {
    return question;
  }
  const options = question.options ?? [];
  if (options.some((o) => o.value === OTHER_OPTION_VALUE)) {
    return question;
  }
  return { ...question, options: [...options, { ...OTHER_OPTION }] };
};

export const otherFieldKey = (questionId: string): string =>
  `${questionId}_other`;

export const isOtherSelected = (
  question: OnboardingQuestion,
  answers: Record<string, unknown>,
): boolean => {
  const val = answers[question.id];
  if (question.type === "choice") {
    return val === OTHER_OPTION_VALUE;
  }
  if (question.type === "multiselect" && Array.isArray(val)) {
    return val.includes(OTHER_OPTION_VALUE);
  }
  return false;
};

export const isQuestionAnswerValid = (
  question: OnboardingQuestion,
  answers: Record<string, unknown>,
): boolean => {
  if (!question.required) return true;
  const val = answers[question.id];
  if (val === undefined || val === null || val === "") return false;

  if (question.type === "multiselect") {
    if (!Array.isArray(val) || val.length === 0) return false;
    if (val.includes(OTHER_OPTION_VALUE)) {
      const otherText = String(answers[otherFieldKey(question.id)] ?? "").trim();
      return otherText.length > 0;
    }
    return true;
  }

  if (question.type === "choice" && val === OTHER_OPTION_VALUE) {
    return String(answers[otherFieldKey(question.id)] ?? "").trim().length > 0;
  }

  return true;
};

export const resolveAnswersForSubmit = (
  answers: Record<string, unknown>,
  questions: OnboardingQuestion[],
): Record<string, unknown> => {
  const result = { ...answers };

  for (const q of questions) {
    const otherKey = otherFieldKey(q.id);
    const otherText = String(result[otherKey] ?? "").trim();

    if (q.type === "choice" && result[q.id] === OTHER_OPTION_VALUE) {
      result[q.id] = otherText;
    }

    if (q.type === "multiselect" && Array.isArray(result[q.id])) {
      const values = result[q.id] as string[];
      if (values.includes(OTHER_OPTION_VALUE)) {
        const withoutOther = values.filter((v) => v !== OTHER_OPTION_VALUE);
        result[q.id] = otherText
          ? [...withoutOther, otherText]
          : withoutOther;
      }
    }

    delete result[otherKey];
  }

  return result;
};
