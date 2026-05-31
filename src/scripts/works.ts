import { gsap } from "gsap";
// ScrollTrigger is registered globally in gsap-setup.ts — referencing
// `scrollTrigger` in a tween config picks it up automatically.

/**
 * Works section — four layers of motion:
 *
 *  1. INNER PARALLAX (every tile)
 *     Image renders 110% of frame and translates yPercent +4 → −4
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
 *  4. HOVER ZOOM + CAPTION SHIFT + CURSOR "VIEW"
 *     Mouseenter on a tile: image scales 1.04, title shifts 4px
 *     right, and the global custom cursor enters its `is-view`
 *     state (ring expands to 80px and shows "View" label). All
 *     driven via GSAP so they compose with parallax translate
 *     on the same elements without conflict.
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
  // ±4% drift (was ±5 — tightened per restraint-over-flair). The
  // image's 110% height plus top:-5% gives 5% headroom each side,
  // so ±4 yPercent (≈4.4% of container) stays safely inside it
  // with a ~0.5% edge-bleed buffer.
  if (!reduced) {
    tiles.forEach((tile) => {
      const img = tile.querySelector<HTMLImageElement>(".work-media img");
      if (!img) return;

      gsap.fromTo(
        img,
        { yPercent: 4 },
        {
          yPercent: -4,
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
  // state expands the ring and shows the "POZRIEŤ" label. Title
  // hover-shift was removed (was redundant with the image scale).
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
