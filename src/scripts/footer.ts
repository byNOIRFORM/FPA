import { getLenis } from "./lenis";

/**
 * Footer — wires the "Späť na vrch" button to scroll the page
 * back to the top.
 *
 * Uses lenis.scrollTo(0) so the animation respects the same
 * smooth-scroll easing the rest of the site uses (rather than
 * the browser's instant `window.scrollTo(0, 0)`).
 *
 * Falls back to native smooth scroll if Lenis isn't running
 * (e.g. reduced-motion users — lenis.ts returns null in that
 * case and we honour their preference with an instant jump).
 */
export function initFooter(): void {
  if (typeof window === "undefined") return;

  const button = document.querySelector<HTMLButtonElement>(
    "[data-back-to-top]",
  );
  if (!button) return;

  button.addEventListener("click", () => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.6 });
    } else {
      // Reduced motion or lenis unavailable — jump instantly.
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  });
}
