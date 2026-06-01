"use client";

import { useMemo, useState } from "react";
import { CreditCard, Pencil, Receipt, Trash2 } from "lucide-react";

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
import { hasActiveSalesFilters, matchesSearch, normalizeSearchValue } from "@/lib/filters";
import {
  formatCurrency,
  formatDateTime,
  formatPaymentMethod,
  fromDateTimeLocalValue,
  toDateTimeLocalValue
} from "@/lib/formatters";
import { getAppointmentDisplay, getSaleDisplay, getServiceTotal } from "@/lib/salon-analytics";
import type { Sale } from "@/lib/types";
import { hasErrors, validateSale, type ValidationErrors } from "@/lib/validation";

type SaleFormState = {
  id: string;
  appointmentId: string;
  customerId: string;
  staffMemberId: string;
  saleDate: string;
  serviceIds: string[];
  discountZar: number;
  amountPaidZar: number;
  paymentMethod: Sale["paymentMethod"];
  commissionRateSnapshot: number;
  notes: string;
  createdAt: string;
};

function buildSale(customerIds: string[], staffIds: string[]): SaleFormState {
  return {
    id: createId(),
    appointmentId: "",
    customerId: customerIds[0] ?? "",
    staffMemberId: staffIds[0] ?? "",
    saleDate: toDateTimeLocalValue(new Date().toISOString()),
    serviceIds: [],
    discountZar: 0,
    amountPaidZar: 0,
    paymentMethod: "cash",
    commissionRateSnapshot: 0,
    notes: "",
    createdAt: new Date().toISOString()
  };
}

