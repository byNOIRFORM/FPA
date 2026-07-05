import { gsap } from "gsap";
// ScrollTrigger is registered globally in gsap-setup.ts — referencing
// `scrollTrigger` in a tween config picks it up.
import { onTransitionSettled } from "./page-transition";
import { getLenis } from "./lenis";

/**
 * /projekty listing — a static project grid (no hero / intro / filter, so
 * nothing ever re-lays out). Two motions, both matching the homepage Works:
 *  - inner parallax (±8 yPercent) on each tile's image as it scrolls past
 *  - hover zoom (scale 1.04) + the shared "POZRIEŤ" cursor
 *
 * Return memory: clicking a card records the grid scroll position in
 * sessionStorage; coming BACK from a detail page (nav-bar "Projekty" or
 * browser back) restores it instantly under the enter curtain, so the user
 * picks up exactly where they left the listing. Fresh arrivals (homepage
 * nav, direct URL) are untouched and start from the top.
 *
 * Reduced motion: parallax is skipped (hover still works).
 */

const RETURN_KEY = "fpa:plist-return";

// Astro's trailingSlash "ignore" serves /projekty and /projekty/ as the
// same page — normalise before storing or comparing listing paths.
const normPath = (p: string) => p.replace(/\/+$/, "");

/**
 * Restore the saved listing position when this pageview is a RETURN from
 * one of this listing's own detail pages. Returns true when it restored
 * (the load reveals are then skipped — the user has already seen them).
 *
 * The flag is consumed on EVERY listing arrival, restored or not, so a
 * stale save can never fire later (e.g. listing → detail → homepage →
 * "Projekty" arrives fresh and clears it).
 */
