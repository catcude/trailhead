CLAUDE.md — Trailhead
What This Project Is
Trailhead is an adaptive daily support app that helps students develop executive functioning skills and learn to regulate their nervous systems — grounded in peer-reviewed science (Maslow's hierarchy, CASEL SEL competencies, Covey's time-management quadrants, Atomic Habits, behavioral science). It serves students primarily, with community layers for parents and teachers. It sits at the intersection of academics, neuroscience, and social-emotional support — something no competitor does together.
The core product is Guidepost, a structured adaptive check-in and dialogue system, fronted by Juniper, a warm, real, non-clinical guide character. This is NOT an open-ended chatbot. It is a designed dialogue engine with authored content, branching paths, and LLM-assisted adaptivity.
The founder is Cat, a teacher who watched students fail not because they lacked ability, but because their basic needs were unmet and no one taught them how to manage what was happening inside. Trailhead exists to interrupt that cycle.
Source Documents (read these — they are canonical)
All in /docs:
Trailhead_Product_Brief.pdf — the why and what
Trailhead_PRD.pdf — the full build spec; when this file and the PRD conflict, flag it, don't guess
brand-voice-report.md — Cat's voice, derived from her Blueprint Session Q&A
paths/green-path.md — From Intention to Alignment (full dialogue flow, tone cheat sheet, storyboard)
paths/yellow-path.md — From Stuck to Steady (five adaptive branches)
paths/blue-path.md — From Disconnection to Awareness (the "I'm fine" path)
paths/red-path.md — From Overwhelm to Ownership (spec complete per Cat, 2026-07-07 — repeated sections in the file are text duplication only; feature-flagged off and cannot ship without a dedicated safety review)
tools/reusable-tools.md — master list of in-dialogue and dashboard tools
The path documents contain Cat's authored dialogue, prompts, and reflection quotes. This content is her IP, prepared for copyright protection. Treat it as canonical content — implement it verbatim, never paraphrase or "improve" it without her approval.
Tech Stack
Framework: Next.js (App Router)
Styling: Tailwind CSS
Backend/DB: Supabase (Postgres, Auth, Realtime, Storage)
Auth: Supabase Auth — email/password + Google OAuth
AI: LLM API (provider TBD — always go through the abstraction layer in lib/llm/)
Payments: Stripe
Deployment: Vercel
Repo: Single GitHub repo — landing page and app live together
Project Structure
/
├── docs/                    # Canonical source documents (see above)
├── app/
│   ├── (marketing)/         # Landing page, about, pricing — public routes
│   ├── (app)/               # Authenticated app routes
│   │   ├── dashboard/       # Dashboard tools (habits, streaks, goals, Weekly Horizon)
│   │   ├── checkin/         # Guidepost daily check-in (the core experience)
│   │   ├── community/       # Phase 2
│   │   └── settings/
│   ├── auth/
│   └── api/
│       ├── checkin/         # Guidepost engine endpoint (LLM proxy + state machine)
│       └── webhooks/
├── components/
│   ├── ui/                  # Shared primitives
│   ├── marketing/
│   ├── guidepost/           # Check-in UI: stages, option pickers, tip boxes
│   └── tools/               # In-dialogue tool components (see Tools section)
├── content/
│   ├── paths/               # Authored path content: prompts, options, branches (versioned)
│   ├── quotes/              # Reflection quote banks (standard + evening variants)
│   └── tone/                # Juniper tone rules per path/stage/check-in response
├── lib/
│   ├── supabase/
│   ├── guidepost/           # Path router + six-stage state machine
│   ├── llm/
│   │   ├── provider.ts      # Provider-agnostic interface — swap LLMs here
│   │   ├── prompts/         # System prompts (Juniper persona, tone calibration)
│   │   └── safety.ts        # Crisis detection, depth-of-water logic, escalation
│   └── utils/
├── supabase/migrations/
└── CLAUDE.md

