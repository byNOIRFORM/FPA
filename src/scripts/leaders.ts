import { gsap } from "gsap";
// ScrollTrigger is registered globally in gsap-setup.ts.

/**
 * Leaders section — CSS-sticky pin + scrubbed sequential reveal.
 *
 *   1. PER-WORD COLOR SCRUB (manifest)
 *      Words darken left-to-right as the user scrolls the
 *      manifest. Same technique as About.
 *
 *   2. STICKY-PINNED SEQUENTIAL REVEAL
 *      Pinning is done by NATIVE CSS (position: sticky on
 *      .leaders-pin-wrap, inside a 300vh tall container). Native
 *      sticky behaves correctly with Lenis smooth scroll —
 *      GSAP's transform-based pin caused Footer content to
 *      bleed into the viewport.
 *
 *      ScrollTrigger drives the reveal timeline by scrubbing
 *      against the container's scroll progress. The cards
 *      reveal in slot sequence (Pavol → Dominik → Tomáš).
 *
 *      The "Spoznajte nás" CTA lives outside the pin in normal
 *      flow — no reveal animation, simply appears after the
 *      pinned cards with its 48px margin-top.
 *
 *   3. MOBILE FALLBACK (≤ 1024px)
 *      Pin disabled in CSS. Each card reveals via its own
 *      scroll trigger as it enters the viewport.
 *
 * Reduced motion: snap manifest words to dark, all cards fully
 * revealed.
 */
export function initLeaders(): void {
  if (typeof window === "undefined") return;

  const section = document.querySelector<HTMLElement>(".leaders");
  if (!section) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // ≤767 = the dedicated mobile layout (no pin). Tablet (768–1199)
  // keeps the scaled-down desktop pin, in sync with the CSS below.
  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  // -------------------------------------------------------------
  // 1. Manifest word color scrub.
  // -------------------------------------------------------------
  if (!reduced) {
    // Scrub --reveal (0 → 1), not colour — the visible tone is a
    // theme-token color-mix in CSS, so a theme flip recolours mid-scroll
    // with no stale hardcoded value. See about.ts for the same pattern.
    gsap.set(".leaders-word", { "--reveal": 0 });
    gsap.to(".leaders-word", {
      "--reveal": 1,
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

  const cards = section.querySelectorAll<HTMLElement>(".leader-card");
  if (cards.length === 0) return;

  // -------------------------------------------------------------
  // Reduced motion — snap to final state, skip timeline.
  // -------------------------------------------------------------
  if (reduced) {
    cards.forEach((card) => {
      const media = card.querySelector<HTMLElement>(".leader-media");
      gsap.set(card, { y: 0, opacity: 1 });
      if (media) gsap.set(media, { clipPath: "inset(0% 0 0 0)" });
      card
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((el) => el.removeAttribute("data-reveal"));
    });
    return;
  }

  // -------------------------------------------------------------
  // MOBILE — per-card scroll triggers, no sticky pin.
  // -------------------------------------------------------------
  if (isMobile) {
    cards.forEach((card) => {
      const media = card.querySelector<HTMLElement>(".leader-media");
      const name = card.querySelector<HTMLElement>(".leader-name");
      const desc = card.querySelector<HTMLElement>(".leader-desc");
      if (!media || !name || !desc) return;

      gsap
        .timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            toggleActions: "play none none none",
          },
          onComplete: () => {
            name.removeAttribute("data-reveal");
            desc.removeAttribute("data-reveal");
          },
        })
        .to(card, { y: 0, opacity: 1, duration: 0.9, ease: "expo.out" }, 0)
        .to(media, { clipPath: "inset(0% 0 0 0)", duration: 0.9, ease: "expo.out" }, 0)
        .fromTo(
          name,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "expo.out", immediateRender: false },
          0.2,
        )
        .fromTo(
          desc,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "expo.out", immediateRender: false },
          0.3,
        );
    });
    return;
  }

  // -------------------------------------------------------------
  // DESKTOP — STICKY-PINNED SCRUBBED TIMELINE.
  // -------------------------------------------------------------
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".leaders-pin-container",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      invalidateOnRefresh: true,
    },
  });

  // Each card occupies one "slot" of the timeline (positions
  // 0, 1, 2). Power2.out gives a soft tail on each reveal.
  cards.forEach((card, i) => {
    const media = card.querySelector<HTMLElement>(".leader-media");
    const name = card.querySelector<HTMLElement>(".leader-name");
    const desc = card.querySelector<HTMLElement>(".leader-desc");
    if (!media || !name || !desc) return;

    const slot = i; // 0 = Pavol, 1 = Dominik, 2 = Tomáš

    tl.to(
      card,
      { y: 0, opacity: 1, ease: "power2.out", duration: 0.6 },
      slot,
    );

    tl.to(
      media,
      { clipPath: "inset(0% 0 0 0)", ease: "power2.out", duration: 0.6 },
      slot,
    );

    tl.to(
      name,
      { y: 0, opacity: 1, ease: "power2.out", duration: 0.4 },
      slot + 0.5,
    );

    tl.to(
      desc,
      { y: 0, opacity: 1, ease: "power2.out", duration: 0.4 },
      slot + 0.6,
    );
  });
}
