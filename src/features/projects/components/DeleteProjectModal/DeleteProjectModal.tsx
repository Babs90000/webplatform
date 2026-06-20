"use client";

import React, { useState } from "react";
import styles from "./DeleteProjectModal.module.css";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";

interface DeleteProjectModalProps {
  isOpen: boolean;
  projectName: string;
  isArchived?: boolean;
  isPending: boolean;
  onClose: () => void;
  onArchive: () => void;
  onRestore?: () => void;
  onDeletePermanent: () => void;
}

export const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  isOpen,
  projectName,
  isArchived = false,
  isPending,
  onClose,
  onArchive,
  onRestore,
  onDeletePermanent,
}) => {
  const [confirmPermanent, setConfirmPermanent] = useState(false);

  const handleClose = (): void => {
    if (isPending) return;
    setConfirmPermanent(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isArchived ? "Projet archivé" : "Archiver le projet"}
      size="sm"
    >
      <div className={styles.body}>
        {!confirmPermanent ? (
          <>
            <p className={styles.message}>
              {isArchived ? (
                <>
                  <span className={styles.projectName}>{projectName}</span> est
                  archivé. Vous pouvez le restaurer ou le supprimer
                  définitivement.
                </>
              ) : (
                <>
                  Archiver{" "}
                  <span className={styles.projectName}>{projectName}</span> ?
                </>
              )}
            </p>
            <p className={styles.warning}>
              {isArchived
                ? "La suppression définitive efface les fichiers, le site publié et les messages de contact."
                : "Le projet disparaît du tableau de bord mais reste récupérable dans « Archivés ». Le site en ligne reste accessible."}
            </p>
            <div className={styles.actions}>
              <Button variant="secondary" size="sm" onClick={handleClose} disabled={isPending}>
                Annuler
              </Button>
              {isArchived && onRestore && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onRestore}
                  isLoading={isPending}
                >
                  Restaurer
                </Button>
              )}
              {!isArchived && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onArchive}
                  isLoading={isPending}
                >
                  Archiver
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
        ) : (
          <>
            <p className={styles.message}>
              Confirmer la suppression définitive de{" "}
              <span className={styles.projectName}>{projectName}</span> ?
            </p>
            <p className={styles.warning}>
              Action irréversible — fichiers, déploiement et données associées
              seront perdus.
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
        )}
      </div>
    </Modal>
  );
};
