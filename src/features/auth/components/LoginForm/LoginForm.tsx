"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import type { FieldErrors } from "react-hook-form";
import styles from "./LoginForm.module.css";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { Spinner } from "@/shared/components/Spinner";
import { ClientOnly } from "@/shared/components/ClientOnly";
import { useZodForm } from "@/shared/hooks/useZodForm";
import { useAuth } from "../../hooks/useAuth";
import { mapAuthError } from "../../utils/mapAuthError";
import { ApiError } from "@/lib/api";
import { toast } from "@/store/toast";

const loginSchema = z.object({
  email: z.string().min(1, "Email requis").email("Email invalide"),
  password: z
    .string()
    .min(1, "Mot de passe requis")
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginFormFields: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, isAuthenticated } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useZodForm({
    schema: loginSchema,
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (searchParams.get("reason") === "session") {
      setSessionNotice(
        "Votre session a expiré ou n'est plus valide. Reconnectez-vous pour continuer.",
      );
      toast.error("Session expirée — reconnectez-vous");
      router.replace("/login");
      return;
    }

    const hasCredentialsInUrl =
      searchParams.has("email") || searchParams.has("password");
    if (hasCredentialsInUrl) {
      router.replace("/login");
    }
  }, [router, searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    setSubmitError(null);

    try {
      await login(data.email.trim(), data.password);
      toast.success("Connexion réussie");
      reset();
      router.push("/dashboard");
    } catch (err) {
      const raw =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Erreur de connexion";
      const message = mapAuthError(raw, "login");
      setSubmitError(message);
      toast.error(message);
    }
  };

  const onInvalid = (fieldErrors: FieldErrors<LoginFormData>): void => {
    const first = Object.values(fieldErrors).find((e) => e?.message);
    setSubmitError(first?.message ?? "Vérifiez les champs du formulaire.");
  };

  return (
    <div>
      {sessionNotice && (
        <div className={styles.alert} role="status">
          <strong className={styles.alertTitle}>Session expirée</strong>
          <p className={styles.alertMessage}>{sessionNotice}</p>
        </div>
      )}

      {submitError && (
        <div className={styles.alert} role="alert" aria-live="assertive">
          <strong className={styles.alertTitle}>Connexion impossible</strong>
          <p className={styles.alertMessage}>{submitError}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className={styles.form}
        noValidate
        method="post"
      >
        <div>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="username"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            suppressHydrationWarning
            {...register("email")}
          />
          {errors.email && (
            <span id="email-error" className={styles.error} role="alert">
              {errors.email.message}
            </span>
          )}
        </div>

        <div>
          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            suppressHydrationWarning
            {...register("password")}
          />
          {errors.password && (
            <span id="password-error" className={styles.error} role="alert">
              {errors.password.message}
            </span>
          )}
        </div>

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          ariaLabel="Se connecter"
        >
          Se connecter
        </Button>
      </form>

      <div className={styles.footer}>
        Pas de compte ?{" "}
        <Link href="/register" className={styles.link}>
          S&apos;inscrire
        </Link>
      </div>
    </div>
  );
};

export const LoginForm: React.FC = () => {
  return (
    <ClientOnly
      fallback={
        <div className={styles.loading}>
          <Spinner size="md" />
        </div>
      }
    >
      <LoginFormFields />
    </ClientOnly>
  );
};
