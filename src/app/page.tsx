"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { LoadingScreen } from "@/shared/components/LoadingScreen";
import { LandingPage } from "@/features/marketing/components/LandingPage";

const HomePage: React.FC = () => {
  const router = useRouter();
  const { token, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (token) {
      router.replace("/dashboard");
    }
  }, [token, isHydrated, router]);

  if (!isHydrated) {
    return <LoadingScreen message="Initialisation…" />;
  }

  if (token) {
    return <LoadingScreen message="Redirection vers le tableau de bord…" />;
  }

  return <LandingPage />;
};

export default HomePage;
