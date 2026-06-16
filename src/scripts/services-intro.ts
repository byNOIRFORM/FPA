/**
 * Služby intro — "drawing becomes reality".
 *
 * The technical BLUEPRINT shows first; on load it rises from below,
 * fades in and zooms from 80% to the full-bleed 100wh hero. Scroll is
 * locked until that finishes. Then, as the visitor scrolls, the finished
 * PHOTO of the same house reveals over the blueprint as a veil dropping
 * from top to bottom — enacting the section's copy: "begins with a
 * precise drawing, ends with lasting architecture".
 *
 * Both layers ride a single frame that carries the whole intro motion,
 * so blueprint and photo stay aligned. GSAP owns the frame transform
 * entirely (no CSS transform) — a CSS percent-translate leaks into
 * GSAP's px channel and never returns to 0, leaving a permanent offset
 * (the cream-band bug). Fallback (reduced motion): the finished photo
 * stays.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "./lenis";

export function initServicesIntro(): void {
  if (typeof window === "undefined") return;
  const section = document.querySelector<HTMLElement>(".sintro");
  if (!section) return;

  initNavTheme(section);
  initReveal(section);
  initTitleReveal();
}

/**
 * Title band — words scrub colour from grey (--ink-faint) to #222 as the
 * user scrolls through, staggered left-to-right. Same reveal as the home
 * About headline (.about-word).
 */
function initTitleReveal(): void {
  const title = document.querySelector<HTMLElement>(".sintro-title");
  if (!title) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    gsap.set(".sintro-word", { color: "#222" });
    return;
  }

  // Ensure the plugin is registered (this script runs before gsap-setup
  // on the page) before building a scrollTrigger-driven tween.
  gsap.registerPlugin(ScrollTrigger);

  // Same range as the home About headline. The Služby section below the
  // title band isn't built yet, so on this short page the reveal won't
  // fully complete (you can't scroll far enough) — that's fine; once the
  // rest of the section exists beneath it, there's scroll room and the
  // word-by-word reveal completes exactly like home, no change needed.
  gsap.to(".sintro-word", {
    color: "#222",
    ease: "none",
    stagger: { each: 0.4 },
    scrollTrigger: {
      trigger: title,
      start: "top 80%",
      end: "bottom 70%",
      scrub: 0.6,
    },
  });
}

/** Light nav over the photo → dark-on-cream once the hero leaves. */
function initNavTheme(section: HTMLElement): void {
  const nav = document.querySelector<HTMLElement>(".snav");
  if (!nav) return;

  if (typeof IntersectionObserver === "undefined") {
    nav.classList.add("is-scrolled");
    return;
  }
  const observer = new IntersectionObserver(
    ([entry]) => nav.classList.toggle("is-scrolled", !entry.isIntersecting),
    { rootMargin: "-60px 0px 0px 0px", threshold: 0 },
  );
  observer.observe(section);
}

function initReveal(section: HTMLElement): void {
  const frame = section.querySelector<HTMLElement>(".sintro-frame");
  const photo = section.querySelector<HTMLElement>(".sintro-photo");
  const blueprint = section.querySelector<HTMLElement>(".sintro-blueprint");
  if (!frame || !photo || !blueprint) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    // Show the finished result, no animation.
    gsap.set(frame, { opacity: 1 });
    gsap.set(photo, { clipPath: "inset(0px 0px 0% 0px)" });
    return;
  }

  const play = () => {
    // GSAP owns the whole transform — yPercent animates cleanly to 0,
    // so there is never a leftover px offset (no cream band).
    gsap.set(frame, { yPercent: 22, scale: 0.8, opacity: 0 });

    const lenis = getLenis();
    const html = document.documentElement;
    const blockMove = (e: Event) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      const keys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "];
      if (keys.includes(e.key)) e.preventDefault();
    };

    // The reveal can't start until the hero is full-bleed, otherwise the
    // veil shows while the frame is still at 80% / mid-rise (cream band).
    // `overflow:hidden` alone is unreliable, so we also stop Lenis and
    // swallow wheel / touch / scroll-key input.
    const lock = () => {
      window.scrollTo(0, 0);
      lenis?.stop();
      html.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      window.addEventListener("wheel", blockMove, { passive: false });
      window.addEventListener("touchmove", blockMove, { passive: false });
      window.addEventListener("keydown", blockKeys, { passive: false });
    };
    const unlock = () => {
      html.style.overflow = "";
      document.body.style.overflow = "";
      window.removeEventListener("wheel", blockMove);
      window.removeEventListener("touchmove", blockMove);
      window.removeEventListener("keydown", blockKeys);
      lenis?.start();
    };
    lock();

    // ---- Intro: rise + fade in, THEN zoom to full-bleed 100wh ----
    const intro = gsap.timeline({
      defaults: { ease: "expo.inOut" },
      onComplete: () => {
        unlock();
        initVeil();
      },
    });
    intro
      .to(frame, { yPercent: 0, opacity: 1, duration: 1.4 })
      .to(frame, { scale: 1, duration: 1.4 }, "-=0.7");

    // ---- Veil: photo drops in top → bottom, scrubbed by scroll ----
    function initVeil() {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });
      tl.to(photo, {
        clipPath: "inset(0px 0px 0% 0px)",
        ease: "none",
        duration: 1,
      });
      // Hold the fully-revealed photo for the last stretch of the scroll.
      tl.to({}, { duration: 0.3 });

      ScrollTrigger.refresh();
    }
  };

  // Start as soon as the blueprint (first thing shown) is decoded —
  // earlier than full window `load`, which also waits on the 7MB photo.
  if (blueprint.complete && blueprint.naturalWidth) play();
  else blueprint.addEventListener("load", () => play(), { once: true });
}
