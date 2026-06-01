import type { AppointmentStatus, PaymentMethod, PaymentStatus, StaffStatus } from "@/lib/types";

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDate(value: string) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function formatTime(value: string) {
  if (!value) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("en-ZA", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatDateTime(value: string) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function toDateTimeLocalValue(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function fromDateTimeLocalValue(value: string) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString();
}

export function formatAppointmentStatus(status: AppointmentStatus) {
  return status.replace("_", " ");
}

export function formatPaymentStatus(status: PaymentStatus) {
  return status;
}

export function formatPaymentMethod(method: PaymentMethod) {
  return method;
}

export function formatStaffStatus(status: StaffStatus) {
  return status === "active" ? "Active" : "Inactive";
}
