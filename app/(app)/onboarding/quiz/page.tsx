import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuizClient } from "@/components/guidepost/quiz-client";
import { saveQuizAnswers } from "./actions";

// Per-user page: always rendered at request time (auth via cookies).
export const dynamic = "force-dynamic";

export const metadata = { title: "Discover Your Path — Trailhead" };

export default async function QuizPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  async function finish(answers: Record<string, string>) {
    "use server";
    await saveQuizAnswers(answers);
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <QuizClient onFinish={finish} />
    </main>
  );
}