function restoreReturnPosition(grid: HTMLElement): boolean {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(RETURN_KEY);
    if (raw) sessionStorage.removeItem(RETURN_KEY);
  } catch {
    return false; // storage unavailable (private mode) — normal top load
  }
  if (!raw) return false;

  let saved: { path?: string; href?: string; y?: number };
  try {
    saved = JSON.parse(raw);
  } catch {
    return false;
  }
  // Per-listing: a position saved on /projekty must not restore /en/projekty.
  const here = normPath(location.pathname);
  if (saved.path !== here || typeof saved.y !== "number") return false;

  // A return is a history back/forward arrival, or a link arrival whose
  // referrer is a detail under this listing (…/projekty/<slug>). Anything
  // else — homepage nav, footer, direct URL — is a fresh visit.
  const navEntry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  // WebKit doesn't expose the navigation entry until the load event —
  // this module runs before it, so fall back to the legacy synchronous
  // API there (deprecated; type 2 = TYPE_BACK_FORWARD).
  let isReturn = navEntry
    ? navEntry.type === "back_forward"
    : performance.navigation?.type === 2;
  if (!isReturn && document.referrer) {
    try {
      const ref = new URL(document.referrer);
      isReturn =
        ref.origin === location.origin && ref.pathname.startsWith(`${here}/`);
    } catch {
      /* unparsable referrer — treat as a fresh arrival */
    }
  }
  if (!isReturn) return false;

  const clamp = (y: number) =>
    Math.max(0, Math.min(y, document.documentElement.scrollHeight - window.innerHeight));
  const jumpTo = (y: number) => {
    // Through Lenis when it's running so its internal target stays in sync
    // (a bare window.scrollTo can be yanked back on the next wheel tick).
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
  };

  jumpTo(clamp(saved.y));

  // Sanity anchor: if the layout changed between save and return (device
  // rotation swaps the grid for the stacked mobile layout), the raw scrollY
  // points somewhere unrelated — re-center on the clicked card instead.
  const cover = Array.from(grid.querySelectorAll<HTMLAnchorElement>(".work-cover")).find(
    (a) => a.getAttribute("href") === saved.href,
  );
  if (cover) {
    const r = cover.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) {
      jumpTo(clamp(window.scrollY + r.top - (window.innerHeight - r.height) / 2));
    }
  }
  return true;
}
export function initProjectsPage(): void {
  if (typeof window === "undefined") return;

  const grid = document.querySelector<HTMLElement>(".pprojects [data-grid]");
  if (!grid) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Returning from a project detail? Jump back to where the user left the
  // grid — while the enter curtain still covers the viewport, so the lift
  // reveals the listing exactly as they left it. Must run BEFORE the reveal
  // setup (a return skips the load reveals — replaying them reads as
  // "starting over") and before the parallax triggers, so the scrubs
  // initialise from the restored offset.
  const restored = restoreReturnPosition(grid);

  // Page title — word-by-word mask reveal, IDENTICAL to the hero titles
  // (homepage slogan / detail hero): yPercent 110 → 0, opacity 0 → 1,
  // 1.0s expo.out, 0.05 stagger. Gated behind the enter curtain like the
  // rest of this page's load reveals.
  const titleWords = document.querySelectorAll<HTMLElement>(".pprojects .ptitle-word");
  if (titleWords.length) {
    if (reduced || restored) {
      gsap.set(titleWords, { yPercent: 0, opacity: 1 });
    } else {
      gsap.set(titleWords, { yPercent: 110, opacity: 0 });
      onTransitionSettled(() => {
        gsap.to(titleWords, {
          yPercent: 0,
          opacity: 1,
          duration: 1.0,
          ease: "expo.out",
          stagger: 0.05,
        });
      });
    }
  }

  const cards = Array.from(grid.querySelectorAll<HTMLElement>(".pcard"));
  if (!cards.length) return;

  // First-row reveal (first two projects) — 1:1 with the homepage Works
  // row-1 reveal (works.ts): the two medias curtain up via clip-path on a
  // row-level ScrollTrigger (top 80%, 1.0s power3.out, 0.15 stagger), and
  // each tile's title → desc rises on its own tile-level trigger (top 75%,
  // 0.7s power3.out, desc 0.08 behind). Initial hidden state lives in CSS
  // via [data-reveal].
  // Registered through onTransitionSettled: on a page-transition arrival the
  // enter curtain covers the viewport for ~1s and this reveal (1.0s, fired
  // immediately — the row is in view at load) would finish unseen underneath
  // it. The [data-reveal] CSS keeps the tiles hidden until the curtain has
  // lifted, then the ScrollTriggers are created and fire — the reveal plays
  // right after the curtain, in sync. Normal visits run immediately.
  const firstRow = grid.querySelector<HTMLElement>(".works-row");
  if (!firstRow || reduced || restored) {
    firstRow
      ?.querySelectorAll("[data-reveal]")
      .forEach((el) => el.removeAttribute("data-reveal"));
  } else {
    onTransitionSettled(() => {
      const medias = firstRow.querySelectorAll<HTMLElement>(".work-media[data-reveal]");
      gsap.fromTo(
        medias,
        { clipPath: "inset(100% 0 0 0)" },
        {
          clipPath: "inset(0% 0 0 0)",
          duration: 1.0,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: firstRow,
            start: "top 80%",
            toggleActions: "play none none none",
          },
          onComplete: () => medias.forEach((m) => m.removeAttribute("data-reveal")),
        },
      );

      firstRow.querySelectorAll<HTMLElement>(".pcard").forEach((tile) => {
        const title = tile.querySelector<HTMLElement>(".work-title[data-reveal]");
        const desc = tile.querySelector<HTMLElement>(".work-desc[data-reveal]");
        if (!title || !desc) return;

        // fromTo + immediateRender:false + strip at onComplete — the desc
        // tween starts 0.08 after the timeline; stripping the attribute in
        // onStart dropped its hidden CSS state before its start values were
        // captured and it popped in unanimated (the services.ts lesson).
        const from = { y: 16, opacity: 0 };
        const to = { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", immediateRender: false };
        gsap
          .timeline({
            scrollTrigger: {
              trigger: tile,
              start: "top 75%",
              toggleActions: "play none none none",
            },
            onComplete: () => {
              title.removeAttribute("data-reveal");
              desc.removeAttribute("data-reveal");
            },
          })
          .fromTo(title, from, to, 0)
          .fromTo(desc, from, to, 0.08);
      });
    });
  }

  // Inner parallax — image drifts yPercent +8 → -8 within its 11% headroom
  // as the tile scrolls through the viewport (same calibration as Works).
  if (!reduced) {
    cards.forEach((card) => {
      const img = card.querySelector<HTMLImageElement>(".work-media img");
      if (!img) return;
      gsap.fromTo(
        img,
        { yPercent: 8 },
        {
          yPercent: -8,
          ease: "none",
          scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    });
  }

  // Leaving for a detail — remember where on the grid the user was, so the
  // return trip can pick up here (see restoreReturnPosition). Modified
  // clicks (new tab, download, …) don't navigate THIS tab, so skip them —
  // same guards as the page-transition interceptor.
  grid.querySelectorAll<HTMLAnchorElement>(".work-cover").forEach((link) => {
    link.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      try {
        sessionStorage.setItem(
          RETURN_KEY,
          JSON.stringify({
            path: normPath(location.pathname),
            href: link.getAttribute("href"),
            y: Math.round(window.scrollY),
          }),
        );
      } catch {
        /* private mode — the return simply lands at the top, as before */
      }
    });
  });

  // Hover zoom + cursor "POZRIEŤ" (pointer devices only).
  if (window.matchMedia("(hover: hover)").matches) {
    const cursor = document.getElementById("cursor");
    cards.forEach((card) => {
      const img = card.querySelector<HTMLImageElement>(".work-media img");
      card.addEventListener("mouseenter", () => {
        cursor?.classList.add("is-view");
        if (img) gsap.to(img, { scale: 1.04, duration: 0.6, ease: "power2.out" });
      });
      card.addEventListener("mouseleave", () => {
        cursor?.classList.remove("is-view");
        if (img) gsap.to(img, { scale: 1, duration: 0.6, ease: "power2.out" });
      });
    });
  }
}
