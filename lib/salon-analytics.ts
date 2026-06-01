import { formatAppointmentStatus, formatPaymentStatus } from "@/lib/formatters";
import type {
  Appointment,
  Customer,
  CustomerVisit,
  DashboardStat,
  Sale,
  SalonDataSnapshot,
  Service,
  StaffMember,
  Weekday
} from "@/lib/types";

export function getServiceTotal(serviceIds: string[], services: Service[]) {
  return serviceIds.reduce((sum, id) => {
    const service = services.find((item) => item.id === id);
    return sum + (service?.priceZar ?? 0);
  }, 0);
}

export function getCustomerById(customers: Customer[], customerId: string) {
  return customers.find((customer) => customer.id === customerId);
}

export function getStaffById(staff: StaffMember[], staffId: string) {
  return staff.find((member) => member.id === staffId);
}

export function getServiceNames(serviceIds: string[], services: Service[]) {
  return serviceIds
    .map((serviceId) => services.find((service) => service.id === serviceId)?.name)
    .filter(Boolean) as string[];
}

export function getCustomerMetrics(snapshot: SalonDataSnapshot, customerId: string) {
  const visits = getCustomerVisitHistory(snapshot, customerId);
  const totalSpend = snapshot.sales
    .filter((sale) => sale.customerId === customerId)
    .reduce((sum, sale) => sum + sale.totalZar, 0);
  const lastVisitAt = visits[0]?.date ?? "";

  return {
    totalSpend,
    totalVisits: visits.length,
    lastVisitAt,
    segment:
      totalSpend >= 3000 ? "VIP" : visits.length >= 4 ? "Returning" : "New"
  };
}

export function getCustomerVisitHistory(
  snapshot: SalonDataSnapshot,
  customerId: string
): CustomerVisit[] {
  const appointmentVisits = snapshot.appointments
    .filter(
      (appointment) =>
        appointment.customerId === customerId && appointment.status === "completed"
    )
    .map((appointment) => ({
      id: `visit-appointment-${appointment.id}`,
      customerId,
      date: appointment.startsAt,
      source: "appointment" as const,
      summary:
        getServiceNames(appointment.serviceIds, snapshot.services).join(" / ") ||
        "Completed appointment",
      amountZar: appointment.totalAmount,
      status: appointment.status,
      staffName:
        getStaffById(snapshot.staff, appointment.staffMemberId)?.fullName ??
        "Unassigned"
    }));

  const salesVisits = snapshot.sales
    .filter((sale) => sale.customerId === customerId)
    .map((sale) => ({
      id: `visit-sale-${sale.id}`,
      customerId,
      date: sale.saleDate,
      source: "sale" as const,
      summary:
        getServiceNames(sale.serviceIds, snapshot.services).join(" / ") || "Retail sale",
      amountZar: sale.totalZar,
      status: sale.paymentStatus,
      staffName: getStaffById(snapshot.staff, sale.staffMemberId)?.fullName ?? "Desk"
    }));

  return [...appointmentVisits, ...salesVisits].sort((left, right) =>
    right.date.localeCompare(left.date)
  );
}

export function getAppointmentDisplay(snapshot: SalonDataSnapshot, appointment: Appointment) {
  return {
    ...appointment,
    customerName:
      getCustomerById(snapshot.customers, appointment.customerId)?.fullName ?? "Guest",
    staffName:
      getStaffById(snapshot.staff, appointment.staffMemberId)?.fullName ?? "Unassigned",
    serviceNames: getServiceNames(appointment.serviceIds, snapshot.services)
  };
}

export function getSaleDisplay(snapshot: SalonDataSnapshot, sale: Sale) {
  return {
    ...sale,
    customerName: getCustomerById(snapshot.customers, sale.customerId)?.fullName ?? "Guest",
    staffName: getStaffById(snapshot.staff, sale.staffMemberId)?.fullName ?? "Unassigned",
    serviceNames: getServiceNames(sale.serviceIds, snapshot.services)
  };
}

export function getDashboardStats(snapshot: SalonDataSnapshot): DashboardStat[] {
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const monthlySales = snapshot.sales.filter((sale) => sale.saleDate.startsWith(currentMonthKey));
  const monthlyRevenue = monthlySales.reduce((sum, sale) => sum + sale.totalZar, 0);
  const monthlyCollected = monthlySales.reduce((sum, sale) => sum + sale.amountPaidZar, 0);
  const unpaidBalance = monthlySales.reduce(
    (sum, sale) => sum + Math.max(sale.totalZar - sale.amountPaidZar, 0),
    0
  );
  const todayKey = new Date().toISOString().slice(0, 10);
  const appointmentsToday = snapshot.appointments.filter((appointment) =>
    appointment.startsAt.startsWith(todayKey)
  );
  const activeStaff = snapshot.staff.filter((member) => member.status === "active").length;

  return [
    {
      label: "Monthly revenue",
      value: `R${monthlyRevenue.toLocaleString("en-ZA")}`,
      delta: `Collected R${monthlyCollected.toLocaleString("en-ZA")} so far`,
      tone: "positive"
    },
    {
      label: "Appointments today",
      value: String(appointmentsToday.length),
      delta: `${appointmentsToday.filter((item) => item.status === "confirmed").length} confirmed`,
      tone: "accent"
    },
    {
      label: "Active staff",
      value: String(activeStaff),
      delta: `${snapshot.staff.length - activeStaff} inactive right now`,
      tone: "neutral"
    },
    {
      label: "Outstanding balance",
      value: `R${unpaidBalance.toLocaleString("en-ZA")}`,
      delta:
        unpaidBalance > 0
          ? "Follow up on partial and unpaid sales"
          : "All tracked sales are settled",
      tone: unpaidBalance > 0 ? "warning" : "positive"
    }
  ];
}

