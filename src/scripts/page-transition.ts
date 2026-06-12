import { gsap } from "gsap";

/**
 * Page transitions (MPA curtain wipe).
 *
 *  EXIT: clicks on internal, cross-page links are intercepted; the
 *  dark curtain sweeps up from the bottom (expo.inOut — the loader /
 *  contact-sheet curve), then the browser navigates while the screen
 *  is fully covered.
 *
 *  ENTER: an inline <head> script (BaseLayout) reads the
 *  sessionStorage flag synchronously and sets html[data-pt], so the
 *  new document's first paint is already covered. This module then
 *  lifts the curtain up and away. To the user the two halves read as
 *  one continuous upward wipe.
 *
 *  The intro house-loader is skipped on transition arrivals
 *  (loader.ts checks html[data-pt]) — the full intro only plays on a
 *  fresh visit.
 *
 *  Skipped: in-page anchors, contact/menu triggers (they
 *  preventDefault), external links, new-tab/middle clicks, downloads,
 *  reduced motion (instant navigation, no sweep).
 */

const FLAG = "fpa:pt";

/**
 * True when this document was opened through the transition curtain.
 * Evaluated at IMPORT time — before initPageTransition() can clear
 * the html attribute — so other modules (the loader skip) can rely on
 * it regardless of init order or the reduced-motion fast path.
 */
export const isTransitionArrival =
  typeof document !== "undefined" &&
  document.documentElement.hasAttribute("data-pt");

export function initPageTransition(): void {
  if (typeof window === "undefined") return;
  const curtain = document.getElementById("page-transition");
  if (!curtain) return;

  const html = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let leaving = false;

  // Remove the boot cover the inline <head> script applied (inline
  // html background + the #pt-boot body-hiding <style>).
  const clearBoot = () => {
    html.removeAttribute("data-pt");
    html.style.background = "";
    document.body.style.visibility = "";
    document.getElementById("pt-boot")?.remove();
  };

  // ---- ENTER — arriving under the curtain ----
  // html[data-pt] keeps the BODY hidden (and the root dark) from the
  // very first progressive paint. Hand over: pin the curtain via
  // inline GSAP state, THEN make the body visible beneath it, lift.
  if (html.hasAttribute("data-pt")) {
    if (reduced) {
      gsap.set(curtain, { autoAlpha: 0 });
      clearBoot();
    } else {
      gsap.set(curtain, { autoAlpha: 1, yPercent: 0 });
      document.body.style.visibility = "visible"; // overrides the boot hide
      gsap.to(curtain, {
        yPercent: -100,
        duration: 0.9,
        ease: "expo.inOut",
        delay: 0.1,
        onComplete: () => {
          clearBoot();
          gsap.set(curtain, { autoAlpha: 0, yPercent: 0 });
        },
      });
    }
  }

  // ---- EXIT — intercept internal cross-page navigations ----
  document.addEventListener("click", (e) => {
    // Element handlers run first (contact panel, side-nav smooth
    // scroll, …) — anything they claimed is not a navigation.
    if (e.defaultPrevented || leaving) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const link = (e.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
    if (!link) return;
    if (link.target && link.target !== "_self") return;
    if (link.hasAttribute("download")) return;

    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    // Same-page (hash) navigation — Lenis territory, not ours.
    if (url.pathname === location.pathname) return;

    e.preventDefault();
    leaving = true;

    if (reduced) {
      try {
        sessionStorage.setItem(FLAG, "1");
      } catch {
        /* private mode — navigate without the covered arrival */
      }
      location.href = url.href;
      return;
    }

    gsap.set(curtain, { autoAlpha: 1, yPercent: 100 });
    gsap.to(curtain, {
      yPercent: 0,
      duration: 0.6,
      ease: "expo.inOut",
      onComplete: () => {
        try {
          sessionStorage.setItem(FLAG, "1");
        } catch {
          /* private mode — navigate without the covered arrival */
        }
        location.href = url.href;
      },
    });
  });

  // ---- Back/forward cache — never restore a stuck curtain ----
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    leaving = false;
    clearBoot();
    gsap.set(curtain, { autoAlpha: 0, yPercent: 0 });
  });
}
