"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToastTone = "error" | "success";

type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showErrorToast: (message: string) => void;
  showSuccessToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((tone: ToastTone, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      dismissToast(id);
    }, 3200);
  }, [dismissToast]);

  const value = useMemo<ToastContextValue>(
    () => ({
      showErrorToast(message) {
        pushToast("error", message);
      },
      showSuccessToast(message) {
        pushToast("success", message);
      }
    }),
    [pushToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col gap-3 sm:left-auto sm:right-4 sm:w-[360px]">
        {toasts.map((toast) => (
          <div
            className={cn(
              "pointer-events-auto rounded-2xl border p-4 shadow-soft backdrop-blur",
              toast.tone === "success"
                ? "border-emerald-200 bg-white text-emerald-700"
                : "border-red-200 bg-white text-red-700"
            )}
            key={toast.id}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {toast.tone === "success" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
              </div>
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <Button
                className="h-8 w-8 rounded-full p-0"
                onClick={() => dismissToast(toast.id)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
