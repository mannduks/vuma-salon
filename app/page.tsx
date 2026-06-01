import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarRange,
  HardDriveDownload,
  Scissors,
  Store,
  UsersRound
} from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: HardDriveDownload,
    title: "Local-first saving",
    copy: "Run the beta without backend setup and keep every core record inside the browser."
  },
  {
    icon: UsersRound,
    title: "Customer memory",
    copy: "Keep notes, loyalty behaviour and spend history in one view."
  },
  {
    icon: Scissors,
    title: "Service control",
    copy: "Price treatments, barbering and packages with clean staff assignment."
  },
  {
    icon: Store,
    title: "Salon setup",
    copy: "Configure owner details, operating days and opening hours before taking live bookings."
  },
  {
    icon: BarChart3,
    title: "Revenue visibility",
    copy: "Track sales, payment status and commission without spreadsheet chaos."
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col rounded-[36px] border border-border/60 bg-background/80 p-6 shadow-soft backdrop-blur sm:p-8">
        <header className="flex flex-col gap-4 border-b border-border/60 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <BrandMark />
          <div className="flex flex-wrap gap-3">
            <Link
              className={cn(buttonVariants({ variant: "ghost" }), "px-4")}
              href="/login"
            >
              Sign in
            </Link>
            <Link className={buttonVariants()} href="/login">
              Open demo
            </Link>
          </div>
        </header>

        <section className="grid gap-8 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-14">
          <div className="space-y-6">
            <Badge tone="accent">Built for South African salons and barbers</Badge>
            <div className="space-y-4">
              <p className="font-[family-name:var(--font-display)] text-5xl leading-none text-foreground sm:text-6xl">
                The modern salon OS for small teams that need reliable beta operations.
              </p>
              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                VUMA Salon helps owners manage setup, bookings, staff, customers, services and revenue from one clean dashboard built for high-volume beauty and grooming businesses.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className={buttonVariants({ size: "lg" })} href="/login">
                Launch MVP
              </Link>
              <Link
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "gap-2"
                )}
                href="/login"
              >
                See dashboard flow
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="bg-card/80">
                <CardContent className="p-5">
                  <p className="text-3xl font-semibold">18</p>
                  <p className="mt-1 text-sm text-muted-foreground">Appointments today</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80">
                <CardContent className="p-5">
                  <p className="text-3xl font-semibold">R112k</p>
                  <p className="mt-1 text-sm text-muted-foreground">Revenue this month</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80">
                <CardContent className="p-5">
                  <p className="text-3xl font-semibold">68%</p>
                  <p className="mt-1 text-sm text-muted-foreground">Customer retention</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="surface-grid overflow-hidden border-none bg-[linear-gradient(135deg,rgba(246,239,229,0.96),rgba(255,255,255,0.88))]">
            <CardContent className="p-0">
              <div className="space-y-6 p-6">
                <div className="rounded-[28px] bg-[linear-gradient(135deg,#224038,#1D5F53)] p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-white/70">
                        Private beta at Braam
                      </p>
                      <p className="mt-3 text-3xl font-semibold">Local records stay in sync</p>
                    </div>
                    <div className="rounded-full bg-white/10 p-3">
                      <CalendarRange className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-white/75">
                    Start with setup, schedule and sales now, then layer live messaging later when the beta stabilizes.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {features.map((feature) => {
                    const Icon = feature.icon;

                    return (
                      <Card className="bg-card/85" key={feature.title}>
                        <CardContent className="space-y-3 p-5">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold">{feature.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {feature.copy}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
