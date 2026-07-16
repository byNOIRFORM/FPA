import type { LayoutProps } from "sanity";

/**
 * Skryje malý muted type-label („Člen tímu") nad veľkým titulom otvoreného
 * dokumentu — meno je hore aj tak, label je duplicitná informácia.
 * Studio naň nemá oficiálny prepínač (FormHeader ho renderuje pre všetky
 * ne-singleton dokumenty), preto CSS ukotvené na oficiálny data-testid
 * veľkého titulu. Ak sa testid v budúcej verzii Studia zmení, label sa
 * iba znova zobrazí — nič sa nerozbije.
 */
export function StudioLayout(props: LayoutProps) {
  return (
    <>
      <style>{`
        /* Element-agnostické: skryjeme v kontajneri titulu všetko okrem
           samotného veľkého titulu (súrodenecký selektor cez :has(+ …)
           v praxi nezabral — label nemusí byť priamy predchádzajúci div). */
        div:has(> [data-testid="document-panel-document-title"])
          > :not([data-testid="document-panel-document-title"]) {
          display: none !important;
        }

        /* Formulár s jazykovými tabmi: základný odstup medzi poľami
           52px (space[6]) pôsobil rozťahane — sťahujeme na 40px.
           Kotva = tab lišta (data-testid="field-groups") ako priame
           dieťa koreňového stacku formulára. */
        div:has(> [data-testid="field-groups"]) {
          gap: 40px;
        }

        /* Tab „Všetky polia" preč — všade (dokumenty aj objekty v
           sekciách/blokoch) chceme len SK | CZ | EN (Michal). Skryté cez
           oficiálny testid tabu + option v mobilnom selecte. */
        [data-testid="group-tab-all-fields"],
        option[data-testid="group-select-all-fields"] {
          display: none !important;
        }

        /* Živé predvyplnenie (withPlaceholderFrom): text, ktorý web
           reálne použije, ukazujeme plnou farbou — sivá je vyhradená
           pre klasické placeholdery. */
        [data-live-default]::placeholder {
          color: var(--card-fg-color, currentColor);
          opacity: 1;
        }
      `}</style>
      {props.renderDefault(props)}
    </>
  );
}
