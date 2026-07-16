/**
 * Projekty — jediný zdroj dát pre komponenty (Works, ProjectsPage,
 * ProjectPage, [slug] stránky). Číta Sanity (fetchProjects +
 * fetchHomepageProjectIds) a mapuje na EXISTUJÚCE tvary webu
 * (ProjectDetail, karty mriežky) — komponenty sa nemusia meniť.
 *
 * Fallback kontrakt (ako tím na O nás): keď Sanity chýba/zlyhá/nevráti
 * nič, každá funkcia sa vráti k hardcoded dátam v i18n/projects.ts +
 * i18n/home.ts. Build sa NIKDY nerozbije o CMS.
 *
 * Pomery strán fotiek: CMS neukladá ratio — odvádza sa z rozmerov
 * originálu (metadata.dimensions → "w / h").
 */
import { home, type Lang } from "../i18n/home";
import { servicesPage } from "../i18n/services-page";
import {
  projects as fallbackDetails,
  extraProjects,
  worksProjectSlugs,
  worksImages,
  relatedCategories,
  availableProjectSlugs,
  projectHref,
  projectsListHref,
  type ProjectDetail,
  type ContentBlock,
  type ProjectImage,
  type SpecRow,
  type Localized,
} from "../i18n/projects";
import {
  fetchProjects,
  fetchHomepageProjectIds,
  imgSrc,
  type SanityProject,
  type SanityImg,
} from "./sanity";

/** Karta v mriežke projektov (hlavná stránka aj /projekty). */
export interface ProjectCard {
  title: string;
  description: string;
  alt: string;
  image: string;
  href: string | null;
}

/** Riadok zoznamu Ďalšie projekty na detaile. */
export interface RelatedProject {
  title: string;
  category: string;
  image: string;
  href: string;
}

// Kategórie: kľúč (Studio → project.category) je index-aligned s typmi
// stavieb zo /sluzby (services-page.ts → buildingTypes.types), odkiaľ
// berieme SK/CZ/EN label — žiadna duplicita prekladov.
// Pri zmene TREBA zosúladiť CATEGORIES v studio/schemaTypes/project.ts.
const CATEGORY_KEYS = [
  "rodinne-domy",
  "bytove-domy",
  "verejne-budovy",
  "priemyselne-stavby",
  "rekreacne-a-sportove-stavby",
  "parky-a-verejny-priestor",
];

function categoryLabel(key: string | null, lang: Lang): string {
  const i = key ? CATEGORY_KEYS.indexOf(key) : -1;
  return i >= 0 ? servicesPage[lang].buildingTypes.types[i].name : "";
}

// Pevné popisky meta tabuľky detailu (zhodné s pôvodnými hardcoded
// riadkami v i18n/projects.ts).
const META_LABELS: Record<
  Lang,
  { year: string; client: string; country: string; category: string; architect: string }
> = {
  sk: { year: "Rok", client: "Klient", country: "Krajina", category: "Kategória", architect: "Architekt" },
  cz: { year: "Rok", client: "Klient", country: "Země", category: "Kategorie", architect: "Architekt" },
  en: { year: "Year", client: "Client", country: "Country", category: "Category", architect: "Architect" },
};

/** Jazykový výber s tichou poistkou na SK (kontrakt ako roly tímu). */
function lf(lang: Lang, sk?: string | null, cz?: string | null, en?: string | null): string {
  return (lang === "cz" ? cz : lang === "en" ? en : sk) || sk || "";
}

/** Odseky z textarea — oddelené prázdnym riadkom. */
function paragraphs(text?: string | null): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const ratioOf = (img: NonNullable<SanityImg>): string => `${img.w} / ${img.h}`;

function projectImage(img: NonNullable<SanityImg>, w: number): ProjectImage {
  return { image: imgSrc(img.url, w), ratio: ratioOf(img) };
}

/* ============================================================
   Mriežky — karty.
   ============================================================ */

