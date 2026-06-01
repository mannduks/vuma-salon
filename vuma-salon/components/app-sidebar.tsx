"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarRange,
  Cog,
  Home,
  Scissors,
  ShoppingBag,
  Sparkles,
  Users,
  UsersRound
} from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { useSalonStore } from "@/components/providers/salon-store-provider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/setup", label: "Setup", icon: Cog },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/staff", label: "Staff", icon: UsersRound },
  { href: "/services", label: "Services", icon: Scissors },
  { href: "/appointments", label: "Appointments", icon: CalendarRange },
  { href: "/sales", label: "Sales", icon: ShoppingBag },
  { href: "/reports", label: "Reports", icon: BarChart3 }
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data } = useSalonStore();
  const todayKey = new Date().toISOString().slice(0, 10);
  const appointmentsToday = data.appointments.filter((appointment) =>
    appointment.startsAt.startsWith(todayKey)
  ).length;

  return (
    <aside className="flex h-full flex-col justify-between rounded-[30px] border border-border/60 bg-card/90 p-5 shadow-soft backdrop-blur">
      <div className="space-y-8">
        <BrandMark />
        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                className={cn(
                  "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
                href={item.href}
                key={item.href}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
                {item.label === "Appointments" ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      active
                        ? "bg-white/20 text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {appointmentsToday}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="rounded-[26px] bg-[linear-gradient(145deg,#1D5F53,#224038)] p-5 text-white">
        <Badge className="mb-3 bg-white/15 text-white" tone="neutral">
          Local-first beta
        </Badge>
        <h3 className="text-lg font-semibold">Built for small teams that need stability first.</h3>
        <p className="mt-2 text-sm text-white/75">
          Customer records, chair plans, sales and setup all save to the browser so early beta salons can run day-to-day without backend friction.
        </p>
        <div className="mt-5 flex items-center gap-2 text-sm text-white/85">
          <Sparkles className="h-4 w-4" />
          <span>Supabase adapter can be added later without changing the screens</span>
        </div>
      </div>
    </aside>
  );
}
