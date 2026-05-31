import { gsap } from "gsap";
import { getLenis } from "./lenis";

/**
 * Contact form — open/close with smooth right-side slide animation.
 *
 *  - Triggers: any element with [data-open-contact]
 *  - Closers: any element with [data-contact-close] (backdrop, X icon,
 *    or any future close affordances), plus the Escape key.
 *  - Open: panel translateX 100% → 0 over 800ms expo.inOut, backdrop
 *    opacity 0 → 1 over 600ms power2.out. Same-start, panel takes
 *    longer for a glide-in feel.
 *  - Close: panel translateX 0 → 100% (700ms expo.inOut), backdrop
 *    opacity 1 → 0 (500ms power2.inOut, 100ms delay so the panel
 *    appears to "leave" first while the wash lingers briefly).
 *  - Body scroll is locked while open via Lenis.stop().
 */

export function initContactForm(): void {
  if (typeof window === "undefined") return;

  const panel = document.getElementById("contact-form");
  if (!panel) return;

  const sheet = panel.querySelector<HTMLElement>(".contact-sheet");
  const backdrop = panel.querySelector<HTMLElement>(".contact-backdrop");
  if (!sheet || !backdrop) return;

  // Seed initial state — GSAP-owned. `x: 0` is explicit so that
  // ANY future CSS translate on .contact-sheet doesn't poison GSAP's
  // xPercent tracking (the matrix-decomposition trap that bit us
  // on the hero word reveals). Parent panel has visibility:hidden
  // until aria-hidden flips, so there's no pre-script flash.
  gsap.set(sheet, { x: 0, xPercent: 100 });
  gsap.set(backdrop, { opacity: 0 });

  let isOpen = false;
  let lastFocus: HTMLElement | null = null;

  const open = () => {
    if (isOpen) return;
    isOpen = true;

    // Remember where focus was so we can return it on close.
    lastFocus = document.activeElement as HTMLElement | null;

    panel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const lenis = getLenis();
    if (lenis) lenis.stop();

    const tl = gsap.timeline({
      onComplete: () => {
        // Move focus to the close button so keyboard users land
        // inside the panel rather than wherever they were before.
        const close = panel.querySelector<HTMLElement>(".contact-close");
        if (close) close.focus();
      },
    });

    tl.to(
      backdrop,
      { opacity: 1, duration: 0.6, ease: "power2.out" },
      0,
    ).to(
      sheet,
      { xPercent: 0, duration: 0.8, ease: "expo.inOut" },
      0,
    );
  };

  const close = () => {
    if (!isOpen) return;
    isOpen = false;

    // IMPORTANT: do NOT flip aria-hidden here — the CSS rule
    // `.contact-panel { visibility: hidden }` would instantly hide
    // the element and the slide-out animation would play on an
    // invisible panel. aria-hidden is flipped in onComplete instead,
    // AFTER the animation has finished playing.
    const tl = gsap.timeline({
      onComplete: () => {
        panel.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        const lenis = getLenis();
        if (lenis) lenis.start();
        // Return focus to whatever opened the panel for screen
        // reader / keyboard continuity.
        if (lastFocus && typeof lastFocus.focus === "function") {
          lastFocus.focus();
        }
      },
    });

    tl.to(
      sheet,
      { xPercent: 100, duration: 0.7, ease: "expo.inOut" },
      0,
    ).to(
      backdrop,
      { opacity: 0, duration: 0.5, ease: "power2.inOut" },
      0.1,
    );
  };

  // Bind openers — any element with [data-open-contact]. preventDefault
  // so anchors with href="#kontakt" don't jump-scroll the page.
  document.querySelectorAll<HTMLElement>("[data-open-contact]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      open();
    });
  });

  // Bind closers — backdrop, X icon, anything else with the attribute.
  panel.querySelectorAll<HTMLElement>("[data-contact-close]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      close();
    });
  });

  // Escape key — close from anywhere.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) close();
  });

  // Form submit — browser-native validation, then preventDefault and
  // log for now (no backend wired up yet).
  const form = panel.querySelector<HTMLFormElement>(".contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      // eslint-disable-next-line no-console
      console.log("Contact form submitted:", data);
    });
  }

  // Textarea auto-grow fallback for browsers that don't support
  // CSS `field-sizing: content` yet. Sets height to "auto" first
  // (lets the textarea collapse to its natural content size), then
  // to scrollHeight so the box matches what's actually inside.
  // CSS min-height: 200px keeps the starting frame intact when
  // content is small.
  const textarea = panel.querySelector<HTMLTextAreaElement>(
    "textarea[name='message']",
  );
  if (textarea) {
    const resize = () => {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    };
    textarea.addEventListener("input", resize);
    // Also resize once on init in case the field has any pre-filled
    // value (autofill, browser persistence, etc.).
    resize();
  }
}
