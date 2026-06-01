"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Download, LoaderCircle, Plus, Search, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatAppointmentStatus, formatPaymentStatus, formatStaffStatus } from "@/lib/formatters";
import type {
  AppointmentStatus,
  PaymentStatus,
  StaffStatus
} from "@/lib/types";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  actions?: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
};

export function SectionCard({
  actions,
  description,
  eyebrow,
  title,
  children
}: SectionCardProps) {
  return (
    <Card className="bg-card/90">
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                {eyebrow}
              </p>
            ) : null}
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {title}
              </h2>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

type FieldProps = {
  children?: ReactNode;
  error?: string;
  label: string;
  required?: boolean;
};

export function Field({ children, error, label, required }: FieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </span>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </label>
  );
}

type FieldInputProps = {
  error?: string;
  label: string;
  required?: boolean;
} & React.ComponentProps<typeof Input>;

export function FieldInput({ error, label, required, ...props }: FieldInputProps) {
  return (
    <Field error={error} label={label} required={required}>
      <Input aria-invalid={Boolean(error)} {...props} />
    </Field>
  );
}

type FieldSelectProps = {
  error?: string;
  label: string;
  children: ReactNode;
  required?: boolean;
} & React.ComponentProps<typeof Select>;

export function FieldSelect({
  error,
  label,
  required,
  children,
  ...props
}: FieldSelectProps) {
  return (
    <Field error={error} label={label} required={required}>
      <Select aria-invalid={Boolean(error)} {...props}>
        {children}
      </Select>
    </Field>
  );
}

type FieldTextareaProps = {
  error?: string;
  label: string;
  required?: boolean;
} & React.ComponentProps<typeof Textarea>;

export function FieldTextarea({
  error,
  label,
  required,
  ...props
}: FieldTextareaProps) {
  return (
    <Field error={error} label={label} required={required}>
      <Textarea aria-invalid={Boolean(error)} {...props} />
    </Field>
  );
}

type FormActionsProps = {
  isEditing: boolean;
  isLoading?: boolean;
  onCancel?: () => void;
};

export function FormActions({
  isEditing,
  isLoading,
  onCancel
}: FormActionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button disabled={isLoading} type="submit">
        {isLoading ? (
          <>
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : isEditing ? (
          "Save changes"
        ) : (
          "Add record"
        )}
      </Button>
      {onCancel ? (
        <Button disabled={isLoading} onClick={onCancel} type="button" variant="outline">
          Cancel
        </Button>
      ) : null}
    </div>
  );
}

type EmptyStateProps = {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  title: string;
};

export function EmptyState({
  actionHref,
  actionLabel,
  description,
  title
}: EmptyStateProps) {
  return (
    <div className="rounded-[26px] border border-dashed border-border/70 bg-background/60 p-8 text-center">
      <p className="text-lg font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {actionHref && actionLabel ? (
        <Link className={cn(buttonVariants(), "mt-4")} href={actionHref}>
          <Plus className="mr-2 h-4 w-4" />
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

type ExportButtonProps = {
  label: string;
  onClick: () => void;
};

export function ExportButton({ label, onClick }: ExportButtonProps) {
  return (
    <Button onClick={onClick} type="button" variant="outline">
      <Download className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}

type FilterPanelProps = {
  children: ReactNode;
};

export function FilterPanel({ children }: FilterPanelProps) {
  return (
    <div className="rounded-[24px] border border-border/70 bg-background/70 p-4">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
        <SlidersHorizontal className="h-4 w-4 text-primary" />
        Filters
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>
    </div>
  );
}

type SearchFieldProps = {
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
};

export function SearchField({
  onChange,
  placeholder,
  value
}: SearchFieldProps) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-10"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </div>
  );
}

type InlineNoticeProps = {
  tone?: "positive" | "warning";
  children: ReactNode;
};

export function InlineNotice({
  tone = "positive",
  children
}: InlineNoticeProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        tone === "positive"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      )}
    >
      {children}
    </div>
  );
}

type MultiSelectTilesProps = {
  items: Array<{ id: string; label: string; meta?: string }>;
  selectedIds: string[];
  onToggle: (id: string) => void;
};

export function MultiSelectTiles({
  items,
  selectedIds,
  onToggle
}: MultiSelectTilesProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const active = selectedIds.includes(item.id);

        return (
          <button
            className={cn(
              "rounded-2xl border px-4 py-3 text-left transition-colors",
              active
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-background text-muted-foreground"
            )}
            key={item.id}
            onClick={() => onToggle(item.id)}
            type="button"
          >
            <p className="font-semibold">{item.label}</p>
            {item.meta ? <p className="mt-1 text-xs">{item.meta}</p> : null}
          </button>
        );
      })}
    </div>
  );
}

type StatusBadgeProps =
  | { kind: "appointment"; value: AppointmentStatus }
  | { kind: "payment"; value: PaymentStatus }
  | { kind: "staff"; value: StaffStatus };

export function StatusBadge(props: StatusBadgeProps) {
  if (props.kind === "appointment") {
    return (
      <Badge tone={appointmentTone[props.value]}>
        {formatAppointmentStatus(props.value)}
      </Badge>
    );
  }

  if (props.kind === "payment") {
    return (
      <Badge tone={paymentTone[props.value]}>
        {formatPaymentStatus(props.value)}
      </Badge>
    );
  }

  return <Badge tone={staffTone[props.value]}>{formatStaffStatus(props.value)}</Badge>;
}

const appointmentTone: Record<AppointmentStatus, "neutral" | "positive" | "warning" | "accent"> =
  {
    booked: "neutral",
    confirmed: "accent",
    completed: "positive",
    cancelled: "warning",
    no_show: "warning"
  };

const paymentTone: Record<PaymentStatus, "neutral" | "positive" | "warning"> = {
  unpaid: "warning",
  partial: "neutral",
  paid: "positive"
};

const staffTone: Record<StaffStatus, "positive" | "neutral"> = {
  active: "positive",
  inactive: "neutral"
};
