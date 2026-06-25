/**
 * Stupne — inner parallax on the full-bleed band's photo: the image
 * drifts ±8% of its own height inside the clipped band as the section
 * scrolls past, so it "lags" the frame (same look as the Works tiles).
 *
 * Driven directly off getBoundingClientRect every scroll frame instead of
 * ScrollTrigger — robust against this page's sticky 220vh intro + scroll
 * lock (a ScrollTrigger scrub mis-measured there and sat still).
 */
import { getLenis } from "./lenis";
import { setupGsap } from "./gsap-setup";

export function initServicesStages(): void {
  if (typeof window === "undefined") return;

  const section = document.querySelector<HTMLElement>(".sstages");
  if (!section) return;
  const img = section.querySelector<HTMLElement>(".sstages-img");
  if (!img) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  // Ensure Lenis exists to subscribe to (component scripts run before the
  // BaseLayout bootstrap). setupGsap is idempotent.
  setupGsap();

  const update = () => {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 as the band enters from the bottom → 1 as it leaves past the top.
    const raw = (vh - rect.top) / (vh + rect.height);
    const p = Math.max(0, Math.min(1, raw));
    img.style.transform = `translate3d(0, ${8 - 16 * p}%, 0)`; // +8 → −8
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
