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

// ── Audio: a soft harp voice (Karplus–Strong plucked-string synthesis). Native
// Web Audio, zero assets — the notes are generated, not loaded. The context
// only wakes on activation, so it costs nothing until the egg is opened.
// Kept deliberately quiet: "It isn't loud. But it resonates."
const MASTER_GAIN = 0.12; // overall level — intentionally low
const ROOT_HZ = 261.63; // C4 — harp register: clear and airy, still not tinkly
const PLUCK_SECONDS = 1.2; // per-note buffer length (harp strings ring longer)
const TRIGGER_ON = 0.55; // cursor must genuinely cross a line to sound it
const TRIGGER_OFF = 0.15; // and leave it before it can ring again (hysteresis)
const VARIANTS = 2; // pre-rendered takes per note — no two plucks identical
const PAN_SPREAD = 0.7; // stereo width: left lines sound left (eye ↔ ear)
const DETUNE_CENTS = 7; // ± per-pluck micro-detune — alive, never off-key

// Karplus–Strong: a burst of noise fed through a short, lightly-damped delay
// line rings down like a plucked string. Delay length = one wavelength = pitch.
function makePluckBuffer(
  ctx: AudioContext,
  freq: number,
  seconds: number,
): AudioBuffer {
  const sr = ctx.sampleRate;
  const n = Math.max(2, Math.round(sr / freq)); // delay line = one wavelength
  const len = Math.floor(sr * seconds);
  const buffer = ctx.createBuffer(1, len, sr);
  const out = buffer.getChannelData(0);
  const line = new Float32Array(n);
  for (let i = 0; i < n; i++) line[i] = Math.random() * 2 - 1; // pluck = noise
  // Harp, not guitar: the string is set off by a fingertip, not a pick.
  // Two passes of a two-point average lowpass the noise burst, so the
  // attack comes out round instead of twangy.
  for (let pass = 0; pass < 2; pass++) {
    let prev = line[n - 1];
    for (let i = 0; i < n; i++) {
      const cur = line[i];
      line[i] = 0.5 * (cur + prev);
      prev = cur;
    }
  }
  const damp = 0.997; // ~1 rings longer; lower = shorter, duller
  let idx = 0;
  for (let i = 0; i < len; i++) {
    out[i] = line[idx];
    const next = line[(idx + 1) % n];
    line[idx] = 0.5 * (line[idx] + next) * damp; // lowpass feedback = decay
    idx = (idx + 1) % n;
  }
  // Fade the tail so the note ends like a muted string, not a tape cut —
  // at these damp values the loop still carries amplitude when the buffer
  // runs out, and a hard truncation would click.
  const fade = Math.min(len, Math.floor(sr * 0.35));
  for (let i = 0; i < fade; i++) {
    out[len - 1 - i] *= i / fade;
  }
  return buffer;
}

// The lines → an ascending major-pentatonic run (left = low). No two crossings
// can clash, so any sweep across the grid stays consonant — like a harp.
function buildPentatonic(count: number, root: number): number[] {
  const steps = [0, 2, 4, 7, 9]; // major pentatonic, in semitones
  return Array.from({ length: count }, (_, i) => {
    const semis = steps[i % steps.length] + 12 * Math.floor(i / steps.length);
    return root * Math.pow(2, semis / 12);
  });
}

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
  const armed = pos.map(() => true); // per line: ready to sound on next crossing
  let mx = -99999;
  let mxPrev = -99999; // last frame's x → cursor speed → pluck strength
  let my = 0;
  let raf = 0;
  let active = false;

  // Web Audio — created lazily on first activation (a user gesture has
  // happened by then, so autoplay policy is satisfied) and reused after.
  let audioCtx: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let pluckBuffers: AudioBuffer[][] | null = null; // [line][variant]

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

  // Build the audio graph once, then pre-render one plucked-string buffer per
  // line (tuned to the pentatonic). Cheap, and only ever runs on activation.
  const ensureAudio = () => {
    if (audioCtx) {
      if (audioCtx.state === "suspended") void audioCtx.resume();
      return;
    }
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return;
    audioCtx = new AC();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = MASTER_GAIN;
    const lp = audioCtx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 4200; // keep the airy top — glassy harp, not woody guitar
    masterGain.connect(lp);
    lp.connect(audioCtx.destination);
    const freqs = buildPentatonic(paths.length, ROOT_HZ);
    // A few takes per note (different noise bursts) so repeated plucks of
    // the same line never sound like the same cloned sample.
    pluckBuffers = freqs.map((f) =>
      Array.from({ length: VARIANTS }, () =>
        makePluckBuffer(audioCtx!, f, PLUCK_SECONDS),
      ),
    );
  };

  // Fire one note: a cached pluck buffer through a per-note gain (a 4 ms
  // attack ramp avoids a click), scaled by how hard the string was struck.
  const playPluck = (i: number, strength: number) => {
    if (!audioCtx || !masterGain || !pluckBuffers) return;
    const takes = pluckBuffers[i];
    if (!takes) return;
    const buf = takes[Math.floor(Math.random() * takes.length)];
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    // Micro-detune each pluck by ± a few cents — far below the threshold of
    // sounding out of tune, but no two plucks land on the exact same pitch.
    src.playbackRate.value = Math.pow(
      2,
      ((Math.random() * 2 - 1) * DETUNE_CENTS) / 1200,
    );
    const g = audioCtx.createGain();
    const t = audioCtx.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(strength, t + 0.004);
    src.connect(g);
    // Place the note where the line is — left lines sound from the left.
    let tail: AudioNode = g;
    if (typeof audioCtx.createStereoPanner === "function") {
      const pan = audioCtx.createStereoPanner();
      pan.pan.value = (pos[i] - 0.5) * PAN_SPREAD;
      g.connect(pan);
      tail = pan;
    }
    tail.connect(masterGain);
    src.start(t);
    src.stop(t + buf.duration + 0.1); // margin for the detuned (slower) takes
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
    const speed = Math.abs(mx - mxPrev); // px/frame → how hard a string is struck
    mxPrev = mx;
    // Snapshot velocities so the neighbour coupling reads a consistent
    // previous state (symmetric, no left-to-right bias).
    for (let i = 0; i < n; i++) velPrev[i] = vel[i];

    for (let i = 0; i < n; i++) {
      const x = xOf(i);
      const dx = mx - x;
      const ad = Math.abs(dx);
      const influence = ad < RANGE ? 1 - ad / RANGE : 0;

      // Sound one note when the cursor genuinely crosses a line; re-arm only
      // after it leaves (hysteresis) so a hovering cursor doesn't retrigger.
      if (audioCtx) {
        if (armed[i] && influence > TRIGGER_ON) {
          playPluck(i, Math.min(1, 0.35 + speed * 0.018));
          armed[i] = false;
        } else if (!armed[i] && influence < TRIGGER_OFF) {
          armed[i] = true;
        }
      }

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
    ensureAudio();
    for (let i = 0; i < paths.length; i++) {
      bend[i] = 0;
      vel[i] = 0;
      glow[i] = 0;
      armed[i] = true;
    }
    straighten();
    mx = -99999;
    mxPrev = -99999;
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
