import { gsap } from "gsap";
// ScrollTrigger plugin is registered globally in gsap-setup.ts;
// referencing `scrollTrigger` in a tween config picks it up.

/**
 * About section — scroll-driven reveals.
 *
 *  1. Words (`.about-word`) scrub color from `--ink-faint` (#C8C8C8)
 *     to `#222` as user scrolls through the section. Each word's
 *     transition is staggered so they "ignite" left-to-right.
 *  2. The "27" counter scrubs value 0 → 27 as user reaches that
 *     part of the headline.
 *  3. CTA and divider are one-shot reveals (play once when the
 *     section enters viewport).
 *
 * Reduced motion path snaps all words to dark and skips the
 * counter scrub — see the CSS @media rule for the static fallback.
 */
export function initAbout(): void {
  if (typeof window === "undefined") return;

  const section = document.querySelector<HTMLElement>(".about");
  if (!section) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    gsap.set(".about-cta", { opacity: 1, y: 0 });
    gsap.set(".about-divider", { scaleX: 1 });
    return;
  }

  // 1. Word color scrub — greyed-out headline darkens left-to-right
  //    as the user scrolls through the section. The stagger spreads
  //    each word's transition across the scroll range.
  gsap.to(".about-word", {
    color: "#222",
    ease: "none",
    stagger: { each: 0.4 },
    scrollTrigger: {
      trigger: section,
      start: "top 80%",
      end: "bottom 70%",
      scrub: 0.6,
    },
  });

  // 2. Counter "27" — value scrubs from 0 to its data-target. The
  //    displayed value is leading-zero padded to 2 digits (00 → 27)
  //    so the headline width never reflows during the count. The
  //    pad width matches the target's digit count, kept generic in
  //    case the target ever changes.
  const counter = document.querySelector<HTMLElement>(".about-counter");
  if (counter) {
    const target = parseInt(counter.dataset.target || "0", 10);
    const padLen = String(target).length;
    const fmt = (n: number) => String(Math.round(n)).padStart(padLen, "0");
    counter.textContent = fmt(0);

    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      ease: "none",
      scrollTrigger: {
        trigger: counter,
        start: "top 90%",
        end: "top 40%",
        scrub: 0.4,
      },
      onUpdate: () => {
        counter.textContent = fmt(obj.val);
      },
    });
  }

  // 3. CTA + divider — one-shot reveals when the section enters.
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 80%",
      toggleActions: "play none none none",
    },
  });

  tl.to(
    ".about-cta",
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power3.out",
    },
    0.3,
  ).to(
    ".about-divider",
    {
      scaleX: 1,
      duration: 1.0,
      ease: "expo.inOut",
    },
    0.6,
  );
}
