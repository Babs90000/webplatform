"use client";

import { AuthGuard } from "@/shared/components/AuthGuard";
import { ClientOnly } from "@/shared/components/ClientOnly";
import { Spinner } from "@/shared/components/Spinner";
import { OnboardingWizard } from "@/features/onboarding/components/OnboardingWizard/OnboardingWizard";
import styles from "@/app/Home.module.css";

const loadingFallback = (
  <div className={styles.loading}>
    <Spinner size="lg" />
  </div>
);

const OnboardingPage: React.FC = () => (
  <ClientOnly fallback={loadingFallback}>
    <AuthGuard fallback={loadingFallback}>
      <OnboardingWizard />
    </AuthGuard>
  </ClientOnly>
);

export default OnboardingPage;
