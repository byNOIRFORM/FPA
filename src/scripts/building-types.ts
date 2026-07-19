/**
 * Typy stavieb (BuildingTypes.astro) — touch-tablet interaction.
 *
 * Three input models, one per device class:
 *   - MOUSE (hover: hover): the photo swaps on hover, others dim — pure
 *     CSS, no JS.
 *   - PHONE (≤767): image hidden, plain list — no JS.
 *   - TOUCH TABLET (no mouse, ≥768 so the image still shows): can't
 *     hover, so a TAP selects a type — this module toggles `.is-active`
 *     on the tapped item + its photo, which the CSS shows and weights
 *     (persistent, mirroring the desktop hover). Michal, 2026-07-19.
 */
export function initBuildingTypes(): void {
  if (typeof window === "undefined") return;
  // Only the touch-tablet gap: no mouse AND wide enough that the image
  // is on screen. Mouse devices (CSS hover) and phones (list only) skip.
  if (!window.matchMedia("(hover: none) and (min-width: 768px)").matches) return;

  const section = document.querySelector<HTMLElement>(".btypes");
  if (!section) return;
  const items = Array.from(section.querySelectorAll<HTMLElement>(".btypes-item"));
  const imgs = Array.from(section.querySelectorAll<HTMLElement>(".btypes-img"));
  if (!items.length) return;

  items.forEach((item) => {
    item.addEventListener("click", () => {
      const key = item.dataset.type;
      if (!key) return;
      items.forEach((it) => it.classList.toggle("is-active", it === item));
      imgs.forEach((im) => im.classList.toggle("is-active", im.dataset.type === key));
    });
  });
}
