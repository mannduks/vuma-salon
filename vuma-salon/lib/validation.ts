import type {
  Appointment,
  Customer,
  Sale,
  SalonDataSnapshot,
  SalonSetup,
  Service,
  StaffMember
} from "@/lib/types";

export type ValidationErrors<T extends string> = Partial<Record<T, string>>;

const PHONE_REGEX = /^\+?[0-9][0-9\s-]{7,15}$/;

export function validatePhoneNumber(phoneNumber: string) {
  return PHONE_REGEX.test(phoneNumber.trim());
}

export function validateSetup(setup: SalonSetup) {
  const errors: ValidationErrors<"ownerName" | "phoneNumber" | "salonName" | "openingHours"> = {};

  if (!setup.salonName.trim()) {
    errors.salonName = "Salon name is required.";
  }

  if (!setup.ownerName.trim()) {
    errors.ownerName = "Owner name is required.";
  }

  if (!setup.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required.";
  } else if (!validatePhoneNumber(setup.phoneNumber)) {
    errors.phoneNumber = "Enter a valid phone number.";
  }

  const invalidHours = setup.openingHours.some(
    (hours) => hours.isOpen && (!hours.openTime || !hours.closeTime || hours.openTime >= hours.closeTime)
  );

  if (invalidHours) {
    errors.openingHours = "Each open day needs a valid opening and closing time.";
  }

  return errors;
}

export function validateCustomer(customer: Customer) {
  const errors: ValidationErrors<"fullName" | "phoneNumber"> = {};

  if (!customer.fullName.trim()) {
    errors.fullName = "Customer name is required.";
  }

  if (!customer.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required.";
  } else if (!validatePhoneNumber(customer.phoneNumber)) {
    errors.phoneNumber = "Enter a valid phone number.";
  }

  return errors;
}

export function validateStaffMember(staffMember: StaffMember) {
  const errors: ValidationErrors<"commissionRate" | "fullName" | "mobile" | "roleTitle"> = {};

  if (!staffMember.fullName.trim()) {
    errors.fullName = "Staff name is required.";
  }

  if (!staffMember.roleTitle.trim()) {
    errors.roleTitle = "Role title is required.";
  }

  if (!staffMember.mobile.trim()) {
    errors.mobile = "Mobile number is required.";
  } else if (!validatePhoneNumber(staffMember.mobile)) {
    errors.mobile = "Enter a valid mobile number.";
  }

  if (staffMember.commissionRate < 0) {
    errors.commissionRate = "Commission cannot be negative.";
  }

  return errors;
}

export function validateService(
  service: Service,
  services: Service[]
) {
  const errors: ValidationErrors<"description" | "durationMinutes" | "name" | "priceZar"> = {};

  if (!service.name.trim()) {
    errors.name = "Service name is required.";
  }

  const duplicate = services.find(
    (existingService) =>
      existingService.id !== service.id &&
      existingService.name.trim().toLowerCase() === service.name.trim().toLowerCase()
  );

  if (duplicate) {
    errors.name = "Service names must be unique.";
  }

  if (service.durationMinutes <= 0) {
    errors.durationMinutes = "Duration must be greater than 0 minutes.";
  }

  if (service.priceZar < 0) {
    errors.priceZar = "Price cannot be negative.";
  }

  return errors;
}

export function validateAppointment(
  appointment: Appointment,
  data: SalonDataSnapshot
) {
  const errors: ValidationErrors<
    "customerId" | "endsAt" | "serviceIds" | "staffMemberId" | "startsAt" | "totalAmount"
  > = {};

  if (!appointment.customerId) {
    errors.customerId = "Select a customer.";
  }

  if (!appointment.staffMemberId) {
    errors.staffMemberId = "Select a staff member.";
  }

  if (!appointment.serviceIds.length) {
    errors.serviceIds = "Select at least one service.";
  }

  if (!appointment.startsAt) {
    errors.startsAt = "Start time is required.";
  }

  if (!appointment.endsAt) {
    errors.endsAt = "End time is required.";
  }

  if (appointment.startsAt && appointment.endsAt) {
    const start = new Date(appointment.startsAt);
    const end = new Date(appointment.endsAt);

    if (Number.isNaN(start.getTime())) {
      errors.startsAt = "Enter a valid start time.";
    } else if (Number.isNaN(end.getTime())) {
      errors.endsAt = "Enter a valid end time.";
    } else if (end <= start) {
      errors.endsAt = "End time must be after start time.";
    }
  }

  if (appointment.totalAmount < 0) {
    errors.totalAmount = "Total amount cannot be negative.";
  }

  const missingCustomer = !data.customers.some((customer) => customer.id === appointment.customerId);
  const missingStaff = !data.staff.some((staffMember) => staffMember.id === appointment.staffMemberId);

  if (appointment.customerId && missingCustomer) {
    errors.customerId = "Selected customer no longer exists.";
  }

  if (appointment.staffMemberId && missingStaff) {
    errors.staffMemberId = "Selected staff member no longer exists.";
  }

  return errors;
}

export function validateSale(sale: Sale, data: SalonDataSnapshot) {
  const errors: ValidationErrors<
    | "amountPaidZar"
    | "commissionRateSnapshot"
    | "customerId"
    | "discountZar"
    | "saleDate"
    | "serviceIds"
    | "staffMemberId"
  > = {};

  if (!sale.customerId) {
    errors.customerId = "Select a customer.";
  }

  if (!sale.staffMemberId) {
    errors.staffMemberId = "Select a staff member.";
  }

  if (!sale.saleDate) {
    errors.saleDate = "Sale date is required.";
  } else if (Number.isNaN(new Date(sale.saleDate).getTime())) {
    errors.saleDate = "Enter a valid sale date.";
  }

  if (!sale.serviceIds.length) {
    errors.serviceIds = "Select at least one service.";
  }

  if (sale.discountZar < 0) {
    errors.discountZar = "Discount cannot be negative.";
  }

  if (sale.amountPaidZar < 0) {
    errors.amountPaidZar = "Amount paid cannot be negative.";
  }

  if (sale.amountPaidZar > sale.totalZar) {
    errors.amountPaidZar = "Amount paid cannot be greater than the sale total.";
  }

  if (sale.commissionRateSnapshot < 0) {
    errors.commissionRateSnapshot = "Commission rate cannot be negative.";
  }

  const missingCustomer = !data.customers.some((customer) => customer.id === sale.customerId);
  const missingStaff = !data.staff.some((staffMember) => staffMember.id === sale.staffMemberId);

  if (sale.customerId && missingCustomer) {
    errors.customerId = "Selected customer no longer exists.";
  }

  if (sale.staffMemberId && missingStaff) {
    errors.staffMemberId = "Selected staff member no longer exists.";
  }

  return errors;
}

export function hasErrors<T extends string>(errors: ValidationErrors<T>) {
  return Object.values(errors).some(Boolean);
}
