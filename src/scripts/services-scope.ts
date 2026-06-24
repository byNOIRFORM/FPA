/**
 * Služby — scope collage parallax (two layers, matching the homepage
 * Works tiles):
 *
 *  1. INNER PARALLAX (every tile) — the image is 122% of the frame with
 *     11% headroom each side; it drifts ±8% of its own height inside the
 *     clipped frame, so it "lags" the frame. Identical maths to works.ts.
 *  2. CARD DRIFT (gentle) — the whole tile also drifts a few % at a
 *     per-tile speed, so the scattered collage gains depth (the
 *     fluid.glass feel) without overpowering the inner parallax.
 *
 * Both are direct scroll-driven transforms read live from
 * getBoundingClientRect every scroll frame — bulletproof against this
 * page's sticky 220vh intro + scroll-lock (a ScrollTrigger scrub
 * mis-measured there and sat still). Ranges are symmetric (+v → −v), so
 * when the section is centred everything rests on its Figma position.
 */
import { getLenis } from "./lenis";
import { setupGsap } from "./gsap-setup";

// Inner-image drift, ±% of the image's own height. Matches works.ts (8):
// 8% of the 122% image = 9.76% of the frame, inside the 11% headroom.
const INNER = 8;

export function initServicesScope(): void {
  if (typeof window === "undefined") return;

  const section = document.querySelector<HTMLElement>(".sscope");
  if (!section) return;

  // Component inline scripts run before BaseLayout's bootstrap, so make
  // sure Lenis exists (setupGsap is idempotent) before we subscribe to it.
  setupGsap();

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  const tiles = Array.from(
    section.querySelectorAll<HTMLElement>(".sscope-tile"),
  );
  if (!tiles.length) return;

  const cardSpeeds = tiles.map((t) => parseFloat(t.dataset.speed || "6"));
  const imgs = tiles.map((t) => t.querySelector<HTMLImageElement>("img"));

  const update = () => {
    // Card drift belongs to the scatter (desktop + tablet, which just
    // scales down). Below 768 the section stacks into a single column, so
    // only the inner image parallax runs there (like the Works tiles).
    // Read live so resizing across the breakpoint works.
    const scatter = window.innerWidth >= 768;
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 as the section enters from the bottom → 1 as it leaves past the top.
    const raw = (vh - rect.top) / (vh + rect.height);
    const p = Math.max(0, Math.min(1, raw));
    const inner = INNER - 2 * INNER * p; // +8 → −8, % of image height

    tiles.forEach((tile, i) => {
      const d = cardSpeeds[i];
      tile.style.transform = scatter
        ? `translate3d(0, ${d - 2 * d * p}%, 0)`
        : "none";
      const img = imgs[i];
      if (img) img.style.transform = `translate3d(0, ${inner}%, 0)`;
    });
  };

  const lenis = getLenis();
  if (lenis) {
    lenis.on("scroll", update);
  } else {
    window.addEventListener("scroll", update, { passive: true });
  }
  window.addEventListener("resize", update, { passive: true });
  update();
}
