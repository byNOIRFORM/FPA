/**
 * /sluzby (Services page) i18n dictionary — SK (default) / CZ / EN.
 *
 * Single source of truth for every visible string that is UNIQUE to the
 * services subpage (the homepage shares home.ts). Each section component
 * takes a `lang` prop and reads its slice from `servicesPage[lang]`.
 *
 * The detailed spec-sheet (Services.astro) still pulls its row titles /
 * descriptions from home.ts (services.items) — only the page-specific
 * extras (the "Obsahuje" lists + label) live here.
 *
 * Translations are a first pass for review, matching home.ts's convention
 * (proper nouns stay; only the prose localises). Image filenames, grid
 * positions and the colour-scrub mechanics are language-agnostic and stay
 * in the components.
 */
import type { Lang } from "./home";

export interface ServicesPageContent {
  intro: { title: string; photoAlt: string };
  scope: {
    /** Label is split so mobile can drop the tail onto its own line. */
    labelHead: string;
    labelTail: string;
    /** 4 collage tiles, in render order (Novostavby … Urbanizmus). */
    tiles: { name: string; alt: string }[];
  };
  buildingTypes: {
    label: string;
    /** 6 types, in render order (matches the lang-agnostic `key`s). */
    types: { name: string; alt: string }[];
  };
  manifest: string;
  stages: { title: string; alt: string };
  spec: {
    includesLabel: string;
    /** "Obsahuje" lists for the 5 stages (01 → 05). */
    includes: string[][];
  };
}

