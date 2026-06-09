import { gsap } from "gsap";
// ScrollTrigger is registered globally in gsap-setup.ts.
import { getLenis } from "./lenis";

/**
 * Footer — two responsibilities:
 *
 *   1. PITCH REVEAL (mask reveal — same pattern as Hero slogan)
 *      Each word sits inside an overflow:hidden mask span. On
 *      enter, words translate from yPercent:110 (= hidden below
 *      the line) to yPercent:0 (= sitting in their proper
 *      position) while opacity fades 0 → 1. The visible effect
 *      is words "rising from below the line", word-by-word.
 *
 *      Parameters mirror Hero exactly: duration 1.0, expo.out,
 *      stagger 0.05 — so the footer feels like a continuation
 *      of the hero's typographic voice.
 *
 *      Layout-safe at any resolution: mask spans are
 *      inline-block and wrap as natural word boundaries, so the
 *      paragraph's line-breaking is identical to plain text.
 *
 *   2. SCROLL-TO-TOP BUTTON
 *      "Späť na vrch" uses lenis.scrollTo(0) so the animation
 *      respects the same smooth-scroll easing as the rest of the
 *      site. Falls back to native scrollTo if Lenis isn't running
 *      (reduced motion).
 */
export function initFooter(): void {
  if (typeof window === "undefined") return;

  // -------------------------------------------------------------
  // 1. Pitch reveal — mask reveal (Hero pattern).
  // -------------------------------------------------------------
  const pitch = document.querySelector<HTMLElement>(".footer-pitch[data-reveal]");
  if (pitch) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const words = pitch.querySelectorAll<HTMLElement>(".footer-pitch-word");

    if (reduced || words.length === 0) {
      // Reduced motion / empty — skip motion, ensure final state.
      gsap.set(words, { yPercent: 0, opacity: 1 });
      pitch.removeAttribute("data-reveal");
    } else {
      // Seed yPercent on the JS side. CSS only sets opacity:0
      // (see comment in Footer.astro) to avoid the matrix-
      // decomposition trap that breaks yPercent animations.
      gsap.set(words, { yPercent: 110, opacity: 0 });

      gsap.to(words, {
        yPercent: 0,
        opacity: 1,
        duration: 1.0,
        ease: "expo.out",
        stagger: 0.05,
        scrollTrigger: {
          trigger: pitch,
          start: "top 80%",
          toggleActions: "play none none none",
        },
        onComplete: () => pitch.removeAttribute("data-reveal"),
      });
    }
  }

  // -------------------------------------------------------------
  // 2. Scroll-to-top button.
  // -------------------------------------------------------------
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
