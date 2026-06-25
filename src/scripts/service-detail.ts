import { gsap } from "gsap";
import { getLenis } from "./lenis";

/**
 * Service detail panel — right-side slide-in, EXACTLY the contact panel's
 * mechanism + timings (see contact-form.ts). Opened by [data-open-detail]
 * triggers carrying data-detail-index; it reveals that index's
 * .sdetail-detail block. Close via [data-detail-close] or Escape.
 */
export function initServiceDetail(): void {
  if (typeof window === "undefined") return;

  const panel = document.getElementById("service-detail");
  if (!panel) return;

  const sheet = panel.querySelector<HTMLElement>(".sdetail-sheet");
  const backdrop = panel.querySelector<HTMLElement>(".sdetail-backdrop");
  if (!sheet || !backdrop) return;

  const details = Array.from(
    panel.querySelectorAll<HTMLElement>(".sdetail-detail"),
  );
  const scroll = panel.querySelector<HTMLElement>(".sdetail-scroll");

  // GSAP-owned off-screen state (mirrors contact-form.ts).
  gsap.set(sheet, { x: 0, xPercent: 100 });
  gsap.set(backdrop, { opacity: 0 });

  let isOpen = false;
  let lastFocus: HTMLElement | null = null;

  const show = (index: number) => {
    details.forEach((d) => {
      d.hidden = Number(d.dataset.detail) !== index;
    });
    if (scroll) scroll.scrollTop = 0;
  };

  const open = (index: number) => {
    show(index);
    if (isOpen) return; // already open — just swapped which stage shows
    isOpen = true;
    lastFocus = document.activeElement as HTMLElement | null;

    panel.setAttribute("aria-hidden", "false");
    // overflow:clip (not hidden) — same reasoning as the contact panel:
    // hidden reparents sticky descendants and would jump the intro photo.
    document.body.style.overflow = "clip";
    const lenis = getLenis();
    if (lenis) lenis.stop();

    const tl = gsap.timeline({
      onComplete: () => {
        const closeBtn = panel.querySelector<HTMLElement>(".sdetail-close");
        if (closeBtn) closeBtn.focus();
      },
    });
    tl.to(backdrop, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0).to(
      sheet,
      { xPercent: 0, duration: 0.8, ease: "expo.inOut" },
      0,
    );
  };

  const close = () => {
    if (!isOpen) return;
    isOpen = false;

    const tl = gsap.timeline({
      onComplete: () => {
        panel.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        const lenis = getLenis();
        if (lenis) lenis.start();
        if (lastFocus && typeof lastFocus.focus === "function") {
          lastFocus.focus();
        }
      },
    });
    tl.to(sheet, { xPercent: 100, duration: 0.7, ease: "expo.inOut" }, 0).to(
      backdrop,
      { opacity: 0, duration: 0.5, ease: "power2.inOut" },
      0.1,
    );
  };

  document.querySelectorAll<HTMLElement>("[data-open-detail]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      open(Number(el.dataset.detailIndex || "0"));
    });
  });

  panel.querySelectorAll<HTMLElement>("[data-detail-close]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      close();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) close();
  });
}
