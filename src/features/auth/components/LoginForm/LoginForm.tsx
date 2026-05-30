"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import styles from "./LoginForm.module.css";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "@/store/toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field specific error
    if (validationErrors[name as keyof LoginFormData]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as keyof LoginFormData] = err.message;
        }
      });
      setValidationErrors(errors);
      return;
    }

    try {
      await login(result.data.email, result.data.password);
      toast.success("Successfully logged in");
      router.push("/dashboard");
    } catch (err) {
      // Error is handled in the store, just prevent unhandled rejection
      console.error(err);
    }
  };

  return (
    <div>
      {error && (
        <ErrorMessage 
          message={error} 
          className="mb-4"
          onRetry={() => clearError()} 
        />
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={validationErrors.email}
          placeholder="you@example.com"
          required
        />
        
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={validationErrors.password}
          placeholder="••••••••"
          required
        />
        
        <Button 
          type="submit" 
          fullWidth 
          isLoading={isLoading}
        >
          Sign In
        </Button>
      </form>
      
      <div className={styles.footer}>
        Don&apos;t have an account?{" "}
        <Link href="/register" className={styles.link}>
          Sign up
        </Link>
      </div>
    </div>
  );
};
