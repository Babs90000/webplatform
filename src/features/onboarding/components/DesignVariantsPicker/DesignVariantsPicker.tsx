"use client";

import React, { useEffect, useState } from "react";
import styles from "./DesignVariantsPicker.module.css";
import { api } from "@/lib/api";

export interface DesignVariantOption {
  id: string;
  label: string;
  vibe: string;
  palette: Record<string, string>;
  fonts: { heading: string; body: string };
}

interface DesignVariantsPickerProps {
  preferredStyle?: string;
  value: string | null;
  onChange: (styleId: string) => void;
}

export const DesignVariantsPicker: React.FC<DesignVariantsPickerProps> = ({
  preferredStyle,
  value,
  onChange,
}) => {
  const [variants, setVariants] = useState<DesignVariantOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<void> => {
      try {
        const qs = preferredStyle
          ? `?style=${encodeURIComponent(preferredStyle)}`
          : "";
        const res = await api.get<{ variants: DesignVariantOption[] }>(
          `/onboarding/design-variants${qs}`,
        );
        if (cancelled) return;
        setVariants(res.variants);
        if (!value && res.variants[0]) onChange(res.variants[0].id);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Impossible de charger les variantes",
          );
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [preferredStyle]);

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  if (variants.length === 0) {
    return <p className={styles.loading}>Chargement des esthétiques…</p>;
  }

  return (
    <div className={styles.grid} role="radiogroup" aria-label="Variantes de design">
      {variants.map((v) => {
        const selected = value === v.id;
        return (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`${styles.card} ${selected ? styles.cardSelected : ""}`}
            onClick={() => onChange(v.id)}
          >
            <div className={styles.swatches} aria-hidden>
              {["primary", "secondary", "accent", "background"].map((key) => (
                <span
                  key={key}
                  className={styles.swatch}
                  style={{ background: v.palette[key] ?? "#ccc" }}
                />
              ))}
            </div>
            <strong className={styles.label}>{v.label}</strong>
            <p className={styles.vibe}>{v.vibe}</p>
            <span className={styles.fonts}>
              {v.fonts.heading} · {v.fonts.body}
            </span>
          </button>
        );
      })}
    </div>
  );
};
