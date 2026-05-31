import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hermesApi } from "../services/hermesApi";
import { blocksApi } from "@/features/blocks/services/blocksApi";
import { useEditorStore } from "@/store/editor";
import { toast } from "@/store/toast";
import { ApiError } from "@/lib/api";
import { isBlockType, type BlockType } from "@/types";

export const useSendHermesMessage = (pageId: string | null) => {
  const queryClient = useQueryClient();
  const { addHermesMessage, setHermesIsThinking } = useEditorStore();

  return useMutation({
    mutationFn: async (content: string) => {
      // Lire l'état FRAIS du store (évite la stale closure si plusieurs
      // messages partent avant un re-render).
      const { projectId, hermesMessages } = useEditorStore.getState();

      if (!projectId || !pageId) {
        throw new Error("Projet ou page non sélectionné");
      }

      // 1. Add user message locally
      addHermesMessage({ role: "user", content });
      setHermesIsThinking(true);

      // 2. Fetch current blocks state from cache or API
      const currentBlocks = await queryClient.ensureQueryData({
        queryKey: ["blocks", pageId],
        queryFn: () => blocksApi.getAll(pageId),
      });

      // 3. Build messages history (including the new user message)
      const chatHistory = [...hermesMessages, { role: "user" as const, content }];

      // 4. Send to Hermes Chat API
      const res = await hermesApi.chat({
        project_id: projectId,
        page_id: pageId,
        messages: chatHistory,
        current_blocks: currentBlocks,
      });

      // 5. Apply mutations sequentially
      if (res.mutations && res.mutations.length > 0) {
        for (const mut of res.mutations) {
          try {
            if (mut.action === "add" && mut.type && isBlockType(mut.type)) {
              await blocksApi.create(pageId, {
                type: mut.type as BlockType,
                props: mut.props ?? {},
                order_index: mut.order_index,
              });
            } else if (mut.action === "update" && mut.block_id) {
              await blocksApi.update(pageId, mut.block_id, {
                props: mut.props,
                order_index: mut.order_index,
              });
            } else if (mut.action === "delete" && mut.block_id) {
              await blocksApi.delete(pageId, mut.block_id);
            }
          } catch (mutationErr) {
            console.error("Failed to apply mutation:", mut, mutationErr);
            toast.error(`Erreur d'application sur un bloc : ${mut.action}`);
          }
        }

        // 6. Invalidate blocks query to refresh the canvas
        await queryClient.invalidateQueries({ queryKey: ["blocks", pageId] });
        toast.success(`${res.mutations.length} modification(s) appliquée(s)`);
      }

      // 7. Add assistant reply to message history
      addHermesMessage({ role: "assistant", content: res.reply });
      setHermesIsThinking(false);

      return res;
    },
    onError: (error) => {
      setHermesIsThinking(false);
      const message =
        error instanceof ApiError ? error.message : "Erreur de connexion avec Koala Codeur";
      toast.error(message);
    },
  });
};
