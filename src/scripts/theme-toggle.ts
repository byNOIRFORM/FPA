/**
 * Theme toggle — flips [data-theme] on <html>, persists the choice, and
 * keeps the button's aria-pressed in sync.
 *
 * The initial theme is already resolved before first paint by the
 * inline script in BaseLayout's <head>, so this module only handles
 * USER toggles + reacting to OS changes (when the user hasn't made an
 * explicit choice yet).
 */
const STORAGE_KEY = "fpa:theme";

type Theme = "light" | "dark";

function current(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

function apply(theme: Theme, persist: boolean): void {
  document.documentElement.setAttribute("data-theme", theme);
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* private mode — toggle still works for the session */
    }
  }
  syncButtons(theme);
}

function syncButtons(theme: Theme): void {
  document
    .querySelectorAll<HTMLButtonElement>("[data-theme-toggle]")
    .forEach((btn) => btn.setAttribute("aria-pressed", String(theme === "dark")));
}

export function initThemeToggle(): void {
  if (typeof window === "undefined") return;

  // Dodge the footer credit: once the footer's bottom row scrolls into
  // view, lift the fixed button above it (CSS .is-lifted, desktop only)
  // so "Made by NOIRFØRM" stays readable at page end.
  const toggle = document.querySelector<HTMLElement>(".theme-toggle");
  const footerBottom = document.querySelector<HTMLElement>(".footer-bottom");
  if (toggle && footerBottom) {
    new IntersectionObserver(([entry]) =>
      toggle.classList.toggle("is-lifted", entry.isIntersecting),
    ).observe(footerBottom);
  }

  // Reflect the head-resolved theme onto the buttons on load.
  syncButtons(current());

  document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      apply(current() === "dark" ? "light" : "dark", true);
    });
  });

  // Follow the OS only while the user hasn't picked a theme themselves.
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener?.("change", (e) => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (!stored) apply(e.matches ? "dark" : "light", false);
  });
}
