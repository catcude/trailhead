/**
 * Discover Your Path — Big Five quiz questions, VERBATIM from
 * docs/onboarding/big-five-quiz.md. Scenario A/B/C format, teen-friendly.
 *
 * Scoring is deliberately NOT implemented: the A/B/C → dimension-score →
 * tone-adjustment rubric is open question OQ2 (needs Cat). Raw answers are
 * stored with QUIZ_VERSION so scores are computable retroactively.
 */
export type Dimension =
  | "openness"
  | "conscientiousness"
  | "extraversion"
  | "agreeableness"
  | "resilience";

export interface QuizOption {
  key: "A" | "B" | "C";
  label: string;
}

export interface QuizQuestion {
  id: string;
  dimension: Dimension;
  prompt: string;
  options: QuizOption[];
}

export const QUIZ_VERSION = "big-five-v1";

const q = (
  id: string,
  dimension: Dimension,
  prompt: string,
  a: string,
  b: string,
  c: string,
): QuizQuestion => ({
  id,
  dimension,
  prompt,
  options: [
    { key: "A", label: a },
    { key: "B", label: b },
    { key: "C", label: c },
  ],
});

export const bigFiveQuiz: QuizQuestion[] = [
  // ── 1. Openness ─────────────────────────────────────────────────────────
  q(
    "o1",
    "openness",
    "When planning a vacation, do you:",
    "Pick a new place you've never been",
    "Think about trying new activities in a place you know",
    "Prefer to go somewhere familiar and comfortable",
  ),
  q(
    "o2",
    "openness",
    "When given a school project with no specific guidelines, do you:",
    "Get excited about creating something unique",
    "Feel comfortable trying a new approach but still need some structure",
    "Prefer more detailed instructions to follow",
  ),
  q(
    "o3",
    "openness",
    "If your friends suggest trying a new activity you’ve never heard of, do you:",
    "Jump at the chance to try it",
    "Need some convincing but are open to it",
    "Prefer sticking to activities you already know",
  ),
  q(
    "o4",
    "openness",
    "When you see an unusual or unique idea, do you:",
    "Feel excited to learn more about it",
    "Consider it if others show interest",
    "Prefer to stick to familiar ideas",
  ),
  // ── 2. Conscientiousness ────────────────────────────────────────────────
  q(
    "c1",
    "conscientiousness",
    "When you have a set schedule, do you:",
    "Stick to it no matter what",
    "Follow it but allow for some flexibility",
    "Prefer to go with the flow and not stick to a strict schedule",
  ),
  q(
    "c2",
    "conscientiousness",
    "When you have a big assignment, do you:",
    "Plan it out carefully in advance",
    "Make a plan but adjust as needed",
    "Tackle it as it comes without a set plan",
  ),
  q(
    "c3",
    "conscientiousness",
    "When you have multiple tasks to complete, do you:",
    "Prioritize and tackle them one by one",
    "Make a list but stay flexible",
    "Handle them as they come without a specific order",
  ),
  q(
    "c4",
    "conscientiousness",
    "When working on a group project, do you:",
    "Prefer to plan everything in detail",
    "Plan but stay open to changes",
    "Go with the flow and adjust as needed",
  ),
  q(
    "c5",
    "conscientiousness",
    "When it comes to organizing your workspace, do you:",
    "Keep everything in its place",
    "Keep it organized but not rigidly",
    "Don't mind a bit of mess as long as you can find things",
  ),
  q(
    "c6",
    "conscientiousness",
    "When it comes to your room, do you:",
    "Need it to be tidy to focus",
    "Prefer it organized but can handle a bit of mess",
    "Feel comfortable even if it's a little messy",
  ),
  q(
    "c7",
    "conscientiousness",
    "Do you prepare for the next day by:",
    "Planning everything the night before",
    "Having a rough idea but leaving room for adjustments",
    "Going with the flow and seeing what the day brings",
  ),
  // ── 3. Extraversion ─────────────────────────────────────────────────────
  q(
    "e1",
    "extraversion",
    "When you attend social events, do you:",
    "Feel energized and love meeting new people",
    "Enjoy them but prefer smaller gatherings",
    "Find them draining and prefer quieter activities",
  ),
  q(
    "e2",
    "extraversion",
    "When working on a team project, do you:",
    "Take the lead and enjoy coordinating with others",
    "Prefer to collaborate but let others lead",
    "Prefer working alone or in small groups",
  ),
  q(
    "e3",
    "extraversion",
    "In a social setting, do you:",
    "Enjoy being the center of attention",
    "Like participating but not being the focus",
    "Prefer to listen and observe",
  ),
  q(
    "e4",
    "extraversion",
    "When meeting new people, do you:",
    "Easily strike up a conversation",
    "Feel comfortable but let them approach you",
    "Prefer to wait until you're introduced",
  ),
  // ── 4. Agreeableness ────────────────────────────────────────────────────
  q(
    "a1",
    "agreeableness",
    "When working with others, do you:",
    "Easily cooperate and compromise",
    "Usually cooperate but stand your ground when needed",
    "Prefer to stick to your own ideas",
  ),
  q(
    "a2",
    "agreeableness",
    "When someone disagrees with you, do you:",
    "Listen and try to understand their perspective",
    "Consider their point but stick to yours",
    "Find it hard to agree and prefer your own view",
  ),
  q(
    "a3",
    "agreeableness",
    "If a friend asks for help, do you:",
    "Readily offer assistance",
    "Help if you have time",
    "Prefer to focus on your own tasks",
  ),
  q(
    "a4",
    "agreeableness",
    "When it comes to helping out at home or on a team, do you:",
    "Volunteer to help whenever you can",
    "Help when asked",
    "Prefer not to get involved unless necessary",
  ),
  q(
    "a5",
    "agreeableness",
    "When playing a team sport, do you:",
    "Always support and encourage your teammates",
    "Support them but focus on your own role",
    "Prefer individual sports or activities",
  ),
  // ── 5. Emotional Resilience ─────────────────────────────────────────────
  q(
    "r1",
    "resilience",
    "When faced with a difficult situation, do you:",
    "Stay calm and find a solution",
    "Feel stressed but manage to cope",
    "Get overwhelmed and need support",
  ),
  q(
    "r2",
    "resilience",
    "When you experience a setback, do you:",
    "Bounce back quickly and keep going",
    "Feel upset but recover with time",
    "Struggle to move on and need encouragement",
  ),
  q(
    "r3",
    "resilience",
    "When you're feeling anxious, do you:",
    "Find ways to calm yourself down",
    "Feel anxious but manage to get through it",
    "Need support from others to feel better",
  ),
  q(
    "r4",
    "resilience",
    "When you face unexpected changes, do you:",
    "Adapt quickly and stay positive",
    "Feel uneasy but manage to adjust",
    "Struggle to cope and feel anxious",
  ),
  q(
    "r5",
    "resilience",
    "When you're in a social situation and something unexpected happens, do you:",
    "Stay calm and adapt quickly",
    "Feel uneasy but manage to get through it",
    "Get anxious and prefer to leave",
  ),
];
