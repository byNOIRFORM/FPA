import { gsap } from "gsap";
// ScrollTrigger is registered globally in gsap-setup.ts — referencing
// `scrollTrigger` in a tween config picks it up.

/**
 * /o-nas page motion — everything reuses the site's motion language 1:1:
 *
 *  1. HERO — the homepage hero choreography (hero.ts → revealHero): image
 *     settles scale 1.1 → 1 (1.6s expo.out) while the title reveals
 *     word-by-word from its masks at the 0.85s beat (1.0s expo.out,
 *     0.05 stagger); the slow Ken Burns yo-yo starts once the reveal
 *     completes. No loader on this subpage → plays on init.
 *  2. INTRO — per-word colour scrub (--reveal), same as every page intro.
 *  3. ORIGINS — the homepage Works row-1 reveal on scroll-in: label + text
 *     columns rise (0.7s power3.out, 0.08 stagger, trigger top 75%), the
 *     photo curtains up (clip-path, 1.0s power3.out, trigger top 80%) with
 *     the caption rising just behind it.
 *
 * Reduced motion: everything snaps to its final state.
 */
export function initAboutPage(): void {
  if (typeof window === "undefined") return;
  const root = document.querySelector<HTMLElement>(".apage");
  if (!root) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ===== 1. HERO =====
  const heroImg = root.querySelector<HTMLImageElement>(".ahero-media img");
  const titleWords = root.querySelectorAll<HTMLElement>(".ahero-title-word");

  const startKenBurns = () => {
    if (heroImg) {
      gsap.to(heroImg, { scale: 1.06, duration: 22, ease: "sine.inOut", repeat: -1, yoyo: true });
    }
  };

  if (reduced) {
    if (heroImg) gsap.set(heroImg, { scale: 1 });
    if (titleWords.length) gsap.set(titleWords, { yPercent: 0, opacity: 1 });
  } else {
    if (heroImg) gsap.set(heroImg, { scale: 1.1 });
    // Seed the masked-word start on the GSAP side (CSS only sets opacity:0).
    if (titleWords.length) gsap.set(titleWords, { yPercent: 110, opacity: 0 });

    const tl = gsap.timeline({ onComplete: startKenBurns });
    if (heroImg) tl.to(heroImg, { scale: 1, duration: 1.6, ease: "expo.out" }, 0);
    if (titleWords.length) {
      tl.to(titleWords, { yPercent: 0, opacity: 1, duration: 1.0, ease: "expo.out", stagger: 0.05 }, 0.85);
    }
  }

  // ===== 2. INTRO WORD-SCRUB =====
  const words = root.querySelectorAll<HTMLElement>(".aword");
  if (words.length) {
    if (reduced) {
      gsap.set(words, { "--reveal": 1 });
    } else {
      gsap.set(words, { "--reveal": 0 });
      gsap.to(words, {
        "--reveal": 1,
        ease: "none",
        stagger: { each: 0.18 },
        scrollTrigger: {
          trigger: root.querySelector<HTMLElement>(".aintro") ?? root,
          start: "top 80%",
          end: "bottom 70%",
          scrub: 0.6,
        },
      });
    }
  }

  // ===== 3. ORIGINS — Works row-1 reveal on scroll-in =====
  const origins = root.querySelector<HTMLElement>(".aorigins");
  if (!origins) return;

  const label = origins.querySelector<HTMLElement>(".aorigins-label[data-reveal]");
  const cols = Array.from(origins.querySelectorAll<HTMLElement>(".aorigins-col[data-reveal]"));
  const media = origins.querySelector<HTMLElement>(".amedia[data-reveal]");
  const caption = origins.querySelector<HTMLElement>(".aorigins-caption[data-reveal]");

  if (reduced) {
    origins.querySelectorAll("[data-reveal]").forEach((el) => el.removeAttribute("data-reveal"));
    return;
  }

  // Label + columns unroll with the SAME clip-path curtain as the homepage
  // Services rows — reading order, left before right (label 0 → col1 0.06 →
  // col2 0.18, expo.out 0.9s). One motion family with the photo curtain
  // below, nothing extra. fromTo + immediateRender:false pins start values;
  // [data-reveal] CSS stays active until onComplete (the services.ts lesson
  // — stripping early made late-starting targets flash fully visible).
  const textEls = [label, ...cols].filter((el): el is HTMLElement => el !== null);
  if (textEls.length) {
    const from = { clipPath: "inset(100% 0 0 0)" };
    const to = { clipPath: "inset(0% 0 0 0)", duration: 0.9, ease: "expo.out", immediateRender: false };
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: origins,
        start: "top 80%",
        toggleActions: "play none none none",
      },
      onComplete: () => textEls.forEach((el) => el.removeAttribute("data-reveal")),
    });
    textEls.forEach((el, i) => tl.fromTo(el, from, to, [0, 0.06, 0.18][i] ?? 0.18));
  }

  // Photo curtains up on its own trigger; the caption rises just behind it.
  if (media) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: media,
        start: "top 80%",
        toggleActions: "play none none none",
      },
      onComplete: () => {
        media.removeAttribute("data-reveal");
        caption?.removeAttribute("data-reveal");
      },
    });
    tl.fromTo(
      media,
      { clipPath: "inset(100% 0 0 0)" },
      { clipPath: "inset(0% 0 0 0)", duration: 1.0, ease: "power3.out" },
      0,
    );
    if (caption) {
      tl.to(caption, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, 0.2);
    }
  }
}
