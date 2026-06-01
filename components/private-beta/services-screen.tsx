"use client";

import { useState } from "react";
import { Clock3, Pencil, Trash2 } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { createId, useSalonStore } from "@/components/providers/salon-store-provider";
import { useToast } from "@/components/providers/toast-provider";
import {
  EmptyState,
  FieldInput,
  FieldSelect,
  FieldTextarea,
  FormActions,
  SectionCard
} from "@/components/private-beta/shared";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import type { Service } from "@/lib/types";
import { hasErrors, validateService, type ValidationErrors } from "@/lib/validation";

function buildService(): Service {
  return {
    id: createId(),
    name: "",
    category: "",
    durationMinutes: 60,
    priceZar: 0,
    isActive: true,
    description: "",
    createdAt: new Date().toISOString()
  };
}

export function ServicesScreen() {
  const { data, deleteService, saveService } = useSalonStore();
  const { showErrorToast, showSuccessToast } = useToast();
  const [form, setForm] = useState<Service>(buildService());
  const [errors, setErrors] = useState<
    ValidationErrors<"description" | "durationMinutes" | "name" | "priceZar">
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const isEditing = data.services.some((service) => service.id === form.id);

  return (
    <div className="space-y-6">
      <AppHeader
        description="Build a clean service menu with durations and prices that feed directly into appointments and sales."
        title="Services"
      />

      <SectionCard
        description="Service prices automatically flow into appointment totals and sale subtotal calculations."
        eyebrow="Catalogue"
        title={isEditing ? "Edit service" : "Add service"}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const nextErrors = validateService(form, data.services);
            setErrors(nextErrors);

            if (hasErrors(nextErrors)) {
              showErrorToast("Please fix the service form errors before saving.");
              return;
            }

            setIsSaving(true);
            saveService(form);
            setForm(buildService());
            setErrors({});
            setIsSaving(false);
            showSuccessToast("Service saved locally.");
          }}
        >
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <FieldInput
              error={errors.name}
              label="Service name"
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              required
              value={form.name}
            />
            <FieldInput
              label="Category"
              onChange={(event) =>
                setForm((current) => ({ ...current, category: event.target.value }))
              }
              value={form.category}
            />
            <FieldInput
              error={errors.durationMinutes}
              label="Duration (minutes)"
              min={0}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  durationMinutes: Math.max(Number(event.target.value || 0), 0)
                }))
              }
              required
              type="number"
              value={String(form.durationMinutes)}
            />
            <FieldInput
              error={errors.priceZar}
              label="Price (ZAR)"
              min={0}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  priceZar: Math.max(Number(event.target.value || 0), 0)
                }))
              }
              required
              type="number"
              value={String(form.priceZar)}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <FieldSelect
              label="Status"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isActive: event.target.value === "active"
                }))
              }
              value={form.isActive ? "active" : "inactive"}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </FieldSelect>
            <FieldTextarea
              label="Description"
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              value={form.description}
            />
          </div>
          <FormActions
            isEditing={isEditing}
            isLoading={isSaving}
            onCancel={
              isEditing
                ? () => {
                    setForm(buildService());
                    setErrors({});
                  }
                : undefined
            }
          />
        </form>
      </SectionCard>

      <SectionCard
        description="Keep the live service menu lean enough for reception and stylists to use quickly."
        eyebrow="Menu"
        title="Service list"
      >
        {!data.services.length ? (
          <EmptyState description="Add your first service." title="No services yet" />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {data.services.map((service) => (
              <div
                className="rounded-[26px] border border-border/70 bg-background/70 p-5"
                key={service.id}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{service.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {service.category} / {service.description || "No description"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      disabled={pendingDeleteId === service.id}
                      onClick={() => {
                        setForm(service);
                        setErrors({});
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      disabled={pendingDeleteId === service.id}
                      onClick={() => {
                        setPendingDeleteId(service.id);
                        const result = deleteService(service.id);
                        setPendingDeleteId(null);

                        if (result.ok) {
                          showSuccessToast("Service removed.");
                          return;
                        }

                        showErrorToast(result.message ?? "Service could not be removed.");
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
                    <Clock3 className="mr-2 inline h-4 w-4" />
                    {service.durationMinutes} min
                  </span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    {formatCurrency(service.priceZar)}
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
                    {service.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
