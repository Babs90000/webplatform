import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { onboardingApi } from "../services/onboardingApi";
import { toast } from "@/store/toast";
import { ApiError } from "@/lib/api";

export const useOnboardingSession = (sessionId: string) => {
  return useQuery({
    queryKey: ["onboarding-session", sessionId],
    queryFn: () => onboardingApi.getSession(sessionId),
    enabled: !!sessionId,
  });
};

export const useStartOnboarding = () => {
  return useMutation({
    mutationFn: (projectId?: string) => onboardingApi.start(projectId),
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : "Failed to start onboarding";
      toast.error(message);
    },
  });
};

export const useSubmitBaseAnswers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      answers,
    }: {
      sessionId: string;
      answers: Record<string, any>;
    }) => onboardingApi.submitBaseAnswers(sessionId, answers),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["onboarding-session", variables.sessionId],
      });
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Failed to submit primary answers";
      toast.error(message);
    },
  });
};

export const useSubmitDynamicAnswers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      answers,
    }: {
      sessionId: string;
      answers: Record<string, any>;
    }) => onboardingApi.submitDynamicAnswers(sessionId, answers),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["onboarding-session", variables.sessionId],
      });
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Failed to submit dynamic answers";
      toast.error(message);
    },
  });
};

export const useGenerateSite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      projectId,
    }: {
      sessionId: string;
      projectId: string;
    }) => onboardingApi.generateSite(sessionId, projectId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : "Failed to generate website";
      toast.error(message);
    },
  });
};
