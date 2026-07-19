import { gsap } from "gsap";
import { revealHero } from "./hero";
import { isTransitionArrival } from "./page-transition";

/**
 * Intro loader — the official FPA logo mark only (the isometric house
 * was removed after client feedback; the mark's own letterforms carry
 * the intro alone, at the exact timeline positions they always had).
 *
 * Sequence (normal flow):
 *   0.25s  "fotta" line rises into its SVG clip band.
 *   0.40s  "popadič" line rises.
 *   0.55s  "architekt" line rises.
 *   1.50s  Curtain outro starts: .loader yPercent → -100 (1.0s,
 *          expo.inOut), revealHero() fires in onStart, .loader-content
 *          is counter-translated +vh so the logo stays planted in
 *          place while the curtain travels up around it. Mark opacity
 *          fades to 0 in the last 0.4s.
 *   2.50s  Curtain done → display:none, hero takes over.
 *
 * Safeguards:
 *   - FAILSAFE_MS timeout force-removes the loader if anything stalls.
 *   - prefers-reduced-motion: skip animation entirely, just show + fade.
 *
 * Once per session: the intro is a first-arrival brand moment, so a
 * sessionStorage flag makes it play only on the visitor's FIRST homepage
 * view this session — every later homepage load (reload, or returning
 * from a subpage) hands straight to the hero. Cleared when the browser
 * session ends, so a fresh visit later still gets the intro.
 */

// Sits just above the natural ~2.5s outro so the failsafe doesn't cut
// the curtain rise short. Still well under any user-perceived "stuck".
const FAILSAFE_MS = 3600;

// Session flag — set on the first homepage view, checked on every later
// one. try/catch guards private-mode where storage throws.
const SEEN_KEY = "fpa:loader-seen";

export function initLoader(): void {
  if (typeof window === "undefined") return;

  const root = document.getElementById("loader");
  if (!root) return;

  // We're on the homepage (the only page with #loader). Read the session
  // flag, then mark the session as "entered" — any later homepage view
  // this session skips the intro, whether this one plays or is skipped.
  let seen = false;
  try {
    seen = sessionStorage.getItem(SEEN_KEY) === "1";
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* private mode — storage throws; the intro just plays each time */
  }

  // Skip the logo intro when EITHER:
  //   - arriving under the page-transition curtain (internal nav — the
  //     curtain owns this entrance; replaying the intro would wear thin),
  //   - or it already played this session (seen).
  // Both hand straight to the hero. (isTransitionArrival is captured at
  // import time, so it's stable regardless of when the attribute clears.)
  if (isTransitionArrival || seen) {
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
  const tl = gsap.timeline({
    onComplete: onDone,
  });

  // 1. Logo reveal — each logo line slides up into its SVG clip band
  // (yPercent 110 → 0) while fading in, the exact word-mask move the
  // old text lockup used, at the same timeline positions. yPercent on
  // an SVG <g> resolves against the group's own bbox height; 110%
  // clears the band's 1.5-unit padding, so the line starts fully
  // hidden below its band.
  //
  // Note: CSS keeps .lg-line at opacity:0 with NO transform — see the
  // comment in the component's <style>. We seed yPercent here so
  // GSAP owns the transform channel from the very first frame.
  gsap.set(".lg-line", { yPercent: 110, opacity: 0 });

  // Tight, flowing succession — each line starts as the previous is
  // mid-rise, so the three slides read as one continuous wave.
  tl.to(
    ".lg-line-1",
    { yPercent: 0, opacity: 1, duration: 0.6, ease: "expo.out" },
    0.25,
  )
    .to(
      ".lg-line-2",
      { yPercent: 0, opacity: 1, duration: 0.6, ease: "expo.out" },
      0.4,
    )
    .to(
      ".lg-line-3",
      { yPercent: 0, opacity: 1, duration: 0.6, ease: "expo.out" },
      0.55,
    );

  // 2. Brief hold after "architekt" lands (~1.15s).
  //
  // 3. Seamless handoff:
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
