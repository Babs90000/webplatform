import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import styles from "./CreateProjectForm.module.css";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { setupBlankProject } from "../../services/projectSetup";
import { toast } from "@/store/toast";
import { ApiError } from "@/lib/api";

const projectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  subdomain: z
    .string()
    .min(3, "Subdomain must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface CreateProjectFormProps {
  onSuccess: (projectId: string, options?: { openHermes?: boolean }) => void;
  onCancel: () => void;
  openHermes?: boolean;
}

export const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  onSuccess,
  onCancel,
  openHermes = true,
}) => {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    subdomain: "",
  });

  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof ProjectFormData, string>>
  >({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "name" && !formData.subdomain) {
      const generated = value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-");

      setFormData((prev) => ({ ...prev, subdomain: generated }));
    }

    if (validationErrors[name as keyof ProjectFormData]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const result = projectSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof ProjectFormData, string>> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as keyof ProjectFormData] = err.message;
        }
      });
      setValidationErrors(errors);
      return;
    }

    setIsPending(true);
    try {
      const { project } = await setupBlankProject(
        result.data.name,
        result.data.subdomain,
      );
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Projet créé — ouvrez Koala Codeur pour construire votre site");
      onSuccess(project.id, { openHermes });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Échec de la création du projet";
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Nom du projet"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={validationErrors.name}
        placeholder="Mon super site"
        autoFocus
      />

      <Input
        label="Sous-domaine (.kdevs.io)"
        name="subdomain"
        value={formData.subdomain}
        onChange={handleChange}
        error={validationErrors.subdomain}
        placeholder="mon-super-site"
      />

      <div className={styles.footer}>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" isLoading={isPending}>
          Créer et ouvrir l&apos;éditeur
        </Button>
      </div>
    </form>
  );
};
