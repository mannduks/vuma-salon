export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
] as const;

export const APPOINTMENT_STATUSES = [
  "booked",
  "confirmed",
  "completed",
  "cancelled",
  "no_show"
] as const;

export const PAYMENT_STATUSES = ["unpaid", "partial", "paid"] as const;
export const PAYMENT_METHODS = ["cash", "card", "EFT"] as const;

export type Weekday = (typeof WEEKDAYS)[number];
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type StaffStatus = "active" | "inactive";

export type NavItem = {
  href: string;
  label: string;
};

export type DashboardStat = {
  label: string;
  value: string;
  delta: string;
  tone: "positive" | "neutral" | "warning" | "accent";
};

export type UserProfile = {
  fullName: string;
  role: string;
  salonName: string;
  city: string;
};

export type OpeningHours = {
  day: Weekday;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

export type SalonSetup = {
  salonName: string;
  ownerName: string;
  phoneNumber: string;
  openingHours: OpeningHours[];
};

export type Customer = {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  notes: string;
  loyaltyPoints: number;
  createdAt: string;
};

export type StaffMember = {
  id: string;
  fullName: string;
  roleTitle: string;
  mobile: string;
  email: string;
  commissionRate: number;
  status: StaffStatus;
  speciality: string;
  createdAt: string;
};

export type Service = {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  priceZar: number;
  isActive: boolean;
  description: string;
  createdAt: string;
};

export type Appointment = {
  id: string;
  customerId: string;
  staffMemberId: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  totalAmount: number;
  notes: string;
  serviceIds: string[];
  createdAt: string;
};

export type Sale = {
  id: string;
  appointmentId: string | null;
  customerId: string;
  staffMemberId: string;
  saleDate: string;
  serviceIds: string[];
  subtotalZar: number;
  discountZar: number;
  totalZar: number;
  amountPaidZar: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  commissionRateSnapshot: number;
  commissionAmount: number;
  notes: string;
  createdAt: string;
};

export type CustomerVisit = {
  id: string;
  customerId: string;
  date: string;
  source: "appointment" | "sale";
  summary: string;
  amountZar: number;
  status: AppointmentStatus | PaymentStatus;
  staffName: string;
};

export type SalonDataSnapshot = {
  version: number;
  setup: SalonSetup;
  customers: Customer[];
  staff: StaffMember[];
  services: Service[];
  appointments: Appointment[];
  sales: Sale[];
};

export type CustomerFilters = {
  search: string;
};

export type StaffFilters = {
  search: string;
};

export type AppointmentFilters = {
  search: string;
  status: "all" | AppointmentStatus;
  date: string;
  staffMemberId: "all" | string;
};

export type SalesFilters = {
  search: string;
  paymentStatus: "all" | PaymentStatus;
  paymentMethod: "all" | PaymentMethod;
  dateFrom: string;
  dateTo: string;
};

export type SalonFilters = {
  appointments: AppointmentFilters;
  customers: CustomerFilters;
  sales: SalesFilters;
  staff: StaffFilters;
};

export type SalonUiState = {
  filters: SalonFilters;
  lastBackupAt: string | null;
};

export type SalonBackupFile = {
  app: "vuma-salon-private-beta";
  data: SalonDataSnapshot;
  exportedAt: string;
  schemaVersion: number;
};

export type OperationResult = {
  ok: boolean;
  message?: string;
};