The Guidepost Engine (the product's spine)
Architecture: hybrid content model
Authored content is canonical. Prompts, user options, Juniper responses, tip boxes, and reflection quotes live in /content as versioned data — pulled from the path documents in /docs.
The LLM adapts, it does not invent. The LLM handles free-text user input, adjusts Juniper's phrasing to the calibrated tone, and selects among authored variants. It never invents flow structure, skips stages, or generates new reflection quotes.
The state machine owns the flow. lib/guidepost/ implements the path router and stage progression deterministically. LLM output cannot move the user to a different stage; only the state machine can.
The four paths
Every check-in routes to one path. All paths share a six-stage skeleton (meet the state → address it → time & energy → calendar alignment → readiness + first step → reflect & reinforce), each with standard and evening (5–10 PM) variants.
Path
For the user who...
Build status
Green — From Intention to Alignment
Has energy and clarity; needs structure
Phase 1
Yellow — From Stuck to Steady
Knows what to do but can't start (5 branches: physical, emotional, overload, procrastination, frozen)
Phase 1
Blue — From Disconnection to Awareness
Says "I'm fine"; flat, autopilot, masking
Phase 2
Red — From Overwhelm to Ownership
Is carrying something heavy
Phase 2 — spec complete; feature-flagged, blocked on safety review

Paths are permeable: Blue Stage 3 routes to Yellow (head full), Red (heart loud), or stays Blue. Implement the fallback logic exactly as specified in the path docs ("I don't know" flips the prompt; "nothing sounds right" offers a micro-reset; still stuck re-anchors to Weekly Horizon).
Juniper's tone system
Tone is a functional requirement, not a style preference. Each stage of each path specifies a tone; Stage 5 check-ins recalibrate it:
💪 Ready to crush it → playful, hyped, encouraging
😬 Ready but nervous → reassuring, steady, normalize nerves
🌀 Optimistic but overwhelmed → calming, simplified
🔄 Processing plan changes → reflective, validating; explain the why, ask what's missing
🤷 Not sure / foggy → grounding, patient, small-win oriented
Juniper's register (from Cat's authored content): "You're not broken. Feeling stuck doesn't mean you're lazy — it just means something's in the way." That's the bar. Before shipping any prompt change, run outputs against the tone cheat sheets in /docs/paths/.
Reusable Tools
In-dialogue (summoned by path stages as structured UI, never as text blobs)
Micro-Needs Menu · Mood-Matching Visual · Gentle Focus Anchor · Covey Quadrant Sorter · Aha! Moment Tracker · Evening Wind Down Prompts · Start Small Planner · Mini Reset Toolkit
Dashboard (standalone, habit-building)
Habit Tracker · Streak System (gentle reset, no shame messaging) · Goal Microflow Tracker · Weekly Horizon Planner (the anchor other flows reference) · Progress Reflection Tools (end-of-week patterns, habit-loop templates)
Build each tool once in components/tools/ and reuse across paths and dashboard. Full specs in /docs/tools/reusable-tools.md.
Brand Voice & Tone
Derived from Cat's Steady Build Q&A. Every piece of copy, every UI label, every Juniper response should feel like this.
Core Voice Attributes
Safe, not soft. Warm but direct. Cat's students trust her because she's real — "you're so real and you get it."
Non-hierarchical. Never talk down, never lecture, never clinical. The student is a person, not a case to be fixed.
Honest about difficulty. Growth is uncomfortable. Don't promise magic — promise a guide. "It's not a magic wand."
Whole-person. The hunger, the fear, the stress, the brilliance underneath. A student is more than their grades.
Anti-money-grab. No subscription dark patterns, ever. Transparent pricing, cancel in two taps.
Do / Don't
Do: use "you" directly · name real feelings without dramatizing · frame challenges as navigable · write so a 14-year-old understands · acknowledge that not knowing is part of learning.
Don't: use clinical/diagnostic language ("disorder," "deficit," "intervention") · promise transformation · be cheerful when the moment calls for steady · use edtech buzzwords ("gamified learning," "unlock your potential") · make the student feel like a data point.
Example Copy Direction
Instead of "Unlock your full potential with AI-powered learning" → "A place to figure things out — at your own pace, on your own terms"
Instead of "Our evidence-based platform helps students achieve academic success" → "Built on real science. Made for real life."
Instead of "Sign up free today!" → "Try it. No tricks, no pressure."
Landing Page Direction
One job: the visitor immediately sees their reflection. Cat: "I would want them to immediately see their reflection."
Hero: Interactive and reflective — a small live taste of the Guidepost check-in (e.g., "What's at the top of your mind today?" with a gentle adaptive response). No stock-photo hero.
The problem: Name the reality (dysregulation, burnout, inequity) plainly, without preachiness.
What Trailhead does: The three-way intersection, explained the way Cat explains it to a stranger.
How it works: A tangible sample exchange from a real path (e.g., Yellow Stage 1 → 2D).
Community: Seed the parent/teacher/student containers honestly ("coming").
Pricing: Transparent freemium with an explicit easy-cancel promise.
CTA: Low-pressure. Referral incentive appears post-signup, never as a gate.
Design Principles
Grounded, not flashy. Steady and trustworthy. No neon gradients, no dark-mode-by-default.
Patagonia palette (confirmed in the PRD §5.1): Sunset Coral #F9A971 + Bright Orange #FB6526 as primary accents, with Deep Sky Blue, Soft Lavender, Rich Indigo, Charcoal Gray, Golden Sand. "Trailhead" evokes nature — adventure guide, not ed-tech. (An earlier warm-neutrals/trail-green direction was superseded.)
Typography with personality. Approachable but not childish; serves teens and adults. Highly readable body text.
Breathing room. Generous whitespace; the design itself should feel calming to a dysregulated user.
Mobile-first. Every flow excellent at 375px; check-in one-thumb operable.
LLM Abstraction
// lib/llm/provider.ts
interface LLMProvider {
  chat(messages: Message[], options?: ChatOptions): Promise<LLMResponse>;
  stream(messages: Message[], options?: ChatOptions): AsyncIterable<string>;
}

