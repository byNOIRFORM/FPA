import { gsap } from "gsap";
// ScrollTrigger is registered globally in gsap-setup.ts — referencing
// `scrollTrigger` in a tween config picks it up.
import { onTransitionSettled } from "./page-transition";

/**
 * /projekty listing — a static project grid (no hero / intro / filter, so
 * nothing ever re-lays out). Two motions, both matching the homepage Works:
 *  - inner parallax (±8 yPercent) on each tile's image as it scrolls past
 *  - hover zoom (scale 1.04) + the shared "POZRIEŤ" cursor
 *
 * Reduced motion: parallax is skipped (hover still works).
 */
export function initProjectsPage(): void {
  if (typeof window === "undefined") return;

  const grid = document.querySelector<HTMLElement>(".pprojects [data-grid]");
  if (!grid) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Page title — word-by-word mask reveal, IDENTICAL to the hero titles
  // (homepage slogan / detail hero): yPercent 110 → 0, opacity 0 → 1,
  // 1.0s expo.out, 0.05 stagger. Gated behind the enter curtain like the
  // rest of this page's load reveals.
  const titleWords = document.querySelectorAll<HTMLElement>(".pprojects .ptitle-word");
  if (titleWords.length) {
    if (reduced) {
      gsap.set(titleWords, { yPercent: 0, opacity: 1 });
    } else {
      gsap.set(titleWords, { yPercent: 110, opacity: 0 });
      onTransitionSettled(() => {
        gsap.to(titleWords, {
          yPercent: 0,
          opacity: 1,
          duration: 1.0,
          ease: "expo.out",
          stagger: 0.05,
        });
      });
    }
  }

  const cards = Array.from(grid.querySelectorAll<HTMLElement>(".pcard"));
  if (!cards.length) return;

  // First-row reveal (first two projects) — 1:1 with the homepage Works
  // row-1 reveal (works.ts): the two medias curtain up via clip-path on a
  // row-level ScrollTrigger (top 80%, 1.0s power3.out, 0.15 stagger), and
  // each tile's title → desc rises on its own tile-level trigger (top 75%,
  // 0.7s power3.out, desc 0.08 behind). Initial hidden state lives in CSS
  // via [data-reveal].
  // Registered through onTransitionSettled: on a page-transition arrival the
  // enter curtain covers the viewport for ~1s and this reveal (1.0s, fired
  // immediately — the row is in view at load) would finish unseen underneath
  // it. The [data-reveal] CSS keeps the tiles hidden until the curtain has
  // lifted, then the ScrollTriggers are created and fire — the reveal plays
  // right after the curtain, in sync. Normal visits run immediately.
  const firstRow = grid.querySelector<HTMLElement>(".works-row");
  if (!firstRow || reduced) {
    firstRow
      ?.querySelectorAll("[data-reveal]")
      .forEach((el) => el.removeAttribute("data-reveal"));
  } else {
    onTransitionSettled(() => {
      const medias = firstRow.querySelectorAll<HTMLElement>(".work-media[data-reveal]");
      gsap.fromTo(
        medias,
        { clipPath: "inset(100% 0 0 0)" },
        {
          clipPath: "inset(0% 0 0 0)",
          duration: 1.0,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: firstRow,
            start: "top 80%",
            toggleActions: "play none none none",
          },
          onComplete: () => medias.forEach((m) => m.removeAttribute("data-reveal")),
        },
      );

      firstRow.querySelectorAll<HTMLElement>(".pcard").forEach((tile) => {
        const title = tile.querySelector<HTMLElement>(".work-title[data-reveal]");
        const desc = tile.querySelector<HTMLElement>(".work-desc[data-reveal]");
        if (!title || !desc) return;

        gsap
          .timeline({
            scrollTrigger: {
              trigger: tile,
              start: "top 75%",
              toggleActions: "play none none none",
            },
            onStart: () => {
              title.removeAttribute("data-reveal");
              desc.removeAttribute("data-reveal");
            },
          })
          .to(title, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" })
          .to(desc, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, 0.08);
      });
    });
  }

  // Inner parallax — image drifts yPercent +8 → -8 within its 11% headroom
  // as the tile scrolls through the viewport (same calibration as Works).
  if (!reduced) {
    cards.forEach((card) => {
      const img = card.querySelector<HTMLImageElement>(".work-media img");
      if (!img) return;
      gsap.fromTo(
        img,
        { yPercent: 8 },
        {
          yPercent: -8,
          ease: "none",
          scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    });
  }

  // Hover zoom + cursor "POZRIEŤ" (pointer devices only).
  if (window.matchMedia("(hover: hover)").matches) {
    const cursor = document.getElementById("cursor");
    cards.forEach((card) => {
      const img = card.querySelector<HTMLImageElement>(".work-media img");
      card.addEventListener("mouseenter", () => {
        cursor?.classList.add("is-view");
        if (img) gsap.to(img, { scale: 1.04, duration: 0.6, ease: "power2.out" });
      });
      card.addEventListener("mouseleave", () => {
        cursor?.classList.remove("is-view");
        if (img) gsap.to(img, { scale: 1, duration: 0.6, ease: "power2.out" });
      });
    });
  }
}
