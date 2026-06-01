"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import { LocalStorageSalonAdapter } from "@/lib/local-storage-adapter";
import { createBackupFile, parseBackupFile } from "@/lib/backup";
import { createDefaultUiState, createSeedState } from "@/lib/mock-data";
import { getDeletionBlockMessage, getServiceTotal } from "@/lib/salon-analytics";
import type {
  Appointment,
  AppointmentFilters,
  CustomerFilters,
  OperationResult,
  PaymentStatus,
  Sale,
  SalonBackupFile,
  SalonDataSnapshot,
  SalonSetup,
  SalesFilters,
  Service,
  StaffFilters,
  StaffMember,
  SalonUiState,
  UserProfile
} from "@/lib/types";

type SalonStoreContextValue = {
  data: SalonDataSnapshot;
  hydrated: boolean;
  importBackupFile: (raw: string) => SalonBackupFile;
  lastBackupAt: string | null;
  lastSavedAt: string | null;
  mode: "demo" | "supabase";
  profile: UserProfile;
  restoreBackup: (backup: SalonBackupFile) => void;
  resetDemoData: () => void;
  saveAppointment: (appointment: Appointment) => void;
  saveCustomer: (customer: SalonDataSnapshot["customers"][number]) => void;
  saveSale: (sale: Sale) => void;
  saveService: (service: Service) => void;
  saveSetup: (setup: SalonSetup) => void;
  saveStaff: (staffMember: StaffMember) => void;
  setAppointmentFilters: (filters: Partial<AppointmentFilters>) => void;
  setCustomerFilters: (filters: Partial<CustomerFilters>) => void;
  setAppointmentStatus: (appointmentId: string, status: Appointment["status"]) => void;
  setSalesFilters: (filters: Partial<SalesFilters>) => void;
  setStaffFilters: (filters: Partial<StaffFilters>) => void;
  uiState: SalonUiState;
  exportBackup: () => SalonBackupFile;
  deleteAppointment: (appointmentId: string) => OperationResult;
  deleteCustomer: (customerId: string) => OperationResult;
  deleteSale: (saleId: string) => OperationResult;
  deleteService: (serviceId: string) => OperationResult;
  deleteStaff: (staffId: string) => OperationResult;
};

const SalonStoreContext = createContext<SalonStoreContextValue | null>(null);
const adapter = new LocalStorageSalonAdapter();

type SalonStoreProviderProps = {
  children: ReactNode;
  initialProfile: UserProfile;
  mode: "demo" | "supabase";
};

