import { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayout } from "@/shared/components/AuthLayout";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account | WebPlatform",
  description: "Create a new WebPlatform account.",
};

const RegisterPage: React.FC = () => {
  return (
    <AuthLayout
      title="Create an account"
      subtitle="Start building beautiful websites today"
    >
      <Suspense fallback={<div style={{ textAlign: "center", padding: "1rem" }}>Chargement...</div>}>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
};

export default RegisterPage;
