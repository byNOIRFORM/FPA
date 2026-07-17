/**
 * Služby — jediný build-time adaptér CMS → web. Skladá dáta pre VŠETKY
 * tri miesta, kde služby žijú (riadky spec-sheetu na hlavnej stránke a
 * /sluzby, modaly „Dozvedieť sa viac", piluľky kontaktného formulára),
 * aby fallback logika existovala raz a nie trikrát.
 *
 * Fallback kontrakt ako všade: keď Sanity nie je nakonfigurované alebo
 * nedostupné, vracia sa presne dnešný hardcoded obsah (home.ts +
 * services-page.ts + service-details.ts) — build sa NIKDY nerozbije o CMS.
 *
 * Pozičné veci zámerne NEžijú v CMS: čísla 01–05 a rytmus fotiek
 * portrait/landscape (TALL → short → short → TALL → short, t.j. portrait
 * na pozíciách i % 3 === 0) odvodzuje adaptér z poradia riadkov, takže
 * drag & drop v Studiu ich nikdy nerozhodí.
 */
import { home, type Lang } from "../i18n/home";
import { servicesPage } from "../i18n/services-page";
import { serviceDetails, detailIndices, type ServiceDetailData } from "../i18n/service-details";
import { fetchServices, imgSrc } from "./sanity";

export interface ServiceRow {
  num: string;
  title: string;
  desc: string;
  image: string;
  alt: string;
  aspect: "portrait" | "landscape";
  includes: string[];
}

export interface ServicesView {
  rows: ServiceRow[];
  /** Obsahy modalov — len služby, ktoré majú čo zobraziť. */
  details: ServiceDetailData[];
  /** Indexy riadkov s modalom — riadi odkazy „Dozvedieť sa viac". */
  detailIndices: Set<number>;
  /** Názvy služieb pre piluľky kontaktného formulára (bez „Iné"). */
  pillTitles: string[];
}

// num / image / aspect sú jazykovo-agnostické a pozičné; obrázky slúžia
// aj ako fallback pre službu bez fotky v CMS.
const META = [
  { num: "01", image: "/images/services/01-urbanisticka.jpg", aspect: "portrait" as const },
  { num: "02", image: "/images/services/02-architektonicka.jpg", aspect: "landscape" as const },
  { num: "03", image: "/images/services/03-uzemne.jpg", aspect: "landscape" as const },
  { num: "04", image: "/images/services/04-stavebne.jpg", aspect: "portrait" as const },
  { num: "05", image: "/images/services/05-realizacna.jpg", aspect: "landscape" as const },
];

export async function getServicesView(lang: Lang): Promise<ServicesView> {
  const t = home[lang];
  const sp = servicesPage[lang];
  const cms = await fetchServices();

  // CZ/EN s fallbackom na SK — prázdny preklad nikdy nevyrenderuje
  // prázdny string.
  const pick = (sk?: string | null, cz?: string | null, en?: string | null): string =>
    (lang === "cz" ? cz : lang === "en" ? en : sk) || sk || "";

  if (!cms) {
    // Fallback = dnešné hardcoded zloženie, 1:1 (vrátane poradia spreadov).
    const rows: ServiceRow[] = t.services.items.map((s, i) => ({
      ...META[i],
      ...s,
      includes: sp.spec.includes[i] ?? [],
    }));
    return {
      rows,
      details: serviceDetails[lang],
      detailIndices,
      pillTitles: rows.map((r) => r.title),
    };
  }

  const rows: ServiceRow[] = cms.map((s, i) => ({
    num: String(i + 1).padStart(2, "0"),
    title: pick(s.titleSk, s.titleCz, s.titleEn),
    desc: pick(s.descSk, s.descCz, s.descEn),
    // Fotka z CMS (media je 328px → w=800 pokryje retinu), inak pôvodná
    // fotka webu na tej istej pozícii. Alt ostáva pozičný z i18n — popisuje
    // seedované fotky; pri výmene fotky v Studiu je názov služby lepší
    // popis než text o starej fotke.
    image: s.photoUrl ? imgSrc(s.photoUrl, 800) : (META[i]?.image ?? ""),
    alt: s.photoUrl
      ? pick(s.titleSk, s.titleCz, s.titleEn)
      : (t.services.items[i]?.alt ?? pick(s.titleSk, s.titleCz, s.titleEn)),
    aspect: i % 3 === 0 ? "portrait" : "landscape",
    includes: (s.includes ?? []).map((it) => pick(it.sk, it.cz, it.en)),
  }));

  // Modal má služba s aspoň jednou sekciou; nadpis = názov služby,
  // úvod = voliteľný text modalu, inak popis služby.
  const details: ServiceDetailData[] = cms.flatMap((s, i) => {
    const sections = s.modalSections ?? [];
    if (sections.length === 0) return [];
    return [
      {
        index: i,
        title: rows[i].title,
        intro: pick(s.modalIntroSk, s.modalIntroCz, s.modalIntroEn) || rows[i].desc,
        sections: sections.map((sec) => ({
          heading: pick(sec.headingSk, sec.headingCz, sec.headingEn),
          body: pick(sec.bodySk, sec.bodyCz, sec.bodyEn),
        })),
      },
    ];
  });

  return {
    rows,
    details,
    detailIndices: new Set(details.map((d) => d.index)),
    pillTitles: rows.map((r) => r.title),
  };
}
