import { gsap } from "gsap";
// ScrollTrigger is registered globally in gsap-setup.ts. The drag gallery
// behaviour (Draggable + InertiaPlugin) lives in drag-gallery.ts, shared
// with the /o-nas team carousel.
import { initDragGallery } from "./drag-gallery";

/**
 * Project detail page motion:
 *
 *  1. INNER PARALLAX (block + duo + context photos) — image fills via
 *     inset:0, scaled 1.3 for overscan, drifts yPercent +10 → -10. No grey
 *     strip. Gallery + preview thumbs (.pmedia--static) are excluded.
 *  1b. HERO — slow Ken Burns yo-yo (scale 1 ↔ 1.06), like the homepage hero.
 *
 *  2. INTRO WORD-SCRUB (.pword) — --ink-faint → --ink via --reveal, same
 *     effect (and theme-safety) as the About headline.
 *
 *  3. DRAG GALLERY (.pgal) — horizontal, GSAP Draggable + InertiaPlugin.
 *     No scroll-hijack: only horizontal pointer drags are captured, so the
 *     page's vertical scroll always works. A custom circular "Ťahajte"
 *     cursor follows the mouse (quickTo lag) inside the gallery and shrinks
 *     while dragging. Touch devices fall back to native horizontal scroll
 *     (CSS) with no custom cursor.
 *
 *  4. RELATED hover — the right-hand preview crossfades to the hovered
 *     project's photo; cursor enters its "POZRIEŤ" state.
 *
 * Reduced motion: parallax snaps to rest, Ken Burns off, gallery inertia
 * off (drag still works), the preview swaps without a crossfade.
 */
export function initProject(): void {
  if (typeof window === "undefined") return;

  const root = document.querySelector<HTMLElement>(".project");
  if (!root) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;
  const cursor = document.getElementById("cursor");

  // ===== 1. INNER PARALLAX =====
  // The image fills its frame (CSS inset:0) and is scaled 1.3 for overscan;
  // we drift yPercent +10 → -10 (10% of the frame). Gallery + preview thumbs
  // (.pmedia--static) and the hero (.phero-media) are excluded.
  const imgs = root.querySelectorAll<HTMLImageElement>(
    ".pmedia:not(.pmedia--static):not(.phero-media) img",
  );
  if (reduced) {
    gsap.set(imgs, { scale: 1.3, yPercent: 0 });
  } else {
    imgs.forEach((img) => {
      const frame = img.closest<HTMLElement>(".pmedia");
      gsap.fromTo(
        img,
        { scale: 1.3, yPercent: 10 },
        {
          scale: 1.3,
          yPercent: -10,
          ease: "none",
          scrollTrigger: {
            trigger: frame ?? img,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });
  }

  // ===== 1b. HERO — intro reveal, 1:1 with the homepage hero (hero.ts →
  // revealHero): the image settles scale 1.1 → 1 (1.6s expo.out) while the
  // title reveals word-by-word from its masks at the SAME 0.85s beat
  // (1.0s expo.out, 0.05 stagger); the slow Ken Burns yo-yo starts only once
  // the reveal timeline completes. There's no loader on this subpage, so the
  // timeline plays on init — the exact same choreography, just no curtain.
  const heroImg = root.querySelector<HTMLImageElement>(".phero-media img");
  const titleWords = root.querySelectorAll<HTMLElement>(".phero-title-word");

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
  const words = root.querySelectorAll<HTMLElement>(".pword");
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
          trigger: root.querySelector<HTMLElement>(".pintro") ?? root,
          start: "top 80%",
          end: "bottom 70%",
          scrub: 0.6,
        },
      });
    }
  }

  // ===== 2b. PHOTO CURTAIN REVEALS — 1:1 with the homepage Works row-1
  // (works.ts): clip-path inset(100%) → 0, 1.0s power3.out, trigger top 80%,
  // play once. The context portrait reveals alone; the duo pair reveals
  // together with the same 0.15s stagger as the homepage pair. Initial
  // hidden state lives in CSS via .pmedia[data-reveal]. =====
  const revealMedias = (medias: HTMLElement[], trigger: HTMLElement) => {
    gsap.fromTo(
      medias,
      { clipPath: "inset(100% 0 0 0)" },
      {
        clipPath: "inset(0% 0 0 0)",
        duration: 1.0,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger,
          start: "top 80%",
          toggleActions: "play none none none",
        },
        onComplete: () => medias.forEach((m) => m.removeAttribute("data-reveal")),
      },
    );
  };

  const revealFrames = Array.from(root.querySelectorAll<HTMLElement>(".pmedia[data-reveal]"));
  if (reduced) {
    revealFrames.forEach((m) => m.removeAttribute("data-reveal"));
  } else {
    const duo = root.querySelector<HTMLElement>("[data-duo]");
    const duoMedias = duo
      ? Array.from(duo.querySelectorAll<HTMLElement>(".pmedia[data-reveal]"))
      : [];
    if (duo && duoMedias.length) revealMedias(duoMedias, duo);
    // Everything else (the context portrait) reveals on its own trigger.
    revealFrames
      .filter((m) => !duoMedias.includes(m))
      .forEach((m) => revealMedias([m], m));
  }

  // ===== 3. DRAG GALLERY =====
  initGallery(root, reduced);

  // ===== 4. RELATED — preview crossfade + "POZRIEŤ" cursor =====
  const thumbImg = root.querySelector<HTMLImageElement>(".prelated-thumb-img");
  const rows = root.querySelectorAll<HTMLAnchorElement>(".prelated-row a[data-project-img]");
  if (thumbImg && rows.length) {
    const defaultSrc = thumbImg.getAttribute("src") || "";

    // Preload the other projects' photos so the first hover never flashes.
    rows.forEach((a) => {
      const src = a.dataset.projectImg;
      if (src) {
        const im = new Image();
        im.src = src;
      }
    });

    const swap = (src: string) => {
      if (!src || thumbImg.getAttribute("src") === src) return;
      if (reduced) {
        thumbImg.src = src;
        return;
      }
      gsap.to(thumbImg, {
        opacity: 0,
        duration: 0.16,
        ease: "power2.out",
        onComplete: () => {
          thumbImg.src = src;
          gsap.to(thumbImg, { opacity: 1, duration: 0.22, ease: "power2.out" });
        },
      });
    };

    rows.forEach((a) => {
      a.addEventListener("mouseenter", () => {
        swap(a.dataset.projectImg || "");
        if (canHover) cursor?.classList.add("is-view");
      });
      a.addEventListener("mouseleave", () => {
        if (canHover) cursor?.classList.remove("is-view");
      });
    });

    // Leaving the whole list restores the default preview.
    root.querySelector<HTMLElement>(".prelated-list")?.addEventListener("mouseleave", () =>
      swap(defaultSrc),
    );
  }
}

/**
 * Horizontal drag gallery — behaviour lives in drag-gallery.ts (shared with
 * the /o-nas team carousel); this just finds the section and hands it over.
 */
function initGallery(root: HTMLElement, reduced: boolean): void {
  const section = root.querySelector<HTMLElement>(".pgal[data-gallery]");
  if (!section) return; // single photo → rendered as a static block, nothing to wire
  initDragGallery(section, reduced);
}
