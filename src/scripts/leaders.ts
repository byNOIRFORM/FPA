import { gsap } from "gsap";
// ScrollTrigger is registered globally in gsap-setup.ts.

/**
 * Leaders section — three layers of motion:
 *
 *   1. PER-WORD COLOR SCRUB (manifest)
 *      Every .leaders-word starts at --ink-faint (#C8C8C8). As
 *      the user scrolls through the manifest, words darken to
 *      var(--ink) left-to-right with a small per-word stagger
 *      that spreads the transition across the scroll range.
 *      Same technique as About — keeps the two manifesto blocks
 *      in one motion family.
 *
 *   2. CARDS CASCADE L→R (one-shot)
 *      When the cards grid enters viewport (start "top 80%"),
 *      cards reveal in sequence — Card 1 first, Card 2 0.2s
 *      later, Card 3 0.4s after Card 1. Each card runs:
 *        - photo curtain: clip-path inset(100% 0 0 0) → inset(0)
 *        - name fade-up (y:16 → 0, opacity:0 → 1)
 *        - description fade-up (offset slightly behind name)
 *      All sub-tweens use expo.out / 0.9–1.0s for the long
 *      gliding settle that matches Services.
 *
 *   3. INNER PARALLAX (every photo)
 *      Each leader photo translates yPercent +8 → −8 as it
 *      scrolls past viewport. Pure scrub, same calibration as
 *      Works tiles and Services rows so all three photo-grid
 *      sections share one ambient rhythm.
 *
 * Reduced motion: snap manifest words to dark, photos to fully
 * revealed, text to visible state.
 */
export function initLeaders(): void {
  if (typeof window === "undefined") return;

  const section = document.querySelector<HTMLElement>(".leaders");
  if (!section) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // -------------------------------------------------------------
  // 1. Manifest word color scrub — mirrors initAbout's word tween.
  // -------------------------------------------------------------
  if (!reduced) {
    gsap.to(".leaders-word", {
      color: "#222",
      ease: "none",
      stagger: { each: 0.4 },
      scrollTrigger: {
        trigger: ".leaders-manifest",
        start: "top 80%",
        end: "bottom 70%",
        scrub: 0.6,
      },
    });
  }

  // -------------------------------------------------------------
  // 2. Inner parallax on every leader photo.
  // -------------------------------------------------------------
  if (!reduced) {
    section
      .querySelectorAll<HTMLElement>(".leader-card")
      .forEach((card) => {
        const img = card.querySelector<HTMLImageElement>(".leader-media img");
        if (!img) return;

        gsap.fromTo(
          img,
          { yPercent: 8 },
          {
            yPercent: -8,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
  }

  // -------------------------------------------------------------
  // 3. Cards cascade reveal L→R.
  // -------------------------------------------------------------
  const grid = section.querySelector<HTMLElement>(".leaders-grid");
  if (!grid) return;

  const cards = grid.querySelectorAll<HTMLElement>(".leader-card");
  if (cards.length === 0) return;

  // Reduced-motion path: snap to final state.
  if (reduced) {
    cards.forEach((card) => {
      const media = card.querySelector<HTMLElement>(".leader-media");
      if (media) gsap.set(media, { clipPath: "inset(0% 0 0 0)" });
      card
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((el) => el.removeAttribute("data-reveal"));
    });
    return;
  }

  // Single timeline triggered when the grid enters viewport.
  // Each card gets an offset (0, 0.2, 0.4s) so the cascade
  // reads as one motion event from left to right.
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: grid,
      start: "top 80%",
      toggleActions: "play none none none",
    },
    onComplete: () => {
      // Strip data-reveal at the end (not onStart) so the CSS
      // [data-reveal] opacity:0 rule stays active during the
      // animation. GSAP's inline opacity overrides it for the
      // duration — stripping early causes a one-frame flash.
      grid
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((el) => el.removeAttribute("data-reveal"));
    },
  });

  cards.forEach((card, i) => {
    const media = card.querySelector<HTMLElement>(".leader-media");
    const name = card.querySelector<HTMLElement>(".leader-name");
    const desc = card.querySelector<HTMLElement>(".leader-desc");
    if (!media || !name || !desc) return;

    // 0.22s between cards — fast enough to read as one cascade,
    // slow enough that each card is clearly its own reveal.
    const cardOffset = i * 0.22;

    // Photo curtain rises from below.
    tl.to(
      media,
      {
        clipPath: "inset(0% 0 0 0)",
        duration: 1.0,
        ease: "expo.out",
      },
      cardOffset,
    );

    // Name + desc fade up. fromTo + immediateRender:false locks
    // the start state at PLAY time so there's no race with the
    // CSS [data-reveal] rule.
    const from = { y: 16, opacity: 0 };
    const to = {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: "expo.out",
      immediateRender: false,
    };

    tl.fromTo(name, from, to, cardOffset + 0.18);
    tl.fromTo(desc, from, to, cardOffset + 0.26);
  });
}
