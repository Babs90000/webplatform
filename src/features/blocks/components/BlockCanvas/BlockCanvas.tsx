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
import { LoadingPanel } from "@/shared/components/LoadingPanel";
import { AI_ASSISTANT_NAME } from "@/lib/branding";
import { type BlockType, type Block } from "@/types";
import { BlockRenderer } from "../BlockRenderer";
import { BlockPicker } from "../BlockPicker";

// --- Skeleton Block for AI "Thinking" State ---
const SkeletonBlock: React.FC = () => {
  return (
    <div className="relative border-2 border-indigo-400/50 rounded-xl overflow-hidden bg-white shadow-[0_0_15px_rgba(99,102,241,0.2)] animate-pulse my-4">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-50/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
      <div className="p-8 md:p-12">
        <div className="w-full flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-2xl animate-bounce">✨</span>
          </div>
          <div className="w-1/3 h-6 bg-zinc-200 rounded-md"></div>
          <div className="w-2/3 h-4 bg-zinc-100 rounded-md"></div>
          <div className="w-1/2 h-4 bg-zinc-100 rounded-md"></div>
          <div className="flex gap-4 mt-4">
            <div className="w-32 h-10 bg-indigo-100 rounded-md"></div>
            <div className="w-32 h-10 bg-zinc-100 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
      className={`relative border-[3px] transition-all duration-200 group ${
        isActive ? "border-indigo-500 z-10 shadow-lg scale-[1.002]" : "border-transparent hover:border-indigo-200"
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
      <div className="pointer-events-none bg-white">
        <BlockRenderer block={block} />
      </div>

      {/* Drag Handle */}
      <div 
        className={`absolute top-3 right-3 bg-white text-zinc-400 shadow-md p-1.5 rounded-md cursor-grab z-20 border border-zinc-200 hover:text-zinc-600 hover:bg-zinc-50 transition-colors ${
          isActive ? "flex" : "hidden group-hover:flex"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
  const { selectedBlockId, selectBlock, switchRightPanel, setMobileView, hermesIsThinking } = useEditorStore();

  const [items, setItems] = useState<Block[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

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
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-zinc-50/80">
        <div className="text-zinc-500 font-medium bg-white px-6 py-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Sélectionnez une page pour commencer l'édition
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-50/80">
        <LoadingPanel variant="centered" message="Chargement du canevas…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-50/80 p-4">
        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md text-center shadow-lg shadow-red-100/50">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">⚠️</div>
          <h3 className="text-zinc-900 font-bold text-lg mb-2">Impossible de charger la page</h3>
          <p className="text-zinc-500 mb-6">Une erreur est survenue lors de la récupération des données.</p>
          <Button variant="secondary" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 flex flex-col items-center overflow-y-auto overflow-x-hidden p-4 sm:p-8 lg:p-12 relative bg-zinc-50/80 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent"
      onClick={() => selectBlock(null)}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />

      {/* Floating Canvas Frame (Webflow / Framer style) */}
      <div className="w-full max-w-[1200px] bg-white min-h-[800px] rounded-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col ring-1 ring-zinc-200/50 transition-all">
        
        {/* Content */}
        <div className="flex-1 flex flex-col w-full relative bg-white">
          {items.length === 0 && !hermesIsThinking ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-50/30">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-white rounded-3xl flex items-center justify-center shadow-sm border border-indigo-50 mb-6">
                <span className="text-4xl">✨</span>
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-3 tracking-tight">Une toile vierge</h3>
              <p className="text-zinc-500 max-w-md mb-8 leading-relaxed text-[15px]">
                Décrivez votre site à {AI_ASSISTANT_NAME} (ex: "Je veux un site pour mon restaurant italien avec un menu"), ou ajoutez des blocs manuellement.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl transition-all shadow-md shadow-zinc-900/10 flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.innerWidth < 1024) setMobileView("ai");
                    else switchRightPanel("hermes");
                  }}
                >
                  <span className="text-lg">✨</span>
                  Générer avec {AI_ASSISTANT_NAME}
                </button>
                <button
                  className="px-6 py-3 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 font-medium rounded-xl transition-all shadow-sm flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPickerOpen(true);
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Ajouter un bloc
                </button>
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

          {/* SKELETON BLOCK FOR FLUID AI ILLUSION */}
          {hermesIsThinking && <SkeletonBlock />}

          {/* Bottom Add Button if not empty */}
          {(items.length > 0 || hermesIsThinking) && (
            <div className="py-16 flex justify-center w-full mt-auto relative group">
              <div className="absolute inset-0 top-1/2 -translate-y-1/2 border-t border-dashed border-zinc-200 z-0"></div>
              <button
                onClick={(e) => { e.stopPropagation(); setIsPickerOpen(true); }}
                className="relative z-10 flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 text-zinc-600 rounded-full text-[14px] font-medium transition-all hover:border-zinc-300 hover:shadow-md hover:text-zinc-900"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
