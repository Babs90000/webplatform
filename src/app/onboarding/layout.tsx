import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un projet | WebPlatform",
  description:
    "Brief guidé par Koala Codeur — de vos réponses à un site généré en code libre.",
};

const OnboardingLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => children;

export default OnboardingLayout;
