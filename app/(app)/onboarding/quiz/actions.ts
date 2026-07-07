"use server";

import { redirect } from "next/navigation";
import { bigFiveQuiz, QUIZ_VERSION } from "@/content/quiz/big-five";
import { createClient } from "@/lib/supabase/server";

const VALID_KEYS = new Set(["A", "B", "C"]);
const QUESTION_IDS = new Set(bigFiveQuiz.map((question) => question.id));

/**
 * Persist raw quiz answers (owner-only RLS; the in-app confidentiality
 * promise is backed by the data model). Scores stay null pending OQ2.
 */
export async function saveQuizAnswers(answers: Record<string, string>) {
  const clean: Record<string, string> = {};
  for (const [id, key] of Object.entries(answers)) {
    if (QUESTION_IDS.has(id) && VALID_KEYS.has(key)) clean[id] = key;
  }
  if (Object.keys(clean).length === 0) redirect("/dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  await supabase.from("personality_profiles").upsert(
    {
      user_id: user.id,
      raw_answers: clean,
      quiz_version: QUIZ_VERSION,
      taken_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  redirect("/dashboard");
}
