import { gsap } from "gsap";
// ScrollTrigger is registered globally in gsap-setup.ts — referencing
// `scrollTrigger` in a tween config picks it up automatically.

/**
 * Works section — four layers of motion:
 *
 *  1. INNER PARALLAX (every tile)
 *     Image renders 122% of frame and translates yPercent +8 → −8
 *     as the tile scrolls past viewport. Pure scrub, no easing —
 *     image appears to lag the frame, drifting up while the frame
 *     moves up faster.
 *
 *  2. PAIRED REVEAL (Row 1 — both tiles)
 *     Both Row 1 tiles unmask via `clip-path: inset(100% 0 0 0)` →
 *     `inset(0)` — a curtain rising from the bottom. 150ms stagger
 *     between left and right keeps them paired as one entrance
 *     event but still gives the lead project (Dom pod korunami)
 *     hierarchical priority. One-shot.
 *
 *  3. TEXT STAGGER REVEAL (every tile)
 *     Title + description fade-up `translateY(16px) opacity:0` →
 *     `0 opacity:1` as each tile enters viewport. Title leads,
 *     description follows 80ms behind. Subtle enough to read as
 *     pacing, not animation.
 *
 *  4. HOVER ZOOM + CURSOR "POZRIEŤ"
 *     Mouseenter on a tile: image scales 1.04, and the global
 *     custom cursor enters its `is-view` state (ring expands to
 *     80px and shows the "POZRIEŤ" label via ::after). Driven via
 *     GSAP so the scale composes with parallax translate on the
 *     same element without conflict.
 *
 * Reduced motion: scroll-driven layers (1–3) snap to final state.
 * Hover layer (4) stays — it's interaction-triggered.
 */
export function initWorks(): void {
  if (typeof window === "undefined") return;

  const section = document.querySelector<HTMLElement>(".works");
  if (!section) return;

  const cursor = document.getElementById("cursor");
  const tiles = section.querySelectorAll<HTMLElement>(".work-tile");
  if (tiles.length === 0) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;

  // ===== 1. INNER PARALLAX (every tile) =====
  // ±8% drift — clearly visible ambient motion, but still
  // "image breathes within the frame", not "image is animated".
  // The image's 122% height + top:-11% (set in Works.astro CSS)
  // gives 11% headroom each side; ±8 yPercent = 8% of image height
  // = 9.76% of container, staying safely inside with a ~1.24%
  // edge-bleed buffer at each extreme.
  if (!reduced) {
    tiles.forEach((tile) => {
      const img = tile.querySelector<HTMLImageElement>(".work-media img");
      if (!img) return;

      gsap.fromTo(
        img,
        { yPercent: 8 },
        {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: tile,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });
  }

  // ===== 2. PAIRED REVEAL (Row 1, both tiles) =====
  // Curtain rises from the bottom on both Row 1 medias, left first
  // and right 150ms later. Pairs them as one entrance choreography
  // instead of orphaning the right tile next to a revealing left
  // (the asymmetry was the original problem with reveal-on-r1l-only).
  const firstRow = section.querySelector<HTMLElement>(".works-row--1");
  if (firstRow) {
    const medias = firstRow.querySelectorAll<HTMLElement>(".work-media");
    if (reduced) {
      gsap.set(medias, { clipPath: "inset(0% 0 0 0)" });
    } else {
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
        },
      );
    }
  }

  // ===== 3. TEXT STAGGER REVEAL (every tile) =====
  // Initial state is declared in CSS via [data-reveal] so the
  // text is hidden from the first paint (no flash of unstyled
  // content before works.ts runs). Here we tween TO the visible
  // state, then strip the attribute so any future style rule
  // querying [data-reveal] doesn't pick it up.
  //
  // Reduced motion path: just strip the attribute and let CSS
  // fall back to defaults (visible).
  if (reduced) {
    tiles.forEach((tile) => {
      tile
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((el) => el.removeAttribute("data-reveal"));
    });
  } else {
    tiles.forEach((tile) => {
      const title = tile.querySelector<HTMLElement>(".work-title");
      const desc = tile.querySelector<HTMLElement>(".work-desc");
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
  }

  // ===== 4. HOVER — IMAGE ZOOM + CURSOR "POZRIEŤ" =====
  // Image scale 1.04 signals interactivity; the cursor's is-view
  // state expands the ring and shows the "POZRIEŤ" label (the
  // pseudo-element label is rendered from global.css).
  if (canHover) {
    tiles.forEach((tile) => {
      const img = tile.querySelector<HTMLImageElement>(".work-media img");
      if (!img) return;

      tile.addEventListener("mouseenter", () => {
        cursor?.classList.add("is-view");
        gsap.to(img, { scale: 1.04, duration: 0.6, ease: "power2.out" });
      });
      tile.addEventListener("mouseleave", () => {
        cursor?.classList.remove("is-view");
        gsap.to(img, { scale: 1.0, duration: 0.6, ease: "power2.out" });
      });
    });
  }
}
