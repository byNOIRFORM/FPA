import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

// Draggable + InertiaPlugin power every drag gallery on the site
// (registered here so each consumer just imports initDragGallery).
gsap.registerPlugin(Draggable, InertiaPlugin);

/**
 * Horizontal drag gallery — the ONE shared behaviour, extracted from the
 * project-detail page so /o-nas (team carousel) is the exact same gallery,
 * not a copy that drifts.
 *
 * On pointer (mouse) devices the track is driven by GSAP Draggable with
 * inertia; the custom "Ťahajte" cursor (DragCursor.astro) follows the mouse
 * and shrinks while dragging. Touch devices are left to native horizontal
 * scroll (CSS) — Draggable is not initialised there.
 *
 * Expected markup inside `section`:
 *   [data-gallery-viewport] > [data-gallery-track] > items
 *   [data-gallery-cursor]  — the DragCursor.astro cluster (optional)
 *
 * Reduced motion: inertia off, drag still works.
 */
export function initDragGallery(section: HTMLElement, reduced: boolean): void {
  const track = section.querySelector<HTMLElement>("[data-gallery-track]");
  const viewport = section.querySelector<HTMLElement>("[data-gallery-viewport]");
  if (!track || !viewport) return;

  // Touch / no mouse → native horizontal scroll handled purely in CSS.
  if (!window.matchMedia("(hover: hover)").matches) return;

  // Drag bounds: 0 at rest (first photo at the gutter) → negative until the
  // last photo's trailing edge reaches the viewport's right edge. Recomputed
  // on resize since item widths derive from viewport-based sizing.
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

  // Keep bounds correct across resizes (item sizes are viewport-relative).
  // Debounced; clamps the current position back in range.
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
