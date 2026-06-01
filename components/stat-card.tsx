import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStat } from "@/lib/types";

type StatCardProps = {
  stat: DashboardStat;
};

export function StatCard({ stat }: StatCardProps) {
  return (
    <Card className="bg-card/90 backdrop-blur">
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{stat.label}</p>
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {stat.value}
          </p>
          <p
            className={
              stat.tone === "positive"
                ? "mt-2 text-sm text-emerald-600"
                : "mt-2 text-sm text-muted-foreground"
            }
          >
            {stat.delta}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
