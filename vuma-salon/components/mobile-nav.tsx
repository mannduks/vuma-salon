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
  Users,
  UsersRound
} from "lucide-react";

import { useSalonStore } from "@/components/providers/salon-store-provider";
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

export function MobileNav() {
  const pathname = usePathname();
  const { data } = useSalonStore();
  const todayKey = new Date().toISOString().slice(0, 10);
  const appointmentsToday = data.appointments.filter((appointment) =>
    appointment.startsAt.startsWith(todayKey)
  ).length;

  return (
    <div className="overflow-x-auto rounded-[24px] border border-border/60 bg-card/90 p-2 shadow-soft lg:hidden">
      <div className="flex min-w-max gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/80 text-muted-foreground"
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {item.label === "Appointments" ? (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
                  {appointmentsToday}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
