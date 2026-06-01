import type {
  Appointment,
  Customer,
  OpeningHours,
  Sale,
  SalonFilters,
  SalonUiState,
  SalonDataSnapshot,
  Service,
  StaffMember,
  UserProfile
} from "@/lib/types";

export const SALON_DATA_VERSION = 2;
export const UI_STATE_VERSION = 1;

export const demoProfile: UserProfile = {
  fullName: "Nandi Mokoena",
  role: "Owner",
  salonName: "VUMA Salon Braam",
  city: "Johannesburg"
};

export const defaultOpeningHours: OpeningHours[] = [
  { day: "Monday", isOpen: true, openTime: "08:00", closeTime: "18:00" },
  { day: "Tuesday", isOpen: true, openTime: "08:00", closeTime: "18:00" },
  { day: "Wednesday", isOpen: true, openTime: "08:00", closeTime: "18:00" },
  { day: "Thursday", isOpen: true, openTime: "08:00", closeTime: "18:00" },
  { day: "Friday", isOpen: true, openTime: "08:00", closeTime: "19:00" },
  { day: "Saturday", isOpen: true, openTime: "08:00", closeTime: "17:00" },
  { day: "Sunday", isOpen: false, openTime: "09:00", closeTime: "14:00" }
];

const createdAt = "2026-05-01T08:00:00.000Z";

export const seedCustomers: Customer[] = [
  {
    id: "cust-1",
    fullName: "Ayanda Mthembu",
    phoneNumber: "+27 82 114 2098",
    email: "ayanda@example.com",
    notes: "Prefers Friday evening touch-ups.",
    loyaltyPoints: 120,
    createdAt
  },
  {
    id: "cust-2",
    fullName: "Karabo Dlamini",
    phoneNumber: "+27 71 566 1240",
    email: "karabo@example.com",
    notes: "Books beard grooming before content shoots.",
    loyaltyPoints: 78,
    createdAt
  },
  {
    id: "cust-3",
    fullName: "Zanele Sithole",
    phoneNumber: "+27 83 441 0023",
    email: "zanele@example.com",
    notes: "First-time colour client.",
    loyaltyPoints: 22,
    createdAt
  },
  {
    id: "cust-4",
    fullName: "Lwazi Ngcobo",
    phoneNumber: "+27 67 845 7781",
    email: "lwazi@example.com",
    notes: "Comes in with walk-in referrals from campus.",
    loyaltyPoints: 65,
    createdAt
  }
];

export const seedStaff: StaffMember[] = [
  {
    id: "staff-1",
    fullName: "Busi Khumalo",
    roleTitle: "Senior Stylist",
    mobile: "+27 76 441 6631",
    email: "busi@vuma.example",
    commissionRate: 18,
    status: "active",
    speciality: "Protective styling and silk press",
    createdAt
  },
  {
    id: "staff-2",
    fullName: "Thato Maseko",
    roleTitle: "Barber",
    mobile: "+27 72 881 9301",
    email: "thato@vuma.example",
    commissionRate: 15,
    status: "active",
    speciality: "Precision fades and beard shaping",
    createdAt
  },
  {
    id: "staff-3",
    fullName: "Palesa Ndlovu",
    roleTitle: "Colour Specialist",
    mobile: "+27 78 120 4519",
    email: "palesa@vuma.example",
    commissionRate: 20,
    status: "inactive",
    speciality: "Colour correction and treatments",
    createdAt
  }
];

export const seedServices: Service[] = [
  {
    id: "svc-1",
    name: "Signature Silk Press",
    category: "Haircare",
    durationMinutes: 90,
    priceZar: 650,
    isActive: true,
    description: "Wash, treatment, blowout and silk finish.",
    createdAt
  },
  {
    id: "svc-2",
    name: "Skin Fade + Beard Lineup",
    category: "Barbering",
    durationMinutes: 60,
    priceZar: 240,
    isActive: true,
    description: "Sharp fade, beard clean-up and hot towel finish.",
    createdAt
  },
  {
    id: "svc-3",
    name: "Knotless Braids",
    category: "Protective Styling",
    durationMinutes: 240,
    priceZar: 1300,
    isActive: true,
    description: "Medium knotless install with parting and finish.",
    createdAt
  },
  {
    id: "svc-4",
    name: "Colour Refresh",
    category: "Colour",
    durationMinutes: 150,
    priceZar: 950,
    isActive: true,
    description: "Root refresh, gloss and bond care.",
    createdAt
  },
  {
    id: "svc-5",
    name: "Scalp Detox",
    category: "Treatments",
    durationMinutes: 45,
    priceZar: 220,
    isActive: true,
    description: "Clarifying exfoliation and hydration boost.",
    createdAt
  }
];

