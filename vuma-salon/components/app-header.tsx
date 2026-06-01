"use client";

import { CalendarDays, Clock3, HardDriveDownload, Store } from "lucide-react";

import { useSalonStore } from "@/components/providers/salon-store-provider";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/formatters";
import { getOpeningDaysLabel, getTodayHours } from "@/lib/salon-analytics";

type AppHeaderProps = {
  title: string;
  description: string;
};

export function AppHeader({ title, description }: AppHeaderProps) {
  const { data, lastSavedAt, mode, profile } = useSalonStore();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-[28px] border border-border/70 bg-card/90 p-6 shadow-soft backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">
              {mode === "demo" ? "Private beta workspace" : "Supabase-ready workspace"}
            </Badge>
            <Badge tone="neutral">
              <Store className="mr-1 h-3.5 w-3.5" />
              {data.setup.salonName}
            </Badge>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <Avatar
            name={data.setup.ownerName || profile.fullName}
            subtitle={`${profile.role} at ${data.setup.salonName || profile.salonName}`}
          />
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {getOpeningDaysLabel(data.setup.openingHours)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
              <Clock3 className="h-3.5 w-3.5" />
              {getTodayHours(data.setup.openingHours)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
              <HardDriveDownload className="h-3.5 w-3.5" />
              {lastSavedAt ? `Saved ${formatDateTime(lastSavedAt)}` : "Saving locally"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
