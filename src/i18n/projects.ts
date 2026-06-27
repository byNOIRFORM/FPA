/**
 * Projects i18n + data — project detail pages (Figma "projektDetail",
 * node 3193:414). Values below are taken 1:1 from that frame at the
 * 1440 canvas (28px gutters → 1384 content), then scaled responsively
 * in ProjectPage.astro the same way the rest of the site scales.
 *
 * HARDCODED-FIRST (phase 1 of the content plan): the sample project
 * "Chata pod korunami" is a typed object whose shape maps 1:1 to a
 * future Astro Content Collection entry. Migration = move each project
 * to Markdown/MDX; the layout doesn't change.
 *
 * Images REUSE /images/works/*.jpg as placeholders so the layout renders
 * with real-ish photos; swap for real project shots once we have them.
 */
import { home, type Lang } from "./home";

export type GallerySpan = "full" | "half";

/** One gallery image. `span` = full-bleed vs paired; `ratio` keeps the
 *  parallax frame proportional (exact Figma px ratios). */
export interface GalleryItem {
  image: string;
  span: GallerySpan;
  ratio: string;
}

export interface ProjectSpec {
  rok: string;
  klient: string;
  krajina: string;
  kategoria: string;
  architekt: string;
}

export interface ProjectLocale {
  title: string;
  intro: string; // big word-scrub intro under the hero
  body: string[]; // "Informácie" paragraphs
  spec: ProjectSpec;
  heroAlt: string;
  infoAlt: string;
}

export interface ProjectDetail {
  slug: string;
  heroImage: string;
  infoImage: string;
  gallery: GalleryItem[];
  locales: Record<Lang, ProjectLocale>;
}

/* ============================================================
   Section + spec labels per language.
   ============================================================ */
export const projectsUI: Record<
  Lang,
  {
    infoLabel: string;
    relatedLabel: string;
    specLabels: { rok: string; klient: string; krajina: string; kategoria: string; architekt: string };
  }
> = {
  sk: {
    infoLabel: "Informácie",
    relatedLabel: "Ďalšie projekty",
    specLabels: { rok: "Rok", klient: "Klient", krajina: "Krajina", kategoria: "Kategória", architekt: "Architekt" },
  },
  cz: {
    infoLabel: "Informace",
    relatedLabel: "Další projekty",
    specLabels: { rok: "Rok", klient: "Klient", krajina: "Země", kategoria: "Kategorie", architekt: "Architekt" },
  },
  en: {
    infoLabel: "Information",
    relatedLabel: "More projects",
    specLabels: { rok: "Year", klient: "Client", krajina: "Country", kategoria: "Category", architekt: "Architect" },
  },
};

/* ============================================================
   Works grid ↔ projects. Index-aligned with home[lang].works.projects
   so a tile knows its slug, image and (localised) category.
   ============================================================ */
export const worksImages = [
  "/images/works/work-1.jpg",
  "/images/works/work-2.jpg",
  "/images/works/work-3.jpg",
  "/images/works/work-4.jpg",
  "/images/works/work-5.jpg",
  "/images/works/work-6.jpg",
];

export const worksProjectSlugs = [
  "chata-pod-korunami",
  "vila-na-kopci",
  "dom-pri-vodnej-hladine",
  "bistro-koncept",
  "atelier-linea",
  "kniznica-archiv",
];

// Categories = the building types offered in /sluzby (services-page.ts →
// buildingTypes), index-aligned with home[lang].works.projects:
//   Chata → Rekreačné a športové stavby, Vila / Dom → Rodinné domy,
//   Bistro / Knižnica → Verejné budovy, Ateliér → Priemyselné stavby.
export const relatedCategories: Record<Lang, string[]> = {
  sk: ["Rekreačné a športové stavby", "Rodinné domy", "Rodinné domy", "Verejné budovy", "Priemyselné stavby", "Verejné budovy"],
  cz: ["Rekreační a sportovní stavby", "Rodinné domy", "Rodinné domy", "Veřejné budovy", "Průmyslové stavby", "Veřejné budovy"],
  en: ["Leisure & sports facilities", "Family houses", "Family houses", "Public buildings", "Industrial structures", "Public buildings"],
};

/* ============================================================
   The projects. Phase 1 = one fully built sample.
   ============================================================ */
