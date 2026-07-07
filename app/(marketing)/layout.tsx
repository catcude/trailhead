import Link from "next/link";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-semibold text-depth">
          Trailhead
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="#how-it-works" className="hidden text-ink sm:inline">
            How it works
          </Link>
          <Link href="#pricing" className="hidden text-ink sm:inline">
            Pricing
          </Link>
          <Link href="/auth/sign-in" className="font-medium text-info">
            Sign in
          </Link>
        </nav>
      </header>
      {children}
      <footer className="mx-auto w-full max-w-5xl px-6 py-10 text-sm text-ink/70">
        <p className="mb-1 font-medium text-depth">Trailhead</p>
        <p>
          No ads. No selling your data. Ever. Cancel anytime — it takes two
          taps.
        </p>
      </footer>
    </div>
  );
}
