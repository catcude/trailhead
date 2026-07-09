import type { NextConfig } from "next";

/*
 * Security headers (scaffolding plan §5). No third-party scripts exist by
 * design — no analytics, no trackers. When Stripe checkout lands (M2), add
 * js.stripe.com to script-src/frame-src deliberately, nothing else.
 * 'unsafe-inline' is required by Next.js inline runtime scripts/styles;
 * tightening to nonce-based CSP is tracked in docs/security.md.
 */
// React needs eval() for dev-mode debugging only; production stays strict.
// Stripe checkout/portal are full-page redirects; js.stripe.com is allowed in
// script-src/frame-src for Stripe.js (deliberate, nothing else — see §5).
const scriptSrc =
  process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com"
    : "script-src 'self' 'unsafe-inline' https://js.stripe.com";

const CSP = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
  "frame-src 'self' https://js.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
