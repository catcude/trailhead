import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Mountains } from "@/components/marketing/mountains";
import { HeroTaste } from "@/components/marketing/hero-taste";

/*
 * Landing v0 (static). The interactive reflective hero — a live taste of the
 * Guidepost check-in — ships in M2 once the engine exists (scaffolding plan
 * §M2). Headline/subline/CTA lines are Cat-approved verbatim from CLAUDE.md;
 * connective copy is minimal and marked NEEDS-CAT (gap G-L1).
 *
 * The "How it works" exchange below is VERBATIM from
 * docs/paths/yellow-path.md (Stage 1 → 2D) — Cat's authored IP. Do not edit.
 */
export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-start gap-10 px-6 pt-14 pb-40 sm:pt-24 md:grid-cols-2">
          <div className="flex flex-col items-start gap-6">
            <h1 className="max-w-xl text-4xl font-semibold text-balance text-depth sm:text-5xl">
              A place to figure things out — at your own pace, on your own
              terms.
            </h1>
            <p className="max-w-md text-lg text-balance">
              Built on real science. Made for real life.
            </p>
            <div className="flex flex-col items-start gap-2">
              <Link
                href="/auth/sign-up"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-cta px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-cta/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-depth"
              >
                Try it
              </Link>
              <span className="text-sm text-ink/70">
                No tricks, no pressure.
              </span>
            </div>
          </div>
          <HeroTaste />
        </div>
        <Mountains className="absolute bottom-0 left-0 h-40 w-full" />
      </section>

      {/* The problem — NEEDS-CAT: her words, plainly, without preachiness */}
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <h2 className="mb-4 text-2xl font-semibold text-depth">
          School asks for your best. Nobody teaches you how to get there.
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-sm">
              Some days you can&apos;t care about erosion or multiplication
              facts — because everything else is louder.
            </p>
          </Card>
          <Card>
            <p className="text-sm">
              Some students have the grades and are still running on empty.
              Performing isn&apos;t the same as being okay.
            </p>
          </Card>
          <Card>
            <p className="text-sm">
              And the support that helps usually costs money. The kids who need
              it most don&apos;t have it.
            </p>
          </Card>
        </div>
      </section>

      {/* What Trailhead does — the three-way intersection */}
      <section className="w-full bg-coral/10">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="mb-4 text-2xl font-semibold text-depth">
            One place, whole picture
          </h2>
          {/* NEEDS-CAT: the way she explains it to a stranger */}
          <p className="mb-6 max-w-2xl">
            Trailhead sits where three things meet: school skills, what&apos;s
            going on in your body, and what&apos;s going on in your life. Other
            apps pick one lane. Struggling doesn&apos;t work that way.
          </p>
          <p className="max-w-2xl text-sm text-ink/80">
            Every day, Juniper — a guide, not a lecture — meets you where you
            actually are and walks one small, doable step with you. It&apos;s
            not a magic wand. It&apos;s a guide.
          </p>
        </div>
      </section>

      {/* How it works — verbatim Yellow Path Stage 1 → 2D */}
      <section
        id="how-it-works"
        className="mx-auto w-full max-w-5xl px-6 py-16"
      >
        <h2 className="mb-2 text-2xl font-semibold text-depth">
          What a check-in feels like
        </h2>
        <p className="mb-6 text-sm text-ink/70">
          A real moment from the Stuck-to-Steady path:
        </p>
        <div className="mx-auto flex max-w-xl flex-col gap-3">
          <Card className="rounded-bl-md">
            <p className="mb-1 text-xs font-semibold text-info">Juniper</p>
            <p className="text-sm">
              “Sometimes our brain hits the brakes even when we know the next
              step. Let’s figure out what’s slowing you down.”
            </p>
          </Card>
          <Card className="self-end rounded-br-md bg-calm/15">
            <p className="mb-1 text-right text-xs font-semibold text-depth">
              You
            </p>
            <p className="text-sm">
              ⏳ I’ve been procrastinating and I don’t even know why.
            </p>
          </Card>
          <Card className="rounded-bl-md">
            <p className="mb-1 text-xs font-semibold text-info">Juniper</p>
            <p className="text-sm">
              “You’re not broken. Feeling stuck doesn’t mean you’re lazy—it just
              means something’s in the way. Let’s explore it.”
            </p>
          </Card>
          <Card className="rounded-bl-md">
            <p className="mb-1 text-xs font-semibold text-info">Juniper</p>
            <p className="text-sm">
              “Procrastination is usually protecting you from something—it’s not
              a flaw.”
            </p>
          </Card>
        </div>
      </section>

      {/* Community — honest about timing */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-16">
        <Card className="bg-calm/10">
          <h2 className="mb-1 text-xl font-semibold text-depth">
            Community — coming
          </h2>
          <p className="text-sm">
            Spaces for students, parents, and teachers — each with their own
            room, and places where they overlap. We&apos;re building it
            carefully, not quickly.
          </p>
        </Card>
      </section>

      {/* Pricing promise */}
      <section id="pricing" className="w-full bg-sand/20">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="mb-4 text-2xl font-semibold text-depth">
            Fair, and easy to leave
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <h3 className="mb-1 font-semibold text-depth">Free</h3>
              <p className="text-sm">
                A daily check-in, reflection, and a habit tracker. Genuinely
                useful — not a teaser.
              </p>
            </Card>
            <Card>
              <h3 className="mb-1 font-semibold text-depth">Paid</h3>
              <p className="text-sm">
                Unlimited check-ins and the full toolkit, priced to be
                accessible. Cancel in two taps from settings — no hoops, no
                guilt trips.
              </p>
            </Card>
          </div>
          <div className="mt-8 flex flex-col items-start gap-2">
            <Link
              href="/auth/sign-up"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-cta px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-cta/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-depth"
            >
              Try it
            </Link>
            <span className="text-sm text-ink/70">No tricks, no pressure.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
