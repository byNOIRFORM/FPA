import Lenis from "lenis";

let instance: Lenis | null = null;

export function initLenis(): Lenis | null {
  if (typeof window === "undefined") return null;
  if (instance) return instance;

  // Respect user preference — no smooth scroll when reduced motion is on.
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return null;

  instance = new Lenis({
    duration: 1.2,
    smoothWheel: true,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  return instance;
}

export function getLenis(): Lenis | null {
  return instance;
}
