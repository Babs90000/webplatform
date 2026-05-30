import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export interface OnboardingQuestionOption {
  value: string;
  label: string;
  emoji?: string;
  description?: string;
}

export interface OnboardingQuestion {
  id: string;
  question: string;
  subtitle?: string;
  type:
    | "text"
    | "textarea"
    | "choice"
    | "multiselect"
    | "boolean"
    | "scale"
    | "url"
    | "color"
    | "freetext";
  options?: OnboardingQuestionOption[];
  placeholder?: string;
  required: boolean;
  max_length?: number;
  depends_on?: {
    question_id: string;
    value: string | string[];
  };
}

export interface OnboardingStartResponse {
  session_id: string;
  project_id: string;
  questions: OnboardingQuestion[];
}

export interface BaseAnswersResponse {
  dynamic_questions: OnboardingQuestion[];
  session_id: string;
}

export interface DynamicAnswersResponse {
  brief: string;
  session_id: string;
  project_id: string;
}

export interface GenerateResponse {
  pages: Array<{
    slug: string;
    title: string;
    order_index: number;
    suggested_blocks: any[];
  }>;
  suggested_blocks_per_page: Record<string, any[]>;
  project_id: string;
}

export interface OnboardingSessionState {
  session_id: string;
  project_id: string | null;
  status: "in_progress" | "completed";
  base_answers: Record<string, any>;
  dynamic_questions: OnboardingQuestion[];
  dynamic_answers: Record<string, any>;
  structured_brief: string | null;
  remaining_base_questions: string[];
  remaining_dynamic_questions: string[];
}

const getToken = () => useAuthStore.getState().token || undefined;

export const onboardingApi = {
  start: (projectId?: string): Promise<OnboardingStartResponse> => {
    return api.post<OnboardingStartResponse>(
      "/onboarding/start",
      { project_id: projectId },
      getToken(),
    );
  },

  submitBaseAnswers: (
    sessionId: string,
    answers: Record<string, any>,
  ): Promise<BaseAnswersResponse> => {
    return api.post<BaseAnswersResponse>(
      `/onboarding/${sessionId}/base-answers`,
      { answers },
      getToken(),
    );
  },

  submitDynamicAnswers: (
    sessionId: string,
    answers: Record<string, any>,
  ): Promise<DynamicAnswersResponse> => {
    return api.post<DynamicAnswersResponse>(
      `/onboarding/${sessionId}/dynamic-answers`,
      { answers },
      getToken(),
    );
  },

  generateSite: (
    sessionId: string,
    projectId: string,
  ): Promise<GenerateResponse> => {
    return api.post<GenerateResponse>(
      `/onboarding/${sessionId}/generate`,
      { project_id: projectId },
      getToken(),
    );
  },

  getSession: (sessionId: string): Promise<OnboardingSessionState> => {
    return api.get<OnboardingSessionState>(
      `/onboarding/${sessionId}`,
      getToken(),
    );
  },
};
