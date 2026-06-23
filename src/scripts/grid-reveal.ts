import { gsap } from "gsap";

/**
 * Grid reveal — the structure easter egg (see GridOverlay.astro).
 *
 * Press-and-hold any [data-grid-trigger] logo for 2s and the 12-column
 * grid draws in (no visible "charging" — it's a secret). Move the cursor
 * near a line and it bends toward it like a plucked string, then springs
 * back. Dismiss with Esc or any click; a quick tap on the logo still
 * navigates home (only a full hold opens the grid, and the release-click
 * is swallowed so it neither navigates nor instantly dismisses).
 *
 * Scroll is deliberately NOT locked — the grid is fixed, so you can
 * scroll and watch each section snap onto the columns.
 */
const HOLD_MS = 2000;

// Bend tuning (px / fractions).
const RANGE = 60; // only the line the cursor is crossing reacts
const STRENGTH = 0.9; // how far the cursor displaces (plucks) the string
const MAX_BEND = 22; // max pluck displacement
const BASE_OPACITY = 0.32; // resting: clearly subtle, a complement not a voice
const PEAK_OPACITY = 0.6; // a vibrating string glows a bit brighter red

// TAUT STRING physics — the whole line bows like a plucked string fixed at
// both ends, and on release it VIBRATES: high stiffness = a fast, tight
// pitch; lighter damping = it rings down over a few oscillations (a twang)
// instead of a single dead bend.
const STIFFNESS = 0.45;
const DAMPING = 0.88;

// SYMPATHETIC resonance — a plucked string passes a little of its energy to
// its neighbours, which then vibrate faintly with a slight delay (then it
// dies down). Modelled as a diffusion of velocity along the lines (a damped
// wave): the second-derivative spreads motion outward, weaker the further
// it travels. Small + bounded by DAMPING so it stays a whisper, not a wave
// pool — in keeping with the brief's "not loud".
const COUPLING = 0.14;

