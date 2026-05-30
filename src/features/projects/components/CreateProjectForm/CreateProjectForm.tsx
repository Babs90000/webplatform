import React, { useState } from "react";
import { z } from "zod";
import styles from "./CreateProjectForm.module.css";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { useCreateProject } from "../../hooks/useProjects";

const projectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  subdomain: z
    .string()
    .min(3, "Subdomain must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface CreateProjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { mutateAsync: createProject, isPending } = useCreateProject();
  
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    subdomain: "",
  });
  
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Auto-generate subdomain from name if subdomain hasn't been manually edited yet
    if (name === "name" && !formData.subdomain) {
      const generated = value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "") // Remove special chars
        .replace(/\s+/g, "-"); // Replace spaces with hyphens
        
      setFormData((prev) => ({ ...prev, subdomain: generated }));
    }

    if (validationErrors[name as keyof ProjectFormData]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      await createProject({
        name: result.data.name,
        subdomain: result.data.subdomain,
      });
      onSuccess();
    } catch (error) {
      // Error handled by hook toast
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Project Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={validationErrors.name}
        placeholder="My Awesome Website"
        autoFocus
      />
      
      <Input
        label="Subdomain (.kdevs.io)"
        name="subdomain"
        value={formData.subdomain}
        onChange={handleChange}
        error={validationErrors.subdomain}
        placeholder="my-awesome-website"
      />
      
      <div className={styles.footer}>
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          isLoading={isPending}
        >
          Create Project
        </Button>
      </div>
    </form>
  );
};