export const servicesPage: Record<Lang, ServicesPageContent> = {
  sk: {
    intro: {
      title:
        "Za každou čiarou vo výkrese vidíme ľudské príbehy. Nestaviame na pominuteľných trendoch, ale na svetle, materiáloch a vašich rituáloch. Vytvárame priestor, ktorý s vami prirodzene splynie.",
      photoAlt: "Dokončený rodinný dom za súmraku — výsledok projektu ateliéru.",
    },
    scope: {
      labelHead: "Vypracujeme kompletnú projektovú",
      labelTail: "dokumentáciu pre",
      tiles: [
        { name: "Novostavby", alt: "Novostavba rodinného domu vo svahu za súmraku" },
        { name: "Rekonštrukcie", alt: "Drevený model rekonštrukcie nad výkresom" },
        { name: "Interiéry", alt: "Interiér s dreveným obkladom a výhľadom do mesta" },
        { name: "Urbanizmus", alt: "Urbanistický model územia na stole pri okne" },
      ],
    },
    buildingTypes: {
      label: "Typy stavieb",
      types: [
        { name: "Rodinné domy", alt: "Moderný rodinný dom vo svahu" },
        { name: "Bytové domy", alt: "Bytový/rezidenčný objekt" },
        { name: "Verejné budovy", alt: "Verejná budova — knižnica" },
        { name: "Priemyselné stavby", alt: "Priemyselná / industriálna stavba" },
        { name: "Rekreačné a športové stavby", alt: "Rekreačný objekt v prírode" },
        { name: "Parky a verejný priestor", alt: "Urbanistický model verejného priestoru" },
      ],
    },
    manifest:
      "Projekt pre nás nekončí odovzdaním výkresov. Sprevádzame vás od prvej skice až po moment, kedy otočíte kľúč v zámku. Strážime každý krok, aby mal hotový dom presne tú atmosféru, ktorú sme spoločne vymysleli.",
    stages: {
      title: "Fázy projektu a rozsah naších služieb",
      alt: "Atelier Fotta // Popadič — pohľad z ulice",
    },
    spec: {
      includesLabel: "Obsahuje:",
      includes: [
        ["Analýza existujúceho územného plánu", "Analýza územia", "Dopravné riešenie", "Riešenie zón", "Podklad pre zmeny a doplnky územného plánu"],
        ["Koncept, idea návrhu", "Pôdorysy", "Rezy", "Pohľady", "3D vizualizácia"],
        ["Sprievodná správa", "Situácia osadenia", "Pôdorysy a rezy", "Zákresy do kontextu"],
        ["Architektúra (mierka 1:50)", "Energetické hodnotenie stavby", "Požiarna bezpečnosť stavby", "Statika", "Zdravotechnika", "Vykurovanie", "Elektroinštalácie", "Vzduchotechnika", "Dopravné riešenie", "Napojenie stavby na inžinierske siete"],
        ["Architektúra (mierka 1:50 až 1:25)", "Energetické hodnotenie stavby", "Požiarna bezpečnosť stavby", "Statika", "Zdravotechnika", "Vykurovanie", "Elektroinštalácie", "Vzduchotechnika", "Dopravné riešenie", "Napojenie stavby na inžinierske siete", "Autorský dozor"],
      ],
    },
  },

  cz: {
    intro: {
      title:
        "Za každou čarou ve výkresu vidíme lidské příběhy. Nestavíme na pomíjivých trendech, ale na světle, materiálech a vašich rituálech. Vytváříme prostor, který s vámi přirozeně splyne.",
      photoAlt: "Dokončený rodinný dům za soumraku — výsledek projektu ateliéru.",
    },
    scope: {
      labelHead: "Vypracujeme kompletní projektovou",
      labelTail: "dokumentaci pro",
      tiles: [
        { name: "Novostavby", alt: "Novostavba rodinného domu ve svahu za soumraku" },
        { name: "Rekonstrukce", alt: "Dřevěný model rekonstrukce nad výkresem" },
        { name: "Interiéry", alt: "Interiér s dřevěným obkladem a výhledem do města" },
        { name: "Urbanismus", alt: "Urbanistický model území na stole u okna" },
      ],
    },
    buildingTypes: {
      label: "Typy staveb",
      types: [
        { name: "Rodinné domy", alt: "Moderní rodinný dům ve svahu" },
        { name: "Bytové domy", alt: "Bytový/rezidenční objekt" },
        { name: "Veřejné budovy", alt: "Veřejná budova — knihovna" },
        { name: "Průmyslové stavby", alt: "Průmyslová / industriální stavba" },
        { name: "Rekreační a sportovní stavby", alt: "Rekreační objekt v přírodě" },
        { name: "Parky a veřejný prostor", alt: "Urbanistický model veřejného prostoru" },
      ],
    },
    manifest:
      "Projekt pro nás nekončí odevzdáním výkresů. Provázíme vás od první skici až po okamžik, kdy otočíte klíčem v zámku. Hlídáme každý krok, aby měl hotový dům přesně tu atmosféru, kterou jsme společně vymysleli.",
    stages: {
      title: "Fáze projektu a rozsah našich služeb",
      alt: "Atelier Fotta // Popadič — pohled z ulice",
    },
    spec: {
      includesLabel: "Obsahuje:",
      includes: [
        ["Analýza stávajícího územního plánu", "Analýza území", "Dopravní řešení", "Řešení zón", "Podklad pro změny a doplňky územního plánu"],
        ["Koncept, idea návrhu", "Půdorysy", "Řezy", "Pohledy", "3D vizualizace"],
        ["Průvodní zpráva", "Situace osazení", "Půdorysy a řezy", "Zákresy do kontextu"],
        ["Architektura (měřítko 1:50)", "Energetické hodnocení stavby", "Požární bezpečnost stavby", "Statika", "Zdravotechnika", "Vytápění", "Elektroinstalace", "Vzduchotechnika", "Dopravní řešení", "Napojení stavby na inženýrské sítě"],
        ["Architektura (měřítko 1:50 až 1:25)", "Energetické hodnocení stavby", "Požární bezpečnost stavby", "Statika", "Zdravotechnika", "Vytápění", "Elektroinstalace", "Vzduchotechnika", "Dopravní řešení", "Napojení stavby na inženýrské sítě", "Autorský dozor"],
      ],
    },
  },

  en: {
    intro: {
      title:
        "Behind every line in the drawing we see human stories. We don't build on fleeting trends, but on light, materials and your rituals. We create a space that naturally becomes one with you.",
      photoAlt: "Finished family house at dusk — the result of the studio's project.",
    },
    scope: {
      labelHead: "We prepare complete project",
      labelTail: "documentation for",
      tiles: [
        { name: "New Builds", alt: "New-build family house on a slope at dusk" },
        { name: "Renovations", alt: "Wooden renovation model over a drawing" },
        { name: "Interiors", alt: "Interior with wood cladding and a city view" },
        { name: "Urban Planning", alt: "Urban model of the area on a table by the window" },
      ],
    },
    buildingTypes: {
      label: "Building types",
      types: [
        { name: "Family houses", alt: "Modern family house on a slope" },
        { name: "Apartment buildings", alt: "Apartment / residential building" },
        { name: "Public buildings", alt: "Public building — library" },
        { name: "Industrial structures", alt: "Industrial building" },
        { name: "Leisure & sports facilities", alt: "Leisure building in nature" },
        { name: "Parks & public space", alt: "Urban model of a public space" },
      ],
    },
    manifest:
      "For us, a project doesn't end with handing over the drawings. We guide you from the first sketch to the moment you turn the key in the lock. We watch over every step so the finished home has exactly the atmosphere we imagined together.",
    stages: {
      title: "Project phases and the scope of our services",
      alt: "Fotta // Popadič studio — view from the street",
    },
    spec: {
      includesLabel: "Includes:",
      includes: [
        ["Analysis of the existing zoning plan", "Site analysis", "Traffic solution", "Zoning layout", "Basis for amendments to the zoning plan"],
        ["Concept and design idea", "Floor plans", "Sections", "Elevations", "3D visualisation"],
        ["Accompanying report", "Site layout plan", "Floor plans and sections", "Context renderings"],
        ["Architecture (scale 1:50)", "Building energy assessment", "Fire safety", "Structural engineering", "Plumbing", "Heating", "Electrical installations", "HVAC", "Traffic solution", "Utility connections"],
        ["Architecture (scale 1:50 to 1:25)", "Building energy assessment", "Fire safety", "Structural engineering", "Plumbing", "Heating", "Electrical installations", "HVAC", "Traffic solution", "Utility connections", "Author's supervision"],
      ],
    },
  },
};
