import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
// ScrollTrigger is registered globally in gsap-setup.ts.
// Draggable + InertiaPlugin power the drag gallery (registered here since
// this is the only page that uses them).
gsap.registerPlugin(Draggable, InertiaPlugin);

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

  // ===== 1b. HERO — slow Ken Burns "yo-yo" (same as the homepage hero) =====
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
 * Horizontal drag gallery. On pointer (mouse) devices the track is driven by
 * GSAP Draggable with inertia; a custom "Ťahajte" cursor follows the mouse
 * and shrinks while dragging. Touch devices are left to native horizontal
 * scroll (CSS) — Draggable is not initialised there.
 */
function initGallery(root: HTMLElement, reduced: boolean): void {
  const section = root.querySelector<HTMLElement>(".pgal[data-gallery]");
  if (!section) return; // single photo → rendered as a static block, nothing to wire

  const track = section.querySelector<HTMLElement>("[data-gallery-track]");
  const viewport = section.querySelector<HTMLElement>(".pgal-viewport");
  if (!track || !viewport) return;

  // Touch / no mouse → native horizontal scroll handled purely in CSS.
  if (!window.matchMedia("(hover: hover)").matches) return;

  // Drag bounds: 0 at rest (first photo at the gutter) → negative until the
  // last photo's trailing edge reaches the viewport's right edge. Recomputed
  // on resize since item widths derive from a viewport-based height.
  const getBounds = () => ({
    minX: Math.min(0, viewport.clientWidth - track.scrollWidth),
    maxX: 0,
  });

  // ---- Custom "Ťahajte" cursor ----
  const cursorEl = section.querySelector<HTMLElement>("[data-gallery-cursor]");
  const globalCursor = document.getElementById("cursor");
  let qx: ((v: number) => void) | null = null;
  let qy: ((v: number) => void) | null = null;

  if (cursorEl) {
    gsap.set(cursorEl, { xPercent: -50, yPercent: -50 });
    qx = gsap.quickTo(cursorEl, "x", { duration: 0.4, ease: "power3" });
    qy = gsap.quickTo(cursorEl, "y", { duration: 0.4, ease: "power3" });

    const enter = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      // Jump to the pointer first (no long glide from 0,0), then reveal.
      gsap.set(cursorEl, { x: e.clientX, y: e.clientY });
      gsap.to(cursorEl, { autoAlpha: 1, duration: 0.25, ease: "power2.out" });
      // Hand the pointer over from the global site cursor to this one.
      if (globalCursor) gsap.to(globalCursor, { autoAlpha: 0, duration: 0.2 });
    };
    const leave = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      gsap.to(cursorEl, { autoAlpha: 0, duration: 0.25, ease: "power2.out" });
      if (globalCursor) gsap.to(globalCursor, { autoAlpha: 1, duration: 0.2 });
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      qx?.(e.clientX);
      qy?.(e.clientY);
    };

    section.addEventListener("pointerenter", enter);
    section.addEventListener("pointerleave", leave);
    section.addEventListener("pointermove", move, { passive: true });
  }

  // ---- Directional affordance ----
  // Hide the chevron for the direction the track can no longer move: at the
  // start there's nothing behind (hide prev), at the end nothing ahead
  // (hide next). The cursor then only ever offers a drag that's possible.
  const arrowPrev = cursorEl?.querySelector<HTMLElement>(".pgal-cursor-arrow--prev");
  const arrowNext = cursorEl?.querySelector<HTMLElement>(".pgal-cursor-arrow--next");
  const updateAffordance = () => {
    const { minX } = getBounds();
    const x = Number(gsap.getProperty(track, "x")) || 0;
    arrowPrev?.classList.toggle("is-off", x >= -1); // at the start
    arrowNext?.classList.toggle("is-off", x <= minX + 1); // at the end
  };

  // ---- Draggable + inertia ----
  const [drag] = Draggable.create(track, {
    type: "x",
    inertia: !reduced,
    bounds: getBounds(),
    edgeResistance: 0.9,
    // Let vertical touch/scroll gestures pass straight through — no hijack.
    allowNativeTouchScrolling: true,
    onPress() {
      // Re-measure in case a resize/layout shift changed the track width.
      this.applyBounds(getBounds());
      track.classList.add("is-dragging");
      if (cursorEl) gsap.to(cursorEl, { scale: 0.85, duration: 0.25, ease: "power3" });
    },
    onDrag: updateAffordance,
    onThrowUpdate: updateAffordance,
    onThrowComplete: updateAffordance,
    onRelease() {
      track.classList.remove("is-dragging");
      if (cursorEl) gsap.to(cursorEl, { scale: 1, duration: 0.3, ease: "power3" });
      updateAffordance();
    },
  });
  updateAffordance();

  // Keep bounds correct across resizes (item height, and thus width, is
  // viewport-relative). Debounced; clamps the current position back in range.
  let rid = 0;
  window.addEventListener(
    "resize",
    () => {
      window.clearTimeout(rid);
      rid = window.setTimeout(() => {
        drag.applyBounds(getBounds());
        updateAffordance();
      }, 150);
    },
    { passive: true },
  );
}
