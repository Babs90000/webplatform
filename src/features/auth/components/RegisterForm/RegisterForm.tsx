"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import styles from "./RegisterForm.module.css";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { useZodForm } from "@/shared/hooks/useZodForm";
import { useAuth } from "../../hooks/useAuth";
import { mapAuthError } from "../../utils/mapAuthError";
import { toast } from "@/store/toast";

const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");
  const hasCheckedInitialAuth = useRef(false);

  const { register, isLoading, error, clearError, isAuthenticated, isHydrated } =
    useAuth();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    reset,
  } = useZodForm({
    schema: registerSchema,
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Redirige seulement si l'utilisateur était déjà connecté à l'arrivée sur /register
  useEffect(() => {
    if (!isHydrated || hasCheckedInitialAuth.current) return;
    hasCheckedInitialAuth.current = true;
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isHydrated, isAuthenticated, router]);

  const displayError = error ? mapAuthError(error, "register") : null;

  useEffect(() => {
    if (displayError) {
      toast.error(displayError);
    }
  }, [displayError]);

  const onSubmit = async (data: RegisterFormData): Promise<void> => {
    clearError();
    try {
      await register(
        data.email.trim(),
        data.password,
        data.name.trim(),
        refCode || undefined,
      );
      toast.success("Compte créé avec succès");
      reset();
      router.replace("/onboarding");
    } catch {
      // Erreur affichée via displayError
    }
  };

  const clearErrorOnChange = (): void => {
    if (error) clearError();
  };

  return (
    <div>
      {displayError && (
        <ErrorMessage
          title="Inscription impossible"
          message={displayError}
          className={styles.apiError}
        />
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={styles.form}
        noValidate
        method="post"
      >
        <div>
          <Input
            label="Nom complet"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...registerField("name", { onChange: clearErrorOnChange })}
          />
          {errors.name && (
            <span id="name-error" className={styles.error} role="alert">
              {errors.name.message}
            </span>
          )}
        </div>

        <div>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...registerField("email", { onChange: clearErrorOnChange })}
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
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            suppressHydrationWarning
            {...registerField("password", { onChange: clearErrorOnChange })}
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
          ariaLabel="Créer un compte"
        >
          Créer mon compte
        </Button>
      </form>

      <div className={styles.footer}>
        Déjà un compte ?{" "}
        <Link href="/login" className={styles.link}>
          Se connecter
        </Link>
      </div>
    </div>
  );
};
