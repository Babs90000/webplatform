import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

export const toast = {
  success: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "success", message, duration }),
  error: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "error", message, duration }),
  info: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "info", message, duration }),
  prompt: (
    message: string,
    action: { label: string; onClick: () => void },
    duration = 12_000,
  ) =>
    useToastStore.getState().addToast({
      type: "info",
      message,
      duration,
      action,
    }),
};
