"use client";

import React, { useEffect, useState } from "react";
import styles from "./DeleteProjectModal.module.css";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";

type ProjectLifecycle = "active" | "archived" | "trashed";

interface DeleteProjectModalProps {
  isOpen: boolean;
  projectName: string;
  lifecycle?: ProjectLifecycle;
  /** Date ISO de mise en corbeille — pour afficher le délai restant */
  deletedAt?: string | null;
  /** Statut d'origine (draft|published) pour le message de restauration */
  previousStatus?: "draft" | "published" | null;
  isPending: boolean;
  onClose: () => void;
  onArchive: () => void;
  onTrash: () => void;
  onRestore?: () => void;
  onDeletePermanent: () => void;
}

const TRASH_RETENTION_DAYS = 30;

const formatPurgeDate = (deletedAt: string): string => {
  const d = new Date(deletedAt);
  d.setUTCDate(d.getUTCDate() + TRASH_RETENTION_DAYS);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const daysRemaining = (deletedAt: string): number => {
  const purge = new Date(deletedAt);
  purge.setUTCDate(purge.getUTCDate() + TRASH_RETENTION_DAYS);
  const ms = purge.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

export const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  isOpen,
  projectName,
  lifecycle = "active",
  deletedAt = null,
  previousStatus = null,
  isPending,
  onClose,
  onArchive,
  onTrash,
  onRestore,
  onDeletePermanent,
}) => {
  const [confirmPermanent, setConfirmPermanent] = useState(false);
  const [confirmTrash, setConfirmTrash] = useState(false);

  const restoreHint =
    previousStatus === "published"
      ? "La restauration le remettra en ligne (statut publié)."
      : "La restauration le remettra en brouillon.";

  useEffect(() => {
    if (!isOpen) {
      setConfirmPermanent(false);
      setConfirmTrash(false);
    }
  }, [isOpen]);

  const handleClose = (): void => {
    if (isPending) return;
    setConfirmPermanent(false);
    setConfirmTrash(false);
    onClose();
  };

  const title =
    lifecycle === "trashed"
      ? "Corbeille"
      : lifecycle === "archived"
        ? "Projet archivé"
        : "Gérer le projet";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <div className={styles.body}>
        {confirmPermanent ? (
          <>
            <p className={styles.message}>
              Confirmer la suppression définitive de{" "}
              <span className={styles.projectName}>{projectName}</span> ?
            </p>
            <p className={styles.warning}>
              Action irréversible — fichiers, déploiement et données associées
              seront perdus immédiatement.
            </p>
            <div className={styles.actions}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmPermanent(false)}
                disabled={isPending}
              >
                Retour
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={onDeletePermanent}
                isLoading={isPending}
              >
                Oui, supprimer
              </Button>
            </div>
          </>
        ) : confirmTrash ? (
          <>
            <p className={styles.message}>
              Mettre{" "}
              <span className={styles.projectName}>{projectName}</span> à la
              corbeille ?
            </p>
            <p className={styles.info}>
              Conservé {TRASH_RETENTION_DAYS} jours, puis suppression
              automatique. Vous pourrez le restaurer depuis l&apos;onglet
              Corbeille.
            </p>
            <div className={styles.actions}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmTrash(false)}
                disabled={isPending}
              >
                Retour
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={onTrash}
                isLoading={isPending}
              >
                Mettre à la corbeille
              </Button>
            </div>
          </>
        ) : lifecycle === "trashed" ? (
          <>
            <p className={styles.message}>
              <span className={styles.projectName}>{projectName}</span> est dans
              la corbeille.
            </p>
            {deletedAt ? (
              <p className={styles.info}>
                Suppression automatique le{" "}
                <strong>{formatPurgeDate(deletedAt)}</strong> (
                {daysRemaining(deletedAt)} j restants).
                <br />
                {restoreHint}
              </p>
            ) : (
              <p className={styles.info}>
                Conservé {TRASH_RETENTION_DAYS} jours avant suppression
                définitive.
                <br />
                {restoreHint}
              </p>
            )}
            <div className={styles.actions}>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClose}
                disabled={isPending}
              >
                Fermer
              </Button>
              {onRestore && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onRestore}
                  isLoading={isPending}
                >
                  Restaurer
                </Button>
              )}
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmPermanent(true)}
                disabled={isPending}
              >
                Supprimer définitivement
              </Button>
            </div>
          </>
        ) : lifecycle === "archived" ? (
          <>
            <p className={styles.message}>
              <span className={styles.projectName}>{projectName}</span> est
              archivé. Restaurez-le ou déplacez-le vers la corbeille.
            </p>
            <p className={styles.info}>
              L&apos;archivage masque le projet du tableau de bord sans
              l&apos;effacer. La corbeille le conserve {TRASH_RETENTION_DAYS}{" "}
              jours puis le supprime.
              <br />
              {restoreHint}
            </p>
            <div className={styles.actions}>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClose}
                disabled={isPending}
              >
                Annuler
              </Button>
              {onRestore && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onRestore}
                  isLoading={isPending}
                >
                  Restaurer
                </Button>
              )}
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmTrash(true)}
                disabled={isPending}
              >
                Mettre à la corbeille
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className={styles.message}>
              Que faire de{" "}
              <span className={styles.projectName}>{projectName}</span> ?
            </p>
            <p className={styles.info}>
              <strong>Archiver</strong> : masqué des actifs, récupérable dans
              « Archivés » (le site en ligne reste accessible).
              <br />
              <strong>Corbeille</strong> : conservé {TRASH_RETENTION_DAYS} jours
              puis suppression automatique.
            </p>
            <div className={styles.actions}>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClose}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onArchive}
                isLoading={isPending}
              >
                Archiver
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmTrash(true)}
                disabled={isPending}
              >
                Mettre à la corbeille
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
