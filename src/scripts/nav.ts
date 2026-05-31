/**
 * Nav — toggle the .is-scrolled class on .nav once the user has
 * scrolled past the hero. Uses IntersectionObserver on the hero
 * element so we don't need a scroll listener; the observer fires
 * once at init and then only on threshold crossings, which is
 * both cheaper and self-cleaning.
 *
 *   Hero overlaps the (shrunk) viewport → is-scrolled OFF
 *   Hero scrolled past the top  → is-scrolled ON
 *
 * The 60px rootMargin trims the top of the viewport by about the
 * nav's own height, so the switch happens the moment the hero's
 * bottom edge slides under the nav — not earlier, not later.
 */
export function initNav(): void {
  if (typeof window === "undefined") return;

  const nav = document.querySelector<HTMLElement>(".nav");
  const hero = document.querySelector<HTMLElement>(".hero");
  if (!nav || !hero) return;

  // If no IntersectionObserver (very old browsers), fall back to
  // permanently solid nav — safer than always-transparent over an
  // unknown background.
  if (typeof IntersectionObserver === "undefined") {
    nav.classList.add("is-scrolled");
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      nav.classList.toggle("is-scrolled", !entry.isIntersecting);
    },
    {
      rootMargin: "-60px 0px 0px 0px",
      threshold: 0,
    },
  );

  observer.observe(hero);
}
