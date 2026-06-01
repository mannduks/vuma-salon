"use client";

import { useMemo, useState } from "react";
import { CalendarCheck2, Pencil, Trash2 } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { createId, useSalonStore } from "@/components/providers/salon-store-provider";
import { useToast } from "@/components/providers/toast-provider";
import {
  EmptyState,
  ExportButton,
  FieldInput,
  FieldSelect,
  FieldTextarea,
  FilterPanel,
  FormActions,
  MultiSelectTiles,
  SearchField,
  SectionCard,
  StatusBadge
} from "@/components/private-beta/shared";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/csv";
import {
  hasActiveAppointmentFilters,
  matchesSearch,
  normalizeSearchValue
} from "@/lib/filters";
import {
  formatCurrency,
  formatDateTime,
  fromDateTimeLocalValue,
  toDateTimeLocalValue
} from "@/lib/formatters";
import { getAppointmentDisplay, getServiceTotal } from "@/lib/salon-analytics";
import type { Appointment } from "@/lib/types";
import {
  hasErrors,
  validateAppointment,
  type ValidationErrors
} from "@/lib/validation";

type AppointmentFormState = {
  id: string;
  customerId: string;
  staffMemberId: string;
  startsAt: string;
  endsAt: string;
  status: Appointment["status"];
  totalAmount: number;
  notes: string;
  serviceIds: string[];
  createdAt: string;
};

function buildAppointment(
  customers: string[],
  staffMembers: string[]
): AppointmentFormState {
  const nextStart = new Date();
  nextStart.setHours(nextStart.getHours() + 1, 0, 0, 0);
  const nextEnd = new Date(nextStart);
  nextEnd.setHours(nextEnd.getHours() + 1);

  return {
    id: createId(),
    customerId: customers[0] ?? "",
    staffMemberId: staffMembers[0] ?? "",
    startsAt: toDateTimeLocalValue(nextStart.toISOString()),
    endsAt: toDateTimeLocalValue(nextEnd.toISOString()),
    status: "booked",
    totalAmount: 0,
    notes: "",
    serviceIds: [],
    createdAt: new Date().toISOString()
  };
}

