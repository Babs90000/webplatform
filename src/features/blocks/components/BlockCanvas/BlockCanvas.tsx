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
      className={`relative border-2 transition-colors duration-200 group ${
        isActive ? "border-primary z-10" : "border-transparent hover:border-indigo-500/30"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(block.id);
      }}
      {...attributes}
      {...listeners}
    >
      <div className={`absolute inset-0 z-10 cursor-pointer ${isActive ? "pointer-events-none" : ""}`} />
      
      {/* Real Block Render */}
      <div className="pointer-events-none">
        <BlockRenderer block={block} />
      </div>

      {/* Drag Handle */}
      <div 
        className={`absolute top-2 right-2 bg-white shadow-md p-1 rounded cursor-grab z-20 ${
          isActive ? "block" : "hidden group-hover:block"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-zinc-500">
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
  const { selectedBlockId, selectBlock, switchRightPanel, setMobileView } = useEditorStore();

  const [items, setItems] = useState<Block[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Synchronise les blocs serveur vers l'état local du DnD.
  useEffect(() => {
    setItems(blocks ? [...blocks].sort((a, b) => a.order_index - b.order_index) : []);
  }, [blocks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
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
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="text-zinc-500 font-medium bg-zinc-900/50 px-6 py-4 rounded-xl border border-zinc-800">
          Sélectionnez une page pour commencer l'édition
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="text-zinc-400 font-medium animate-pulse">Chargement du canevas...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md text-center">
          <span className="text-4xl block mb-4">⚠️</span>
          <h3 className="text-red-400 font-bold text-lg mb-2">Impossible de charger la page</h3>
          <p className="text-zinc-400 mb-6">Une erreur est survenue lors de la récupération des données.</p>
          <Button variant="secondary" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 flex flex-col items-center overflow-y-auto overflow-x-hidden p-2 sm:p-4 lg:p-8 relative"
      onClick={() => selectBlock(null)}
    >
      {/* Browser-like Frame */}
      <div className="w-full max-w-6xl bg-white min-h-[800px] rounded-xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-zinc-800">
        {/* Fake Browser Bar */}
        <div className="h-10 bg-zinc-100 border-b border-zinc-200 flex items-center px-4 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
            <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
            <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
          </div>
          <div className="mx-auto bg-white border border-zinc-200 text-zinc-400 text-xs px-24 py-1 rounded-md hidden sm:block">
            localhost:3000
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col w-full relative bg-white">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-50/50">
              <span className="text-5xl mb-6">✨</span>
              <h3 className="text-xl font-bold text-zinc-800 mb-3">Une toile vierge</h3>
              <p className="text-zinc-500 max-w-md mb-8 leading-relaxed">
                Décrivez votre site à {AI_ASSISTANT_NAME} (ex: "Je veux un site pour mon restaurant avec un menu et une galerie"), ou assemblez vos blocs manuellement.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.innerWidth < 1024) setMobileView("ai");
                    else switchRightPanel("hermes");
                  }}
                >
                  Générer avec {AI_ASSISTANT_NAME}
                </Button>
                <Button
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPickerOpen(true);
                  }}
                  style={{ color: "black", borderColor: "#e4e4e7" }}
                >
                  Ajouter un bloc
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

          {/* Bottom Add Button if not empty */}
          {items.length > 0 && (
            <div className="py-12 flex justify-center w-full border-t border-dashed border-zinc-200 mt-auto">
              <button
                onClick={(e) => { e.stopPropagation(); setIsPickerOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-full text-sm font-medium transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Ajouter un bloc
              </button>
            </div>
          )}
        </div>
      </div>

      <BlockPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectBlockType}
      />
    </div>
  );
};
