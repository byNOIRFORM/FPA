import { gsap } from "gsap";
import { revealHero } from "./hero";
import { isTransitionArrival } from "./page-transition";

/**
 * Intro loader — isometric house + FOTTA//POPADIČ / architekt lockup.
 *
 * Sequence (normal flow):
 *   0.00s  Icon breathes in (scale 0.94 → 1, opacity 0 → 1, expo.out).
 *          Walls draw (0–0.6s), roof (0.5–1.0s), ridge (1.05–1.4s).
 *   0.25s  "FOTTA/" rises from its mask.
 *   0.40s  "/POPADIČ" rises.
 *   0.55s  "architekt" rises.
 *   1.50s  Curtain outro starts: .loader yPercent → -100 (1.0s,
 *          expo.inOut), revealHero() fires in onStart, .loader-content
 *          is counter-translated +vh so the logo stays planted in
 *          place while the curtain travels up around it. Lockup opacity
 *          fades to 0 in the last 0.4s.
 *   2.50s  Curtain done → display:none, hero takes over.
 *
 * Safeguards:
 *   - FAILSAFE_MS timeout force-removes the loader if anything stalls.
 *   - prefers-reduced-motion: skip animation entirely, just show + fade.
 *
 * Pre-launch TODO: gate the loader on sessionStorage so it only plays
 * on the first visit per session. (Tracked in the parked-work memory.)
 */

// Sits just above the natural ~2.5s outro so the failsafe doesn't cut
// the curtain rise short. Still well under any user-perceived "stuck".
const FAILSAFE_MS = 3600;

export function initLoader(): void {
  if (typeof window === "undefined") return;

  const root = document.getElementById("loader");
  if (!root) return;

  // Arriving under the page-transition curtain — skip the house intro
  // entirely. The curtain owns this entrance; replaying the full
  // intro on every internal navigation would wear thin. The hero
  // reveal still plays underneath the lifting curtain.
  // (isTransitionArrival is captured at import time, so this works
  // regardless of when page-transition.ts clears the attribute.)
  if (isTransitionArrival) {
    document.body.removeAttribute("data-loader-active");
    root.remove();
    revealHero();
    return;
  }

  document.body.setAttribute("data-loader-active", "");

  const finish = createFinisher(root);
  const failsafeId = window.setTimeout(finish, FAILSAFE_MS);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    // CSS already shows everything statically under reduced-motion.
    window.setTimeout(() => {
      window.clearTimeout(failsafeId);
      finish();
    }, 400);
    return;
  }

  playIntro(root, () => {
    window.clearTimeout(failsafeId);
    finish();
  });
}

function playIntro(root: HTMLElement, onDone: () => void): void {
  const paths = root.querySelectorAll<SVGPathElement>(".loader-icon .draw");

  // Prepare each path individually — every path has its own getTotalLength().
  paths.forEach((p) => {
    try {
      const len = p.getTotalLength();
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = String(len);
    } catch {
      /* If measurement fails (very rare), the CSS fallback keeps it hidden. */
    }
  });

  const tl = gsap.timeline({
    onComplete: onDone,
  });

  // 0. Breathe the whole icon in (scale + opacity) so the first frame
  //    feels "placed", not popped. Soft expo ease for that glassy rise.
  tl.from(
    ".loader-icon",
    {
      scale: 0.94,
      opacity: 0,
      duration: 1.0,
      ease: "expo.out",
    },
    0,
  );

  // 1. Walls (front, side) — base of the house, drawn first, bottom-up.
  tl.to(
    [".draw-front", ".draw-side"],
    {
      strokeDashoffset: 0,
      duration: 0.6,
      ease: "power3.out",
      stagger: 0.1,
    },
    0,
  );

  // 2. Roof (left gable, right slope) — second beat.
  tl.to(
    [".draw-roof-left", ".draw-roof-right"],
    {
      strokeDashoffset: 0,
      duration: 0.5,
      ease: "power3.out",
      stagger: 0.1,
    },
    0.5,
  );

  // 3. Ridge — final accent stroke that ties the roof together.
  tl.to(
    ".draw-ridge",
    {
      strokeDashoffset: 0,
      duration: 0.35,
      ease: "power2.out",
    },
    1.05,
  );

  // 4. Text reveal — runs OVER the house drawing so the two beats
  //    interlock. Each word slides up from a mask (yPercent 110 → 0)
  //    while fading in. The opacity component prevents a one-frame
  //    flash before gsap.set lands, AND smooths the glass-like feel.
  //
  //    Note: CSS keeps .word at opacity:0 with NO transform — see the
  //    comment in the component's <style>. We seed yPercent here so
  //    GSAP owns the transform channel from the very first frame.
  gsap.set(".word", { yPercent: 110, opacity: 0 });

  // Tight, flowing succession — each word starts as the previous is
  // mid-rise, so the three slides read as one continuous wave.
  tl.to(
    ".word-fotta",
    { yPercent: 0, opacity: 1, duration: 0.6, ease: "expo.out" },
    0.25,
  )
    .to(
      ".word-popadic",
      { yPercent: 0, opacity: 1, duration: 0.6, ease: "expo.out" },
      0.4,
    )
    .to(
      ".loader-name-sub",
      { yPercent: 0, opacity: 1, duration: 0.6, ease: "expo.out" },
      0.55,
    );

  // 5. Brief hold after "architekt" lands (~1.15s).
  //
  // 6. Seamless handoff:
  //    - .loader root rises as a curtain (yPercent: -100)
  //    - revealHero() fires in onStart → hero image settles under it
  //    - .loader-content is COUNTER-translated by the same viewport
  //      height in pixels, so visually the logo stays planted at
  //      its original position while the curtain travels up around
  //      it. The lockup fades to 0 in the last 0.4s of the rise.
  const vh = window.innerHeight;
  tl.to(
    root,
    {
      yPercent: -100,
      duration: 1.0,
      ease: "expo.inOut",
      onStart: revealHero,
      onComplete: () => {
        root.style.display = "none";
        root.style.pointerEvents = "none";
      },
    },
    1.5,
  )
    .to(
      ".loader-content",
      {
        y: vh,
        duration: 1.0,
        ease: "expo.inOut",
      },
      1.5,
    )
    .to(
      ".loader-content",
      {
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
      },
      2.1,
    );
}

function createFinisher(root: HTMLElement): () => void {
  let done = false;
  return () => {
    if (done) return;
    done = true;

    document.body.removeAttribute("data-loader-active");
    root.setAttribute("data-loader-done", "");

    // Hand off to the hero. Safe to call in all paths — revealHero
    // also handles reduced motion by snapping to final state.
    revealHero();

    window.setTimeout(() => {
      root.remove();
    }, 550);
  };
}
