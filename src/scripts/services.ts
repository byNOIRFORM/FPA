import { gsap } from "gsap";
// ScrollTrigger is registered globally in gsap-setup.ts.

/**
 * Services section — three layers of motion, mirroring Works so the
 * two photo-grid sections share one scroll choreography:
 *
 *   1. INNER PARALLAX (every row)
 *      Image renders 122% of frame and translates yPercent +8 → −8
 *      as the row scrolls past viewport. Pure scrub, no easing.
 *      Identical tween + selector pattern to works.ts so the
 *      ambient breathing rhythm carries through both sections.
 *
 *   2. ROW 1 PHOTO REVEAL (one-shot)
 *      First row's media unmasks via `clip-path: inset(100% 0 0 0)`
 *      → `inset(0)` — a curtain rising from the bottom. Triggers
 *      when the row crosses 80% of the viewport. Announces "the
 *      section has started" with one deliberate motion before
 *      the user starts reading the spec sheet.
 *
 *   3. ROW 1 TEXT STAGGER REVEAL
 *      Number → title → description, all fading up from
 *      translateY(16px) opacity:0. Tiny stagger (40ms title, 120ms
 *      desc) so the eye reads it as one reveal.
 *
 * Rows 02–05 only receive the parallax. No text reveal there —
 * the eye is already in "scan the table" mode by the time it
 * reaches them, and a reveal per row would feel busy.
 *
 * Reduced motion: scroll-driven layers snap to final state.
 */
export function initServices(): void {
  if (typeof window === "undefined") return;

  const section = document.querySelector<HTMLElement>(".services");
  if (!section) return;

  const rows = section.querySelectorAll<HTMLElement>(".service-row");
  if (rows.length === 0) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ===== 1. INNER PARALLAX (every row) =====
  // ±8 yPercent — same calibration as Works. The image's 122% height
  // + top:-11% gives 11% headroom on each side; ±8 stays well inside
  // with a ~3% safety buffer.
  if (!reduced) {
    rows.forEach((row) => {
      const img = row.querySelector<HTMLImageElement>(".service-media img");
      if (!img) return;

      gsap.fromTo(
        img,
        { yPercent: 8 },
        {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: row,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });
  }

  // ===== 2. ROW 1 PHOTO REVEAL =====
  const firstRow = rows[0];
  if (!firstRow) return;

  const firstMedia = firstRow.querySelector<HTMLElement>(".service-media");
  if (firstMedia) {
    if (reduced) {
      gsap.set(firstMedia, { clipPath: "inset(0% 0 0 0)" });
    } else {
      gsap.to(firstMedia, {
        clipPath: "inset(0% 0 0 0)",
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: firstRow,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }
  }

  // ===== 3. ROW 1 TEXT STAGGER REVEAL =====
  // CSS owns the pre-reveal state via [data-reveal] (opacity:0 +
  // translateY 16px). The script tweens TO the visible state and
  // strips the attribute so [data-reveal]-targeting rules no longer
  // apply.
  const num = firstRow.querySelector<HTMLElement>(".service-num");
  const title = firstRow.querySelector<HTMLElement>(".service-title");
  const desc = firstRow.querySelector<HTMLElement>(".service-desc");
  if (!num || !title || !desc) return;

  if (reduced) {
    num.removeAttribute("data-reveal");
    title.removeAttribute("data-reveal");
    desc.removeAttribute("data-reveal");
    return;
  }

  gsap
    .timeline({
      scrollTrigger: {
        trigger: firstRow,
        start: "top 80%",
        toggleActions: "play none none none",
      },
      onStart: () => {
        num.removeAttribute("data-reveal");
        title.removeAttribute("data-reveal");
        desc.removeAttribute("data-reveal");
      },
    })
    .to(num, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" })
    .to(title, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, 0.04)
    .to(desc, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, 0.12);
}