export const seedAppointments: Appointment[] = [
  {
    id: "apt-1",
    customerId: "cust-1",
    staffMemberId: "staff-1",
    startsAt: "2026-05-27T07:00:00.000Z",
    endsAt: "2026-05-27T08:30:00.000Z",
    status: "confirmed",
    totalAmount: 650,
    notes: "Arrives before work. Keep silk serum ready.",
    serviceIds: ["svc-1"],
    createdAt
  },
  {
    id: "apt-2",
    customerId: "cust-2",
    staffMemberId: "staff-2",
    startsAt: "2026-05-27T09:00:00.000Z",
    endsAt: "2026-05-27T10:00:00.000Z",
    status: "booked",
    totalAmount: 240,
    notes: "Content shoot later in the day.",
    serviceIds: ["svc-2"],
    createdAt
  },
  {
    id: "apt-3",
    customerId: "cust-3",
    staffMemberId: "staff-3",
    startsAt: "2026-05-27T11:30:00.000Z",
    endsAt: "2026-05-27T14:00:00.000Z",
    status: "booked",
    totalAmount: 1170,
    notes: "Patch test already completed.",
    serviceIds: ["svc-4", "svc-5"],
    createdAt
  },
  {
    id: "apt-4",
    customerId: "cust-4",
    staffMemberId: "staff-2",
    startsAt: "2026-05-26T15:00:00.000Z",
    endsAt: "2026-05-26T16:00:00.000Z",
    status: "completed",
    totalAmount: 240,
    notes: "Campus promo redeemed.",
    serviceIds: ["svc-2"],
    createdAt
  }
];

export const seedSales: Sale[] = [
  {
    id: "sale-1",
    appointmentId: "apt-4",
    customerId: "cust-4",
    staffMemberId: "staff-2",
    saleDate: "2026-05-26T16:10:00.000Z",
    serviceIds: ["svc-2"],
    subtotalZar: 240,
    discountZar: 0,
    totalZar: 240,
    amountPaidZar: 240,
    paymentStatus: "paid",
    paymentMethod: "card",
    commissionRateSnapshot: 15,
    commissionAmount: 36,
    notes: "Walk-in sale closed at desk.",
    createdAt
  },
  {
    id: "sale-2",
    appointmentId: null,
    customerId: "cust-1",
    staffMemberId: "staff-1",
    saleDate: "2026-05-24T15:45:00.000Z",
    serviceIds: ["svc-1"],
    subtotalZar: 650,
    discountZar: 50,
    totalZar: 600,
    amountPaidZar: 300,
    paymentStatus: "partial",
    paymentMethod: "EFT",
    commissionRateSnapshot: 18,
    commissionAmount: 108,
    notes: "Deposit settled, balance due on Friday.",
    createdAt
  },
  {
    id: "sale-3",
    appointmentId: null,
    customerId: "cust-3",
    staffMemberId: "staff-3",
    saleDate: "2026-05-22T13:20:00.000Z",
    serviceIds: ["svc-4", "svc-5"],
    subtotalZar: 1170,
    discountZar: 0,
    totalZar: 1170,
    amountPaidZar: 1170,
    paymentStatus: "paid",
    paymentMethod: "card",
    commissionRateSnapshot: 20,
    commissionAmount: 234,
    notes: "Colour refresh package.",
    createdAt
  }
];

export function createSeedState(profile?: Partial<UserProfile>): SalonDataSnapshot {
  return {
    version: SALON_DATA_VERSION,
    setup: {
      salonName: profile?.salonName ?? demoProfile.salonName,
      ownerName: profile?.fullName ?? demoProfile.fullName,
      phoneNumber: "+27 82 900 1100",
      openingHours: defaultOpeningHours
    },
    customers: seedCustomers,
    staff: seedStaff,
    services: seedServices,
    appointments: seedAppointments,
    sales: seedSales
  };
}

export function createDefaultFilters(): SalonFilters {
  return {
    appointments: {
      search: "",
      status: "all",
      date: "",
      staffMemberId: "all"
    },
    customers: {
      search: ""
    },
    sales: {
      search: "",
      paymentStatus: "all",
      paymentMethod: "all",
      dateFrom: "",
      dateTo: ""
    },
    staff: {
      search: ""
    }
  };
}

export function createDefaultUiState(): SalonUiState {
  return {
    filters: createDefaultFilters(),
    lastBackupAt: null
  };
}
