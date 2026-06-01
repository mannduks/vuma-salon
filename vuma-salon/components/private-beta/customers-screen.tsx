"use client";

import { useMemo, useState } from "react";
import { Pencil, Star, Trash2 } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { createId, useSalonStore } from "@/components/providers/salon-store-provider";
import { useToast } from "@/components/providers/toast-provider";
import {
  EmptyState,
  ExportButton,
  FieldInput,
  FieldTextarea,
  FilterPanel,
  FormActions,
  SearchField,
  SectionCard
} from "@/components/private-beta/shared";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/csv";
import { hasActiveCustomerFilters, matchesSearch, normalizeSearchValue } from "@/lib/filters";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { getCustomerMetrics, getCustomerVisitHistory } from "@/lib/salon-analytics";
import type { Customer } from "@/lib/types";
import { hasErrors, validateCustomer, type ValidationErrors } from "@/lib/validation";

function buildCustomer(): Customer {
  return {
    id: createId(),
    fullName: "",
    phoneNumber: "",
    email: "",
    notes: "",
    loyaltyPoints: 0,
    createdAt: new Date().toISOString()
  };
}

export function CustomersScreen() {
  const { data, deleteCustomer, saveCustomer, setCustomerFilters, uiState } = useSalonStore();
  const { showErrorToast, showSuccessToast } = useToast();
  const [form, setForm] = useState<Customer>(buildCustomer());
  const [errors, setErrors] = useState<ValidationErrors<"fullName" | "phoneNumber">>({});
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const filters = uiState.filters.customers;
  const isEditing = data.customers.some((customer) => customer.id === form.id);

  const filteredCustomers = useMemo(
    () =>
      data.customers.filter((customer) =>
        matchesSearch(
          normalizeSearchValue(customer.fullName, customer.phoneNumber, customer.email),
          filters.search
        )
      ),
    [data.customers, filters.search]
  );

  return (
    <div className="space-y-6">
      <AppHeader
        description="Capture clean contact details, notes and visit history without needing a live backend."
        title="Customers"
      />

      <SectionCard
        actions={
          <ExportButton
            label="Export customers CSV"
            onClick={() => {
              downloadCsv(
                "vuma-customers.csv",
                data.customers.map((customer) => {
                  const metrics = getCustomerMetrics(data, customer.id);
                  return {
                    full_name: customer.fullName,
                    phone_number: customer.phoneNumber,
                    email: customer.email,
                    loyalty_points: customer.loyaltyPoints,
                    total_visits: metrics.totalVisits,
                    total_spend_zar: metrics.totalSpend,
                    last_visit_at: metrics.lastVisitAt ? formatDateTime(metrics.lastVisitAt) : "",
                    notes: customer.notes
                  };
                })
              );
              showSuccessToast("Customer CSV exported.");
            }}
          />
        }
        description="Create or edit customer records, then export a clean CSV for beta support or migration."
        eyebrow="CRM"
        title={isEditing ? "Edit customer" : "Add customer"}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const nextErrors = validateCustomer(form);
            setErrors(nextErrors);

            if (hasErrors(nextErrors)) {
              showErrorToast("Please fix the customer form errors before saving.");
              return;
            }

            setIsSaving(true);
            saveCustomer(form);
            setForm(buildCustomer());
            setErrors({});
            setIsSaving(false);
            showSuccessToast("Customer saved locally.");
          }}
        >
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <FieldInput
              error={errors.fullName}
              label="Full name"
              onChange={(event) =>
                setForm((current) => ({ ...current, fullName: event.target.value }))
              }
              required
              value={form.fullName}
            />
            <FieldInput
              error={errors.phoneNumber}
              label="Phone number"
              onChange={(event) =>
                setForm((current) => ({ ...current, phoneNumber: event.target.value }))
              }
              required
              value={form.phoneNumber}
            />
            <FieldInput
              label="Email"
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              type="email"
              value={form.email}
            />
            <FieldInput
              label="Loyalty points"
              min={0}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  loyaltyPoints: Math.max(Number(event.target.value || 0), 0)
                }))
              }
              type="number"
              value={String(form.loyaltyPoints)}
            />
          </div>
          <FieldTextarea
            label="Notes"
            onChange={(event) =>
              setForm((current) => ({ ...current, notes: event.target.value }))
            }
            value={form.notes}
          />
          <FormActions
            isEditing={isEditing}
            isLoading={isSaving}
            onCancel={
              isEditing
                ? () => {
                    setForm(buildCustomer());
                    setErrors({});
                  }
                : undefined
            }
          />
        </form>
      </SectionCard>

      <SectionCard
        actions={
          <div className="w-full max-w-sm">
            <SearchField
              onChange={(value) => setCustomerFilters({ search: value })}
              placeholder="Search by customer name or phone"
              value={filters.search}
            />
          </div>
        }
        description="Customers are filtered instantly and the search survives navigation."
        eyebrow="Directory"
        title="Customer records"
      >
        <FilterPanel>
          <FieldInput label="Active search" readOnly value={filters.search || "No search applied"} />
        </FilterPanel>

        {!filteredCustomers.length ? (
          <EmptyState
            description={
              hasActiveCustomerFilters(filters)
                ? "No customers match the current search."
                : "Add your first customer to start capturing visit history and spend."
            }
            title={hasActiveCustomerFilters(filters) ? "No matching customers" : "No customers yet"}
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredCustomers.map((customer) => {
              const metrics = getCustomerMetrics(data, customer.id);
              const visits = getCustomerVisitHistory(data, customer.id).slice(0, 3);

              return (
                <div
                  className="rounded-[26px] border border-border/70 bg-background/70 p-5"
                  key={customer.id}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">{customer.fullName}</h3>
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                          {metrics.segment}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {customer.phoneNumber} / {customer.email || "No email"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        disabled={pendingDeleteId === customer.id}
                        onClick={() => {
                          setForm(customer);
                          setErrors({});
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        disabled={pendingDeleteId === customer.id}
                        onClick={() => {
                          setPendingDeleteId(customer.id);
                          const result = deleteCustomer(customer.id);
                          setPendingDeleteId(null);

                          if (result.ok) {
                            showSuccessToast("Customer removed.");
                            return;
                          }

                          showErrorToast(result.message ?? "Customer could not be removed.");
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-card p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Spend
                      </p>
                      <p className="mt-2 text-xl font-semibold">
                        {formatCurrency(metrics.totalSpend)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-card p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Visits
                      </p>
                      <p className="mt-2 text-xl font-semibold">{metrics.totalVisits}</p>
                    </div>
                    <div className="rounded-2xl bg-card p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Loyalty
                      </p>
                      <p className="mt-2 inline-flex items-center gap-1 text-xl font-semibold">
                        <Star className="h-4 w-4 text-primary" />
                        {customer.loyaltyPoints}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-secondary/60 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Notes
                    </p>
                    <p className="mt-1 text-sm text-foreground">{customer.notes || "No notes yet."}</p>
                  </div>

                  <div className="mt-5 rounded-2xl bg-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Visit history
                    </p>
                    <div className="mt-3 space-y-3">
                      {visits.length ? (
                        visits.map((visit) => (
                          <div
                            className="flex flex-col gap-1 border-b border-border/60 pb-3 last:border-b-0 last:pb-0"
                            key={visit.id}
                          >
                            <p className="text-sm font-medium">{visit.summary}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(visit.date)} / {visit.staffName} /{" "}
                              {formatCurrency(visit.amountZar)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No completed visits or sales tracked yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