export const projects: ProjectDetail[] = [
  {
    slug: "chata-pod-korunami",
    // Real photos exported from Figma (node 3193:414). Mapping:
    // hero=imgImg, info+slot2=imgImg2, slot1=imgImg1, slot3=imgImg3,
    // slot4=imgImg6, slot5=imgImg5, slot6=imgImg4.
    heroImage: "/images/projects/chata/hero.jpg",
    infoImage: "/images/projects/chata/02.jpg",
    // Gallery rhythm + exact Figma px frame ratios:
    // full (1384×1024) → 2-up (680×800) → full → 2-up (680×905).
    gallery: [
      { image: "/images/projects/chata/01.jpg", span: "full", ratio: "1384 / 1024" },
      { image: "/images/projects/chata/02.jpg", span: "half", ratio: "680 / 800" },
      { image: "/images/projects/chata/03.jpg", span: "half", ratio: "680 / 800" },
      { image: "/images/projects/chata/04.jpg", span: "full", ratio: "1384 / 1024" },
      { image: "/images/projects/chata/05.jpg", span: "half", ratio: "680 / 905" },
      { image: "/images/projects/chata/06.jpg", span: "half", ratio: "680 / 905" },
    ],
    locales: {
      sk: {
        title: home.sk.works.projects[0].title,
        intro: home.sk.works.projects[0].description,
        heroAlt: home.sk.works.projects[0].alt,
        infoAlt: "Chata pod korunami — interiér s presklením do lesa",
        body: [
          "Chata pod korunami nie je len stavbou v lese – je jeho priamym, architektonickým predĺžením. Koncept citlivo reaguje na morfológiu terénu a vertikálny rytmus okolitého porastu. Výrazná silueta so štíhlou sedlovou strechou a veľkoformátovým presklením otvára dom do krajiny, zatiaľ čo kombinácia surového kameňa a hrejivého dreva definuje jeho nadčasový charakter. Objekt tak nepôsobí ako cudzí zásah, ale ako organická súčasť miesta, ktorá tu stála odjakživa.",
          "Dispozičné riešenie je navrhnuté pre celoročné bývanie s dôrazom na otvorenosť a spoločné momenty. Srdcom prízemia je veľkorysá denná zóna, ktorá plynule prepája kuchyňu, jedálenský kút a obývací priestor s panoramatickým výhľadom. Skutočným stredobodom domova je akumulačná pec na drevo, ktorá do celého priestoru sála prírodné teplo. Nočná časť na druhom podlaží ukrýva dve útulné spálne, navrhnuté ako útočisko s výhľadom priamo do korún stromov. Je to ideálne miesto pre každého, komu už tesný mestský byt nestačí.",
        ],
        spec: {
          rok: "1. polovica roka 2025",
          klient: "OIKOS Construction",
          krajina: "Slovensko",
          kategoria: "Rekreačné a športové stavby",
          architekt: "Fotta Popadič",
        },
      },
      cz: {
        title: home.cz.works.projects[0].title,
        intro: home.cz.works.projects[0].description,
        heroAlt: home.cz.works.projects[0].alt,
        infoAlt: "Chata pod korunami — interiér s prosklením do lesa",
        body: [
          "Chata pod korunami není jen stavbou v lese – je jeho přímým, architektonickým prodloužením. Koncept citlivě reaguje na morfologii terénu a vertikální rytmus okolního porostu. Výrazná silueta se štíhlou sedlovou střechou a velkoformátovým prosklením otevírá dům do krajiny, zatímco kombinace surového kamene a hřejivého dřeva definuje jeho nadčasový charakter. Objekt tak nepůsobí jako cizí zásah, ale jako organická součást místa, která tu stála odjakživa.",
          "Dispoziční řešení je navrženo pro celoroční bydlení s důrazem na otevřenost a společné momenty. Srdcem přízemí je velkorysá denní zóna, která plynule propojuje kuchyni, jídelní kout a obývací prostor s panoramatickým výhledem. Skutečným středobodem domova jsou akumulační kamna na dřevo, která do celého prostoru sálají přirozené teplo. Noční část v druhém podlaží ukrývá dvě útulné ložnice, navržené jako útočiště s výhledem přímo do korun stromů. Je to ideální místo pro každého, komu už těsný městský byt nestačí.",
        ],
        spec: {
          rok: "1. polovina roku 2025",
          klient: "OIKOS Construction",
          krajina: "Slovensko",
          kategoria: "Rekreační a sportovní stavby",
          architekt: "Fotta Popadič",
        },
      },
      en: {
        title: home.en.works.projects[0].title,
        intro: home.en.works.projects[0].description,
        heroAlt: home.en.works.projects[0].alt,
        infoAlt: "Cabin Beneath the Canopy — interior glazing onto the forest",
        body: [
          "Cabin Beneath the Canopy is not merely a building in the forest – it is its direct architectural extension. The concept responds sensitively to the morphology of the terrain and the vertical rhythm of the surrounding trees. A distinct silhouette with a slender gabled roof and large-format glazing opens the house to the landscape, while the pairing of raw stone and warm timber defines its timeless character. The building reads not as a foreign intrusion but as an organic part of the place, as if it had always stood there.",
          "The layout is designed for year-round living with an emphasis on openness and shared moments. At the heart of the ground floor is a generous living zone that flows between the kitchen, the dining nook and the living area beneath a panoramic view. The true centre of the home is a wood-burning heat-storage stove that radiates natural warmth throughout. The upper floor hides two intimate bedrooms conceived as a retreat, looking directly into the treetops. It is the ideal place for anyone for whom a cramped city flat is no longer enough.",
        ],
        spec: {
          rok: "First half of 2025",
          klient: "OIKOS Construction",
          krajina: "Slovakia",
          kategoria: "Leisure & sports facilities",
          architekt: "Fotta Popadič",
        },
      },
    },
  },
];

export const projectsBySlug = new Map(projects.map((p) => [p.slug, p]));
export const availableProjectSlugs = new Set(projects.map((p) => p.slug));

/** Language-aware path to a project detail page (SK has no prefix). */
export function projectHref(lang: Lang, slug: string): string {
  const prefix = lang === "sk" ? "" : `/${lang}`;
  return `${prefix}/projekty/${slug}`;
}