function cardFromSanity(p: SanityProject, lang: Lang): ProjectCard | null {
  if (!p.cover?.url) return null;
  const title = lf(lang, p.titleSk, p.titleCz, p.titleEn);
  return {
    title,
    description: lf(lang, p.descriptionSk, p.descriptionCz, p.descriptionEn),
    alt: title,
    image: imgSrc(p.cover.url, 2000),
    href: p.hasDetail && p.slug ? projectHref(lang, p.slug) : null,
  };
}

/** Fallback: presne dnešná kompozícia mriežky /projekty (6 works + 6 extra). */
function fallbackListing(lang: Lang): ProjectCard[] {
  const works = home[lang].works.projects.map((p, i) => ({
    title: p.title,
    description: p.description,
    alt: p.alt,
    image: worksImages[i],
    href: availableProjectSlugs.has(worksProjectSlugs[i])
      ? projectHref(lang, worksProjectSlugs[i])
      : null,
  }));
  const extras = extraProjects.map((p) => ({
    title: p.title[lang],
    description: p.description[lang],
    alt: p.title[lang],
    image: p.image,
    href: null,
  }));
  return [...works, ...extras];
}

/** /projekty — všetky projekty v poradí zo Studia (drag & drop). */
export async function getListingProjects(lang: Lang): Promise<ProjectCard[]> {
  const cms = await fetchProjects();
  const cards = cms?.map((p) => cardFromSanity(p, lang)).filter((c): c is ProjectCard => !!c);
  return cards && cards.length ? cards : fallbackListing(lang);
}

/**
 * Hlavná stránka — výber + poradie zo singletonu homepageProjects.
 * Mriežka Works je dizajnovo zamknutá na 6 dlaždíc, preto sa CMS výber
 * použije len keď je kompletný (6 platných kariet) — inak fallback.
 */
export async function getHomeProjects(lang: Lang): Promise<ProjectCard[]> {
  const [cms, ids] = await Promise.all([fetchProjects(), fetchHomepageProjectIds()]);
  if (cms && ids && ids.length === 6) {
    const byId = new Map(cms.map((p) => [p._id, p]));
    const cards = ids.map((id) => {
      const p = byId.get(id);
      return p ? cardFromSanity(p, lang) : null;
    });
    if (cards.every((c): c is ProjectCard => !!c)) return cards;
  }
  return fallbackListing(lang).slice(0, 6);
}

/* ============================================================
   Detail — mapovanie na ProjectDetail (i18n/projects.ts).
   ============================================================ */

function localizedText(
  sk?: string | null,
  cz?: string | null,
  en?: string | null,
): Localized<string> {
  return { sk: sk ?? "", cz: cz || sk || "", en: en || sk || "" };
}

function blockFromSanity(b: NonNullable<SanityProject["blocks"]>[number]): ContentBlock | null {
  if (b._type === "photoBlock") {
    return b.img?.url ? { kind: "photo", media: projectImage(b.img, 2560) } : null;
  }
  if (b._type === "duoBlock") {
    return b.left?.url && b.right?.url
      ? { kind: "duo", left: projectImage(b.left, 1600), right: projectImage(b.right, 1600) }
      : null;
  }
  if (b._type === "textBlock") {
    return {
      kind: "text",
      title: localizedText(b.titleSk, b.titleCz, b.titleEn),
      body: {
        sk: paragraphs(b.bodySk),
        cz: paragraphs(b.bodyCz || b.bodySk),
        en: paragraphs(b.bodyEn || b.bodySk),
      },
    };
  }
  const rows = b.rows ?? [];
  const specRows = (pickL: "labelSk" | "labelCz" | "labelEn", pickV: "valueSk" | "valueCz" | "valueEn"): SpecRow[] =>
    rows.map((r) => ({
      label: r[pickL] || r.labelSk || "",
      value: r[pickV] || r.valueSk || "",
    }));
  return {
    kind: "spec",
    title: localizedText(b.titleSk, b.titleCz, b.titleEn),
    rows: {
      sk: specRows("labelSk", "valueSk"),
      cz: specRows("labelCz", "valueCz"),
      en: specRows("labelEn", "valueEn"),
    },
  };
}

