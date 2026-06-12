import { gsap } from "gsap";

/**
 * Hero — clock, custom cursor, reveal animation, scroll parallax.
 *
 *  - initHero() wires the live clock, the custom cursor, and the
 *    hero-image scroll parallax.
 *  - revealHero() is fired by loader.ts (curtain onStart). It runs
 *    the image scale settle, navbar drop-in, slogan word reveal,
 *    and the scroll cue fade — then starts the slow Ken Burns.
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
  initHeroParallax();
  initHeroImageSwap();
}

/**
 * Hover over "hlučná" or "priestor životu" in the slogan and the
 * hero image crossfades to a different one — same trick as
 * thisisstudiox.com's retail line. Each hoverable element carries
 * a data-hover-image attribute whose value matches a data-image-key
 * on one of the stacked .hero-media-img elements.
 *
 * LAYERED CROSSFADE (no dim midpoint)
 * The naive "fade out old + fade in new" simultaneously leaves
 * both at opacity 0.5 in the middle, showing whatever's beneath
 * through both — a dim, flickering moment. Instead:
 *
 *   1. The default image always sits at opacity 1, z-index 1 —
 *      the permanent backdrop. Never animates.
 *   2. The incoming image gets z-index 3 and fades 0 → 1 OVER
 *      the previous active image (which stays at opacity 1 below).
 *   3. After the fade-in completes, the previous active is
 *      snapped to opacity 0 (invisible because the new one fully
 *      covers it).
 *
 * Result: there's always at least one image at opacity 1 in the
 * visible stack. No dim. No flicker.
 *
 * Leave is debounced (80ms) so that a fast cursor move from one
 * hoverable trigger directly onto another doesn't briefly snap
 * back to default — the pending "go to default" is cancelled the
 * moment a new enter fires.
 */
function initHeroImageSwap(): void {
  const words = document.querySelectorAll<HTMLElement>("[data-hover-image]");
  const images = Array.from(
    document.querySelectorAll<HTMLImageElement>(
      ".hero-media-img[data-image-key]",
    ),
  );
  if (!words.length || !images.length) return;

  const findImage = (key: string) =>
    images.find((img) => img.dataset.imageKey === key) ?? null;

  let activeKey = "default";
  let leaveTimeout: number | null = null;

  const show = (key: string) => {
    if (key === activeKey) return;

    const target = findImage(key);
    if (!target) return;

    const previousKey = activeKey;
    activeKey = key;

    // Going back to default: fade the currently-active hover image
    // OUT to reveal the default sitting underneath. No incoming
    // tween because default is always at opacity 1 already.
    if (key === "default") {
      if (previousKey !== "default") {
        const previous = findImage(previousKey);
        if (previous) {
          gsap.to(previous, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
            overwrite: "auto",
          });
        }
      }
      return;
    }

    // Going to a hover image: bring target above any previous
    // hover image (which stays at opacity 1 underneath while
    // target fades in), then snap previous to 0 once target is
    // fully opaque on top.
    target.style.zIndex = "3";
    const previous = previousKey !== "default" ? findImage(previousKey) : null;
    if (previous && previous !== target) {
      previous.style.zIndex = "2";
    }

    gsap.to(target, {
      opacity: 1,
      duration: 0.8,
      ease: "power2.inOut",
      overwrite: "auto",
      onComplete: () => {
        // Only hide the previous if state hasn't changed back to it.
        if (previous && activeKey !== previousKey) {
          gsap.set(previous, { opacity: 0 });
        }
      },
    });
  };

  words.forEach((word) => {
    const key = word.dataset.hoverImage;
    if (!key) return;

    word.addEventListener("mouseenter", () => {
      if (leaveTimeout !== null) {
        window.clearTimeout(leaveTimeout);
        leaveTimeout = null;
      }
      show(key);
    });

    word.addEventListener("mouseleave", () => {
      // Debounce so cursor moving directly to another hoverable
      // word doesn't briefly snap back to default in between.
      leaveTimeout = window.setTimeout(() => {
        show("default");
        leaveTimeout = null;
      }, 80);
    });
  });
}

/**
 * Scrub parallax — hero image lags behind page scroll, giving the
 * section a sense of depth as content above it scrolls past.
 *
 * yPercent: 12 means as user scrolls hero from top to bottom of
 * viewport, the image translates DOWN by 12% of its own height.
 * Result: image "stays" with the user longer than the surrounding
 * content — classic parallax lag.
 *
 * yPercent only RISES with scroll (starts at 0), so at scroll 0
 * the image fills the section perfectly — no empty area at top.
 * Coexists with the Ken Burns scale tween (different transform
 * channels; GSAP composes them).
 */
function initHeroParallax(): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  gsap.to(".hero-media-img", {
    yPercent: 12,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });
}

/**
 * Custom cursor — circle ring + small square in centre.
 *  - Square follows the mouse tightly (lerp 0.6) — feels responsive.
 *  - Ring lags slightly (lerp 0.18) — gives the "delayed shadow" feel.
 *  - On hover over any anchor/button, ring grows via CSS class. Uses
 *    a single delegated mouseover/mouseout listener instead of
 *    attaching one pair to every <a> and <button> on the page.
 *  - The ticker short-circuits when the cursor has settled to its
 *    target, so a stationary mouse costs zero per-frame work.
 *  - No-op on touch / small screens (system cursor is used there).
 */
function initCursor(): void {
  const cursor = document.getElementById("cursor");
  if (!cursor) return;
  // Match the CSS media query so the JS doesn't run on touch. Gated
  // by pointer capability only (no width) so the custom cursor — and
  // the hover states that depend on it — behave the same at any width
  // on a mouse device.
  if (!window.matchMedia("(hover: hover)").matches) {
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

  // Sub-pixel threshold for "close enough to skip". Anything below
  // half a pixel is invisible on a 1× display anyway.
  const SETTLE = 0.5;

  gsap.ticker.add(() => {
    const dx = mx - sx;
    const dy = my - sy;
    const drx = mx - rx;
    const dry = my - ry;

    // If both followers have caught up to the target, do nothing.
    // A stationary mouse this frame and after costs zero work.
    if (
      Math.abs(dx) < SETTLE &&
      Math.abs(dy) < SETTLE &&
      Math.abs(drx) < SETTLE &&
      Math.abs(dry) < SETTLE
    ) {
      return;
    }

    sx += dx * 0.6;
    sy += dy * 0.6;
    rx += drx * 0.18;
    ry += dry * 0.18;
    square.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
  });

  // Delegated hover detection — one mouseover/mouseout listener on
  // document.body, walks up to find the nearest <a> or <button>.
  // Previously attached two listeners per element (≈ 40+ listeners
  // on this page); now it's two listeners total.
  document.body.addEventListener("mouseover", (e) => {
    const target = (e.target as Element | null)?.closest("a, button");
    if (target) cursor.classList.add("is-hover");
  });
  document.body.addEventListener("mouseout", (e) => {
    const target = (e.target as Element | null)?.closest("a, button");
    if (target) cursor.classList.remove("is-hover");
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
    return;
  }

  const tl = gsap.timeline({
    onComplete: startKenBurns,
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
  // timeline infinite and onComplete never fired.
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
