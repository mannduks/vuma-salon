"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, Coins, Wallet } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { useSalonStore } from "@/components/providers/salon-store-provider";
import { StatusBadge } from "@/components/private-beta/shared";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import {
  getAppointmentDisplay,
  getDashboardStats,
  getRevenueSeries
} from "@/lib/salon-analytics";
import { cn } from "@/lib/utils";

export function DashboardScreen() {
  const { data } = useSalonStore();
  const stats = getDashboardStats(data);
  const upcomingAppointments = [...data.appointments]
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt))
    .slice(0, 4)
    .map((appointment) => getAppointmentDisplay(data, appointment));
  const revenueSeries = getRevenueSeries(data, 5);
  const currentMonth = revenueSeries[revenueSeries.length - 1];
  const collectionRate =
    currentMonth.revenue > 0
      ? Math.round((currentMonth.collected / currentMonth.revenue) * 100)
      : 0;
  const openDays = data.setup.openingHours.filter((day) => day.isOpen).length;
  const setupCompletion = [
    data.setup.salonName,
    data.setup.ownerName,
    data.setup.phoneNumber,
    openDays > 0 ? "hours" : ""
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <AppHeader
        description="Run the private beta with local-first reliability: setup, bookings, customers, sales and reporting all save in the browser."
        title="Private beta dashboard"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-card/90">
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  Operations
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Upcoming appointments
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Quick visibility into today's chair plan and booking health.
                </p>
              </div>
              <Link
                className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
                href="/appointments"
              >
                Open schedule
              </Link>
            </div>

            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  className="rounded-[24px] border border-border/70 bg-background/70 p-4"
                  key={appointment.id}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold">{appointment.customerName}</p>
                      <StatusBadge kind="appointment" value={appointment.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {appointment.staffName} /{" "}
                      {appointment.serviceNames.join(" / ") || "Custom package"}
                    </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                        {formatDateTime(appointment.startsAt)}
                      </span>
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                        {formatCurrency(appointment.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-card/90">
            <CardContent className="space-y-5">
              <div className="rounded-[28px] bg-[linear-gradient(135deg,#224038,#1D5F53)] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Collected this month</p>
                    <p className="mt-2 text-4xl font-semibold">
                      {formatCurrency(currentMonth.collected)}
                    </p>
                  </div>
                  <div className="rounded-full bg-white/10 p-3">
                    <Coins className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-white/78">
                  Total sold: {formatCurrency(currentMonth.revenue)}
                </p>
                <div className="mt-4">
                  <Progress value={collectionRate} />
                </div>
                <p className="mt-2 text-sm text-white/78">
                  {collectionRate}% collection rate
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] bg-secondary/70 p-5">
                  <CalendarClock className="h-5 w-5 text-primary" />
                  <p className="mt-4 text-sm text-muted-foreground">Setup completion</p>
                  <p className="mt-1 text-2xl font-semibold">{setupCompletion}/4</p>
                  <Link
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                    href="/setup"
                  >
                    Finish setup
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="rounded-[24px] bg-secondary/70 p-5">
                  <Wallet className="h-5 w-5 text-primary" />
                  <p className="mt-4 text-sm text-muted-foreground">Opening schedule</p>
                  <p className="mt-1 text-2xl font-semibold">{openDays} days</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {data.setup.openingHours
                      .filter((day) => day.isOpen)
                      .map((day) => day.day.slice(0, 3))
                      .join(" / ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/90">
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    Beta notes
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">What this beta is good at</h2>
                </div>
                <Badge tone="neutral">2-5 salons ready</Badge>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>Local-first saving means salons can work immediately without backend setup.</li>
                <li>Every core screen now supports create, edit, delete, and CSV export.</li>
                <li>Sales automatically track payment status and staff commission per ticket.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