function detailFromSanity(p: SanityProject): ProjectDetail | null {
  if (!p.hasDetail || !p.slug || !p.hero?.url || !p.context?.url) return null;

  const localeFor = (lang: Lang) => {
    const title = lf(lang, p.titleSk, p.titleCz, p.titleEn);
    const L = META_LABELS[lang];
    // Slogan (intro) je voliteľný — prázdny sa nahrádza popisom karty
    // v ROVNAKOM jazyku (popis je povinný vo všetkých jazykoch, takže
    // fallback je vždy správne preložený; slogan v inom jazyku by bol
    // horší než preložený popis).
    const ownIntro = lang === "cz" ? p.introCz : lang === "en" ? p.introEn : p.introSk;
    return {
      title,
      intro: ownIntro || lf(lang, p.descriptionSk, p.descriptionCz, p.descriptionEn),
      heroAlt: title,
      contextAlt: title,
      contextBody: paragraphs(lf(lang, p.contextBodySk, p.contextBodyCz, p.contextBodyEn)),
      // Prázdna hodnota = riadok sa na webe nezobrazí (render filter).
      meta: [
        { label: L.year, value: p.year ?? "" },
        { label: L.client, value: p.client ?? "" },
        { label: L.country, value: lf(lang, p.countrySk, p.countryCz, p.countryEn) },
        { label: L.category, value: categoryLabel(p.category, lang) },
        { label: L.architect, value: p.architect ?? "" },
      ],
    };
  };

  return {
    slug: p.slug,
    heroImage: imgSrc(p.hero.url, 2560),
    contextImage: imgSrc(p.context.url, 1600),
    blocks: (p.blocks ?? [])
      .map(blockFromSanity)
      .filter((b): b is ContentBlock => !!b),
    gallery: (p.gallery ?? [])
      .filter((g) => g?.url)
      .map((g) => projectImage(g, 2560)),
    locales: { sk: localeFor("sk"), cz: localeFor("cz"), en: localeFor("en") },
  };
}

/** Všetky projekty s detailnou stránkou (getStaticPaths + render). */
export async function getProjectDetails(): Promise<ProjectDetail[]> {
  const cms = await fetchProjects();
  const details = cms?.map(detailFromSanity).filter((d): d is ProjectDetail => !!d) ?? [];
  return details.length ? details : fallbackDetails;
}

export async function getProjectDetail(slug: string): Promise<ProjectDetail | null> {
  return (await getProjectDetails()).find((d) => d.slug === slug) ?? null;
}

/* ============================================================
   Ďalšie projekty (detail) — riadky s hover náhľadom.
   ============================================================ */

/** Fallback: dnešná kompozícia z works mriežky. */
function fallbackRelated(lang: Lang, slug: string): RelatedProject[] {
  const anchor = projectsListHref(lang);
  const currentIndex = worksProjectSlugs.indexOf(slug);
  return home[lang].works.projects
    .map((p, i) => {
      const s = worksProjectSlugs[i];
      return {
        title: p.title,
        category: relatedCategories[lang][i],
        image: worksImages[i],
        href: availableProjectSlugs.has(s) ? projectHref(lang, s) : anchor,
      };
    })
    .filter((_, i) => i !== currentIndex);
}

/** Ostatné projekty z homepage výberu — projekt bez detailu vedie na /projekty. */
export async function getRelatedProjects(lang: Lang, slug: string): Promise<RelatedProject[]> {
  const [cms, ids] = await Promise.all([fetchProjects(), fetchHomepageProjectIds()]);
  if (cms && ids && ids.length) {
    const byId = new Map(cms.map((p) => [p._id, p]));
    const anchor = projectsListHref(lang);
    const rows = ids
      .map((id) => byId.get(id))
      .filter((p): p is SanityProject => !!p && !!p.cover?.url && p.slug !== slug)
      .map((p) => ({
        title: lf(lang, p.titleSk, p.titleCz, p.titleEn),
        category: categoryLabel(p.category, lang),
        image: imgSrc(p.cover!.url, 1200),
        href: p.hasDetail && p.slug ? projectHref(lang, p.slug) : anchor,
      }));
    if (rows.length) return rows;
  }
  return fallbackRelated(lang, slug);
}
