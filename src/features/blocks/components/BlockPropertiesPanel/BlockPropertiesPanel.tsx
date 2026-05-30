"use client";

import React, { useState } from "react";
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

  // Derive local props from selectedBlock using render-phase update
  const [prevBlockId, setPrevBlockId] = useState<string | null>(null);
  const [localProps, setLocalProps] = useState<Record<string, unknown>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if ((selectedBlock?.id ?? null) !== prevBlockId) {
    setPrevBlockId(selectedBlock?.id ?? null);
    setLocalProps(selectedBlock?.props ? { ...selectedBlock.props } : {});
    setSaveSuccess(false);
  }

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
      }
    );
  }, 500);

  const handleFieldChange = (name: string, value: unknown) => {
    const updatedProps = { ...localProps, [name]: value };
    setLocalProps(updatedProps);
    setSaveSuccess(false);
    saveProperties(updatedProps);
  };

  if (!selectedBlock) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.title}>Properties</span>
        </div>
        <div className={styles.emptyState}>
          Select a block to edit its properties
        </div>
      </div>
    );
  }

  const renderField = (field: FieldDefinition) => {
    const raw = localProps[field.name] ?? field.defaultValue ?? "";
    const value = typeof raw === "string" ? raw : String(raw);

    switch (field.type) {
      case "text":
        return (
          <div key={field.name} className={styles.fieldGroup}>
            <label className={styles.label}>{field.label}</label>
            <input
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
            <label className={styles.label}>{field.label}</label>
            <textarea
              className={styles.textarea}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            />
          </div>
        );
      case "select":
        return (
          <div key={field.name} className={styles.fieldGroup}>
            <label className={styles.label}>{field.label}</label>
            <select
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
            <label className={styles.label}>{field.label}</label>
            <div className={styles.colorInputWrapper}>
              <input
                type="color"
                className={styles.colorInput}
                value={value.startsWith("var") ? "#ffffff" : value}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
              />
              <input
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
            <label className={styles.label}>{field.label}</label>
            <input
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
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Properties</span>
        <span className={styles.blockType}>
          {BLOCK_TYPE_LABELS[selectedBlock.type] || selectedBlock.type}
        </span>
      </div>

      <div className={styles.content}>
        {schema && schema.length > 0 ? (
          schema.map(renderField)
        ) : (
          <div className={styles.emptyState} style={{ fontSize: "0.875rem", fontStyle: "italic" }}>
            No customizable properties for this block type.
          </div>
        )}

        <div style={{ marginTop: "auto", paddingTop: "16px" }}>
          {isSaving && (
            <div className={styles.saveMessage} style={{ color: "var(--color-accent-warning)" }}>
              Saving...
            </div>
          )}
          {saveSuccess && (
            <div className={styles.saveMessage}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Saved
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
