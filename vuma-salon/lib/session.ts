import { cookies } from "next/headers";

import { demoProfile } from "@/lib/mock-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getAppSession() {
  const cookieStore = await cookies();
  const demoSession = cookieStore.get("vuma-demo-session")?.value === "true";
  const supabase = await getSupabaseServerClient();

  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      return {
        user: {
          fullName:
            user.user_metadata.full_name ??
            user.email?.split("@")[0] ??
            demoProfile.fullName,
          role: user.user_metadata.role ?? "Manager",
          salonName: user.user_metadata.salon_name ?? demoProfile.salonName,
          city: user.user_metadata.city ?? demoProfile.city
        },
        mode: "supabase" as const
      };
    }
  }

  if (demoSession) {
    return {
      user: demoProfile,
      mode: "demo" as const
    };
  }

  return null;
}
