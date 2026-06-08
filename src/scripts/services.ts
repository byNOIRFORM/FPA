import { gsap } from "gsap";
// ScrollTrigger is registered globally in gsap-setup.ts.

/**
 * Services section — two layers of motion, mirroring Works where
 * possible so the two photo-grid sections share one choreography:
 *
 *   1. INNER PARALLAX (every row)
 *      Image renders 122% of frame and translates yPercent +8 → −8
 *      as the row scrolls past viewport. Pure scrub, no easing.
 *      Same calibration as works.ts.
 *
 *   2. PER-ROW REVEAL (every row, single timeline)
 *      As each row enters viewport (start "top 80%"):
 *        - Photo: clip-path inset(100% 0 0 0) → inset(0)
 *          (curtain rises from below, 0.9s power3.out)
 *        - Number / title / description: fade up from y:16,
 *          opacity:0 → y:0, opacity:1 (0.7s power3.out)
 *          with small staggered start (40 / 120 ms)
 *      Both photo and text run in the SAME timeline so they feel
 *      like one coordinated entrance — otherwise the text
 *      animated while the photo just popped in, which read as
 *      uncoordinated.
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

  // ===== 2. PER-ROW REVEAL (photo + text in one timeline) =====
  if (reduced) {
    rows.forEach((row) => {
      const media = row.querySelector<HTMLElement>(".service-media");
      if (media) gsap.set(media, { clipPath: "inset(0% 0 0 0)" });
      row
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((el) => el.removeAttribute("data-reveal"));
    });
    return;
  }

  rows.forEach((row) => {
    const media = row.querySelector<HTMLElement>(".service-media");
    const num = row.querySelector<HTMLElement>(".service-num");
    const title = row.querySelector<HTMLElement>(".service-title");
    const desc = row.querySelector<HTMLElement>(".service-desc");
    if (!media || !num || !title || !desc) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: row,
        start: "top 80%",
        toggleActions: "play none none none",
      },
      onComplete: () => {
        // Strip data-reveal at the end (not onStart) so the CSS
        // [data-reveal] opacity:0 rule stays active during the
        // animation. GSAP's inline opacity overrides it for the
        // duration — stripping early caused a one-frame flash
        // when CSS dropped opacity:0 *before* GSAP recorded its
        // start value.
        num.removeAttribute("data-reveal");
        title.removeAttribute("data-reveal");
        desc.removeAttribute("data-reveal");
      },
    });

    // Reading-flow choreography: LEFT → RIGHT, following the
    // visual scan order a Slovak reader would naturally take
    // across the row.
    //
    //   [01]  [Title]    [Description]              [Photo]
    //    │      │            │                         │
    //    0      0.06s        0.18s                     0.36s
    //
    // The number + title in column 1 fire near-simultaneously
    // (they're one typographic unit). Description follows after
    // a small gap that gives the eye time to register the title.
    // Photo lands LAST as the visual punctuation — the reveal
    // "lands" on the image rather than racing it.
    //
    // fromTo + immediateRender:false locks the start state in
    // at PLAY time so there's no race with the CSS [data-reveal]
    // rule. expo.out gives the longest, softest settle in the
    // free GSAP easing library.
    const from = { y: 16, opacity: 0 };
    const to = {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: "expo.out",
      immediateRender: false,
    };

    // Col 1 — number, then title 60ms later (same column unit).
    tl.fromTo(num, from, to, 0);
    tl.fromTo(title, from, to, 0.06);

    // Col 2 — description, ~180ms after the title kicks off so
    // the eye gets a beat to scan the heading first.
    tl.fromTo(desc, from, to, 0.18);

    // Col 3 — photo curtain rises LAST. expo.out matches the text
    // easing so the whole row reads as one motion family.
    tl.to(
      media,
      {
        clipPath: "inset(0% 0 0 0)",
        duration: 1.0,
        ease: "expo.out",
      },
      0.36,
    );
  });
}
