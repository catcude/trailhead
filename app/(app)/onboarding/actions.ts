"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const VALID_ROLES = ["student", "parent", "teacher"] as const;
type Role = (typeof VALID_ROLES)[number];

function isRole(value: FormDataEntryValue | null): value is Role {
  return (
    typeof value === "string" &&
    (VALID_ROLES as readonly string[]).includes(value)
  );
}

export async function completeOnboarding(formData: FormData) {
  const role = formData.get("role");
  const displayName = formData.get("displayName");

  if (!isRole(role)) redirect("/onboarding");
  if (
    typeof displayName !== "string" ||
    displayName.trim().length === 0 ||
    displayName.trim().length > 60
  ) {
    redirect("/onboarding");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  // RLS: owner-only update — the user can only ever touch their own row.
  const { error } = await supabase
    .from("profiles")
    .update({ role, display_name: displayName.trim() })
    .eq("id", user.id);

  if (error) redirect("/onboarding");
  // Offer Discover Your Path next — always skippable from there.
  redirect("/onboarding/quiz");
}
