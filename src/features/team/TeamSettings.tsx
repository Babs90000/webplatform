"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import styles from "./TeamSettings.module.css";
import { AppNavbar } from "@/shared/components/AppNavbar";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { LoadingPanel } from "@/shared/components/LoadingPanel";
import { useZodForm } from "@/shared/hooks/useZodForm";
import { ApiError } from "@/lib/api";
import { toast } from "@/store/toast";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  teamApi,
  type TeamMember,
} from "./services/teamApi";

const inviteSchema = z.object({
  email: z.string().min(1, "Email requis").email("Email invalide"),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export const TeamSettings: React.FC = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useZodForm({
    schema: inviteSchema,
    defaultValues: { email: "" },
  });

  const loadMembers = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await teamApi.listMembers();
      setMembers(res.members);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Impossible de charger l'équipe.";
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const onInvite = async (data: InviteFormData): Promise<void> => {
    setInviting(true);
    try {
      await teamApi.invite(data.email, "member");
      toast.success("Invitation envoyée");
      reset();
      await loadMembers();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Invitation impossible.";
      toast.error(message);
    } finally {
      setInviting(false);
    }
  };

  const onRemove = async (member: TeamMember): Promise<void> => {
    if (member.user_id === user?.id) {
      toast.error("Vous ne pouvez pas vous retirer vous-même.");
      return;
    }
    if (!window.confirm(`Retirer ${member.email} de l'équipe ?`)) return;

    setRemovingId(member.user_id);
    try {
      await teamApi.removeMember(member.user_id);
      toast.success("Membre retiré");
      await loadMembers();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Suppression impossible.";
      toast.error(message);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className={styles.page} data-testid="team-settings-page">
      <AppNavbar />
      <div className={styles.container}>
        <Link href="/settings" className={styles.back}>
          ← Paramètres
        </Link>
        <h1 className={styles.title}>Équipe</h1>
        <p className={styles.subtitle}>
          Gérez les membres de votre espace de travail.
        </p>

        <section className={styles.card} aria-labelledby="invite-heading">
          <h2 id="invite-heading" className={styles.cardTitle}>
            Inviter un membre
          </h2>
          <form
            onSubmit={handleSubmit(onInvite)}
            className={styles.inviteForm}
            noValidate
          >
            <div className={styles.inviteField}>
              <Input
                label="Email"
                type="email"
                placeholder="collegue@entreprise.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <span className={styles.fieldError} role="alert">
                  {errors.email.message}
                </span>
              )}
            </div>
            <Button type="submit" size="sm" isLoading={inviting}>
              Inviter
            </Button>
          </form>
        </section>

        <section className={styles.card} aria-labelledby="members-heading">
          <h2 id="members-heading" className={styles.cardTitle}>
            Membres
          </h2>

          {isLoading && (
            <LoadingPanel variant="inline" message="Chargement des membres…" />
          )}

          {loadError && (
            <p className={styles.error}>
              {loadError}{" "}
              <button type="button" className={styles.back} onClick={() => void loadMembers()}>
                Réessayer
              </button>
            </p>
          )}

          {!isLoading && !loadError && members.length === 0 && (
            <p className={styles.empty}>Aucun membre pour le moment.</p>
          )}

          {!isLoading && !loadError && members.length > 0 && (
            <ul className={styles.memberList}>
              {members.map((member) => (
                <li key={member.user_id} className={styles.memberRow}>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberEmail}>{member.email}</div>
                    <div className={styles.memberRole}>{member.role}</div>
                  </div>
                  {member.user_id !== user?.id && member.role !== "owner" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void onRemove(member)}
                      disabled={removingId === member.user_id}
                    >
                      {removingId === member.user_id ? "…" : "Retirer"}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};
