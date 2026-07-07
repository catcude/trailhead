import type { ComponentPropsWithoutRef } from "react";

export type CardProps = ComponentPropsWithoutRef<"div">;

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-sand/40 bg-white p-6 shadow-[var(--shadow-card)] ${className}`}
      {...props}
    />
  );
}
