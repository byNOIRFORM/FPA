import { gsap } from "gsap";
import { getLenis } from "./lenis";

/**
 * Mobile side navigation (≤767px) — slide-in fullscreen menu.
 *
 *  - Opener:  [data-open-menu] (the "Menu" button in the nav).
 *  - Closers: [data-sidenav-close] (the "Close" button) + Escape +
 *             tapping any link (which closes, then acts).
 *  - Open:  panel translateX 100% → 0 over 800ms expo.inOut (same
 *           engine + curve as the contact-form sheet), links rise out
 *           of their masks (yPercent 110 → 0) with a 60ms stagger,
 *           language switch fades up last.
 *  - Close: panel translateX 0 → 100% (650ms expo.inOut); link masks
 *           are reset afterwards so the next open re-animates.
 *  - Body scroll is locked via Lenis.stop() while open.
 *  - "Kontaktujte nás" hands off to the contact panel through the
 *    `app:open-contact` event so the two sheets never fight over the
 *    scroll lock.
 */
export function initSideNav(): void {
  if (typeof window === "undefined") return;

  const panel = document.getElementById("sidenav");
  if (!panel) return;

  const sheet = panel.querySelector<HTMLElement>(".sidenav-panel");
  if (!sheet) return;

  const linkTexts = panel.querySelectorAll<HTMLElement>(".sidenav-link-text");
  const langs = panel.querySelectorAll<HTMLElement>(".sidenav-langs li");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Seed initial states — GSAP-owned so a stray CSS transform can't
  // poison xPercent/yPercent tracking (the matrix-decomposition trap).
  gsap.set(sheet, { x: 0, xPercent: 100 });
  const seedReveal = () => {
    if (reduced) return;
    gsap.set(linkTexts, { yPercent: 110 });
    gsap.set(langs, { autoAlpha: 0, y: 12 });
  };
  seedReveal();

  let isOpen = false;
  let lastFocus: HTMLElement | null = null;

  const lockScroll = () => {
    document.body.style.overflow = "hidden";
    const lenis = getLenis();
    if (lenis) lenis.stop();
  };

  const unlockScroll = () => {
    document.body.style.overflow = "";
    const lenis = getLenis();
    if (lenis) lenis.start();
  };

  const open = () => {
    if (isOpen) return;
    isOpen = true;

    lastFocus = document.activeElement as HTMLElement | null;
    panel.setAttribute("aria-hidden", "false");
    lockScroll();

    const onDone = () => {
      const close = panel.querySelector<HTMLElement>(".sidenav-close");
      if (close) close.focus();
    };

    if (reduced) {
      gsap.set(sheet, { xPercent: 0 });
      onDone();
      return;
    }

    seedReveal();
    const tl = gsap.timeline({ onComplete: onDone });
    tl.to(sheet, { xPercent: 0, duration: 0.8, ease: "expo.inOut" }, 0)
      .to(
        linkTexts,
        { yPercent: 0, duration: 0.7, ease: "expo.out", stagger: 0.06 },
        0.18,
      )
      .to(
        langs,
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.05 },
        0.45,
      );
  };

  /**
   * @param opts.transferContact  Hand off to the contact panel — skip
   *   the scroll-unlock so the contact sheet keeps the page locked.
   * @param opts.scrollTo  Element to Lenis-scroll to once closed.
   */
  const close = (opts: { transferContact?: boolean; scrollTo?: Element | null } = {}) => {
    if (!isOpen) return;
    isOpen = false;

    const finish = () => {
      panel.setAttribute("aria-hidden", "true");
      seedReveal();

      if (opts.transferContact) {
        // Contact panel takes over the scroll lock — don't restore it
        // here. Fire on the next frame so the slide-out has visually
        // cleared before the contact sheet slides in over it.
        requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent("app:open-contact"));
        });
        return;
      }

      unlockScroll();
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();

      if (opts.scrollTo) {
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(opts.scrollTo as HTMLElement, { offset: 0 });
        else opts.scrollTo.scrollIntoView({ behavior: "smooth" });
      }
    };

    if (reduced) {
      gsap.set(sheet, { xPercent: 100 });
      finish();
      return;
    }

    gsap.to(sheet, {
      xPercent: 100,
      duration: 0.65,
      ease: "expo.inOut",
      overwrite: "auto",
      onComplete: finish,
    });
  };

  // Openers — the nav "Menu" button.
  document.querySelectorAll<HTMLElement>("[data-open-menu]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      open();
    });
  });

  // Close button.
  panel.querySelectorAll<HTMLElement>("[data-sidenav-close]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      close();
    });
  });

  // Links — contact hands off to the contact panel; everything else
  // closes then Lenis-scrolls to its in-page target.
  panel.querySelectorAll<HTMLAnchorElement>("[data-sidenav-link]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      if (link.hasAttribute("data-sidenav-contact")) {
        close({ transferContact: true });
        return;
      }
      const hash = link.getAttribute("href") || "";
      const target = hash.startsWith("#") ? document.querySelector(hash) : null;
      close({ scrollTo: target });
    });
  });

  // Escape closes from anywhere.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) close();
  });
}
