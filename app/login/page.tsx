import Link from "next/link";
import { HardDriveDownload, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured } from "@/lib/env";
import { cn } from "@/lib/utils";

import { signInAction } from "./actions";

const highlights = [
  "Track bookings, staff and cash-ups in one workflow.",
  "Run the MVP instantly in demo mode with no external setup.",
  "Switch to live Supabase auth by adding your project keys."
];

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const hasError = resolvedSearchParams?.error === "invalid";

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[36px] border border-border/60 bg-background/80 shadow-soft backdrop-blur lg:grid-cols-[0.95fr_1.05fr]">
        <section className="surface-grid hidden border-r border-border/60 bg-[linear-gradient(155deg,rgba(29,95,83,0.96),rgba(34,64,56,0.92))] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-8">
            <BrandMark />
            <div className="space-y-5">
              <Badge className="bg-white/15 text-white" tone="neutral">
                Local-first operations
              </Badge>
              <h1 className="font-[family-name:var(--font-display)] text-5xl leading-tight">
                Run your private beta without waiting on backend setup.
              </h1>
              <p className="max-w-lg text-base text-white/78">
                VUMA keeps the admin tidy so your team can focus on chair turns, client experience and repeat revenue while the product is still early.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {highlights.map((highlight) => (
              <div className="flex items-start gap-3 rounded-2xl bg-white/8 p-4" key={highlight}>
                <Sparkles className="mt-0.5 h-5 w-5 text-[#F4D38B]" />
                <p className="text-sm text-white/82">{highlight}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-8 lg:p-10">
          <Card className="w-full max-w-xl bg-card/92">
            <CardContent className="space-y-8 p-8">
              <div className="space-y-4">
                <Badge tone="accent">
                  {isSupabaseConfigured() ? "Live authentication" : "Demo authentication"}
                </Badge>
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight">Welcome back</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {isSupabaseConfigured()
                      ? "Sign in with your Supabase credentials to open the salon workspace."
                      : "No Supabase keys found yet. Any email and password will start the guided demo session."}
                  </p>
                </div>
              </div>

              <form action={signInAction} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">
                    Email
                  </label>
                  <Input
                    defaultValue="owner@vumasalon.co.za"
                    id="email"
                    name="email"
                    placeholder="owner@vumasalon.co.za"
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="password">
                    Password
                  </label>
                  <Input
                    defaultValue="demo-password"
                    id="password"
                    name="password"
                    placeholder="********"
                    type="password"
                  />
                </div>

                {hasError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Sign-in failed. Check the email/password pair in Supabase and try again.
                  </div>
                ) : null}

                <Button className="w-full" size="lg" type="submit">
                  <LockKeyhole className="mr-2 h-4 w-4" />
                  {isSupabaseConfigured() ? "Sign in to VUMA" : "Start demo session"}
                </Button>
              </form>

              <div className="rounded-[24px] bg-secondary/70 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                    {isSupabaseConfigured() ? (
                      <ShieldCheck className="h-5 w-5" />
                    ) : (
                      <HardDriveDownload className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {isSupabaseConfigured()
                        ? "Supabase is connected"
                        : "Demo mode is active"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {isSupabaseConfigured()
                        ? "Auth, session refresh and database fallbacks are ready for your project keys."
                        : "Explore the full UI immediately, then add Supabase keys later for live auth and data."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link className={cn(buttonVariants({ variant: "outline" }))} href="/">
                  Back to overview
                </Link>
                <Link className={cn(buttonVariants({ variant: "ghost" }))} href="/">
                  View feature summary
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
