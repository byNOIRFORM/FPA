/**
 * Sanity CMS — build-time čítanie obsahu (prvý test: členovia tímu na
 * O nás; pozri studio/ pre schému a editačné rozhranie).
 *
 * Zámerne BEZ @sanity/client — statický build potrebuje pár GROQ
 * dotazov cez verejné HTTP API, takže plain fetch stačí a neťaháme
 * závislosť. Ide o NECACHOVANÉ api.sanity.io, nie apicdn: build beží
 * zriedka a musí vidieť čerstvý obsah — apicdn vie tesne po publikovaní
 * vrátiť starú odpoveď (overené 2026-07-16: checkbox Voľného miesta sa
 * cez apicdn do buildu nepremietol).
 *
 * Fallback kontrakt: každá funkcia vracia `null`, keď Sanity nie je
 * nakonfigurované (chýba env) alebo je nedostupné — volajúci sa vtedy
 * vráti k hardcoded i18n dátam. Build sa NIKDY nerozbije o CMS.
 */

const PROJECT_ID = import.meta.env.PUBLIC_SANITY_PROJECT_ID as string | undefined;
const DATASET = (import.meta.env.PUBLIC_SANITY_DATASET as string | undefined) ?? "production";
const API_VERSION = "2026-07-01";

async function groq<T>(query: string): Promise<T | null> {
  if (!PROJECT_ID) return null;
  try {
    const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const body = (await res.json()) as { result?: T };
    return body.result ?? null;
  } catch {
    return null;
  }
}

export type SanityTeamMember = {
  name: string;
  roleSk: string;
  roleCz?: string | null;
  roleEn?: string | null;
  /** Priama URL na Sanity image CDN (bez transformačných parametrov). */
  portraitUrl: string | null;
};

// Jeden fetch na build — stránka sa renderuje pre 3 jazyky a všetky
// zdieľajú ten istý výsledok.
let teamCache: Promise<SanityTeamMember[] | null> | undefined;

export function fetchTeamMembers(): Promise<SanityTeamMember[] | null> {
  // orderRank = lexorank string spravovaný drag & drop pluginom v Studiu;
  // lexikografické radenie je jeho poradie. Rola je v Studiu vnorená
  // do objektu role{sk,cz,en} (sekčný vzor s prepínačom Jazyk) — tu ju
  // splošťujeme na pôvodné mená.
  teamCache ??= groq<SanityTeamMember[]>(
    `*[_type == "teamMember"] | order(orderRank) {
      name,
      "roleSk": role.sk, "roleCz": role.cz, "roleEn": role.en,
      "portraitUrl": portrait.asset->url
    }`,
  ).then((members) => (members && members.length ? members : null));
  return teamCache;
}

export type SanityTeamSettings = {
  careersOpen?: boolean | null;
  careersUrl?: string | null;
};

let settingsCache: Promise<SanityTeamSettings | null> | undefined;

/** Singleton "Nastavenia tímu" — riadi dlaždicu Voľné miesto. */
export function fetchTeamSettings(): Promise<SanityTeamSettings | null> {
  settingsCache ??= groq<SanityTeamSettings | null>(
    `*[_id == "teamSettings"][0]{ careersOpen, careersUrl }`,
  );
  return settingsCache;
}

export type SanityTestimonial = {
  name: string;
  quoteSk: string;
  quoteCz?: string | null;
  quoteEn?: string | null;
  roleSk: string;
  roleCz?: string | null;
  roleEn?: string | null;
  /** Priama URL na Sanity image CDN (bez transformačných parametrov). */
  photoUrl: string | null;
};

let testimonialsCache: Promise<SanityTestimonial[] | null> | undefined;

/**
 * Referencie klientov — carousel "Čo hovoria naši klienti" na O nás,
 * v poradí drag & drop zoznamu v Studiu. Citát a rola sú v Studiu vnorené
 * do objektov quote{sk,cz,en} / role{sk,cz,en} — tu ich splošťujeme.
 */
export function fetchTestimonials(): Promise<SanityTestimonial[] | null> {
  testimonialsCache ??= groq<SanityTestimonial[]>(
    `*[_type == "testimonial"] | order(orderRank) {
      name,
      "quoteSk": quote.sk, "quoteCz": quote.cz, "quoteEn": quote.en,
      "roleSk": role.sk, "roleCz": role.cz, "roleEn": role.en,
      "photoUrl": photo.asset->url
    }`,
  ).then((list) => (list && list.length ? list : null));
  return testimonialsCache;
}

/**
 * Transformačné parametre Sanity image CDN — portrét mriežky tímu:
 * 800px šírka pokrýva 328px dlaždicu aj na 2560/retina, auto=format
 * servíruje WebP/AVIF podľa prehliadača.
 */
export function portraitSrc(url: string): string {
  return `${url}?w=800&q=80&auto=format`;
}