Provider set by env var. No direct SDK imports outside lib/llm/. Stream all Juniper responses.
Safety & Escalation (non-negotiable)
Depth-of-water monitoring: detect crisis signals (self-harm, abuse, immediate danger) in free-text input; pause the flow and surface human resources (988 Suicide & Crisis Lifeline, Crisis Text Line, trusted-adult prompts) in Juniper's steady voice.
Clear boundaries: "I'm not a counselor, but here's someone who can help." Never diagnose. Never prescribe. Never attempt therapy for acute crises.
Vulnerability safeguards: pathways cap reflective depth; Blue/Red flows always offer grounding exits.
No identifiable logging in safety telemetry. No behavioral ad tracking. No data sale, ever.
The Red Path cannot ship without a dedicated safety review.
Auth & Data Model
Supabase Auth: email/password + Google OAuth. Roles (student, parent, teacher) in a profiles table, not auth metadata.
Assume minors: minimize data collection, COPPA/FERPA-aware posture, parental consent flow where required.
RLS on every table. A student's check-ins, reflections, and messages are visible only to them — no parent/teacher surveillance of dialogue content.
Core tables (full schema in the PRD and supabase/migrations/):
profiles · chat_sessions (+ path, variant) · chat_messages (+ stage) · reflections · aha_moments · habits / habit_checks · goals · weekly_horizons · posts (Phase 2)
Pricing Model
Freemium via Stripe:
Free: daily check-in with a generous limit, core reflection, habit tracker. Genuinely useful — not a teaser.
Paid (accessibly priced): unlimited Guidepost, full dashboard suite, community, history. Cancel in two taps from settings.
School/institutional (future): bulk seats, grant-funding friendly. It must stay cheap — the kids who need it most don't have money.
Phased Roadmap
Phase 1 (MVP — 30 Days)
Landing page with interactive reflective hero, live on Vercel
Auth + roles + minimal onboarding
Green and Yellow paths end-to-end (all six stages, evening variants, Mini Reset Toolkit, reflection quote banks)
Aha! Moment Tracker + Habit Tracker on dashboard
Safety layer v1
Freemium billing
Mobile-first throughout
Phase 2 (Community & Depth — 90 Days)
Blue and Red paths (Red pending source doc + safety review)
Community containers (students / parents / teachers + overlap spaces), moderation and report flows from day one
Weekly Horizon Planner, Streak System, Goal Microflow Tracker, Progress Reflection Tools
Referral/invite incentive
Chat history and session continuity
Phase 3 (Tutoring Matching — 180 Days)
Tutor profiles and personality/needs/interest-based matching
Scheduling and session management
Cat's original vision — academics + support + human connection
Development Guidelines
Code Style
TypeScript strict mode — no any types
Server Components by default; Client Components only for interactivity
Supabase SSR helpers for server-side auth
Collocate related files
Authored dialogue content lives in /content as data — never hardcode Juniper's lines in components
Environment Variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
LLM_API_KEY=
LLM_PROVIDER=          # "anthropic" | "openai" | etc.
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

Commit Conventions
feat: · fix: · style: · content: (authored dialogue/copy changes) · infra:
When In Doubt
Ask: "Would this feel safe to a stressed 14-year-old?" If not, change it.
Ask: "Does this sound like Juniper or like a product?" If product, rewrite.
Ask: "Is this in Cat's authored content already?" If yes, use it verbatim.
Ask: "Is this the simplest version that works?" Ship that.
Notes for Claude Code
Read this file first every session, then the PRD and the relevant path doc before touching Guidepost code.
Guidepost is a state machine with authored content, not a freeform chatbot. The most common way to build this wrong is to hand the whole conversation to the LLM. Don't.
Cat's authored dialogue is IP. Implement it verbatim from /docs/paths/. Flag gaps; don't fill them with generated content.
The landing page IS the first impression. Not boilerplate.
Privacy is a feature. Minimize collection. No individual behavioral analytics. No selling data. Ever.
Accessibility matters. ADHD, anxiety, learning differences. Reduced motion, clear focus states, no time pressure in dialogue.
Mobile is primary. 375px is the design target, not the afterthought.

