import { useCallback, useEffect, useState } from "react";
import {
  loadCustomPreviewPresets,
  removeCustomPreviewPreset,
  upsertCustomPreviewPreset,
  type CustomPreviewPreset,
} from "../lib/customPreviewPresets";

export const useCustomPreviewPresets = (): {
  presets: CustomPreviewPreset[];
  savePreset: (
    input: Omit<CustomPreviewPreset, "id"> & { id?: string },
  ) => CustomPreviewPreset;
  deletePreset: (id: string) => void;
  refresh: () => void;
} => {
  const [presets, setPresets] = useState<CustomPreviewPreset[]>([]);

  const refresh = useCallback(() => {
    setPresets(loadCustomPreviewPresets());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const savePreset = useCallback(
    (input: Omit<CustomPreviewPreset, "id"> & { id?: string }) => {
      const saved = upsertCustomPreviewPreset(input);
      refresh();
      return saved;
    },
    [refresh],
  );

  const deletePreset = useCallback(
    (id: string) => {
      removeCustomPreviewPreset(id);
      refresh();
    },
    [refresh],
  );

  return { presets, savePreset, deletePreset, refresh };
};
