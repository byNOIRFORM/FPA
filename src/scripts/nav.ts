import { gsap } from "gsap";
import { getLenis } from "./lenis";

/**
 * Nav — two scroll behaviours, both driven from a single Lenis
 * scroll subscription so they stay frame-locked with the page:
 *
 *  1. THEME SWITCH (is-scrolled, CSS-driven)
 *     IntersectionObserver on .hero. Once the hero has scrolled
 *     off the top of the viewport, the nav swaps to the dark-text
 *     state (background var(--bg), color var(--ink), shrunk logo).
 *
 *  2. AUTO-HIDE (GSAP-driven yPercent tween)
 *     The nav slides off the top of the screen on scroll-down and
 *     slides back the moment the user scrolls up. Same engine and
 *     curve as the contact form sheet (GSAP, expo.inOut, 800ms) so
 *     the motion language is consistent across the page.
 *
 *     Using GSAP instead of a CSS class toggle gives three wins:
 *       - True exponential expo.inOut (CSS cubic-bezier can only
 *         approximate it; the start-slow / accel / end-slow shape
 *         is what makes the contact form feel premium)
 *       - GSAP blends mid-flight when the user reverses direction
 *         instead of restarting from the current position with a
 *         fresh curve (which is what made the CSS version feel
 *         "chunky" — restart events stacking)
 *       - overwrite: "auto" auto-kills the previous tween so we
 *         never have two competing animations on the same property
 *
 *     Guards against twitchy behaviour:
 *       - TOP_BUFFER (80px): within this distance of the page top,
 *         the nav is forced visible. First impressions matter.
 *       - DELTA_THRESHOLD (12px): small scrolls don't flip state.
 *         Stops momentum/inertial wobble from triggering hide.
 *
 * Reduced motion: auto-hide is skipped entirely. The theme switch
 * still runs because it's a state change, not motion.
 */
export function initNav(): void {
  if (typeof window === "undefined") return;

  const nav = document.querySelector<HTMLElement>(".nav");
  const hero = document.querySelector<HTMLElement>(".hero");
  if (!nav || !hero) return;

  // ===== 1. THEME SWITCH =====
  if (typeof IntersectionObserver === "undefined") {
    nav.classList.add("is-scrolled");
  } else {
    const observer = new IntersectionObserver(
      ([entry]) => {
        nav.classList.toggle("is-scrolled", !entry.isIntersecting);
      },
      {
        rootMargin: "-60px 0px 0px 0px",
        threshold: 0,
      },
    );
    observer.observe(hero);
  }

  // ===== 2. AUTO-HIDE =====
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  const TOP_BUFFER = 80;
  const DELTA_THRESHOLD = 12;

  const lenis = getLenis();
  let lastY = lenis ? lenis.scroll : window.scrollY;
  let hidden = false;

  // Tween config — single source of truth for the hide/show motion.
  // expo.inOut and 0.8s match the contact form sheet exactly.
  const HIDE_TWEEN = {
    duration: 0.8,
    ease: "expo.inOut",
    overwrite: "auto" as const,
  };

  const hide = () => {
    if (hidden) return;
    hidden = true;
    gsap.to(nav, { yPercent: -100, ...HIDE_TWEEN });
  };

  const show = () => {
    if (!hidden) return;
    hidden = false;
    gsap.to(nav, { yPercent: 0, ...HIDE_TWEEN });
  };

  const update = (y: number) => {
    // Always visible near the top.
    if (y < TOP_BUFFER) {
      show();
      lastY = y;
      return;
    }

    const delta = y - lastY;
    if (Math.abs(delta) < DELTA_THRESHOLD) return;

    if (delta > 0) hide();
    else show();

    lastY = y;
  };

  if (lenis) {
    lenis.on("scroll", (e: { scroll: number }) => update(e.scroll));
  } else {
    window.addEventListener("scroll", () => update(window.scrollY), {
      passive: true,
    });
  }
}
