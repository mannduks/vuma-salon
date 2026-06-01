"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const cookieStore = await cookies();
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    cookieStore.set("vuma-demo-session", "true", {
      httpOnly: true,
      path: "/",
      sameSite: "lax"
    });
    redirect("/dashboard");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect("/login?error=invalid");
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const cookieStore = await cookies();
  const supabase = await getSupabaseServerClient();

  cookieStore.delete("vuma-demo-session");

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/login");
}
