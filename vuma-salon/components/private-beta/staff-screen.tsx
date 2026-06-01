"use client";

import { useMemo, useState } from "react";
import { Pencil, Trophy, Trash2 } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { createId, useSalonStore } from "@/components/providers/salon-store-provider";
import { useToast } from "@/components/providers/toast-provider";
import {
  EmptyState,
  FieldInput,
  FieldSelect,
  FieldTextarea,
  FilterPanel,
  FormActions,
  SearchField,
  SectionCard,
  StatusBadge
} from "@/components/private-beta/shared";
import { Button } from "@/components/ui/button";
import { hasActiveStaffFilters, matchesSearch, normalizeSearchValue } from "@/lib/filters";
import { formatCurrency } from "@/lib/formatters";
import { getStaffPerformance } from "@/lib/salon-analytics";
import type { StaffMember } from "@/lib/types";
import { hasErrors, validateStaffMember, type ValidationErrors } from "@/lib/validation";

function buildStaffMember(): StaffMember {
  return {
    id: createId(),
    fullName: "",
    roleTitle: "",
    mobile: "",
    email: "",
    commissionRate: 10,
    status: "active",
    speciality: "",
    createdAt: new Date().toISOString()
  };
}

export function StaffScreen() {
  const { data, deleteStaff, saveStaff, setStaffFilters, uiState } = useSalonStore();
  const { showErrorToast, showSuccessToast } = useToast();
  const [form, setForm] = useState<StaffMember>(buildStaffMember());
  const [errors, setErrors] = useState<
    ValidationErrors<"commissionRate" | "fullName" | "mobile" | "roleTitle">
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const filters = uiState.filters.staff;
  const isEditing = data.staff.some((member) => member.id === form.id);

  const filteredStaff = useMemo(
    () =>
      data.staff.filter((member) =>
        matchesSearch(
          normalizeSearchValue(member.fullName, member.mobile, member.roleTitle),
          filters.search
        )
      ),
    [data.staff, filters.search]
  );

  return (
    <div className="space-y-6">
      <AppHeader
        description="Manage the real team roster, working status and commission rules for the private beta."
        title="Staff"
      />

      <SectionCard
        description="Each sale snapshots the commission rate so payouts remain traceable even if the base rate changes later."
        eyebrow="Team"
        title={isEditing ? "Edit staff member" : "Add staff member"}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const nextErrors = validateStaffMember(form);
            setErrors(nextErrors);

            if (hasErrors(nextErrors)) {
              showErrorToast("Please fix the staff form errors before saving.");
              return;
            }

            setIsSaving(true);
            saveStaff(form);
            setForm(buildStaffMember());
            setErrors({});
            setIsSaving(false);
            showSuccessToast("Staff member saved locally.");
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
              error={errors.roleTitle}
              label="Role title"
              onChange={(event) =>
                setForm((current) => ({ ...current, roleTitle: event.target.value }))
              }
              required
              value={form.roleTitle}
            />
            <FieldInput
              error={errors.mobile}
              label="Mobile"
              onChange={(event) =>
                setForm((current) => ({ ...current, mobile: event.target.value }))
              }
              required
              value={form.mobile}
            />
            <FieldInput
              label="Email"
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              type="email"
              value={form.email}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <FieldInput
              error={errors.commissionRate}
              label="Commission rate (%)"
              min={0}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  commissionRate: Math.max(Number(event.target.value || 0), 0)
                }))
              }
              required
              type="number"
              value={String(form.commissionRate)}
            />
            <FieldSelect
              label="Status"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as StaffMember["status"]
                }))
              }
              value={form.status}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </FieldSelect>
            <FieldInput
              label="Speciality"
              onChange={(event) =>
                setForm((current) => ({ ...current, speciality: event.target.value }))
              }
              value={form.speciality}
            />
          </div>
          <FieldTextarea
            label="Speciality notes"
            onChange={(event) =>
              setForm((current) => ({ ...current, speciality: event.target.value }))
            }
            value={form.speciality}
          />
          <FormActions
            isEditing={isEditing}
            isLoading={isSaving}
            onCancel={
              isEditing
                ? () => {
                    setForm(buildStaffMember());
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
              onChange={(value) => setStaffFilters({ search: value })}
              placeholder="Search by staff name or phone"
              value={filters.search}
            />
          </div>
        }
        description="Staff performance updates from locally saved sales and completed appointments."
        eyebrow="Roster"
        title="Current team"
      >
        <FilterPanel>
          <FieldInput label="Active search" readOnly value={filters.search || "No search applied"} />
        </FilterPanel>

        {!filteredStaff.length ? (
          <EmptyState
            description={
              hasActiveStaffFilters(filters)
                ? "No staff members match the current search."
                : "Add your first team member."
            }
            title={hasActiveStaffFilters(filters) ? "No matching staff" : "No staff yet"}
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredStaff.map((member) => {
              const performance = getStaffPerformance(data, member.id);

              return (
                <div
                  className="rounded-[26px] border border-border/70 bg-background/70 p-5"
                  key={member.id}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">{member.fullName}</h3>
                        <StatusBadge kind="staff" value={member.status} />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {member.roleTitle} / {member.mobile}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        disabled={pendingDeleteId === member.id}
                        onClick={() => {
                          setForm(member);
                          setErrors({});
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        disabled={pendingDeleteId === member.id}
                        onClick={() => {
                          setPendingDeleteId(member.id);
                          const result = deleteStaff(member.id);
                          setPendingDeleteId(null);

                          if (result.ok) {
                            showSuccessToast("Staff member removed.");
                            return;
                          }

                          showErrorToast(result.message ?? "Staff member could not be removed.");
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
                        Commission
                      </p>
                      <p className="mt-2 text-xl font-semibold">{member.commissionRate}%</p>
                    </div>
                    <div className="rounded-2xl bg-card p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Sales tracked
                      </p>
                      <p className="mt-2 text-xl font-semibold">
                        {formatCurrency(performance.totalSales)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-card p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Commission earned
                      </p>
                      <p className="mt-2 inline-flex items-center gap-2 text-xl font-semibold">
                        <Trophy className="h-5 w-5 text-primary" />
                        {formatCurrency(performance.commissionEarned)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-secondary/60 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Speciality
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {member.speciality || "No speciality added yet."}
                    </p>
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
