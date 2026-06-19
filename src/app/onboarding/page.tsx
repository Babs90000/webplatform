"use client";

import { AuthGuard } from "@/shared/components/AuthGuard";
import { ClientOnly } from "@/shared/components/ClientOnly";
import { LoadingScreen } from "@/shared/components/LoadingScreen";
import { OnboardingWizard } from "@/features/onboarding/components/OnboardingWizard/OnboardingWizard";

const loadingFallback = <LoadingScreen message="Chargement de l'onboarding…" />;

const OnboardingPage: React.FC = () => (
  <ClientOnly fallback={loadingFallback}>
    <AuthGuard fallback={loadingFallback}>
      <OnboardingWizard />
    </AuthGuard>
  </ClientOnly>
);

export default OnboardingPage;
