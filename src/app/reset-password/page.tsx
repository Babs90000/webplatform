import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayout } from "@/shared/components/AuthLayout";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { LoadingScreen } from "@/shared/components/LoadingScreen";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe | WebPlatform",
  description: "Choisissez un nouveau mot de passe pour votre compte WebPlatform.",
};

const ResetPasswordPage: React.FC = () => {
  return (
    <AuthLayout
      title="Nouveau mot de passe"
      subtitle="Choisissez un mot de passe sécurisé pour votre compte"
    >
      <Suspense
        fallback={
          <LoadingScreen
            message="Chargement…"
            showBrand={false}
          />
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