/**
 * Všeobecná transformácia Sanity image CDN — šírka podľa miesta použitia
 * (CDN nikdy neupscaluje nad originál, takže w môže byť veľkoryso).
 */
export function imgSrc(url: string, w: number): string {
  return `${url}?w=${w}&q=80&auto=format`;
}

/* ============================================================
   Projekty — mriežky (hlavná stránka + /projekty) a detaily.
   ============================================================ */

/** Fotka s rozmermi originálu — pomery strán si web odvodí z w/h. */
export type SanityImg = { url: string; w: number; h: number } | null;

export type SanityProjectBlock =
  | { _type: "photoBlock"; _key: string; img: SanityImg }
  | {
      _type: "textBlock";
      _key: string;
      titleSk?: string | null;
      titleCz?: string | null;
      titleEn?: string | null;
      bodySk?: string | null;
      bodyCz?: string | null;
      bodyEn?: string | null;
    }
  | { _type: "duoBlock"; _key: string; left: SanityImg; right: SanityImg }
  | {
      _type: "specBlock";
      _key: string;
      titleSk?: string | null;
      titleCz?: string | null;
      titleEn?: string | null;
      rows?:
        | {
            labelSk?: string | null;
            valueSk?: string | null;
            labelCz?: string | null;
            valueCz?: string | null;
            labelEn?: string | null;
            valueEn?: string | null;
          }[]
        | null;
    };

export type SanityProject = {
  _id: string;
  slug: string | null;
  hasDetail: boolean | null;
  category: string | null;
  year: string | null;
  client: string | null;
  architect: string | null;
  countrySk: string | null;
  countryCz: string | null;
  countryEn: string | null;
  titleSk: string | null;
  titleCz: string | null;
  titleEn: string | null;
  descriptionSk: string | null;
  descriptionCz: string | null;
  descriptionEn: string | null;
  introSk: string | null;
  introCz: string | null;
  introEn: string | null;
  contextBodySk: string | null;
  contextBodyCz: string | null;
  contextBodyEn: string | null;
  cover: SanityImg;
  hero: SanityImg;
  context: SanityImg;
  blocks: SanityProjectBlock[] | null;
  gallery: ({ _key: string } & NonNullable<SanityImg>)[] | null;
};

const IMG = `{ "url": url, "w": metadata.dimensions.width, "h": metadata.dimensions.height }`;

let projectsCache: Promise<SanityProject[] | null> | undefined;

/** Všetky projekty v poradí mriežky /projekty (drag & drop v Studiu). */
export function fetchProjects(): Promise<SanityProject[] | null> {
  // Preložené texty sú v Studiu vnorené do sekčných objektov (card /
  // slogan / infoText — jazykový prepínač per sekcia); tu ich splošťujeme
  // na pôvodné mená, takže SanityProject a adaptér sa nemenia.
  projectsCache ??= groq<SanityProject[]>(
    `*[_type == "project"] | order(orderRank) {
      _id, "slug": slug.current, hasDetail,
      "category": facts.category,
      "year": facts.year,
      "client": facts.client,
      "architect": facts.architect,
      "countrySk": facts.countrySk,
      "countryCz": facts.countryCz,
      "countryEn": facts.countryEn,
      "titleSk": card.titleSk, "titleCz": card.titleCz, "titleEn": card.titleEn,
      "descriptionSk": card.descriptionSk,
      "descriptionCz": card.descriptionCz,
      "descriptionEn": card.descriptionEn,
      "introSk": slogan.sk, "introCz": slogan.cz, "introEn": slogan.en,
      "contextBodySk": infoText.textSk,
      "contextBodyCz": infoText.textCz,
      "contextBodyEn": infoText.textEn,
      "cover": cover.asset->${IMG},
      "hero": hero.asset->${IMG},
      "context": context.asset->${IMG},
      blocks[]{
        _type, _key,
        _type == "photoBlock" => { "img": image.asset->${IMG} },
        _type == "textBlock" => { titleSk, titleCz, titleEn, bodySk, bodyCz, bodyEn },
        _type == "duoBlock" => { "left": left.asset->${IMG}, "right": right.asset->${IMG} },
        _type == "specBlock" => { titleSk, titleCz, titleEn, rows[]{ labelSk, valueSk, labelCz, valueCz, labelEn, valueEn } }
      },
      gallery[]{ _key, "url": asset->url, "w": asset->metadata.dimensions.width, "h": asset->metadata.dimensions.height }
    }`,
  ).then((list) => (list && list.length ? list : null));
  return projectsCache;
}

let homepageIdsCache: Promise<string[] | null> | undefined;

/** Singleton homepageProjects — _id-čka 6 projektov v poradí mriežky. */
export function fetchHomepageProjectIds(): Promise<string[] | null> {
  homepageIdsCache ??= groq<string[]>(
    `*[_id == "homepageProjects"][0].projects[]._ref`,
  ).then((ids) => (ids && ids.length ? ids : null));
  return homepageIdsCache;
}
