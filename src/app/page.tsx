"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Spinner } from "@/shared/components/Spinner";
import { LandingPage } from "@/features/marketing/components/LandingPage";
import styles from "./Home.module.css";

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
    return (
      <div className={styles.loading}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (token) {
    return (
      <div className={styles.loading}>
        <Spinner size="lg" />
      </div>
    );
  }

  return <LandingPage />;
};

export default HomePage;
