"use client";

import { useEffect, useRef, useState } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { useToast } from "@/components/providers/toast-provider";
import { useSalonStore } from "@/components/providers/salon-store-provider";
import {
  FieldInput,
  FilterPanel,
  FormActions,
  SectionCard
} from "@/components/private-beta/shared";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { downloadJson } from "@/lib/download";
import { formatDateTime } from "@/lib/formatters";
import { hasErrors, validateSetup } from "@/lib/validation";
import type { SalonSetup } from "@/lib/types";

export function SetupScreen() {
  const {
    data,
    exportBackup,
    importBackupFile,
    lastBackupAt,
    resetDemoData,
    restoreBackup,
    saveSetup
  } = useSalonStore();
  const [form, setForm] = useState<SalonSetup>(data.setup);
  const [errors, setErrors] = useState<Partial<Record<keyof SalonSetup | "openingHours", string>>>(
    {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isExportConfirmOpen, setIsExportConfirmOpen] = useState(false);
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isRestorePending, setIsRestorePending] = useState(false);
  const [pendingBackupRaw, setPendingBackupRaw] = useState("");
  const [pendingBackupSummary, setPendingBackupSummary] = useState<{
    exportedAt: string;
    schemaVersion: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { showErrorToast, showSuccessToast } = useToast();

  useEffect(() => {
    setForm(data.setup);
  }, [data.setup]);

  return (
    <div className="space-y-6">
      <AppHeader
        description="Capture the essentials each salon needs before staff start taking real bookings and cash-ups."
        title="Salon setup"
      />

      <SectionCard
        actions={
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setIsExportConfirmOpen(true)} type="button" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export full JSON backup
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              variant="outline"
            >
              <Upload className="mr-2 h-4 w-4" />
              Restore JSON backup
            </Button>
            <Button onClick={() => setIsResetConfirmOpen(true)} type="button" variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore starter data
            </Button>
          </div>
        }
        description="This screen is intentionally simple so new beta salons can be onboarded in minutes."
        eyebrow="Foundation"
        title="Business details"
      >
        <form
          className="space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();
            const nextErrors = validateSetup(form);
            setErrors(nextErrors);

            if (hasErrors(nextErrors)) {
              showErrorToast("Please fix the setup form errors before saving.");
              return;
            }

            setIsSaving(true);
            saveSetup(form);
            setIsSaving(false);
            showSuccessToast("Salon setup saved locally.");
          }}
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <FieldInput
              error={errors.salonName}
              label="Salon name"
              onChange={(event) =>
                setForm((current) => ({ ...current, salonName: event.target.value }))
              }
              required
              value={form.salonName}
            />
            <FieldInput
              error={errors.ownerName}
              label="Owner name"
              onChange={(event) =>
                setForm((current) => ({ ...current, ownerName: event.target.value }))
              }
              required
              value={form.ownerName}
            />
            <FieldInput
              error={errors.phoneNumber}
              label="Phone number"
              onChange={(event) =>
                setForm((current) => ({ ...current, phoneNumber: event.target.value }))
              }
              required
              value={form.phoneNumber}
            />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground">Opening days and hours</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Toggle each day on or off and set the hours your team actually works.
              </p>
            </div>
            {errors.openingHours ? (
              <p className="text-sm text-red-600">{errors.openingHours}</p>
            ) : null}
            <div className="space-y-3">
              {form.openingHours.map((hours, index) => (
                <div
                  className="grid gap-3 rounded-[24px] border border-border/70 bg-background/70 p-4 md:grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr]"
                  key={hours.day}
                >
                  <div className="flex items-center gap-3">
                    <input
                      checked={hours.isOpen}
                      className="h-4 w-4"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          openingHours: current.openingHours.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, isOpen: event.target.checked }
                              : item
                          )
                        }))
                      }
                      type="checkbox"
                    />
                    <span className="font-medium">{hours.day}</span>
                  </div>
                  <label className="space-y-2 text-sm">
                    <span className="text-muted-foreground">Open</span>
                    <Input
                      disabled={!hours.isOpen}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          openingHours: current.openingHours.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, openTime: event.target.value }
                              : item
                          )
                        }))
                      }
                      type="time"
                      value={hours.openTime}
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-muted-foreground">Close</span>
                    <Input
                      disabled={!hours.isOpen}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          openingHours: current.openingHours.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, closeTime: event.target.value }
                              : item
                          )
                        }))
                      }
                      type="time"
                      value={hours.closeTime}
                    />
                  </label>
                  <div className="flex items-center text-sm text-muted-foreground">
                    {hours.isOpen ? `${hours.openTime} - ${hours.closeTime}` : "Closed"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <FormActions isEditing isLoading={isSaving} />
        </form>
      </SectionCard>

      <SectionCard
        description="Backup metadata is stored locally so beta operators can see when the last full JSON export happened."
        eyebrow="Recovery"
        title="Backup status"
      >
        <FilterPanel>
          <FieldInput
            label="Last saved"
            readOnly
            value={lastBackupAt ? formatDateTime(lastBackupAt) : "No JSON backup exported yet"}
          />
          <FieldInput label="Schema version" readOnly value={String(data.version)} />
          <FieldInput label="Customers in backup scope" readOnly value={String(data.customers.length)} />
          <FieldInput label="Sales in backup scope" readOnly value={String(data.sales.length)} />
        </FilterPanel>
        <input
          accept="application/json"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];

            if (!file) {
              return;
            }

            try {
              const raw = await file.text();
              const backup = importBackupFile(raw);
              setPendingBackupRaw(raw);
              setPendingBackupSummary({
                exportedAt: backup.exportedAt,
                schemaVersion: backup.schemaVersion
              });
              setIsRestoreConfirmOpen(true);
            } catch (error) {
              showErrorToast(
                error instanceof Error ? error.message : "Backup file could not be restored."
              );
            } finally {
              event.target.value = "";
            }
          }}
          ref={fileInputRef}
          type="file"
        />
      </SectionCard>

      <Dialog
        confirmLabel="Export backup"
        description="This will download a full JSON backup including salon settings, customers, staff, services, appointments, and sales."
        isOpen={isExportConfirmOpen}
        onCancel={() => setIsExportConfirmOpen(false)}
        onConfirm={() => {
          const backup = exportBackup();
          downloadJson(
            `vuma-salon-backup-${backup.exportedAt.replaceAll(":", "-")}.json`,
            backup
          );
          setIsExportConfirmOpen(false);
          showSuccessToast("Full JSON backup exported.");
        }}
        title="Export full JSON backup?"
      />

      <Dialog
        confirmLabel="Restore backup"
        description={
          pendingBackupSummary
            ? `This will overwrite the current local workspace with backup schema version ${pendingBackupSummary.schemaVersion} from ${formatDateTime(pendingBackupSummary.exportedAt)}.`
            : "This will overwrite the current local workspace with the selected backup."
        }
        isOpen={isRestoreConfirmOpen}
        isPending={isRestorePending}
        onCancel={() => {
          setIsRestoreConfirmOpen(false);
          setPendingBackupRaw("");
          setPendingBackupSummary(null);
        }}
        onConfirm={() => {
          try {
            setIsRestorePending(true);
            const backup = importBackupFile(pendingBackupRaw);
            restoreBackup(backup);
            setForm(backup.data.setup);
            setErrors({});
            showSuccessToast("Backup restored successfully.");
          } catch (error) {
            showErrorToast(
              error instanceof Error ? error.message : "Backup restore failed."
            );
          } finally {
            setIsRestorePending(false);
            setIsRestoreConfirmOpen(false);
            setPendingBackupRaw("");
            setPendingBackupSummary(null);
          }
        }}
        title="Restore JSON backup?"
      />

      <Dialog
        confirmLabel="Reset workspace"
        description="This will overwrite the current local workspace with the starter dataset."
        isOpen={isResetConfirmOpen}
        onCancel={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          resetDemoData();
          setIsResetConfirmOpen(false);
          showSuccessToast("Starter data restored.");
        }}
        title="Restore starter data?"
      />
    </div>
  );
}
