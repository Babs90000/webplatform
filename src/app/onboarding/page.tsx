import { Metadata } from "next";
import { AuthGuard } from "@/shared/components/AuthGuard";
import { OnboardingWizard } from "@/features/onboarding/components/OnboardingWizard/OnboardingWizard";

export const metadata: Metadata = {
  title: "Onboarding Wizard | WebPlatform",
  description: "Configure your new project and let Hermes generate a beautiful, custom layout for you.",
};

const OnboardingPage: React.FC = () => {
  return (
    <AuthGuard>
      <OnboardingWizard />
    </AuthGuard>
  );
};

export default OnboardingPage;