export function SalesScreen() {
  const {
    data,
    deleteSale,
    saveSale,
    setSalesFilters,
    uiState
  } = useSalonStore();
  const { showErrorToast, showSuccessToast } = useToast();
  const [form, setForm] = useState<SaleFormState>(() =>
    buildSale(
      data.customers.map((customer) => customer.id),
      data.staff.map((member) => member.id)
    )
  );
  const [errors, setErrors] = useState<
    ValidationErrors<
      | "amountPaidZar"
      | "commissionRateSnapshot"
      | "customerId"
      | "discountZar"
      | "saleDate"
      | "serviceIds"
      | "staffMemberId"
    >
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const filters = uiState.filters.sales;
  const isEditing = data.sales.some((sale) => sale.id === form.id);

  const subtotal = getServiceTotal(form.serviceIds, data.services);
  const total = Math.max(subtotal - form.discountZar, 0);
  const selectedStaff = data.staff.find((member) => member.id === form.staffMemberId);
  const commissionRate = form.commissionRateSnapshot || selectedStaff?.commissionRate || 0;
  const commissionAmount = Math.round(total * (commissionRate / 100));
  const paymentStatus =
    form.amountPaidZar <= 0 ? "unpaid" : form.amountPaidZar >= total ? "paid" : "partial";

  const saleRows = useMemo(
    () =>
      [...data.sales]
        .map((sale) => getSaleDisplay(data, sale))
        .filter((sale) => {
          const customer = data.customers.find((item) => item.id === sale.customerId);
          const searchMatch = matchesSearch(
            normalizeSearchValue(sale.customerName, customer?.phoneNumber, sale.staffName),
            filters.search
          );
          const paymentStatusMatch =
            filters.paymentStatus === "all" || sale.paymentStatus === filters.paymentStatus;
          const paymentMethodMatch =
            filters.paymentMethod === "all" || sale.paymentMethod === filters.paymentMethod;
          const fromMatch = !filters.dateFrom || sale.saleDate.slice(0, 10) >= filters.dateFrom;
          const toMatch = !filters.dateTo || sale.saleDate.slice(0, 10) <= filters.dateTo;

          return searchMatch && paymentStatusMatch && paymentMethodMatch && fromMatch && toMatch;
        })
        .sort((left, right) => right.saleDate.localeCompare(left.saleDate)),
    [data, filters]
  );

  const appointmentOptions = data.appointments.map((appointment) =>
    getAppointmentDisplay(data, appointment)
  );
  const serviceOptions = data.services
    .filter((service) => service.isActive)
    .map((service) => ({
      id: service.id,
      label: service.name,
      meta: formatCurrency(service.priceZar)
    }));

  return (
    <div className="space-y-6">
      <AppHeader
        description="Track payment status, method and staff commission per sale before you introduce live backend sync."
        title="Sales tracking"
      />

      <SectionCard
        actions={
          <ExportButton
            label="Export sales CSV"
            onClick={() => {
              downloadCsv(
                "vuma-sales.csv",
                saleRows.map((sale) => ({
                  sale_date: formatDateTime(sale.saleDate),
                  customer_name: sale.customerName,
                  customer_phone:
                    data.customers.find((customer) => customer.id === sale.customerId)
                      ?.phoneNumber ?? "",
                  staff_name: sale.staffName,
                  services: sale.serviceNames.join(" | "),
                  subtotal_zar: sale.subtotalZar,
                  discount_zar: sale.discountZar,
                  total_zar: sale.totalZar,
                  amount_paid_zar: sale.amountPaidZar,
                  payment_status: sale.paymentStatus,
                  payment_method: sale.paymentMethod,
                  commission_rate: sale.commissionRateSnapshot,
                  commission_amount: sale.commissionAmount,
                  notes: sale.notes
                }))
              );
              showSuccessToast("Sales CSV exported.");
            }}
          />
        }
        description="Sales automatically calculate payment status and commission snapshots from the values you enter."
        eyebrow="Payments"
        title={isEditing ? "Edit sale" : "Add sale"}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const salePayload: Sale = {
              id: form.id,
              appointmentId: form.appointmentId || null,
              customerId: form.customerId,
              staffMemberId: form.staffMemberId,
              saleDate: fromDateTimeLocalValue(form.saleDate),
              serviceIds: form.serviceIds,
              subtotalZar: subtotal,
              discountZar: form.discountZar,
              totalZar: total,
              amountPaidZar: form.amountPaidZar,
              paymentStatus,
              paymentMethod: form.paymentMethod,
              commissionRateSnapshot: commissionRate,
              commissionAmount,
              notes: form.notes,
              createdAt: form.createdAt
            };
            const nextErrors = validateSale(salePayload, data);
            setErrors(nextErrors);

            if (hasErrors(nextErrors)) {
              showErrorToast("Please fix the sales form errors before saving.");
              return;
            }

            setIsSaving(true);
            saveSale(salePayload);
            setForm(
              buildSale(
                data.customers.map((customer) => customer.id),
                data.staff.map((member) => member.id)
              )
            );
            setErrors({});
            setIsSaving(false);
            showSuccessToast("Sale saved locally.");
          }}
        >
          <div className="grid gap-4 xl:grid-cols-4">
            <FieldSelect
              label="Link appointment"
              onChange={(event) => {
                const selectedId = event.target.value;
                const appointment = data.appointments.find((item) => item.id === selectedId);
                setForm((current) => ({
                  ...current,
                  appointmentId: selectedId,
                  customerId: appointment?.customerId ?? current.customerId,
                  staffMemberId: appointment?.staffMemberId ?? current.staffMemberId,
                  serviceIds: appointment?.serviceIds ?? current.serviceIds
                }));
              }}
              value={form.appointmentId}
            >
              <option value="">No linked appointment</option>
              {appointmentOptions.map((appointment) => (
                <option key={appointment.id} value={appointment.id}>
                  {appointment.customerName} / {formatDateTime(appointment.startsAt)}
                </option>
              ))}
            </FieldSelect>
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
                setForm((current) => ({
                  ...current,
                  staffMemberId: event.target.value,
                  commissionRateSnapshot:
                    data.staff.find((member) => member.id === event.target.value)
                      ?.commissionRate ?? current.commissionRateSnapshot
                }))
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
              error={errors.saleDate}
              label="Sale date"
              onChange={(event) =>
                setForm((current) => ({ ...current, saleDate: event.target.value }))
              }
              required
              type="datetime-local"
              value={form.saleDate}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
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
                  setForm((current) => ({
                    ...current,
                    serviceIds: current.serviceIds.includes(serviceId)
                      ? current.serviceIds.filter((id) => id !== serviceId)
                      : [...current.serviceIds, serviceId]
                  }))
                }
                selectedIds={form.serviceIds}
              />
            </div>
            <div className="space-y-4 rounded-[26px] bg-secondary/70 p-4">
              <FieldInput label="Subtotal" readOnly value={String(subtotal)} />
              <FieldInput
                error={errors.discountZar}
                label="Discount (ZAR)"
                min={0}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    discountZar: Math.max(Number(event.target.value || 0), 0)
                  }))
                }
                type="number"
                value={String(form.discountZar)}
              />
              <FieldInput label="Total" readOnly value={String(total)} />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-4">
            <FieldInput
              error={errors.amountPaidZar}
              label="Amount paid (ZAR)"
              min={0}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  amountPaidZar: Math.max(Number(event.target.value || 0), 0)
                }))
              }
              type="number"
              value={String(form.amountPaidZar)}
            />
            <FieldSelect
              label="Payment method"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  paymentMethod: event.target.value as Sale["paymentMethod"]
                }))
              }
              value={form.paymentMethod}
            >
              <option value="cash">cash</option>
              <option value="card">card</option>
              <option value="EFT">EFT</option>
            </FieldSelect>
            <FieldInput label="Payment status" readOnly value={paymentStatus} />
            <FieldInput
              error={errors.commissionRateSnapshot}
              label="Commission rate (%)"
              min={0}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  commissionRateSnapshot: Math.max(Number(event.target.value || 0), 0)
                }))
              }
              type="number"
              value={String(commissionRate)}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[24px] bg-card p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Commission preview
              </p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(commissionAmount)}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Snapshot rate: {commissionRate}% of {formatCurrency(total)}
              </p>
            </div>
            <FieldTextarea
              label="Notes"
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
              value={form.notes}
            />
          </div>

          <FormActions
            isEditing={isEditing}
            isLoading={isSaving}
            onCancel={
              isEditing
                ? () => {
                    setForm(
                      buildSale(
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
              onChange={(value) => setSalesFilters({ search: value })}
              placeholder="Search by customer, phone, or staff"
              value={filters.search}
            />
          </div>
        }
        description="Each sale shows both payment status and method, making daily cash-up checks much easier."
        eyebrow="Ledger"
        title="Recorded sales"
      >
        <FilterPanel>
          <FieldSelect
            label="Payment status"
            onChange={(event) =>
              setSalesFilters({
                paymentStatus: event.target.value as typeof filters.paymentStatus
              })
            }
            value={filters.paymentStatus}
          >
            <option value="all">All statuses</option>
            <option value="unpaid">unpaid</option>
            <option value="partial">partial</option>
            <option value="paid">paid</option>
          </FieldSelect>
          <FieldSelect
            label="Payment method"
            onChange={(event) =>
              setSalesFilters({
                paymentMethod: event.target.value as typeof filters.paymentMethod
              })
            }
            value={filters.paymentMethod}
          >
            <option value="all">All methods</option>
            <option value="cash">cash</option>
            <option value="card">card</option>
            <option value="EFT">EFT</option>
          </FieldSelect>
          <FieldInput
            label="Date from"
            onChange={(event) => setSalesFilters({ dateFrom: event.target.value })}
            type="date"
            value={filters.dateFrom}
          />
          <FieldInput
            label="Date to"
            onChange={(event) => setSalesFilters({ dateTo: event.target.value })}
            type="date"
            value={filters.dateTo}
          />
        </FilterPanel>

        <div className="flex justify-end">
          <Button
            onClick={() =>
              setSalesFilters({
                dateFrom: "",
                dateTo: "",
                paymentMethod: "all",
                paymentStatus: "all",
                search: ""
              })
            }
            type="button"
            variant="outline"
          >
            Clear filters
          </Button>
        </div>

        {!saleRows.length ? (
          <EmptyState
            description={
              hasActiveSalesFilters(filters)
                ? "No sales match the current filters."
                : "Create the first sale."
            }
            title={hasActiveSalesFilters(filters) ? "No matching sales" : "No sales yet"}
          />
        ) : (
          <div className="space-y-4">
            {saleRows.map((sale) => (
              <div
                className="rounded-[26px] border border-border/70 bg-background/70 p-5"
                key={sale.id}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">{sale.customerName}</h3>
                      <StatusBadge kind="payment" value={sale.paymentStatus} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {sale.staffName} / {sale.serviceNames.join(" / ") || "No services selected"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      disabled={pendingDeleteId === sale.id}
                      onClick={() => {
                        setForm({
                          id: sale.id,
                          appointmentId: sale.appointmentId ?? "",
                          customerId: sale.customerId,
                          staffMemberId: sale.staffMemberId,
                          saleDate: toDateTimeLocalValue(sale.saleDate),
                          serviceIds: sale.serviceIds,
                          discountZar: sale.discountZar,
                          amountPaidZar: sale.amountPaidZar,
                          paymentMethod: sale.paymentMethod,
                          commissionRateSnapshot: sale.commissionRateSnapshot,
                          notes: sale.notes,
                          createdAt: sale.createdAt
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
                      disabled={pendingDeleteId === sale.id}
                      onClick={() => {
                        setPendingDeleteId(sale.id);
                        deleteSale(sale.id);
                        setPendingDeleteId(null);
                        showSuccessToast("Sale removed.");
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <div className="rounded-2xl bg-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Sale date
                    </p>
                    <p className="mt-2 inline-flex items-center gap-2 text-base font-semibold">
                      <Receipt className="h-4 w-4 text-primary" />
                      {formatDateTime(sale.saleDate)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Payment method
                    </p>
                    <p className="mt-2 inline-flex items-center gap-2 text-base font-semibold">
                      <CreditCard className="h-4 w-4 text-primary" />
                      {formatPaymentMethod(sale.paymentMethod)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Total
                    </p>
                    <p className="mt-2 text-base font-semibold">{formatCurrency(sale.totalZar)}</p>
                  </div>
                  <div className="rounded-2xl bg-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Commission
                    </p>
                    <p className="mt-2 text-base font-semibold">
                      {formatCurrency(sale.commissionAmount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
