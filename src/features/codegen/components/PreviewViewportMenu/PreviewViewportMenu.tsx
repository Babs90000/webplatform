"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Plus, Ruler } from "lucide-react";
import styles from "./PreviewViewportMenu.module.css";
import { Icon } from "@/shared/components/Icon";
import {
  getPreviewViewportIcon,
  getPreviewViewportLabel,
  isDevicePreview,
  PREVIEW_VIEWPORT_OPTIONS,
  VIEWPORT_MENU_GROUPS,
  type PreviewViewport,
} from "../../lib/previewViewport";
import type { CustomPreviewPreset } from "../../lib/customPreviewPresets";

interface PreviewViewportMenuProps {
  value: PreviewViewport;
  onChange: (viewport: PreviewViewport) => void;
  customPresets?: CustomPreviewPreset[];
  activeCustomPresetId?: string | null;
  onSelectCustomPreset?: (preset: CustomPreviewPreset) => void;
  onOpenCustomModal?: () => void;
  disabled?: boolean;
  /** Contrôle externe (ex. badge LivePreview) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const PreviewViewportMenu: React.FC<PreviewViewportMenuProps> = ({
  value,
  onChange,
  customPresets = [],
  activeCustomPresetId = null,
  onSelectCustomPreset,
  onOpenCustomModal,
  disabled = false,
  open: controlledOpen,
  onOpenChange,
}) => {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  const ViewportIcon = getPreviewViewportIcon(value === "custom" ? "custom" : value);
  const deviceActive = isDevicePreview(value);
  const activeCustomPreset =
    value === "custom" && activeCustomPresetId
      ? customPresets.find((p) => p.id === activeCustomPresetId) ?? null
      : null;
  const displayLabel = getPreviewViewportLabel(value, activeCustomPreset);

  const updateMenuPosition = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 6,
      left: Math.max(8, rect.right - 248),
    });
  }, []);

  const handleSelect = useCallback(
    (viewport: PreviewViewport) => {
      onChange(viewport);
      setOpen(false);
    },
    [onChange, setOpen],
  );

  useEffect(() => {
    if (!isOpen) return;
    updateMenuPosition();
    const idx = PREVIEW_VIEWPORT_OPTIONS.findIndex((o) => o.id === value);
    setFocusedIndex(idx >= 0 ? idx : 0);

    const onDocClick = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onResize = (): void => updateMenuPosition();

    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [isOpen, setOpen, updateMenuPosition, value]);

  const handleMenuKeyDown = (event: React.KeyboardEvent): void => {
    if (!isOpen) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex((i) => (i + 1) % PREVIEW_VIEWPORT_OPTIONS.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex(
        (i) =>
          (i - 1 + PREVIEW_VIEWPORT_OPTIONS.length) %
          PREVIEW_VIEWPORT_OPTIONS.length,
      );
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const opt = PREVIEW_VIEWPORT_OPTIONS[focusedIndex];
      if (opt) handleSelect(opt.id);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  const menu =
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            className={styles.menuPortal}
            style={{ top: menuPos.top, left: menuPos.left }}
            onKeyDown={handleMenuKeyDown}
          >
            {VIEWPORT_MENU_GROUPS.map((group) => {
              if (group.id === "custom") {
                return (
                  <div key={group.id}>
                    <div className={styles.groupLabel}>{group.label}</div>
                    {customPresets.map((preset) => {
                      const active =
                        value === "custom" && activeCustomPresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          role="menuitem"
                          className={`${styles.menuItem} ${active ? styles.menuItemActive : ""}`}
                          onClick={() => onSelectCustomPreset?.(preset)}
                        >
                          <Icon icon={Ruler} size="sm" className={styles.itemIcon} />
                          <span className={styles.itemBody}>
                            <span className={styles.itemLabel}>{preset.label}</span>
                            <span className={styles.itemMeta}>
                              {preset.width} × {preset.height}px
                            </span>
                          </span>
                          {active && (
                            <Icon icon={Check} size="sm" className={styles.check} />
                          )}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      role="menuitem"
                      className={styles.menuItem}
                      onClick={() => {
                        setOpen(false);
                        onOpenCustomModal?.();
                      }}
                    >
                      <Icon icon={Plus} size="sm" className={styles.itemIcon} />
                      <span className={styles.itemBody}>
                        <span className={styles.itemLabel}>Personnaliser…</span>
                        <span className={styles.itemMeta}>390 × 844, etc.</span>
                      </span>
                    </button>
                  </div>
                );
              }

              const items = PREVIEW_VIEWPORT_OPTIONS.filter(
                (o) => o.menuGroup === group.id,
              );
              if (items.length === 0) return null;
              return (
                <div key={group.id}>
                  <div className={styles.groupLabel}>{group.label}</div>
                  {items.map((opt) => {
                    const OptIcon = opt.icon;
                    const active = opt.id === value;
                    const globalIdx = PREVIEW_VIEWPORT_OPTIONS.findIndex(
                      (o) => o.id === opt.id,
                    );
                    const focused = globalIdx === focusedIndex;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="menuitem"
                        className={`${styles.menuItem} ${active ? styles.menuItemActive : ""} ${focused ? styles.menuItemFocused : ""}`}
                        onClick={() => handleSelect(opt.id)}
                        onMouseEnter={() => setFocusedIndex(globalIdx)}
                      >
                        <Icon icon={OptIcon} size="sm" className={styles.itemIcon} />
                        <span className={styles.itemBody}>
                          <span className={styles.itemLabel}>{opt.label}</span>
                          <span className={styles.itemMeta}>
                            {opt.width && opt.height
                              ? `${opt.width} × ${opt.height}px`
                              : "Adaptatif au panneau"}
                          </span>
                        </span>
                        <kbd className={styles.itemKey}>{opt.shortcutKey}</kbd>
                        {active && (
                          <Icon icon={Check} size="sm" className={styles.check} />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={styles.root} ref={rootRef}>
      <div
        className={`${styles.split} ${deviceActive ? styles.splitActive : ""}`}
      >
        <button
          type="button"
          className={styles.mainBtn}
          disabled={disabled}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-controls={menuId}
          title="Choisir une taille d'aperçu (1-5)"
          onClick={() => !disabled && setOpen(!isOpen)}
        >
          <Icon icon={ViewportIcon} size="sm" />
          {displayLabel}
        </button>
        <button
          type="button"
          className={styles.toggleBtn}
          disabled={disabled}
          aria-label="Ouvrir le menu des tailles"
          onClick={() => !disabled && setOpen(!isOpen)}
        >
          <Icon icon={ChevronDown} size="sm" />
        </button>
      </div>
      {menu}
    </div>
  );
};