export function getRevenueSeries(snapshot: SalonDataSnapshot, months = 5) {
  const baseDate = new Date();

  return Array.from({ length: months }).map((_, index) => {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - (months - 1 - index), 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const revenue = snapshot.sales
      .filter((sale) => sale.saleDate.startsWith(key))
      .reduce((sum, sale) => sum + sale.totalZar, 0);
    const collected = snapshot.sales
      .filter((sale) => sale.saleDate.startsWith(key))
      .reduce((sum, sale) => sum + sale.amountPaidZar, 0);

    return {
      key,
      month: date.toLocaleString("en-ZA", { month: "short" }),
      revenue,
      collected,
      target: Math.max(revenue + 15000, 50000)
    };
  });
}

export function getStaffPerformance(snapshot: SalonDataSnapshot, staffId: string) {
  const sales = snapshot.sales.filter((sale) => sale.staffMemberId === staffId);
  const totalSales = sales.reduce((sum, sale) => sum + sale.totalZar, 0);
  const commissionEarned = sales.reduce((sum, sale) => sum + sale.commissionAmount, 0);
  const completedAppointments = snapshot.appointments.filter(
    (appointment) =>
      appointment.staffMemberId === staffId && appointment.status === "completed"
  ).length;

  return {
    totalSales,
    commissionEarned,
    completedAppointments
  };
}

export function getPaymentMix(snapshot: SalonDataSnapshot) {
  return {
    cash: snapshot.sales.filter((sale) => sale.paymentMethod === "cash").length,
    card: snapshot.sales.filter((sale) => sale.paymentMethod === "card").length,
    EFT: snapshot.sales.filter((sale) => sale.paymentMethod === "EFT").length
  };
}

export function getAppointmentStatusBreakdown(snapshot: SalonDataSnapshot) {
  return snapshot.appointments.reduce<Record<string, number>>((accumulator, appointment) => {
    const key = formatAppointmentStatus(appointment.status);
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
}

export function getPaymentStatusBreakdown(snapshot: SalonDataSnapshot) {
  return snapshot.sales.reduce<Record<string, number>>((accumulator, sale) => {
    const key = formatPaymentStatus(sale.paymentStatus);
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
}

export function getOpeningDaysLabel(openingHours: SalonDataSnapshot["setup"]["openingHours"]) {
  const openDays = openingHours.filter((day) => day.isOpen).map((day) => day.day);

  if (!openDays.length) {
    return "No opening days configured";
  }

  return openDays.join(", ");
}

export function getTodayHours(
  openingHours: SalonDataSnapshot["setup"]["openingHours"],
  dayName?: Weekday
) {
  const today =
    dayName ??
    (new Intl.DateTimeFormat("en-US", {
      weekday: "long"
    }).format(new Date()) as Weekday);
  const hours = openingHours.find((item) => item.day === today);

  if (!hours || !hours.isOpen) {
    return "Closed today";
  }

  return `${hours.openTime} - ${hours.closeTime}`;
}

export function getDeletionBlockMessage(
  snapshot: SalonDataSnapshot,
  entity: "customer" | "staff" | "service" | "appointment",
  id: string
) {
  if (entity === "customer") {
    const hasLinks =
      snapshot.appointments.some((appointment) => appointment.customerId === id) ||
      snapshot.sales.some((sale) => sale.customerId === id);
    return hasLinks ? "Delete linked appointments and sales first." : "";
  }

  if (entity === "staff") {
    const hasLinks =
      snapshot.appointments.some((appointment) => appointment.staffMemberId === id) ||
      snapshot.sales.some((sale) => sale.staffMemberId === id);
    return hasLinks ? "Delete linked appointments and sales first." : "";
  }

  if (entity === "service") {
    const hasLinks =
      snapshot.appointments.some((appointment) => appointment.serviceIds.includes(id)) ||
      snapshot.sales.some((sale) => sale.serviceIds.includes(id));
    return hasLinks ? "Delete linked appointments and sales first." : "";
  }

  const hasSale = snapshot.sales.some((sale) => sale.appointmentId === id);
  return hasSale ? "Delete the linked sale before removing this appointment." : "";
}
