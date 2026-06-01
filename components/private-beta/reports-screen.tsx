"use client";

import { ArrowUpRight, Banknote, UsersRound } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { useSalonStore } from "@/components/providers/salon-store-provider";
import { SectionCard } from "@/components/private-beta/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/formatters";
import {
  getAppointmentStatusBreakdown,
  getPaymentMix,
  getPaymentStatusBreakdown,
  getRevenueSeries,
  getStaffPerformance
} from "@/lib/salon-analytics";

export function ReportsScreen() {
  const { data } = useSalonStore();
  const revenueSeries = getRevenueSeries(data, 5);
  const paymentMix = getPaymentMix(data);
  const paymentStatuses = getPaymentStatusBreakdown(data);
  const appointmentStatuses = getAppointmentStatusBreakdown(data);
  const staffPerformance = data.staff
    .map((member) => ({
      ...member,
      ...getStaffPerformance(data, member.id)
    }))
    .sort((left, right) => right.totalSales - left.totalSales);
  const topStaffSales = staffPerformance[0]?.totalSales || 1;

  return (
    <div className="space-y-6">
      <AppHeader
        description="Spot collection risk, sales concentration and team contribution from the same local-first dataset your beta salons are already using."
        title="Revenue reporting"
      />

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          description="Monthly revenue and collection progress generated from recorded local sales."
          eyebrow="Financials"
          title="Revenue by month"
        >
          <div className="space-y-4">
            {revenueSeries.map((month) => {
              const revenueProgress =
                month.target > 0 ? Math.round((month.revenue / month.target) * 100) : 0;
              const collectedProgress =
                month.revenue > 0 ? Math.round((month.collected / month.revenue) * 100) : 0;

              return (
                <div key={month.key}>
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{month.month}</p>
                      <p className="text-sm text-muted-foreground">
                        Collected {formatCurrency(month.collected)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">{formatCurrency(month.revenue)}</p>
                  </div>
                  <Progress value={revenueProgress} />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {collectedProgress}% of sold value collected
                  </p>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <Card className="bg-card/90">
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Highlights
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Operational mix
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A fast owner view of where cash is landing and where operational risk lives.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] bg-secondary/70 p-5">
                <Banknote className="h-5 w-5 text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">Payment methods</p>
                <p className="mt-2 text-sm text-foreground">
                  Cash {paymentMix.cash} / Card {paymentMix.card} / EFT {paymentMix.EFT}
                </p>
              </div>
              <div className="rounded-[24px] bg-secondary/70 p-5">
                <UsersRound className="h-5 w-5 text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">Payment statuses</p>
                <p className="mt-2 text-sm text-foreground">
                  Paid {paymentStatuses.paid ?? 0} / Partial {paymentStatuses.partial ?? 0} /
                  Unpaid {paymentStatuses.unpaid ?? 0}
                </p>
              </div>
              <div className="rounded-[24px] bg-secondary/70 p-5 sm:col-span-2">
                <p className="text-sm text-muted-foreground">Appointment statuses</p>
                <p className="mt-2 text-sm text-foreground">
                  {Object.entries(appointmentStatuses)
                    .map(([label, count]) => `${label} ${count}`)
                    .join(" / ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <SectionCard
        description="Staff contribution is driven by recorded sales and commission snapshots."
        eyebrow="Team output"
        title="Contribution leaderboard"
      >
        <div className="space-y-4">
          {staffPerformance.map((member, index) => {
            const relative = Math.min(
              Math.round((member.totalSales / topStaffSales) * 100),
              100
            );

            return (
              <div
                className="rounded-[24px] border border-border/70 bg-background/70 p-4"
                key={member.id}
              >
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">
                      {index + 1}. {member.fullName}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.roleTitle}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    <ArrowUpRight className="h-4 w-4" />
                    {formatCurrency(member.totalSales)} / commission{" "}
                    {formatCurrency(member.commissionEarned)}
                  </div>
                </div>
                <Progress value={relative} />
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
