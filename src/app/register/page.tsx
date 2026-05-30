import { Metadata } from "next";
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
      <RegisterForm />
    </AuthLayout>
  );
};

export default RegisterPage;
