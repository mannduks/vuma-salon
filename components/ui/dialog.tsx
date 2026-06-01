import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type DialogProps = {
  cancelLabel?: string;
  confirmLabel: string;
  description: string;
  isOpen: boolean;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
};

export function Dialog({
  cancelLabel = "Cancel",
  confirmLabel,
  description,
  isOpen,
  isPending,
  onCancel,
  onConfirm,
  title
}: DialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(24,23,19,0.48)] px-4">
      <div className="w-full max-w-lg rounded-[28px] border border-border bg-card p-6 shadow-soft">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button disabled={isPending} onClick={onCancel} type="button" variant="outline">
            {cancelLabel}
          </Button>
          <Button disabled={isPending} onClick={onConfirm} type="button">
            {isPending ? "Working..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
