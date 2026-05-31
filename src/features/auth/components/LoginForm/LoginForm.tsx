"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import styles from "./LoginForm.module.css";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { useZodForm } from "@/shared/hooks/useZodForm";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "@/store/toast";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  
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
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error) clearError();
  }, [error, clearError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success("Connexion réussie");
      reset();
      router.push("/dashboard");
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
            label="Email"
            type="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
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
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
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