export function initGridReveal(): void {
  if (typeof window === "undefined") return;

  const overlay = document.getElementById("grid-overlay");
  const svg = overlay?.querySelector<SVGSVGElement>("svg.grid-svg");
  if (!overlay || !svg) return;

  const triggers = Array.from(
    document.querySelectorAll<HTMLElement>("[data-grid-trigger]"),
  );
  if (!triggers.length) return;

  // A quiet signature for anyone who opens the console (Awwwards juries do).
  // English for the international jury; it still echoes the hero slogan
  // ("Architecture shouldn't be loud…"), the brand word in structural red,
  // plus the hint so the curious actually find the grid. Never on the page.
  // eslint-disable-next-line no-console
  console.log(
    "%cIt isn't loud. But it resonates.\n%c↳ Hold the logo (2s) to reveal the structure.\n\n%cMade by NOIRFØRM",
    "color:#C73E2C;font:600 13px/1.7 ui-monospace,SFMono-Regular,monospace",
    "color:#9a9a9a;font:12px/1.6 ui-monospace,SFMono-Regular,monospace",
    "color:#9a9a9a;font:11px/1.6 ui-monospace,SFMono-Regular,monospace;letter-spacing:.04em",
  );

  const paths = Array.from(svg.querySelectorAll<SVGPathElement>(".grid-line"));
  const pos = paths.map((p) => parseFloat(p.dataset.pos || "0"));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0;
  let H = 0;
  let originX = 0;
  let originY = 0;
  const bend = pos.map(() => 0);
  const vel = pos.map(() => 0); // spring velocity per line
  const velPrev = pos.map(() => 0); // frame snapshot for symmetric coupling
  const glow = pos.map(() => 0); // smoothed amplitude → opacity (no flicker)
  let mx = -99999;
  let my = 0;
  let raf = 0;
  let active = false;

  let holdTimer: number | null = null;
  let charging: HTMLElement | null = null;

  const measure = () => {
    const r = svg.getBoundingClientRect();
    W = r.width;
    H = r.height;
    originX = r.left;
    originY = r.top;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  };

  const xOf = (i: number) => pos[i] * W;

  const straighten = () => {
    for (let i = 0; i < paths.length; i++) {
      const x = xOf(i);
      paths[i].setAttribute("d", `M ${x} 0 L ${x} ${H}`);
    }
  };

  // Per-frame: each line is a plucked string. The cursor displaces it; the
  // whole line bows (fixed at top + bottom, leaning toward the cursor's
  // height). On release the under-damped spring rings down over a few
  // oscillations — the string vibrates. `glow` is a smoothed envelope of
  // the amplitude so the red brightens on the pluck and fades as it
  // settles, rather than flickering with every oscillation.
  const frame = () => {
    const cy = my;
    const n = paths.length;
    // Snapshot velocities so the neighbour coupling reads a consistent
    // previous state (symmetric, no left-to-right bias).
    for (let i = 0; i < n; i++) velPrev[i] = vel[i];

    for (let i = 0; i < n; i++) {
      const x = xOf(i);
      const dx = mx - x;
      const ad = Math.abs(dx);
      const influence = ad < RANGE ? 1 - ad / RANGE : 0;
      let target = dx * STRENGTH * influence;
      target = Math.max(-MAX_BEND, Math.min(MAX_BEND, target));

      // Direct pluck — under-damped harmonic motion (vibrates on release).
      vel[i] += (target - bend[i]) * STIFFNESS;
      // Sympathetic resonance — velocity diffuses to neighbours so a pluck
      // faintly stirs the lines around it, then dies (fixed-ish at the ends).
      const left = i > 0 ? velPrev[i - 1] : velPrev[i];
      const right = i < n - 1 ? velPrev[i + 1] : velPrev[i];
      vel[i] += COUPLING * (left + right - 2 * velPrev[i]);
      vel[i] *= DAMPING;
      bend[i] += vel[i];
      const cur = bend[i];

      if (Math.abs(cur) < 0.04 && Math.abs(vel[i]) < 0.04) {
        paths[i].setAttribute("d", `M ${x} 0 L ${x} ${H}`);
      } else {
        paths[i].setAttribute("d", `M ${x} 0 Q ${x + cur} ${cy} ${x} ${H}`);
      }

      glow[i] = Math.max(Math.abs(cur), glow[i] * 0.9);
      const op =
        BASE_OPACITY +
        Math.min(1, glow[i] / MAX_BEND) * (PEAK_OPACITY - BASE_OPACITY);
      paths[i].style.opacity = String(op);
    }
    raf = requestAnimationFrame(frame);
  };

  const startLoop = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  const stopLoop = () => {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const clearCharge = () => {
    if (holdTimer !== null) {
      window.clearTimeout(holdTimer);
      holdTimer = null;
    }
    charging = null;
  };

  // Swallow exactly one upcoming click — the release of the long-press.
  const swallowNextClick = () => {
    const handler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      cleanup();
    };
    const cleanup = () => {
      document.removeEventListener("click", handler, true);
      window.clearTimeout(timeout);
    };
    const timeout = window.setTimeout(cleanup, 600);
    document.addEventListener("click", handler, true);
  };

  const activate = () => {
    clearCharge();
    if (active) return;
    active = true;
    swallowNextClick();
    measure();
    for (let i = 0; i < paths.length; i++) {
      bend[i] = 0;
      vel[i] = 0;
      glow[i] = 0;
    }
    straighten();
    mx = -99999;
    my = H / 2;
    overlay.setAttribute("data-active", "");

    if (reduced) {
      paths.forEach((p) => (p.style.opacity = String(BASE_OPACITY)));
      startLoop();
      return;
    }
    // Draw the lines in left → right, then hand opacity to the loop.
    paths.forEach((p) => (p.style.opacity = "0"));
    gsap.to(paths, {
      opacity: BASE_OPACITY,
      duration: 0.5,
      ease: "power2.out",
      stagger: 0.03,
      onComplete: startLoop,
    });
  };

  const dismiss = () => {
    if (!active) return;
    active = false;
    stopLoop();
    const done = () => overlay.removeAttribute("data-active");
    if (reduced) {
      done();
      return;
    }
    gsap.to(paths, {
      opacity: 0,
      duration: 0.35,
      ease: "power2.in",
      stagger: { each: 0.02, from: "end" },
      onComplete: done,
    });
  };

  triggers.forEach((el) => {
    el.addEventListener("pointerdown", (e) => {
      if (active) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      charging = el;
      holdTimer = window.setTimeout(activate, HOLD_MS);
    });
    el.addEventListener("pointerup", clearCharge);
    el.addEventListener("pointerleave", clearCharge);
    el.addEventListener("pointercancel", clearCharge);
    el.addEventListener("contextmenu", (e) => {
      if (charging || active) e.preventDefault();
    });
  });

  overlay.addEventListener("pointermove", (e) => {
    mx = e.clientX - originX;
    my = e.clientY - originY;
  });
  // Cursor leaves the overlay → relax all lines back to straight.
  overlay.addEventListener("pointerleave", () => {
    mx = -99999;
  });
  overlay.addEventListener("click", dismiss);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") dismiss();
  });
  window.addEventListener("resize", () => {
    if (active) measure();
  });
}
