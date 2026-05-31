"use client";

import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./BlockCanvas.module.css";
import { useBlocks, useCreateBlock, useReorderBlocks } from "../../hooks/useBlocks";
import { useEditorStore } from "@/store/editor";
import { Button } from "@/shared/components/Button";
import { AI_ASSISTANT_NAME } from "@/lib/branding";
import { type BlockType, type Block } from "@/types";
import { BlockRenderer } from "../BlockRenderer";
import { BlockPicker } from "../BlockPicker";

// --- Sortable Block Wrapper ---
interface SortableBlockProps {
  block: Block;
  isActive: boolean;
  onSelect: (id: string) => void;
}

const SortableBlock: React.FC<SortableBlockProps> = ({ block, isActive, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.blockWrapper} ${isActive ? styles.blockWrapperActive : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(block.id);
      }}
      {...attributes}
      {...listeners}
    >
      <div className={`${styles.blockOverlay} ${isActive ? styles.blockOverlayActive : ""}`} />
      
      {/* Real Block Render */}
      <div style={{ pointerEvents: "none" }}>
        <BlockRenderer block={block} />
      </div>

      {/* Drag Handle (Visible only on hover/active in CSS, but inline for now) */}
      <div 
        style={{ 
          position: "absolute", 
          top: "8px", 
          right: "8px", 
          background: "white", 
          padding: "4px", 
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          zIndex: 20,
          cursor: "grab",
          display: isActive ? "block" : "none" 
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="5" r="1.5" fill="currentColor" />
          <circle cx="15" cy="5" r="1.5" fill="currentColor" />
          <circle cx="9" cy="12" r="1.5" fill="currentColor" />
          <circle cx="15" cy="12" r="1.5" fill="currentColor" />
          <circle cx="9" cy="19" r="1.5" fill="currentColor" />
          <circle cx="15" cy="19" r="1.5" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
};

// --- Main Canvas ---
interface BlockCanvasProps {
  pageId: string | null;
}

export const BlockCanvas: React.FC<BlockCanvasProps> = ({ pageId }) => {
  const { data: blocks, isLoading, isError, refetch } = useBlocks(pageId);
  const { mutate: createBlock } = useCreateBlock(pageId);
  const { mutate: reorderBlocks } = useReorderBlocks(pageId);
  const { selectedBlockId, selectBlock, switchRightPanel } = useEditorStore();

  const [items, setItems] = useState<Block[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Synchronise les blocs serveur vers l'état local du DnD (hors phase render).
  useEffect(() => {
    setItems(blocks ? [...blocks].sort((a, b) => a.order_index - b.order_index) : []);
  }, [blocks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require 5px movement before drag starts (allows clicking to select)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Prepare reorder payload for backend
        const payload = newItems.map((item, index) => ({
          id: item.id,
          order_index: index,
        }));
        
        reorderBlocks({ blocks: payload });
        
        return newItems;
      });
    }
  };

  const handleSelectBlockType = (type: BlockType) => {
    if (!pageId) return;
    const order_index = items.length;
    createBlock({ type, props: {} as Record<string, unknown>, order_index });
  };

  if (!pageId) {
    return (
      <div className={styles.canvas}>
        <div className={styles.content}>
          <div className={styles.emptyState}>
            <p>Sélectionnez une page pour commencer l'édition</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.canvas}>
        <div className={styles.content}>
          <div className={styles.emptyState}>Chargement des blocs…</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.canvas}>
        <div className={styles.content}>
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>⚠️</span>
            <h3>Impossible de charger les blocs</h3>
            <p>Une erreur est survenue lors du chargement de cette page.</p>
            <div className={styles.emptyActions}>
              <Button variant="secondary" onClick={() => refetch()}>
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.canvas} onClick={() => selectBlock(null)}>
      <div className={styles.content}>
        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>✨</span>
            <h3>Page vierge</h3>
            <p>
              Décrivez votre site à {AI_ASSISTANT_NAME} — navbar, hero, sections — et il
              construira la page en temps réel. Ou ajoutez vos blocs manuellement.
            </p>
            <div className={styles.emptyActions}>
              <Button
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  switchRightPanel("hermes");
                }}
              >
                Construire avec {AI_ASSISTANT_NAME}
              </Button>
              <Button
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPickerOpen(true);
                }}
              >
                + Ajouter un bloc
              </Button>
            </div>
          </div>
        ) : (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={items.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  isActive={selectedBlockId === block.id}
                  onSelect={selectBlock}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className={styles.addBlockButton}>
        <Button onClick={(e) => { e.stopPropagation(); setIsPickerOpen(true); }} variant="secondary">
          + Ajouter un bloc
        </Button>
      </div>

      <BlockPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectBlockType}
      />
    </div>
  );
};
