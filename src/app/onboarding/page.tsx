"use client";

import { AuthGuard } from "@/shared/components/AuthGuard";
import { ClientOnly } from "@/shared/components/ClientOnly";
import { Spinner } from "@/shared/components/Spinner";
import { OnboardingWizard } from "@/features/onboarding/components/OnboardingWizard/OnboardingWizard";

const loadingFallback = (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
    }}
  >
    <Spinner size="lg" />
  </div>
);

const OnboardingPage: React.FC = () => {
  return (
    <ClientOnly fallback={loadingFallback}>
      <AuthGuard fallback={loadingFallback}>
        <OnboardingWizard />
      </AuthGuard>
    </ClientOnly>
  );
};

export default OnboardingPage;
