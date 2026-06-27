import { gsap } from "gsap";
// ScrollTrigger is registered globally in gsap-setup.ts.

/**
 * Project detail page motion:
 *
 *  1. INNER PARALLAX (gallery + info photos) — image fills via inset:0,
 *     scaled 1.3 for overscan, drifts yPercent +10 → -10. No grey strip.
 *  1b. HERO — slow Ken Burns yo-yo (scale 1 ↔ 1.06), like the homepage
 *     hero, instead of inner parallax.
 *
 *  2. INTRO WORD-SCRUB (.pword) — --ink-faint → --ink via --reveal,
 *     same effect (and theme-safety) as the About headline.
 *
 *  3. RELATED hover — the right-hand preview crossfades to the hovered
 *     project's photo; cursor enters its "POZRIEŤ" state.
 *
 * Photos otherwise just load (no scroll-reveal). Reduced motion: parallax
 * snaps to rest, Ken Burns off, the preview swaps without a crossfade.
 */
export function initProject(): void {
  if (typeof window === "undefined") return;

  const root = document.querySelector<HTMLElement>(".project");
  if (!root) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;
  const cursor = document.getElementById("cursor");

  // ===== 1. INNER PARALLAX =====
  // The image fills its frame (CSS inset:0) and is scaled 1.3 for
  // overscan; we drift yPercent +10 → -10 (10% of the frame). scale
  // 1.3 gives 15% headroom each side, so ±10 keeps ~5% cover buffer —
  // no grey strip ever shows. Keeping scale in both keyframes so the
  // zoom holds while only the translate animates.
  // Hero is excluded here — it gets the Ken Burns yo-yo below.
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

  // ===== 1b. HERO — slow Ken Burns "yo-yo" (same as the homepage hero),
  // not inner parallax. Image fills via inset:0; scale 1 ↔ 1.06 forever,
  // sine-eased, so it never reveals an edge. =====
  const heroImg = root.querySelector<HTMLImageElement>(".phero-media img");
  if (heroImg) {
    if (reduced) {
      gsap.set(heroImg, { scale: 1 });
    } else {
      gsap.to(heroImg, {
        scale: 1.06,
        duration: 22,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
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

  // ===== 3. RELATED — preview crossfade + "POZRIEŤ" cursor =====
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
