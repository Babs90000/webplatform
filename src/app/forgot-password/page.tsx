import type { Metadata } from "next";
import { AuthLayout } from "@/shared/components/AuthLayout";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Mot de passe oublié | WebPlatform",
  description: "Réinitialisez votre mot de passe WebPlatform.",
};

const ForgotPasswordPage: React.FC = () => {
  return (
    <AuthLayout
      title="Mot de passe oublié"
      subtitle="Entrez votre email pour recevoir un lien de réinitialisation"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
