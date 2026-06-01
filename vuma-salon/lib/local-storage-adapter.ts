"use client";

import {
  createDefaultUiState,
  createSeedState,
  SALON_DATA_VERSION,
  UI_STATE_VERSION
} from "@/lib/mock-data";
import type { SalonDataSnapshot, SalonUiState, UserProfile } from "@/lib/types";

const STORAGE_KEY = "vuma-salon-private-beta-v2";
const UI_STORAGE_KEY = "vuma-salon-private-beta-ui-v1";

export interface SalonDataAdapter {
  clear(): void;
  load(profile?: Partial<UserProfile>): SalonDataSnapshot;
  loadUiState(): SalonUiState;
  save(snapshot: SalonDataSnapshot): void;
  saveUiState(state: SalonUiState): void;
}

export class LocalStorageSalonAdapter implements SalonDataAdapter {
  clear() {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(UI_STORAGE_KEY);
  }

  load(profile?: Partial<UserProfile>) {
    const fallback = createSeedState(profile);

    if (typeof window === "undefined") {
      return fallback;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return fallback;
      }

      const parsed = JSON.parse(raw) as Partial<SalonDataSnapshot>;

      if (parsed.version !== SALON_DATA_VERSION) {
        return fallback;
      }

      return {
        ...fallback,
        ...parsed,
        setup: {
          ...fallback.setup,
          ...parsed.setup,
          openingHours:
            parsed.setup?.openingHours?.length === fallback.setup.openingHours.length
              ? parsed.setup.openingHours
              : fallback.setup.openingHours
        },
        customers: parsed.customers ?? fallback.customers,
        staff: parsed.staff ?? fallback.staff,
        services: parsed.services ?? fallback.services,
        appointments: parsed.appointments ?? fallback.appointments,
        sales: parsed.sales ?? fallback.sales
      };
    } catch {
      return fallback;
    }
  }

  save(snapshot: SalonDataSnapshot) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }

  loadUiState() {
    const fallback = createDefaultUiState();

    if (typeof window === "undefined") {
      return fallback;
    }

    try {
      const raw = window.localStorage.getItem(UI_STORAGE_KEY);

      if (!raw) {
        return fallback;
      }

      const parsed = JSON.parse(raw) as Partial<SalonUiState> & { version?: number };

      if (parsed.version !== UI_STATE_VERSION) {
        return fallback;
      }

      return {
        ...fallback,
        ...parsed,
        filters: {
          ...fallback.filters,
          ...parsed.filters,
          appointments: {
            ...fallback.filters.appointments,
            ...parsed.filters?.appointments
          },
          customers: {
            ...fallback.filters.customers,
            ...parsed.filters?.customers
          },
          sales: {
            ...fallback.filters.sales,
            ...parsed.filters?.sales
          },
          staff: {
            ...fallback.filters.staff,
            ...parsed.filters?.staff
          }
        }
      };
    } catch {
      return fallback;
    }
  }

  saveUiState(state: SalonUiState) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      UI_STORAGE_KEY,
      JSON.stringify({
        ...state,
        version: UI_STATE_VERSION
      })
    );
  }
}
