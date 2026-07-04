import { gsap } from "gsap";
import { getLenis } from "./lenis";

/**
 * Nav behaviour — shared by every page (the single Nav.astro component).
 * Two behaviours, both frame-locked to Lenis scroll:
 *
 *  1. THEME SWITCH (is-scrolled, CSS-driven)
 *     IntersectionObserver on the nav's BOUNDARY element — the selector
 *     lives in `data-nav-boundary-target` on the nav so each page points
 *     it at whatever sits behind the bar at the top (homepage → .hero,
 *     /sluzby → .sintro). Once that element has scrolled off the top,
 *     the nav swaps to the cream panel (dark text, shrunk logo). This is
 *     why the bar now behaves identically on every page.
 *
 *  2. AUTO-HIDE (GSAP-driven yPercent tween)
 *     The nav slides off on scroll-down and back on scroll-up — same
 *     engine/curve as the contact sheet (expo.inOut, 800ms) so the
 *     motion language is consistent. overwrite:"auto" blends mid-flight
 *     when the user reverses direction.
 *
 *     Guards: TOP_BUFFER (80px) forces it visible near the top;
 *     DELTA_THRESHOLD (12px) ignores inertial wobble.
 *
 * Reduced motion: auto-hide is skipped; the theme switch still runs (it
 * is a state change, not motion).
 */
export function initNav(): void {
  if (typeof window === "undefined") return;

  const nav = document.querySelector<HTMLElement>(".nav");
  if (!nav) return;

  // ===== 0. iOS STATUS-BAR TINT =====
  // In portrait Safari the page can NOT paint behind the notch — the
  // status-bar strip is browser chrome, and Safari fills it from
  // <meta name="theme-color"> (falling back to the page background,
  // which is what showed as the cream band above the photo heroes).
  // So instead of fighting the layout, we drive that meta in sync with
  // the nav state: transparent-over-photo → misty photo tone (the strip
  // reads as the image continuing under the notch); cream panel → the
  // live --bg token (theme-aware). Safari animates the change smoothly.
  const barMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const HERO_TONE = "#a9adb2"; // misty-sky neutral shared by the hero photos
  let overPhoto = false;
  const tintBar = () => {
    if (!barMeta) return;
    barMeta.content = overPhoto
      ? HERO_TONE
      : getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#FAF9F6";
  };
  // Re-tint when the light/dark theme flips (visible in the panel state).
  new MutationObserver(tintBar).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  // ===== 1. THEME SWITCH =====
  const boundarySel = nav.dataset.navBoundaryTarget || ".hero";
  const boundary = document.querySelector<HTMLElement>(boundarySel);

  if (!boundary || typeof IntersectionObserver === "undefined") {
    // No boundary to watch (or no IO support) → just show the panel.
    nav.classList.add("is-scrolled");
    tintBar();
  } else {
    const observer = new IntersectionObserver(
      ([entry]) => {
        nav.classList.toggle("is-scrolled", !entry.isIntersecting);
        overPhoto = entry.isIntersecting;
        tintBar();
      },
      {
        rootMargin: "-60px 0px 0px 0px",
        threshold: 0,
      },
    );
    observer.observe(boundary);
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
