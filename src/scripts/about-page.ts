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
 *  2. INTROS — per-word colour scrub (--reveal), same as every page intro;
 *     runs for both scrub blocks (.aintro + .ateam-intro), each on its
 *     own trigger.
 *  3. ORIGINS/TEAM TEXTS — the homepage Works row-1 reveal on scroll-in:
 *     texts unroll with the clip-path curtain, photos curtain up with
 *     their caption/info rising just behind; story rows unroll in reading
 *     order, and the Pavol/duo sections sequence like the Services rows
 *     (Pavol: photo → bio; duo: bio → Dominik → Tomáš).
 *  4. TEAM GRID — rows curtain in reading order like the story rows;
 *     the hover portrait swap is pure CSS (AboutPage.astro); portraits
 *     drift with the same halved ±4 inner parallax as Pavol/duo.
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

  // ===== 2. INTRO WORD-SCRUBS — one per scrub block, own trigger each =====
  const scrubIntro = (section: HTMLElement | null) => {
    if (!section) return;
    const words = section.querySelectorAll<HTMLElement>(".aword");
    if (!words.length) return;
    if (reduced) {
      gsap.set(words, { "--reveal": 1 });
      return;
    }
    gsap.set(words, { "--reveal": 0 });
    gsap.to(words, {
      "--reveal": 1,
      ease: "none",
      stagger: { each: 0.18 },
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        end: "bottom 70%",
        scrub: 0.6,
      },
    });
  };
  scrubIntro(root.querySelector<HTMLElement>(".aintro"));
  scrubIntro(root.querySelector<HTMLElement>(".ateam-intro"));

  // ===== 3. SCROLL REVEALS — origins/team texts + every photo =====
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

  const desktop = window.matchMedia("(min-width: 768px)").matches;

  // Shared clip-path curtain for the team texts — used standalone here and
  // inside the Pavol/duo section sequences below.
  const teamTextFrom = { clipPath: "inset(100% 0 0 0)" };
  const teamTextTo = {
    clipPath: "inset(0% 0 0 0)",
    duration: 0.9,
    ease: "expo.out",
    immediateRender: false,
  };

  // "Náš tím" label — own trigger. On mobile the Pavol/duo bios reveal
  // standalone here too (the section sequences below are desktop-only,
  // same reasoning as the story rows).
  const soloTeamTexts = desktop
    ? ".ateam-label[data-reveal]"
    : ".ateam-label[data-reveal], .ateam-bio[data-reveal]";
  root.querySelectorAll<HTMLElement>(soloTeamTexts).forEach((el) => {
    gsap.fromTo(el, teamTextFrom, {
      ...teamTextTo,
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        toggleActions: "play none none none",
      },
      onComplete: () => el.removeAttribute("data-reveal"),
    });
  });

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
  if (desktop) {
    root.querySelectorAll<HTMLElement>(".astory-row, .ateam-grid-row").forEach((row) => {
      const medias = Array.from(
        row.querySelectorAll<HTMLElement>(".amedia[data-reveal], .ateam-portrait[data-reveal]"),
      );
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

  // Pavol + Tomáš/Dominik — one section trigger each, sequenced in reading
  // order like the Services rows (client request 2026-07-12): Pavol's photo
  // curtains first with the bio unrolling 0.15 behind; the duo bio unrolls
  // first, then Dominik (+0.15) and Tomáš (+0.30). Desktop only (see above).
  if (desktop) {
    const pavol = root.querySelector<HTMLElement>(".ateam-pavol");
    const pavolMedia = pavol?.querySelector<HTMLElement>(".amedia[data-reveal]") ?? null;
    if (pavol && pavolMedia) {
      grouped.add(pavolMedia);
      const bio = pavol.querySelector<HTMLElement>(".ateam-bio[data-reveal]");
      const els: HTMLElement[] = bio ? [bio] : [];
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pavol,
          start: "top 80%",
          toggleActions: "play none none none",
        },
        onComplete: () => els.forEach((el) => el.removeAttribute("data-reveal")),
      });
      els.push(...addFigure(tl, pavolMedia, 0));
      if (bio) tl.fromTo(bio, teamTextFrom, teamTextTo, 0.15);
    }

    const duo = root.querySelector<HTMLElement>(".ateam-duo");
    if (duo) {
      const bio = duo.querySelector<HTMLElement>(".ateam-bio[data-reveal]");
      const medias = Array.from(duo.querySelectorAll<HTMLElement>(".amedia[data-reveal]"));
      if (bio || medias.length) {
        medias.forEach((m) => grouped.add(m));
        const els: HTMLElement[] = bio ? [bio] : [];
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: duo,
            start: "top 80%",
            toggleActions: "play none none none",
          },
          onComplete: () => els.forEach((el) => el.removeAttribute("data-reveal")),
        });
        if (bio) tl.fromTo(bio, teamTextFrom, teamTextTo, 0);
        medias.forEach((media, i) => els.push(...addFigure(tl, media, 0.15 + i * 0.15)));
      }
    }
  }

  // Remaining photos (origins, the wide one — and all of them on mobile)
  // reveal on their own trigger as they scroll in.
  root
    .querySelectorAll<HTMLElement>(".amedia[data-reveal], .ateam-portrait[data-reveal]")
    .forEach((media) => {
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

  // Inner parallax — each photo drifts around the -9.0164 centering
  // baseline (-11% of the frame, carried by the scrub itself; see
  // works.ts / Works.astro for the Safari grey-band story). Same ±8
  // calibration as the homepage Works grid — except the small portrait
  // frames (Pavol, Dominik, Tomáš + the team grid): the full drift read
  // too strong there (client feedback) and they get half the amplitude.
  // Grid tiles stack TWO faces (default + hover); both get the identical
  // tween on the same trigger, so the crossfade stays pixel-aligned.
  // Skipped entirely under reduced motion (early return above).
  root
    .querySelectorAll<HTMLElement>(".amedia img, .ateam-portrait img")
    .forEach((img) => {
      const amp = img.closest(".ateam-fig, .ateam-portrait") ? 4 : 8;
      gsap.fromTo(
        img,
        { yPercent: amp - 9.0164 },
        {
          yPercent: -amp - 9.0164,
          ease: "none",
          scrollTrigger: {
            trigger: img.closest(".amedia, .ateam-portrait"),
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });
}
