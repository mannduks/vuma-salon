import { SALON_DATA_VERSION } from "@/lib/mock-data";
import type { SalonBackupFile, SalonDataSnapshot } from "@/lib/types";

export function createBackupFile(data: SalonDataSnapshot): SalonBackupFile {
  return {
    app: "vuma-salon-private-beta",
    data,
    exportedAt: new Date().toISOString(),
    schemaVersion: SALON_DATA_VERSION
  };
}

export function parseBackupFile(raw: string) {
  const parsed = JSON.parse(raw) as Partial<SalonBackupFile>;

  if (
    parsed.app !== "vuma-salon-private-beta" ||
    typeof parsed.exportedAt !== "string" ||
    typeof parsed.schemaVersion !== "number" ||
    !parsed.data
  ) {
    throw new Error("This file is not a valid VUMA Salon backup.");
  }

  if (parsed.schemaVersion !== SALON_DATA_VERSION) {
    throw new Error(
      `Backup schema version ${parsed.schemaVersion} does not match app schema version ${SALON_DATA_VERSION}.`
    );
  }

  if (!isSalonDataSnapshot(parsed.data)) {
    throw new Error("Backup content is incomplete or malformed.");
  }

  return parsed as SalonBackupFile;
}

export function isSalonDataSnapshot(value: unknown): value is SalonDataSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<SalonDataSnapshot>;

  return (
    typeof candidate.version === "number" &&
    Boolean(candidate.setup) &&
    Array.isArray(candidate.customers) &&
    Array.isArray(candidate.staff) &&
    Array.isArray(candidate.services) &&
    Array.isArray(candidate.appointments) &&
    Array.isArray(candidate.sales)
  );
}
