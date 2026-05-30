import { gsap } from "gsap";
import { getLenis } from "./lenis";

/**
 * Hero — clock, custom cursor, reveal animation, hover plumbing.
 *
 *  - initHero() wires the live clock and the custom cursor.
 *  - revealHero() is fired by loader.ts (curtain onStart). It runs
 *    the image scale settle, navbar drop-in, slogan word reveal,
 *    and the scroll cue fade — then starts the slow Ken Burns and
 *    binds magnetic + scramble for any future opt-in elements.
 *  - bindHovers / initMagnetic / initCtaScramble / bindScrollTos are
 *    kept as no-ops until elements opt in via the data-* attributes
 *    they read (none currently in the markup).
 *
 * GSAP practices: transform/opacity only, stagger over siblings,
 * expo/power3 easings for smooth tails, reduced-motion path snaps
 * to final state. will-change set in CSS not JS so the GPU layer
 * is ready before the first animation frame.
 */

const CLOCK_CITY = "Bardejov";
const CLOCK_TIMEZONE = "Europe/Bratislava";

export function initHero(): void {
  if (typeof window === "undefined") return;
  initClock();
  initCursor();
}

/**
 * Smooth-scroll any element with [data-scroll-to="#selector"] to the
 * referenced target. Kept ready for explicit CTAs ("SEE ALL PROJECTS"
 * etc.) — not used by the hero scroll cue, which is informational
 * only. Uses Lenis when available so motion matches the page scroll.
 *
 * Not wired into initHero yet — add `bindScrollTos()` to init when
 * the first concrete scroll-to button exists.
 */
// @ts-expect-error - intentionally unused until a scroll-to button needs it
function bindScrollTos(): void {
  const els = document.querySelectorAll<HTMLElement>("[data-scroll-to]");
  els.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const sel = el.getAttribute("data-scroll-to") || "";
      const target = document.querySelector<HTMLElement>(sel);
      const targetY = target
        ? target.getBoundingClientRect().top + window.scrollY
        : 0;

      const lenis = getLenis();
      if (lenis) lenis.scrollTo(targetY, { duration: 1.4 });
      else window.scrollTo({ top: targetY, behavior: "smooth" });
    });
  });
}

/**
 * Custom cursor — circle ring + small square in centre.
 *  - Square follows the mouse tightly (lerp 0.6) — feels responsive.
 *  - Ring lags slightly (lerp 0.18) — gives the "delayed shadow" feel.
 *  - On hover over any anchor/button, ring grows via CSS class.
 *  - No-op on touch / small screens (system cursor is used there).
 */
function initCursor(): void {
  const cursor = document.getElementById("cursor");
  if (!cursor) return;
  // Match the CSS media query so the JS doesn't run on touch.
  if (!window.matchMedia("(hover: hover) and (min-width: 821px)").matches) {
    return;
  }

  const square = cursor.querySelector<HTMLElement>(".cursor-square");
  const ring = cursor.querySelector<HTMLElement>(".cursor-ring");
  if (!square || !ring) return;

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let sx = mx;
  let sy = my;
  let rx = mx;
  let ry = my;

  window.addEventListener(
    "mousemove",
    (e) => {
      mx = e.clientX;
      my = e.clientY;
    },
    { passive: true },
  );

  gsap.ticker.add(() => {
    sx += (mx - sx) * 0.6;
    sy += (my - sy) * 0.6;
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    square.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
  });

  // Hover detection — any anchor or button grows the ring.
  document.querySelectorAll<HTMLElement>("a, button").forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
  });
}

function initClock(): void {
  const el = document.querySelector<HTMLElement>("[data-clock]");
  if (!el) return;

  const formatter = new Intl.DateTimeFormat("sk-SK", {
    timeZone: CLOCK_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const render = () => {
    el.textContent = `${CLOCK_CITY} ${formatter.format(new Date())}`;
  };

  render();
  const now = new Date();
  const msToNextMinute =
    (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
  window.setTimeout(() => {
    render();
    window.setInterval(render, 60_000);
  }, msToNextMinute);
}

/**
 * Reveal the hero. Called by loader.ts once its background fade
 * has hidden the loader element.
 */
let revealed = false;
export function revealHero(): void {
  if (typeof window === "undefined" || revealed) return;
  revealed = true;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Seed the masked-word initial state on the GSAP side. CSS only
  // sets opacity:0 (see the comment in Hero.astro) to avoid the
  // CSS-translateY/yPercent matrix-decomposition trap that breaks
  // mask-reveal animations.
  gsap.set(".hero-title-word", { yPercent: 110, opacity: 0 });

  if (reduced) {
    gsap.set(".hero-media-img", { scale: 1 });
    gsap.set(".hero-media-overlay", { opacity: 0.3 });
    gsap.set(".hero-title-word, .nav-animate, .hero-scroll", {
      opacity: 1,
      y: 0,
      yPercent: 0,
    });
    bindHovers();
    initMagnetic();
    initCtaScramble();
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      bindHovers();
      initMagnetic();
      initCtaScramble();
      startKenBurns();
    },
  });

  // 1. Image — Ken Burns intro: scale 1.1 → 1 over 1.6s, expo.out.
  //    This runs UNDER the rising loader curtain. As the curtain
  //    moves up, more of the image is exposed; meanwhile the image
  //    is gently settling from a slight zoom. That's the
  //    "image rises from below" feel — pure compositor work,
  //    glass-smooth, no bitmap re-interpolation.
  tl.to(
    ".hero-media-img",
    {
      scale: 1,
      duration: 1.6,
      ease: "expo.out",
    },
    0,
  );

  // 2. Overlay fades in during the image settle so by the time text
  //    arrives the contrast is already there.
  tl.to(
    ".hero-media-overlay",
    {
      opacity: 0.3,
      duration: 1.1,
      ease: "power2.out",
    },
    0,
  );

  // 3. Navbar — staggered drop-in from above.
  tl.to(
    ".nav-animate",
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.08,
    },
    0.5,
  );

  // 4. Slogan — word-by-word mask reveal from below. Same technique
  //    as the loader's word reveals: the curtain motion above and the
  //    word slide-ups below echo each other.
  //
  // Note: the slow Ken Burns is started as a SEPARATE tween in
  // onComplete — keeping it in the timeline (repeat: -1) made the
  // timeline infinite and onComplete (where initMagnetic runs) never
  // fired. That's why the magnetic effect was silently dead.
  tl.to(
    ".hero-title-word",
    {
      yPercent: 0,
      opacity: 1,
      duration: 1.0,
      ease: "expo.out",
      stagger: 0.05,
    },
    0.85,
  );

  // 5. Scroll cue — slides up + fades in last, signals "you can move".
  tl.to(
    ".hero-scroll",
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power3.out",
    },
    1.4,
  );
}

