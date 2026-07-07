import type { ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-2.5 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-depth disabled:pointer-events-none disabled:opacity-50";

/*
 * Contrast constraint from the token file: white on cta passes AA for
 * large/bold text only, so primary buttons keep text-lg font-semibold.
 */
const variants: Record<ButtonVariant, string> = {
  primary: "bg-cta text-lg text-white hover:bg-cta/90",
  secondary: "bg-coral text-depth hover:bg-coral/80",
  ghost: "text-info underline-offset-4 hover:underline",
};

export type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
