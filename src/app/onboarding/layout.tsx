import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding Wizard | WebPlatform",
  description:
    "Configure your new project and let Koala Codeur generate a beautiful, custom layout for you.",
};

const OnboardingLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return children;
};

export default OnboardingLayout;
