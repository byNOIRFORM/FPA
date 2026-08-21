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
    /** "Obsahuje" lists for the 6 services (01 → 06). */
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
      title: "Fázy projektu a rozsah našich služieb",
      alt: "Atelier Fotta // Popadič — pohľad z ulice",
    },
    spec: {
      includesLabel: "Obsahuje:",
      includes: [
        ["Analýza existujúceho územného plánu a limitov územia", "Komplexný priestorový návrh a riešenie zón", "Dopravné riešenie a napojenie na infraštruktúru", "Kapacitné bilancie", "Podklad pre zmeny a doplnky územného plánu"],
        ["Koncept a idea návrhu", "Pôdorysy, rezy a pohľady", "Osadenie objektu na pozemok", "Fotorealistická 3D vizualizácia", "Hrubý odhad nákladov (bilancia plôch)"],
        ["Sprievodná správa a koordinačná situácia", "Architektonické riešenie (pôdorysy, rezy)", "Zákresy do kontextu prostredia", "Koncept požiarnej bezpečnosti", "Riešenie inžinierskych sietí a dopravy"],
        ["Architektúra (mierka 1:50) a statika", "Energetické hodnotenie a požiarna bezpečnosť", "Zdravotechnika, vykurovanie a vzduchotechnika", "Elektroinštalácie", "Dopravné riešenie a napojenie na siete"],
        ["Vykonávací projekt (detailná dokumentácia 1:50 až 1:25)", "Súčinnosť pri výrobnej príprave zhotoviteľa", "Autorský dozor a kontrola realizácie", "Dokumentácia skutočného zhotovenia stavby (DSZ)"],
        ["Zameranie skutočného stavu (As-Built)", "Mračno bodov (.E57, .RCP, .LGS)", "HDR sférické panorámy", "Podklady pre BIM a CAD", "2D výkresová dokumentácia a 3D BIM model"],
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
        ["Analýza stávajícího územního plánu a limitů území", "Komplexní prostorový návrh a řešení zón", "Dopravní řešení a napojení na infrastrukturu", "Kapacitní bilance", "Podklad pro změny a doplňky územního plánu"],
        ["Koncept a idea návrhu", "Půdorysy, řezy a pohledy", "Osazení objektu na pozemek", "Fotorealistická 3D vizualizace", "Hrubý odhad nákladů (bilance ploch)"],
        ["Průvodní zpráva a koordinační situace", "Architektonické řešení (půdorysy, řezy)", "Zákresy do kontextu prostředí", "Koncept požární bezpečnosti", "Řešení inženýrských sítí a dopravy"],
        ["Architektura (měřítko 1:50) a statika", "Energetické hodnocení a požární bezpečnost", "Zdravotechnika, vytápění a vzduchotechnika", "Elektroinstalace", "Dopravní řešení a napojení na sítě"],
        ["Prováděcí projekt (detailní dokumentace 1:50 až 1:25)", "Součinnost při výrobní přípravě zhotovitele", "Autorský dozor a kontrola realizace", "Dokumentace skutečného provedení stavby (DSPS)"],
        ["Zaměření skutečného stavu (As-Built)", "Mračno bodů (.E57, .RCP, .LGS)", "HDR sférická panoramata", "Podklady pro BIM a CAD", "2D výkresová dokumentace a 3D BIM model"],
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
        ["Analysis of the existing zoning plan and site limits", "Comprehensive spatial design and zoning layout", "Traffic solution and infrastructure connections", "Capacity balances", "Basis for amendments to the zoning plan"],
        ["Concept and design idea", "Floor plans, sections and elevations", "Siting of the building on the plot", "Photorealistic 3D visualisation", "Rough cost estimate (area schedule)"],
        ["Accompanying report and coordination site plan", "Architectural design (floor plans, sections)", "Context renderings", "Fire safety concept", "Utilities and traffic solution"],
        ["Architecture (scale 1:50) and structural engineering", "Energy assessment and fire safety", "Plumbing, heating and HVAC", "Electrical installations", "Traffic solution and utility connections"],
        ["Detailed design (documentation at 1:50 to 1:25)", "Support for the contractor’s shop-drawing preparation", "Author’s supervision and site inspection", "As-built documentation"],
        ["As-built survey", "Point cloud (.E57, .RCP, .LGS)", "HDR spherical panoramas", "Data for BIM and CAD", "2D drawing documentation and 3D BIM model"],
      ],
    },
  },
};
