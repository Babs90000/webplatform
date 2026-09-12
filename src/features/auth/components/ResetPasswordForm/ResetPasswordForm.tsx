"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import styles from "./ResetPasswordForm.module.css";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { useZodForm } from "@/shared/hooks/useZodForm";
import { ApiError } from "@/lib/api";
import { authApi } from "../../services/authApi";
import { toast } from "@/store/toast";

const schema = z
  .object({
    password: z
      .string()
      .min(1, "Mot de passe requis")
      .min(6, "Au moins 6 caractères"),
    confirmPassword: z.string().min(1, "Confirmation requise"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

const readTokenFromHash = (): string | null => {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  return (
    params.get("access_token") ??
    params.get("accessToken") ??
    params.get("token")
  );
};

export const ResetPasswordForm: React.FC = () => {
  const searchParams = useSearchParams();
  const [hashToken, setHashToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setHashToken(readTokenFromHash());
  }, []);

  const accessToken = useMemo(() => {
    return (
      hashToken ??
      searchParams.get("access_token") ??
      searchParams.get("accessToken") ??
      searchParams.get("token")
    );
  }, [hashToken, searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useZodForm({
    schema,
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: FormData): Promise<void> => {
    if (!accessToken) {
      setSubmitError("Lien invalide ou expiré. Demandez un nouveau lien.");
      return;
    }

    setSubmitError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await authApi.resetPassword(accessToken, data.password);
      setSuccessMessage(res.message);
      reset();
      toast.success("Mot de passe mis à jour");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Impossible de réinitialiser le mot de passe.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!accessToken) {
    return (
      <div>
        <p className={styles.hint}>
          Lien de réinitialisation manquant ou expiré. Demandez un nouveau
          email depuis la page « Mot de passe oublié ».
        </p>
        <div className={styles.footer}>
          <Link href="/forgot-password" className={styles.link}>
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {successMessage && (
        <div className={styles.success} role="status">
          {successMessage}{" "}
          <Link href="/login" className={styles.link}>
            Se connecter
          </Link>
        </div>
      )}

      {submitError && (
        <div className={styles.alert} role="alert">
          <strong className={styles.alertTitle}>Échec</strong>
          <p className={styles.alertMessage}>{submitError}</p>
        </div>
      )}

      {!successMessage && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={styles.form}
          noValidate
          data-testid="reset-password-form"
        >
          <div>
            <Input
              label="Nouveau mot de passe"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password ? "reset-password-error" : undefined
              }
              {...register("password")}
            />
            {errors.password && (
              <span
                id="reset-password-error"
                className={styles.error}
                role="alert"
              >
                {errors.password.message}
              </span>
            )}
          </div>

          <div>
            <Input
              label="Confirmer le mot de passe"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword ? "reset-confirm-error" : undefined
              }
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <span
                id="reset-confirm-error"
                className={styles.error}
                role="alert"
              >
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <Button type="submit" fullWidth isLoading={isLoading}>
            Enregistrer le mot de passe
          </Button>
        </form>
      )}

      <div className={styles.footer}>
        <Link href="/login" className={styles.link}>
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
};