export function AppointmentsScreen() {
  const {
    data,
    deleteAppointment,
    saveAppointment,
    setAppointmentFilters,
    setAppointmentStatus,
    uiState
  } = useSalonStore();
  const { showErrorToast, showSuccessToast } = useToast();
  const [form, setForm] = useState<AppointmentFormState>(() =>
    buildAppointment(
      data.customers.map((customer) => customer.id),
      data.staff.map((member) => member.id)
    )
  );
  const [errors, setErrors] = useState<
    ValidationErrors<
      "customerId" | "endsAt" | "serviceIds" | "staffMemberId" | "startsAt" | "totalAmount"
    >
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const filters = uiState.filters.appointments;
  const isEditing = data.appointments.some((appointment) => appointment.id === form.id);

  const appointmentRows = useMemo(
    () =>
      [...data.appointments]
        .map((appointment) => getAppointmentDisplay(data, appointment))
        .filter((appointment) => {
          const customer = data.customers.find((item) => item.id === appointment.customerId);
          const searchMatch = matchesSearch(
            normalizeSearchValue(
              appointment.customerName,
              customer?.phoneNumber,
              appointment.staffName
            ),
            filters.search
          );
          const statusMatch =
            filters.status === "all" || appointment.status === filters.status;
          const dateMatch =
            !filters.date || appointment.startsAt.slice(0, 10) === filters.date;
          const staffMatch =
            filters.staffMemberId === "all" ||
            appointment.staffMemberId === filters.staffMemberId;

          return searchMatch && statusMatch && dateMatch && staffMatch;
        })
        .sort((left, right) => left.startsAt.localeCompare(right.startsAt)),
    [data, filters]
  );

  const serviceOptions = data.services
    .filter((service) => service.isActive)
    .map((service) => ({
      id: service.id,
      label: service.name,
      meta: `${service.durationMinutes} min / ${formatCurrency(service.priceZar)}`
    }));

  return (
    <div className="space-y-6">
      <AppHeader
        description="Take real bookings, move them through status changes, and export the schedule for manual beta support when needed."
        title="Appointments"
      />

      <SectionCard
        actions={
          <ExportButton
            label="Export appointments CSV"
            onClick={() => {
              downloadCsv(
                "vuma-appointments.csv",
                appointmentRows.map((appointment) => ({
                  customer_name: appointment.customerName,
                  customer_phone:
                    data.customers.find((customer) => customer.id === appointment.customerId)
                      ?.phoneNumber ?? "",
                  staff_name: appointment.staffName,
                  starts_at: formatDateTime(appointment.startsAt),
                  ends_at: formatDateTime(appointment.endsAt),
                  status: appointment.status,
                  services: appointment.serviceNames.join(" | "),
                  total_amount_zar: appointment.totalAmount,
                  notes: appointment.notes
                }))
              );
              showSuccessToast("Appointments CSV exported.");
            }}
          />
        }
        description="Appointments save immediately to the local beta workspace and can be edited as the day changes."
        eyebrow="Schedule"
        title={isEditing ? "Edit appointment" : "Add appointment"}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const appointmentPayload: Appointment = {
              id: form.id,
              customerId: form.customerId,
              staffMemberId: form.staffMemberId,
              startsAt: fromDateTimeLocalValue(form.startsAt),
              endsAt: fromDateTimeLocalValue(form.endsAt),
              status: form.status,
              totalAmount: form.totalAmount,
              notes: form.notes,
              serviceIds: form.serviceIds,
              createdAt: form.createdAt
            };
            const nextErrors = validateAppointment(appointmentPayload, data);
            setErrors(nextErrors);

            if (hasErrors(nextErrors)) {
              showErrorToast("Please fix the appointment form errors before saving.");
              return;
            }

            setIsSaving(true);
            saveAppointment(appointmentPayload);
            setForm(
              buildAppointment(
                data.customers.map((customer) => customer.id),
                data.staff.map((member) => member.id)
              )
            );
            setErrors({});
            setIsSaving(false);
            showSuccessToast("Appointment saved locally.");
          }}
        >
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <FieldSelect
              error={errors.customerId}
              label="Customer"
              onChange={(event) =>
                setForm((current) => ({ ...current, customerId: event.target.value }))
              }
              required
              value={form.customerId}
            >
              {data.customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.fullName}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              error={errors.staffMemberId}
              label="Staff member"
              onChange={(event) =>
                setForm((current) => ({ ...current, staffMemberId: event.target.value }))
              }
              required
              value={form.staffMemberId}
            >
              {data.staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.fullName}
                </option>
              ))}
            </FieldSelect>
            <FieldInput
              error={errors.startsAt}
              label="Start time"
              onChange={(event) =>
                setForm((current) => ({ ...current, startsAt: event.target.value }))
              }
              required
              type="datetime-local"
              value={form.startsAt}
            />
            <FieldInput
              error={errors.endsAt}
              label="End time"
              onChange={(event) =>
                setForm((current) => ({ ...current, endsAt: event.target.value }))
              }
              required
              type="datetime-local"
              value={form.endsAt}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Services
                <span className="ml-1 text-red-600">*</span>
              </p>
              {errors.serviceIds ? (
                <p className="text-sm text-red-600">{errors.serviceIds}</p>
              ) : null}
              <MultiSelectTiles
                items={serviceOptions}
                onToggle={(serviceId) =>
                  setForm((current) => {
                    const serviceIds = current.serviceIds.includes(serviceId)
                      ? current.serviceIds.filter((id) => id !== serviceId)
                      : [...current.serviceIds, serviceId];
                    return {
                      ...current,
                      serviceIds,
                      totalAmount: getServiceTotal(serviceIds, data.services)
                    };
                  })
                }
                selectedIds={form.serviceIds}
              />
            </div>
            <div className="space-y-4 rounded-[26px] bg-secondary/70 p-4">
              <FieldSelect
                label="Status"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as Appointment["status"]
                  }))
                }
                value={form.status}
              >
                <option value="booked">booked</option>
                <option value="confirmed">confirmed</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
                <option value="no_show">no_show</option>
              </FieldSelect>
              <FieldInput
                error={errors.totalAmount}
                label="Total amount (ZAR)"
                min={0}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    totalAmount: Math.max(Number(event.target.value || 0), 0)
                  }))
                }
                type="number"
                value={String(form.totalAmount)}
              />
            </div>
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
                    setForm(
                      buildAppointment(
                        data.customers.map((customer) => customer.id),
                        data.staff.map((member) => member.id)
                      )
                    );
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
              onChange={(value) => setAppointmentFilters({ search: value })}
              placeholder="Search by customer, phone, or staff"
              value={filters.search}
            />
          </div>
        }
        description="Use instant filters to narrow the schedule by status, date, or assigned team member."
        eyebrow="Live schedule"
        title="Appointment list"
      >
        <FilterPanel>
          <FieldSelect
            label="Status"
            onChange={(event) =>
              setAppointmentFilters({
                status: event.target.value as typeof filters.status
              })
            }
            value={filters.status}
          >
            <option value="all">All statuses</option>
            <option value="booked">booked</option>
            <option value="confirmed">confirmed</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
            <option value="no_show">no_show</option>
          </FieldSelect>
          <FieldInput
            label="Date"
            onChange={(event) => setAppointmentFilters({ date: event.target.value })}
            type="date"
            value={filters.date}
          />
          <FieldSelect
            label="Staff member"
            onChange={(event) =>
              setAppointmentFilters({ staffMemberId: event.target.value })
            }
            value={filters.staffMemberId}
          >
            <option value="all">All staff</option>
            {data.staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName}
              </option>
            ))}
          </FieldSelect>
          <Button
            className="self-end"
            onClick={() =>
              setAppointmentFilters({
                date: "",
                search: "",
                staffMemberId: "all",
                status: "all"
              })
            }
            type="button"
            variant="outline"
          >
            Clear filters
          </Button>
        </FilterPanel>

        {!appointmentRows.length ? (
          <EmptyState
            description={
              hasActiveAppointmentFilters(filters)
                ? "No appointments match the current filters."
                : "Create the first appointment."
            }
            title={
              hasActiveAppointmentFilters(filters)
                ? "No matching appointments"
                : "No appointments yet"
            }
          />
        ) : (
          <div className="space-y-4">
            {appointmentRows.map((appointment) => (
              <div
                className="rounded-[26px] border border-border/70 bg-background/70 p-5"
                key={appointment.id}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">{appointment.customerName}</h3>
                      <StatusBadge kind="appointment" value={appointment.status} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {appointment.staffName} /{" "}
                      {appointment.serviceNames.join(" / ") || "No services selected"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      disabled={pendingDeleteId === appointment.id}
                      onClick={() => {
                        setForm({
                          id: appointment.id,
                          customerId: appointment.customerId,
                          staffMemberId: appointment.staffMemberId,
                          startsAt: toDateTimeLocalValue(appointment.startsAt),
                          endsAt: toDateTimeLocalValue(appointment.endsAt),
                          status: appointment.status,
                          totalAmount: appointment.totalAmount,
                          notes: appointment.notes,
                          serviceIds: appointment.serviceIds,
                          createdAt: appointment.createdAt
                        });
                        setErrors({});
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      disabled={pendingDeleteId === appointment.id}
                      onClick={() => {
                        setPendingDeleteId(appointment.id);
                        const result = deleteAppointment(appointment.id);
                        setPendingDeleteId(null);

                        if (result.ok) {
                          showSuccessToast("Appointment removed.");
                          return;
                        }

                        showErrorToast(result.message ?? "Appointment could not be removed.");
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_1fr]">
                  <div className="rounded-2xl bg-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Time
                    </p>
                    <p className="mt-2 inline-flex items-center gap-2 text-base font-semibold">
                      <CalendarCheck2 className="h-4 w-4 text-primary" />
                      {formatDateTime(appointment.startsAt)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Total amount
                    </p>
                    <p className="mt-2 text-base font-semibold">
                      {formatCurrency(appointment.totalAmount)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Notes
                    </p>
                    <p className="mt-2 text-sm text-foreground">
                      {appointment.notes || "No notes yet."}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {(["booked", "confirmed", "completed", "cancelled", "no_show"] as const).map(
                    (status) => (
                      <Button
                        key={status}
                        onClick={() => {
                          setAppointmentStatus(appointment.id, status);
                          showSuccessToast("Appointment status updated.");
                        }}
                        size="sm"
                        type="button"
                        variant={appointment.status === status ? "default" : "outline"}
                      >
                        {status}
                      </Button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
