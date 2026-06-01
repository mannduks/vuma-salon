import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyAuthState() {
  return (
    <div className="rounded-[28px] border border-dashed border-border/70 bg-card/70 p-8 text-center shadow-soft">
      <p className="text-sm text-muted-foreground">
        No session was found. Sign in with Supabase or start the guided demo.
      </p>
      <Link
        className={cn(buttonVariants({ size: "lg" }), "mt-5")}
        href="/login"
      >
        Go to sign in
      </Link>
    </div>
  );
}
