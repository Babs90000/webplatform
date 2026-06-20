"use client";

import React from "react";
import styles from "./DeleteProjectModal.module.css";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";

interface DeleteProjectModalProps {
  isOpen: boolean;
  projectName: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  isOpen,
  projectName,
  isDeleting,
  onClose,
  onConfirm,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Supprimer le projet"
    size="sm"
  >
    <div className={styles.body}>
      <p className={styles.message}>
        Voulez-vous supprimer définitivement{" "}
        <span className={styles.projectName}>{projectName}</span> ?
      </p>
      <p className={styles.warning}>
        Cette action est irréversible. Le site, les fichiers et les données
        associés seront perdus.
      </p>
      <div className={styles.actions}>
        <Button variant="secondary" size="sm" onClick={onClose} disabled={isDeleting}>
          Annuler
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={onConfirm}
          isLoading={isDeleting}
        >
          Supprimer
        </Button>
      </div>
    </div>
  </Modal>
);
