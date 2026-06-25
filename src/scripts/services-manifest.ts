/**
 * Služby manifest — per-word colour scrub (faint → ink), left-to-right.
 *
 * Identical to the home About / Leaders manifests so the reveal feels the
 * same everywhere: the words "ignite" faint → ink with a 0.4 stagger,
 * scrubbed against scroll with a 0.6s smoothing lag (the gentle
 * "catch-up" the direct version was missing). ScrollTrigger is registered
 * by setupGsap; referencing `scrollTrigger` in the tween config then picks
 * it up (same as about.ts).
 */
import { gsap } from "gsap";
import { setupGsap } from "./gsap-setup";

export function initServicesManifest(): void {
  if (typeof window === "undefined") return;

  const section = document.querySelector<HTMLElement>(".smanifest");
  if (!section) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    gsap.set(".smanifest-word", { "--reveal": 1 });
    return;
  }

  // Component inline scripts run before BaseLayout's bootstrap, so make
  // sure GSAP + ScrollTrigger + the Lenis sync exist first (idempotent).
  setupGsap();

  gsap.set(".smanifest-word", { "--reveal": 0 });
  gsap.to(".smanifest-word", {
    "--reveal": 1,
    ease: "none",
    stagger: { each: 0.4 },
    scrollTrigger: {
      trigger: section,
      start: "top 80%",
      end: "bottom 70%",
      scrub: 0.6,
    },
  });
}
