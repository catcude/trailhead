/*
 * Layered mountain silhouette — "adventure guide, not ed-tech" (PRD §5.1).
 * Decorative only; colors come from the token palette via fill utilities.
 */
export function Mountains({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 200"
      role="presentation"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="xMidYMax slice"
    >
      <path
        className="fill-calm/40"
        d="M0 200 L120 90 L210 150 L330 40 L450 140 L560 70 L680 150 L800 60 L800 200 Z"
      />
      <path
        className="fill-depth/70"
        d="M0 200 L90 130 L200 180 L320 90 L430 170 L570 110 L690 180 L800 120 L800 200 Z"
      />
      <path
        className="fill-coral"
        d="M0 200 L140 160 L260 195 L400 140 L540 190 L660 155 L800 185 L800 200 Z"
      />
    </svg>
  );
}
