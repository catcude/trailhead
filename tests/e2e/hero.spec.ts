import { test, expect } from "@playwright/test";

/**
 * Interactive reflective hero (WS8, acceptance §8): a taste of the check-in at
 * the landing page — no auth, no DB writes, no LLM. Option taps only; a
 * free-text node is never reached (we invite sign-up instead).
 */
test("hero gives a reflective taste and invites sign-up, no auth", async ({
  page,
}) => {
  await page.goto("/");

  const hero = page.getByTestId("hero-taste");
  await expect(hero).toBeVisible();
  // The authored router prompt is the opening line.
  await expect(hero.getByText("How are you feeling today?")).toBeVisible();

  // Tap the Yellow taste ("I know what to do but I can't start").
  await hero.getByRole("button", { name: /can.?t start/i }).click();

  // Juniper responds with an authored line (a labelled bubble appears).
  await expect(hero.getByText("Juniper").first()).toBeVisible();

  // Tap through up to one more offered beat until the sign-up invite shows.
  const keepGoing = hero.getByRole("link", { name: /keep going/i });
  for (let i = 0; i < 2; i++) {
    if (await keepGoing.isVisible().catch(() => false)) break;
    const options = hero.getByRole("button");
    if ((await options.count()) === 0) break;
    await options.first().click();
  }

  await expect(keepGoing).toBeVisible();
  await expect(keepGoing).toHaveAttribute("href", "/auth/sign-up");
});
