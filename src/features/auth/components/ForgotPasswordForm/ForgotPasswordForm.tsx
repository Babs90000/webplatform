"use client";

import React, { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import styles from "./ForgotPasswordForm.module.css";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { useZodForm } from "@/shared/hooks/useZodForm";
import { ApiError } from "@/lib/api";
import { authApi } from "../../services/authApi";
import { toast } from "@/store/toast";

const schema = z.object({
  email: z.string().min(1, "Email requis").email("Email invalide"),
});

type FormData = z.infer<typeof schema>;

export const ForgotPasswordForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useZodForm({
    schema,
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: FormData): Promise<void> => {
    setSubmitError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await authApi.forgotPassword(data.email);
      setSuccessMessage(res.message);
      toast.success("Email envoyé si le compte existe");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Impossible d'envoyer le lien de réinitialisation.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {successMessage && (
        <div className={styles.success} role="status">
          {successMessage}
        </div>
      )}

      {submitError && (
        <div className={styles.alert} role="alert">
          <strong className={styles.alertTitle}>Envoi impossible</strong>
          <p className={styles.alertMessage}>{submitError}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={styles.form}
        noValidate
        data-testid="forgot-password-form"
      >
        <div>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "forgot-email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <span id="forgot-email-error" className={styles.error} role="alert">
              {errors.email.message}
            </span>
          )}
        </div>

        <Button type="submit" fullWidth isLoading={isLoading}>
          Envoyer le lien
        </Button>
      </form>

      <div className={styles.footer}>
        <Link href="/login" className={styles.link}>
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
};
