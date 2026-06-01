import { redirect } from "next/navigation";

import { SalonStoreProvider } from "@/components/providers/salon-store-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { MobileNav } from "@/components/mobile-nav";
import { AppSidebar } from "@/components/app-sidebar";
import { getAppSession } from "@/lib/session";

export default async function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getAppSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <ToastProvider>
        <SalonStoreProvider initialProfile={session.user} mode={session.mode}>
          <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="hidden lg:block">
              <AppSidebar />
            </div>
            <main className="rounded-[32px] border border-border/60 bg-background/75 p-4 shadow-soft backdrop-blur sm:p-6">
              <div className="mb-4">
                <MobileNav />
              </div>
              {children}
            </main>
          </div>
        </SalonStoreProvider>
      </ToastProvider>
    </div>
  );
}
