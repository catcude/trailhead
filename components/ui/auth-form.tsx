"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isProtectedPath } from "@/lib/supabase/routes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/*
 * Shared email/password + Google form for sign-in and sign-up.
 * Copy is low-pressure by design (CLAUDE.md voice rules) — no urgency,
 * no dark patterns.
 */
export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next") ?? "/dashboard";
  const next = isProtectedPath(nextParam) ? nextParam : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // 13+ attestation (OQ4 posture): a checkbox only — we collect NO date of
  // birth (data minimization). Parental consent is reserved for the school
  // rollout. Gates sign-up; sign-in never asks.
  const [ageOk, setAgeOk] = useState(false);
  const [message, setMessage] = useState<string | null>(
    searchParams.get("error") === "auth"
      ? "That sign-in didn't go through. No worries — try again."
      : null,
  );
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    try {
      const supabase = createClient();

      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setMessage(
            error.code === "email_not_confirmed"
              ? "Almost there — check your email for a confirmation link, then come back and sign in."
              : "That email and password don't match. Try again?",
          );
          setPending(false);
          return;
        }
        router.push(next);
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback?next=/onboarding`,
          },
        });
        if (error) {
          setMessage("Something didn't work there. Try again?");
          setPending(false);
          return;
        }
        if (data.session) {
          router.push("/onboarding");
          router.refresh();
        } else {
          setMessage(
            "Check your email for a confirmation link — then you're in.",
          );
          setPending(false);
        }
      }
    } catch {
      setMessage("Something didn't work there. Try again?");
      setPending(false);
    }
  }

  async function handleGoogle() {
    if (mode === "sign-up" && !ageOk) {
      setMessage("Please confirm you’re 13 or older to make an account.");
      return;
    }
    setPending(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        setMessage("Something didn't work there. Try again?");
        setPending(false);
      }
    } catch {
      setMessage("Something didn't work there. Try again?");
      setPending(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <h1 className="mb-1 text-2xl font-semibold text-depth">
        {mode === "sign-in" ? "Welcome back" : "Make an account"}
      </h1>
      <p className="mb-6 text-sm">
        {mode === "sign-in"
          ? "Pick up where you left off."
          : "No tricks, no pressure. You can delete it anytime."}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-11 rounded-lg border border-sand/60 px-3 focus-visible:outline-2 focus-visible:outline-depth"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Password
          <input
            type="password"
            required
            minLength={8}
            autoComplete={
              mode === "sign-in" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-11 rounded-lg border border-sand/60 px-3 focus-visible:outline-2 focus-visible:outline-depth"
          />
        </label>

        {mode === "sign-up" ? (
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              required
              checked={ageOk}
              onChange={(e) => setAgeOk(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 focus-visible:outline-2 focus-visible:outline-depth"
            />
            <span>I’m 13 or older.</span>
          </label>
        ) : null}

        {message ? (
          <p role="status" className="text-sm text-depth">
            {message}
          </p>
        ) : null}

        <Button type="submit" disabled={pending}>
          {mode === "sign-in" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-ink/60">
        <span className="h-px flex-1 bg-sand/60" />
        or
        <span className="h-px flex-1 bg-sand/60" />
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={handleGoogle}
        disabled={pending}
      >
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm">
        {mode === "sign-in" ? (
          <>
            New here?{" "}
            <Link href="/auth/sign-up" className="text-info underline">
              Make an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="text-info underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </Card>
  );
}
