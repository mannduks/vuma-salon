import type {
  AppointmentFilters,
  CustomerFilters,
  SalesFilters,
  StaffFilters
} from "@/lib/types";

export function matchesSearch(haystack: string, search: string) {
  return haystack.toLowerCase().includes(search.trim().toLowerCase());
}

export function normalizeSearchValue(...parts: Array<string | undefined>) {
  return parts
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function hasActiveCustomerFilters(filters: CustomerFilters) {
  return Boolean(filters.search.trim());
}

export function hasActiveStaffFilters(filters: StaffFilters) {
  return Boolean(filters.search.trim());
}

export function hasActiveAppointmentFilters(filters: AppointmentFilters) {
  return Boolean(
    filters.search.trim() ||
      filters.status !== "all" ||
      filters.date ||
      filters.staffMemberId !== "all"
  );
}

export function hasActiveSalesFilters(filters: SalesFilters) {
  return Boolean(
    filters.search.trim() ||
      filters.paymentStatus !== "all" ||
      filters.paymentMethod !== "all" ||
      filters.dateFrom ||
      filters.dateTo
  );
}
