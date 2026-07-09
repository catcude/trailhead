import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/webhooks/stripe/route";

/**
 * Webhook signature verification is mandatory. Without a configured secret the
 * route refuses (503); without a signature header it 400s; a bad signature
 * 400s and is never processed. A real valid-signature flow needs Stripe's
 * signing and is exercised in the preview E2E, recorded in the PR.
 */
function post(headers: Record<string, string>, body = "{}"): NextRequest {
  return new NextRequest("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers,
    body,
  });
}

const saved = {
  secret: process.env.STRIPE_WEBHOOK_SECRET,
  key: process.env.STRIPE_SECRET_KEY,
};
afterEach(() => {
  if (saved.secret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
  else process.env.STRIPE_WEBHOOK_SECRET = saved.secret;
  if (saved.key === undefined) delete process.env.STRIPE_SECRET_KEY;
  else process.env.STRIPE_SECRET_KEY = saved.key;
});

describe("stripe webhook route", () => {
  it("503 when no webhook secret is configured", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const res = await POST(post({}));
    expect(res.status).toBe(503);
  });

  it("400 when the signature header is missing", async () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    const res = await POST(post({}));
    expect(res.status).toBe(400);
  });

  it("400 on an invalid signature (never processed)", async () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    const res = await POST(post({ "stripe-signature": "t=1,v1=bogus" }));
    expect(res.status).toBe(400);
  });
});
