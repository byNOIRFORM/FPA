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

  // ===== 3. SCROLL REVEALS — origins text + every photo on the page =====
  if (reduced) {
    root.querySelectorAll("[data-reveal]").forEach((el) => el.removeAttribute("data-reveal"));
    return;
  }

  // Label + columns unroll with the SAME clip-path curtain as the homepage
  // Services rows — reading order, left before right (label 0 → col1 0.06 →
  // col2 0.18, expo.out 0.9s). One motion family with the photo curtain
  // below, nothing extra. fromTo + immediateRender:false pins start values;
  // [data-reveal] CSS stays active until onComplete (the services.ts lesson
  // — stripping early made late-starting targets flash fully visible).
  const origins = root.querySelector<HTMLElement>(".aorigins");
  if (origins) {
    const label = origins.querySelector<HTMLElement>(".aorigins-label[data-reveal]");
    const cols = Array.from(origins.querySelectorAll<HTMLElement>(".aorigins-col[data-reveal]"));
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
  }

  // Every photo (origins + story blocks) curtains up 1.0s power3.out with
  // its caption rising 0.2 behind — one motion, repeated. Adds one figure
  // (media + caption) to a timeline at the given offset and returns the
  // elements so the caller can strip [data-reveal] onComplete.
  const addFigure = (tl: gsap.core.Timeline, media: HTMLElement, at: number): HTMLElement[] => {
    const caption =
      media.closest("figure")?.querySelector<HTMLElement>("figcaption[data-reveal]") ?? null;
    tl.fromTo(
      media,
      { clipPath: "inset(100% 0 0 0)" },
      { clipPath: "inset(0% 0 0 0)", duration: 1.0, ease: "power3.out", immediateRender: false },
      at,
    );
    if (caption) {
      tl.to(caption, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, at + 0.2);
    }
    return caption ? [media, caption] : [media];
  };

  // Side-by-side pairs unroll in READING ORDER — the row is the trigger and
  // the right photo starts 0.15 after the left (the Works/duo stagger).
  // Desktop only: on mobile the rows stack, so a shared trigger would play
  // the lower photo off-screen; each keeps its own trigger there instead.
  const grouped = new Set<HTMLElement>();
  if (window.matchMedia("(min-width: 768px)").matches) {
    root.querySelectorAll<HTMLElement>(".astory-row").forEach((row) => {
      const medias = Array.from(row.querySelectorAll<HTMLElement>(".amedia[data-reveal]"));
      if (!medias.length) return;
      medias.forEach((m) => grouped.add(m));
      const els: HTMLElement[] = [];
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: row,
          start: "top 80%",
          toggleActions: "play none none none",
        },
        onComplete: () => els.forEach((el) => el.removeAttribute("data-reveal")),
      });
      medias.forEach((media, i) => els.push(...addFigure(tl, media, i * 0.15)));
    });
  }

  // Remaining photos (origins, the wide one — and all of them on mobile)
  // reveal on their own trigger as they scroll in.
  root.querySelectorAll<HTMLElement>(".amedia[data-reveal]").forEach((media) => {
    if (grouped.has(media)) return;
    const els: HTMLElement[] = [];
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: media,
        start: "top 80%",
        toggleActions: "play none none none",
      },
      onComplete: () => els.forEach((el) => el.removeAttribute("data-reveal")),
    });
    els.push(...addFigure(tl, media, 0));
  });

  // Inner parallax — each photo drifts ±8 around the -9.0164 centering
  // baseline (-11% of the frame, carried by the scrub itself; see
  // works.ts / Works.astro for the Safari grey-band story). Same
  // calibration as the homepage Works grid. Skipped entirely under
  // reduced motion (early return above).
  root.querySelectorAll<HTMLElement>(".amedia img").forEach((img) => {
    gsap.fromTo(
      img,
      { yPercent: 8 - 9.0164 },
      {
        yPercent: -8 - 9.0164,
        ease: "none",
        scrollTrigger: {
          trigger: img.closest(".amedia"),
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });
}
