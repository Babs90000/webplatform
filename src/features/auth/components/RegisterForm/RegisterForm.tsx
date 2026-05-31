"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import styles from "./RegisterForm.module.css";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { useZodForm } from "@/shared/hooks/useZodForm";
import { useAuth } from "../../hooks/useAuth";
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

  const { register, isLoading, error, clearError, isAuthenticated } = useAuth();

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

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error) clearError();
  }, [error, clearError]);

  const onSubmit = async (data: RegisterFormData): Promise<void> => {
    try {
      await register(
        data.email,
        data.password,
        data.name,
        refCode || undefined,
      );
      toast.success("Compte créé avec succès");
      reset();
      router.push("/onboarding");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {error && <ErrorMessage message={error} className="mb-4" />}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
        <div>
          <Input
            label="Nom complet"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...registerField("name")}
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
            {...registerField("email")}
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
            {...registerField("password")}
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
