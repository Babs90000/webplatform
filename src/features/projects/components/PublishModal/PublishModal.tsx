"use client";

import React, { useState } from "react";
import styles from "./PublishModal.module.css";
import { Button } from "@/shared/components/Button";
import { toast } from "@/store/toast";
import { projectsApi } from "../../services/projectsApi";
import { ApiError } from "@/lib/api";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  initialSubdomain?: string;
  initialCustomDomain?: string;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  projectId,
  initialSubdomain = "",
  initialCustomDomain = "",
}) => {
  const [publishType, setPublishType] = useState<"subdomain" | "domain">(
    "subdomain",
  );
  const [subdomain, setSubdomain] = useState(initialSubdomain);
  const [customDomain, setCustomDomain] = useState(initialCustomDomain);
  const [isLoading, setIsLoading] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      const payload =
        publishType === "subdomain"
          ? { subdomain, custom_domain: "" }
          : { custom_domain: customDomain, subdomain: "" };

      const res = await projectsApi.publish(projectId, payload);
      toast.success("Votre projet est en ligne !");

      const url = res.custom_domain
        ? `https://${res.custom_domain}`
        : `https://${res.subdomain}.webplatform.live`;

      setPublishedUrl(url);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Échec de publication de votre site.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPublishedUrl(null);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {publishedUrl ? (
          <div className={styles.successState}>
            <span className={styles.successIcon}>🚀</span>
            <h3 className={styles.successTitle}>Félicitations !</h3>
            <p>Votre site internet est en ligne à cette adresse :</p>
            <a
              href={publishedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.successLink}
            >
              {publishedUrl}
            </a>
            <div style={{ marginTop: "var(--space-2xl)" }}>
              <Button onClick={handleClose} fullWidth>
                Retour à l'éditeur
              </Button>
            </div>
          </div>
        ) : (
          <>
            <header className={styles.header}>
              <h3 className={styles.title}>Publier le projet</h3>
              <button onClick={handleClose} className={styles.closeBtn}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            <div className={styles.body}>
              <div className={styles.tabs}>
                <button
                  type="button"
                  className={`${styles.tab} ${publishType === "subdomain" ? styles.tabActive : ""}`}
                  onClick={() => setPublishType("subdomain")}
                >
                  Sous-domaine gratuit
                </button>
                <button
                  type="button"
                  className={`${styles.tab} ${publishType === "domain" ? styles.tabActive : ""}`}
                  onClick={() => setPublishType("domain")}
                >
                  Nom de domaine personnalisé
                </button>
              </div>

              {publishType === "subdomain" ? (
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    Choisissez votre sous-domaine
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputPrefix}>https://</span>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="mon-super-site"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                    />
                    <span className={styles.inputSuffix}>.webplatform.live</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                      Entrez votre nom de domaine
                    </label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="www.mon-entreprise.com"
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.dnsInstructions}>
                    <h4 className={styles.dnsTitle}>
                      Configuration DNS requise
                    </h4>
                    <p>
                      Pour lier votre nom de domaine, configurez l'enregistrement
                      suivant dans votre registrar de nom de domaine (OVH, GoDaddy, etc.) :
                    </p>
                    <table className={styles.dnsTable}>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Nom / Host</th>
                          <th>Valeur / Cible</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>CNAME</td>
                          <td>
                            <code>www</code>
                          </td>
                          <td>
                            <code>cname.webplatform.live</code>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <footer className={styles.footer}>
              <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button
                onClick={handlePublish}
                isLoading={isLoading}
                disabled={
                  publishType === "subdomain"
                    ? !subdomain.trim()
                    : !customDomain.trim()
                }
              >
                Mettre en ligne
              </Button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};
