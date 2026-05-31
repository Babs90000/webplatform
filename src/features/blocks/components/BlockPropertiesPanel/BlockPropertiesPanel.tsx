"use client";

import React, { useEffect, useState } from "react";
import styles from "./BlockPropertiesPanel.module.css";
import { useBlocks, useUpdateBlock } from "../../hooks/useBlocks";
import { useEditorStore } from "@/store/editor";
import { useDebouncedCallback } from "@/shared/hooks/useDebouncedCallback";
import { BLOCK_TYPE_LABELS, type BlockProps } from "@/types";
import { BLOCK_FIELD_SCHEMAS, type FieldDefinition } from "../../config/blockFieldSchemas";

interface BlockPropertiesPanelProps {
  pageId: string | null;
}

export const BlockPropertiesPanel: React.FC<BlockPropertiesPanelProps> = ({ pageId }) => {
  const { data: blocks } = useBlocks(pageId);
  const { mutate: updateBlock } = useUpdateBlock(pageId);
  const { selectedBlockId } = useEditorStore();

  const selectedBlock = blocks?.find((b) => b.id === selectedBlockId);
  const schema = selectedBlock ? BLOCK_FIELD_SCHEMAS[selectedBlock.type] : [];

  const [localProps, setLocalProps] = useState<Record<string, unknown>>({});
  const [abVariant, setAbVariant] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Resync quand le bloc sélectionné change OU est modifié à l'extérieur
  // (ex : mutations Koala Codeur) — via updated_at, pas en phase de render.
  useEffect(() => {
    setLocalProps(selectedBlock?.props ? { ...selectedBlock.props } : {});
    setAbVariant(selectedBlock?.ab_variant ?? "");
    setSaveSuccess(false);
  }, [selectedBlock?.id, selectedBlock?.updated_at]);

  const saveProperties = useDebouncedCallback((newProps: Record<string, unknown>) => {
    if (!selectedBlock) return;
    setIsSaving(true);
    setSaveSuccess(false);
    updateBlock(
      { blockId: selectedBlock.id, data: { props: newProps as BlockProps } },
      {
        onSuccess: () => {
          setIsSaving(false);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2000);
        },
        onError: () => setIsSaving(false),
      },
    );
  }, 500);

  const saveAbVariant = useDebouncedCallback((value: string) => {
    if (!selectedBlock) return;
    updateBlock({ blockId: selectedBlock.id, data: { ab_variant: value || null } });
  }, 500);

  const handleFieldChange = (name: string, value: unknown) => {
    const updatedProps = { ...localProps, [name]: value };
    setLocalProps(updatedProps);
    setSaveSuccess(false);
    saveProperties(updatedProps);
  };

  const handleArrayItemChange = (
    arrayName: string,
    index: number,
    subName: string,
    value: unknown,
  ) => {
    const current = Array.isArray(localProps[arrayName])
      ? [...(localProps[arrayName] as Record<string, unknown>[])]
      : [];
    current[index] = { ...current[index], [subName]: value };
    handleFieldChange(arrayName, current);
  };

  const handleAddArrayItem = (field: FieldDefinition) => {
    const current = Array.isArray(localProps[field.name])
      ? [...(localProps[field.name] as Record<string, unknown>[])]
      : [];
    const empty: Record<string, unknown> = {};
    field.arraySchema?.forEach((sub) => {
      empty[sub.name] = sub.defaultValue ?? "";
    });
    handleFieldChange(field.name, [...current, empty]);
  };

  const handleRemoveArrayItem = (arrayName: string, index: number) => {
    const current = Array.isArray(localProps[arrayName])
      ? [...(localProps[arrayName] as Record<string, unknown>[])]
      : [];
    current.splice(index, 1);
    handleFieldChange(arrayName, current);
  };

  if (!selectedBlock) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.title}>Propriétés</span>
        </div>
        <div className={styles.emptyState}>
          Sélectionnez un bloc pour modifier ses propriétés
        </div>
      </div>
    );
  }

  const fieldId = (name: string) => `${selectedBlock.id}-${name}`;

  const renderArrayField = (field: FieldDefinition) => {
    const items = Array.isArray(localProps[field.name])
      ? (localProps[field.name] as Record<string, unknown>[])
      : [];

    return (
      <div key={field.name} className={styles.fieldGroup}>
        <label className={styles.label}>{field.label}</label>
        <div className={styles.arrayList}>
          {items.map((item, idx) => (
            <div key={idx} className={styles.arrayItem}>
              <div className={styles.arrayItemHeader}>
                <span className={styles.arrayItemIndex}>#{idx + 1}</span>
                <button
                  type="button"
                  className={styles.arrayRemoveBtn}
                  onClick={() => handleRemoveArrayItem(field.name, idx)}
                  aria-label={`Supprimer l'élément ${idx + 1}`}
                >
                  Supprimer
                </button>
              </div>
              {field.arraySchema?.map((sub) => {
                const subVal = item[sub.name];
                const subStr = typeof subVal === "string" ? subVal : "";
                const subId = `${fieldId(field.name)}-${idx}-${sub.name}`;
                return (
                  <div key={sub.name} className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor={subId}>{sub.label}</label>
                    {sub.type === "textarea" ? (
                      <textarea
                        id={subId}
                        className={styles.textarea}
                        value={subStr}
                        onChange={(e) =>
                          handleArrayItemChange(field.name, idx, sub.name, e.target.value)
                        }
                      />
                    ) : (
                      <input
                        id={subId}
                        type="text"
                        className={styles.input}
                        value={subStr}
                        onChange={(e) =>
                          handleArrayItemChange(field.name, idx, sub.name, e.target.value)
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          <button
            type="button"
            className={styles.addItemBtn}
            onClick={() => handleAddArrayItem(field)}
          >
            + Ajouter un élément
          </button>
        </div>
      </div>
    );
  };

  const renderField = (field: FieldDefinition) => {
    const raw = localProps[field.name] ?? field.defaultValue ?? "";
    const value = typeof raw === "string" ? raw : String(raw);
    const id = fieldId(field.name);

    switch (field.type) {
      case "text":
        return (
          <div key={field.name} className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={id}>{field.label}</label>
            <input
              id={id}
              type="text"
              className={styles.input}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            />
          </div>
        );
      case "textarea":
        return (
          <div key={field.name} className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={id}>{field.label}</label>
            <textarea
              id={id}
              className={styles.textarea}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            />
          </div>
        );
      case "select":
        return (
          <div key={field.name} className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={id}>{field.label}</label>
            <select
              id={id}
              className={styles.input}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            >
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        );
      case "color":
        return (
          <div key={field.name} className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={id}>{field.label}</label>
            <div className={styles.colorInputWrapper}>
              <input
                type="color"
                aria-label={`${field.label} (sélecteur)`}
                className={styles.colorInput}
                value={value.startsWith("var") ? "#ffffff" : value}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
              />
              <input
                id={id}
                type="text"
                className={`${styles.input} ${styles.colorText}`}
                value={value}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
              />
            </div>
          </div>
        );
      case "number":
        return (
          <div key={field.name} className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={id}>{field.label}</label>
            <input
              id={id}
              type="number"
              className={styles.input}
              value={value}
              onChange={(e) => handleFieldChange(field.name, Number(e.target.value))}
            />
          </div>
        );
      case "boolean":
        return (
          <label key={field.name} className={styles.checkboxGroup}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={!!raw}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
            />
            <span className={styles.label}>{field.label}</span>
          </label>
        );
      case "array":
        return renderArrayField(field);
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Propriétés</span>
        <span className={styles.blockType}>
          {BLOCK_TYPE_LABELS[selectedBlock.type] || selectedBlock.type}
        </span>
      </div>

      <div className={styles.content}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor={fieldId("ab_variant")}>
            Variant A/B
          </label>
          <input
            id={fieldId("ab_variant")}
            type="text"
            className={styles.input}
            placeholder="ex. variant_a"
            value={abVariant}
            onChange={(e) => {
              setAbVariant(e.target.value);
              saveAbVariant(e.target.value);
            }}
          />
        </div>
        <hr style={{ margin: "16px 0", borderColor: "var(--color-border-subtle)" }} />
        {schema && schema.length > 0 ? (
          schema.map(renderField)
        ) : (
          <div className={styles.emptyState} style={{ fontSize: "0.875rem", fontStyle: "italic" }}>
            Aucune propriété personnalisable pour ce type de bloc.
          </div>
        )}

        <div style={{ marginTop: "auto", paddingTop: "16px" }}>
          {isSaving && (
            <div className={styles.saveMessage} style={{ color: "var(--color-accent-warning)" }}>
              Enregistrement...
            </div>
          )}
          {saveSuccess && (
            <div className={styles.saveMessage}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Enregistré
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