export function SalonStoreProvider({
  children,
  initialProfile,
  mode
}: SalonStoreProviderProps) {
  const [data, setData] = useState<SalonDataSnapshot>(() => createSeedState(initialProfile));
  const [hydrated, setHydrated] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [uiState, setUiState] = useState<SalonUiState>(() => createDefaultUiState());

  useEffect(() => {
    const loaded = adapter.load(initialProfile);
    const loadedUiState = adapter.loadUiState();
    setData(loaded);
    setUiState(loadedUiState);
    setHydrated(true);
  }, [initialProfile]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    adapter.save(data);
    setLastSavedAt(new Date().toISOString());
  }, [data, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    adapter.saveUiState(uiState);
  }, [hydrated, uiState]);

  const profile = useMemo<UserProfile>(
    () => ({
      ...initialProfile,
      fullName: data.setup.ownerName || initialProfile.fullName,
      salonName: data.setup.salonName || initialProfile.salonName
    }),
    [data.setup.ownerName, data.setup.salonName, initialProfile]
  );

  const value = useMemo<SalonStoreContextValue>(
    () => ({
      data,
      hydrated,
      importBackupFile(raw) {
        return parseBackupFile(raw);
      },
      lastBackupAt: uiState.lastBackupAt,
      lastSavedAt,
      mode,
      profile,
      restoreBackup(backup) {
        setData(backup.data);
        setUiState((current) => ({
          ...current,
          lastBackupAt: backup.exportedAt
        }));
      },
      resetDemoData() {
        setData(createSeedState(initialProfile));
        setUiState(createDefaultUiState());
      },
      saveSetup(setup) {
        setData((current) => ({
          ...current,
          setup
        }));
      },
      saveCustomer(customer) {
        setData((current) => ({
          ...current,
          customers: upsertById(current.customers, {
            ...customer,
            createdAt: customer.createdAt || new Date().toISOString()
          })
        }));
      },
      saveStaff(staffMember) {
        setData((current) => ({
          ...current,
          staff: upsertById(current.staff, {
            ...staffMember,
            createdAt: staffMember.createdAt || new Date().toISOString()
          })
        }));
      },
      saveService(service) {
        setData((current) => ({
          ...current,
          services: upsertById(current.services, {
            ...service,
            createdAt: service.createdAt || new Date().toISOString()
          })
        }));
      },
      saveAppointment(appointment) {
        setData((current) => ({
          ...current,
          appointments: upsertById(current.appointments, {
            ...appointment,
            totalAmount:
              appointment.totalAmount > 0
                ? appointment.totalAmount
                : getServiceTotal(appointment.serviceIds, current.services),
            createdAt: appointment.createdAt || new Date().toISOString()
          })
        }));
      },
      setAppointmentStatus(appointmentId, status) {
        setData((current) => ({
          ...current,
          appointments: current.appointments.map((appointment) =>
            appointment.id === appointmentId ? { ...appointment, status } : appointment
          )
        }));
      },
      setAppointmentFilters(filters) {
        setUiState((current) => ({
          ...current,
          filters: {
            ...current.filters,
            appointments: {
              ...current.filters.appointments,
              ...filters
            }
          }
        }));
      },
      setCustomerFilters(filters) {
        setUiState((current) => ({
          ...current,
          filters: {
            ...current.filters,
            customers: {
              ...current.filters.customers,
              ...filters
            }
          }
        }));
      },
      saveSale(sale) {
        setData((current) => {
          const staffRate =
            current.staff.find((member) => member.id === sale.staffMemberId)?.commissionRate ??
            sale.commissionRateSnapshot;
          const subtotal =
            sale.subtotalZar > 0
              ? sale.subtotalZar
              : getServiceTotal(sale.serviceIds, current.services);
          const total = Math.max(subtotal - sale.discountZar, 0);
          const amountPaid = Math.max(sale.amountPaidZar, 0);

          return {
            ...current,
            sales: upsertById(current.sales, {
              ...sale,
              appointmentId: sale.appointmentId || null,
              subtotalZar: subtotal,
              totalZar: total,
              paymentStatus: getPaymentStatus(total, amountPaid),
              commissionRateSnapshot: sale.commissionRateSnapshot || staffRate,
              commissionAmount: roundCurrency(
                total * ((sale.commissionRateSnapshot || staffRate) / 100)
              ),
              createdAt: sale.createdAt || new Date().toISOString()
            })
          };
        });
      },
      setSalesFilters(filters) {
        setUiState((current) => ({
          ...current,
          filters: {
            ...current.filters,
            sales: {
              ...current.filters.sales,
              ...filters
            }
          }
        }));
      },
      setStaffFilters(filters) {
        setUiState((current) => ({
          ...current,
          filters: {
            ...current.filters,
            staff: {
              ...current.filters.staff,
              ...filters
            }
          }
        }));
      },
      uiState,
      exportBackup() {
        const backup = createBackupFile(data);
        setUiState((current) => ({
          ...current,
          lastBackupAt: backup.exportedAt
        }));
        return backup;
      },
      deleteCustomer(customerId) {
        const reason = getDeletionBlockMessage(data, "customer", customerId);

        if (reason) {
          return { ok: false, message: reason };
        }

        setData((current) => ({
          ...current,
          customers: current.customers.filter((customer) => customer.id !== customerId)
        }));
        return { ok: true };
      },
      deleteStaff(staffId) {
        const reason = getDeletionBlockMessage(data, "staff", staffId);

        if (reason) {
          return { ok: false, message: reason };
        }

        setData((current) => ({
          ...current,
          staff: current.staff.filter((member) => member.id !== staffId)
        }));
        return { ok: true };
      },
      deleteService(serviceId) {
        const reason = getDeletionBlockMessage(data, "service", serviceId);

        if (reason) {
          return { ok: false, message: reason };
        }

        setData((current) => ({
          ...current,
          services: current.services.filter((service) => service.id !== serviceId)
        }));
        return { ok: true };
      },
      deleteAppointment(appointmentId) {
        const reason = getDeletionBlockMessage(data, "appointment", appointmentId);

        if (reason) {
          return { ok: false, message: reason };
        }

        setData((current) => ({
          ...current,
          appointments: current.appointments.filter(
            (appointment) => appointment.id !== appointmentId
          )
        }));
        return { ok: true };
      },
      deleteSale(saleId) {
        setData((current) => ({
          ...current,
          sales: current.sales.filter((sale) => sale.id !== saleId)
        }));
        return { ok: true };
      }
    }),
    [data, hydrated, lastSavedAt, mode, profile, initialProfile, uiState]
  );

  return (
    <SalonStoreContext.Provider value={value}>{children}</SalonStoreContext.Provider>
  );
}

export function useSalonStore() {
  const context = useContext(SalonStoreContext);

  if (!context) {
    throw new Error("useSalonStore must be used inside SalonStoreProvider");
  }

  return context;
}

function upsertById<T extends { id: string }>(items: T[], item: T) {
  const id = item.id || createId();
  const nextItem = {
    ...item,
    id
  };
  const existingIndex = items.findIndex((currentItem) => currentItem.id === id);

  if (existingIndex === -1) {
    return [nextItem, ...items];
  }

  return items.map((currentItem) => (currentItem.id === id ? nextItem : currentItem));
}

function getPaymentStatus(total: number, amountPaid: number): PaymentStatus {
  if (amountPaid <= 0) {
    return "unpaid";
  }

  if (amountPaid >= total) {
    return "paid";
  }

  return "partial";
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `vuma-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