/**
 * Slow Ken Burns on the hero image — runs independently so it can
 * repeat forever without holding the reveal timeline open.
 */
function startKenBurns(): void {
  gsap.to(".hero-media-img", {
    scale: 1.06,
    duration: 22,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
  });
}

/**
 * Hover micro-interactions. Bound after the reveal completes so
 * pointer events don't fight the entrance animations.
 *
 * All current hover states (nav link flips, CTA invert + flip,
 * arrow translate, cursor grow) are handled by pure CSS transitions.
 * Kept as a hook so future orchestrated GSAP hovers can drop in.
 */
function bindHovers(): void {
  /* no-op for now — CSS handles the active hover effects */
}

/**
 * Magnetic effect — Colette pattern. Only kicks in when the cursor
 * is over the element (mousemove fires only inside its bounds), so
 * the pull is subtle and disciplined, not a "field" you trigger from
 * across the screen. Spring-back to origin on mouseleave.
 *
 * STRENGTH 0.25 = ~quarter of the cursor offset from centre →
 * noticeable but never silly.
 */
let magneticStarted = false;
function initMagnetic(): void {
  if (magneticStarted) return;
  magneticStarted = true;
  if (typeof window === "undefined") return;
  if (!window.matchMedia("(hover: hover) and (min-width: 821px)").matches) {
    return;
  }

  const STRENGTH = 0.25;
  const targets = document.querySelectorAll<HTMLElement>("[data-magnetic]");

  targets.forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * STRENGTH;
      const y = (e.clientY - rect.top - rect.height / 2) * STRENGTH;
      gsap.to(el, { x, y, duration: 0.4, ease: "power3.out" });
    });
    el.addEventListener("mouseleave", () => {
      // Elastic spring-back gives the "magnet releases" feel.
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
    });
  });
}

/**
 * CTA letter scramble — each char cycles random A-Z/0-9 before
 * locking onto its final letter. Left-to-right stagger so the
 * resolve reads as a wave. Inspired by Glass Field / awwwards
 * pattern but tuned subtle for an architecture studio.
 *
 *  - Lock time per char: 150ms base + i * 28ms stagger
 *  - Char-swap tick: 38ms (≈ 26 fps for the scramble itself)
 *  - mouseleave cancels mid-scramble and snaps back to the
 *    original text — the button is never stuck in a garbled state.
 */
let ctaScrambleStarted = false;
function initCtaScramble(): void {
  if (ctaScrambleStarted) return;
  ctaScrambleStarted = true;

  const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randChar = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];

  const ctas = document.querySelectorAll<HTMLElement>("[data-cta-scramble]");

  ctas.forEach((cta) => {
    const textEl = cta.querySelector<HTMLElement>(".nav-cta-text");
    if (!textEl) return;

    const original = (textEl.textContent || "").trim();
    if (!original) return;

    // Split original text into per-char spans. Array.from handles
    // multi-byte chars (á, č, ď, etc.) cleanly — String.split('')
    // would break on surrogate pairs.
    const chars = Array.from(original);
    textEl.textContent = "";
    const charEls: HTMLElement[] = chars.map((ch) => {
      const span = document.createElement("span");
      span.className = "nav-cta-char";
      span.textContent = ch === " " ? " " : ch;
      textEl.appendChild(span);
      return span;
    });

    let intervalId: number | null = null;

    const reset = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
      charEls.forEach((el, i) => {
        const ch = chars[i];
        el.textContent = ch === " " ? " " : ch;
      });
    };

    const scramble = () => {
      if (intervalId !== null) window.clearInterval(intervalId);

      const start = performance.now();
      const swapMs = 38;
      const baseLock = 150;
      const perCharStagger = 28;

      intervalId = window.setInterval(() => {
        const elapsed = performance.now() - start;
        let stillScrambling = false;

        charEls.forEach((el, i) => {
          const ch = chars[i];
          const lockAt = baseLock + i * perCharStagger;
          if (ch === " ") return;
          if (elapsed >= lockAt) {
            el.textContent = ch;
          } else {
            el.textContent = randChar();
            stillScrambling = true;
          }
        });

        if (!stillScrambling) {
          if (intervalId !== null) {
            window.clearInterval(intervalId);
            intervalId = null;
          }
        }
      }, swapMs);
    };

    cta.addEventListener("mouseenter", scramble);
    cta.addEventListener("mouseleave", reset);
  });
}
