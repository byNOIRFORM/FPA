import {
  defineArrayMember,
  defineField,
  defineType,
  type ConditionalPropertyCallbackContext,
  type CustomValidator,
} from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { DocumentSheetIcon } from "@sanity/icons/DocumentSheet";
import { ImageIcon } from "@sanity/icons/Image";
import { ImagesIcon } from "@sanity/icons/Images";
import { withPlaceholder, withPlaceholderFrom } from "../components/placeholderInput";

/**
 * Projekt — mriežka na hlavnej stránke + /projekty + detail /projekty/[slug].
 *
 * UX formulára (Michalov model, 2026-07-16): ŽIADNE jazykové taby na
 * úrovni dokumentu — formulár je zvislý sled SEKCIÍ presne v poradí
 * stránky (fieldsety s názvom a popisom). Preložené texty každej sekcie
 * žijú v objekte s JEDNOTNÝM labelom „Jazyk" a prepínačom SK | CZ | EN
 * (ako texty v blokoch obsahu). Tab "Všetky polia" je skrytý globálne
 * (StudioLayout).
 *
 * Sekcie: Karta v mriežke → [Detailná stránka + slug] → Hero fotka →
 * Slogan → Informácie o projekte → Údaje o projekte → Obsah detailu.
 * Sekcie detailu sú celé skryté, kým je prepínač vypnutý.
 *
 * Poradie v mriežke /projekty = drag & drop v zozname "Všetky projekty"
 * (orderRank). Výber + poradie 6 na hlavnej stránke = singleton
 * homepageProjects. Pomery strán fotiek sa NEZADÁVAJÚ — web si ich
 * odvodí z rozmerov nahraného assetu.
 */

// Kategórie = typy stavieb zo /sluzby (services-page.ts → buildingTypes),
// kľúče sú jazykovo neutrálne — web si k nim doplní SK/CZ/EN label.
// Pri zmene TREBA zosúladiť CATEGORY_KEYS v src/lib/projects.ts.
const CATEGORIES = [
  { title: "Rodinné domy", value: "rodinne-domy" },
  { title: "Bytové domy", value: "bytove-domy" },
  { title: "Verejné budovy", value: "verejne-budovy" },
  { title: "Priemyselné stavby", value: "priemyselne-stavby" },
  { title: "Rekreačné a športové stavby", value: "rekreacne-a-sportove-stavby" },
  { title: "Parky a verejný priestor", value: "parky-a-verejny-priestor" },
] as const;

/** Jazykové taby vnútri sekcie — rovnaké ako v blokoch obsahu. */
const LANG_GROUPS = [
  { name: "sk", title: "SK", default: true },
  { name: "cz", title: "CZ" },
  { name: "en", title: "EN" },
];

/** Jednotný label nad každým prepínačom jazykov (Michalov feedback). */
const LANG_LABEL = "Jazyk";

/** Povinné len pri zapnutej detailnej stránke. */
const detailRequired: CustomValidator = (v, ctx) =>
  ctx.document?.hasDetail && !v ? "Povinné pri zapnutej detailnej stránke." : true;
const requiredForDetail = <R extends { custom(fn: CustomValidator): R }>(r: R): R =>
  r.custom(detailRequired);

const detailOnly = ({ document }: ConditionalPropertyCallbackContext) => !document?.hasDetail;

/* ============================================================
   Bloky obsahu — detail medzi Údajmi o projekte a drag galériou.
   ============================================================ */

export const photoBlock = defineType({
  name: "photoBlock",
  title: "Fotografia (celá šírka)",
  type: "object",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "image",
      title: "Fotka",
      type: "image",
      options: { hotspot: true },
      description: "Zobrazí sa na celú šírku obsahu s jemnou paralaxou. Ideálne na šírku (~1384 × 780).",
      validation: (r) => r.required().error("Povinné pole."),
    }),
  ],
  preview: {
    select: { media: "image" },
    prepare: (sel) => ({ title: "Fotografia (celá šírka)", media: sel.media as never }),
  },
});

export const textBlock = defineType({
  name: "textBlock",
  title: "Text (nadpis + odseky)",
  type: "object",
  icon: BlockContentIcon,
  groups: LANG_GROUPS,
  fields: [
    defineField({ name: "titleSk", title: "Nadpis (SK)", type: "string", group: "sk", validation: (r) => r.required().error("Povinné pole.") }),
    defineField({
      name: "bodySk",
      title: "Text (SK)",
      type: "text",
      rows: 10,
      group: "sk",
      description: "Odseky oddeľte prázdnym riadkom (2× Enter).",
      validation: (r) => r.required().error("Povinné pole."),
    }),
    defineField({ name: "titleCz", title: "Nadpis (CZ)", type: "string", group: "cz", validation: (r) => r.required().error("Povinné pole — doplňte český preklad.") }),
    defineField({
      name: "bodyCz",
      title: "Text (CZ)",
      type: "text",
      rows: 10,
      group: "cz",
      description: "Odseky oddeľte prázdnym riadkom (2× Enter).",
      validation: (r) => r.required().error("Povinné pole — doplňte český preklad."),
    }),
    defineField({ name: "titleEn", title: "Nadpis (EN)", type: "string", group: "en", validation: (r) => r.required().error("Povinné pole — doplňte anglický preklad.") }),
    defineField({
      name: "bodyEn",
      title: "Text (EN)",
      type: "text",
      rows: 10,
      group: "en",
      description: "Odseky oddeľte prázdnym riadkom (2× Enter).",
      validation: (r) => r.required().error("Povinné pole — doplňte anglický preklad."),
    }),
  ],
  preview: {
    select: { title: "titleSk" },
    prepare: (sel) => ({ title: (sel.title as string) || "Text", subtitle: "Text (nadpis + odseky)" }),
  },
});

export const duoBlock = defineType({
  name: "duoBlock",
  title: "Dve fotky vedľa seba",
  type: "object",
  icon: ImagesIcon,
  fields: [
    defineField({
      name: "left",
      title: "Ľavá fotka (menšia)",
      type: "image",
      options: { hotspot: true },
      description: "Menší formát, skôr na šírku (~445 × 478).",
      validation: (r) => r.required().error("Povinné pole."),
    }),
    defineField({
      name: "right",
      title: "Pravá fotka (vyššia)",
      type: "image",
      options: { hotspot: true },
      description: "Vyšší formát, na výšku (~680 × 698).",
      validation: (r) => r.required().error("Povinné pole."),
    }),
  ],
  preview: {
    select: { media: "left" },
    prepare: (sel) => ({ title: "Dve fotky vedľa seba", media: sel.media as never }),
  },
});

export const specBlock = defineType({
  name: "specBlock",
  title: "Tabuľka špecifikácií",
  type: "object",
  icon: DocumentSheetIcon,
  fields: [
    defineField({
      name: "titleSk",
      title: "Nadpis (SK)",
      type: "string",
      initialValue: "Technické špecifikácie",
      validation: (r) => r.required().error("Povinné pole."),
    }),
    defineField({
      name: "titleCz",
      title: "Nadpis (CZ)",
      type: "string",
      initialValue: "Technické specifikace",
      validation: (r) => r.required().error("Povinné pole — doplňte český preklad."),
    }),
    defineField({
      name: "titleEn",
      title: "Nadpis (EN)",
      type: "string",
      initialValue: "Technical specifications",
      validation: (r) => r.required().error("Povinné pole — doplňte anglický preklad."),
    }),
    defineField({
      name: "rows",
      title: "Riadky tabuľky",
      type: "array",
      validation: (r) => r.min(1).error("Pridajte aspoň jeden riadok."),
      of: [
        defineArrayMember({
          type: "object",
          name: "specRow",
          title: "Riadok",
          groups: LANG_GROUPS,
          fields: [
            defineField({ name: "labelSk", title: "Názov (SK)", type: "string", group: "sk", components: { input: withPlaceholder("napr. Zastavaná plocha") }, validation: (r) => r.required().error("Povinné pole.") }),
            defineField({ name: "valueSk", title: "Hodnota (SK)", type: "string", group: "sk", components: { input: withPlaceholder("napr. 114 m²") }, validation: (r) => r.required().error("Povinné pole.") }),
            defineField({ name: "labelCz", title: "Názov (CZ)", type: "string", group: "cz", validation: (r) => r.required().error("Povinné pole — doplňte český preklad.") }),
            defineField({ name: "valueCz", title: "Hodnota (CZ)", type: "string", group: "cz", validation: (r) => r.required().error("Povinné pole — doplňte český preklad.") }),
            defineField({ name: "labelEn", title: "Názov (EN)", type: "string", group: "en", validation: (r) => r.required().error("Povinné pole — doplňte anglický preklad.") }),
            defineField({ name: "valueEn", title: "Hodnota (EN)", type: "string", group: "en", validation: (r) => r.required().error("Povinné pole — doplňte anglický preklad.") }),
          ],
          preview: {
            select: { label: "labelSk", value: "valueSk" },
            prepare: (sel) => ({ title: `${sel.label ?? ""} — ${sel.value ?? ""}` }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "titleSk" },
    prepare: (sel) => ({ title: (sel.title as string) || "Tabuľka špecifikácií", subtitle: "Tabuľka špecifikácií" }),
  },
});

/* ============================================================
   Dokument projektu — sekcie v poradí stránky.
   ============================================================ */

/** Textové bloky (text + tabuľka) — dva po sebe rozbijú rytmus stránky. */
const TEXT_LIKE_BLOCKS = ["textBlock", "specBlock"];

export const project = defineType({
  name: "project",
  title: "Projekt",
  type: "document",
  fieldsets: [
    {
      name: "karta",
      title: "Thumbnail",
      description:
        "Náhľad projektu v mriežke — na hlavnej stránke aj na podstránke Projekty. Tvorí ho fotka, názov a krátky popis.",
    },
    {
      name: "hero",
      title: "Hero fotka",
      description: "Fotka na celú obrazovku, cez ktorú sa zobrazí názov projektu.",
      hidden: detailOnly,
    },
    {
      name: "slogan",
      title: "Slogan",
      description:
        "Veľká veta pod hero fotkou — pri scrollovaní sa odhaľuje slovo po slove. Predvyplnená je popisom projektu z Thumbnailu; prepíšte ju, keď chcete niečo kratšie a údernejšie.",
      hidden: detailOnly,
    },
    {
      name: "info",
      title: "Informácie o projekte",
      description: "Hlavný text o projekte s portrétovou fotkou po ľavej strane.",
      hidden: detailOnly,
    },
    {
      name: "udaje",
      title: "Údaje o projekte",
      description:
        "Tabuľka pod textom: Rok, Klient, Krajina, Kategória a Architekt. Prázdny údaj sa na webe jednoducho nezobrazí.",
      hidden: detailOnly,
    },
    {
      name: "obsah",
      title: "Obsah detailu",
      description:
        "Stredná časť stránky poskladaná z blokov — fotografie a texty sa najlepšie čítajú, keď sa striedajú. Poradie meníte ťahaním. Na záver stránky drag galéria.",
      hidden: detailOnly,
    },
  ],
  fields: [
    orderRankField({ type: "project" }),

    // ===== Karta v mriežke =====
    defineField({
      name: "cover",
      title: "Fotka",
      type: "image",
      fieldset: "karta",
      options: { hotspot: true },
      description:
        "Orez podľa pozície v mriežke rieši web — dôležité miesto fotky označte terčíkom (hotspot).",
      validation: (r) => r.required().error("Povinné pole."),
    }),
    defineField({
      name: "card",
      title: LANG_LABEL,
      type: "object",
      fieldset: "karta",
      options: { collapsible: false },
      groups: LANG_GROUPS,
      fields: [
        defineField({
          name: "titleSk",
          title: "Názov (SK)",
          type: "string",
          group: "sk",
          components: { input: withPlaceholder("napr. Chata pod korunami") },
          validation: (r) => r.required().error("Povinné pole."),
        }),
        defineField({
          name: "descriptionSk",
          title: "Popis (SK)",
          type: "text",
          rows: 3,
          group: "sk",
          description: "Krátky popis projektu pod názvom (2–3 vety).",
          validation: (r) => r.required().error("Povinné pole."),
        }),
        defineField({
          name: "titleCz",
          title: "Názov (CZ)",
          type: "string",
          group: "cz",
          validation: (r) => r.required().error("Povinné pole — doplňte český preklad."),
        }),
        defineField({
          name: "descriptionCz",
          title: "Popis (CZ)",
          type: "text",
          rows: 3,
          group: "cz",
          validation: (r) => r.required().error("Povinné pole — doplňte český preklad."),
        }),
        defineField({
          name: "titleEn",
          title: "Názov (EN)",
          type: "string",
          group: "en",
          validation: (r) => r.required().error("Povinné pole — doplňte anglický preklad."),
        }),
        defineField({
          name: "descriptionEn",
          title: "Popis (EN)",
          type: "text",
          rows: 3,
          group: "en",
          validation: (r) => r.required().error("Povinné pole — doplňte anglický preklad."),
        }),
      ],
    }),

    // ===== Prepínač detailu + adresa =====
    defineField({
      name: "hasDetail",
      title: "Detailná stránka",
      type: "boolean",
      initialValue: false,
      description:
        "Zapnuté = projekt dostane vlastnú podstránku /projekty/… a karta v mriežke sa dá rozkliknúť; nižšie sa rozbalia sekcie detailu v poradí stránky. Vypnuté = projekt je iba karta v mriežke.",
    }),
    defineField({
      name: "slug",
      title: "Adresa stránky",
      type: "slug",
      hidden: detailOnly,
      options: {
        source: (doc) => (doc as { card?: { titleSk?: string } }).card?.titleSk ?? "",
        maxLength: 96,
      },
      description:
        "Časť webovej adresy za /projekty/ — tlačidlo Generate ju vyrobí zo slovenského názvu. Po zverejnení ju už nemeňte, zmenila by sa adresa stránky.",
      validation: (r) =>
        r.custom((v: { current?: string } | undefined, ctx) =>
          (ctx.document as { hasDetail?: boolean } | undefined)?.hasDetail && !v?.current
            ? "Povinné pri zapnutej detailnej stránke."
            : true,
        ),
    }),

    // ===== Hero fotka =====
    defineField({
      name: "hero",
      title: "Fotka",
      type: "image",
      fieldset: "hero",
      options: { hotspot: true },
      description: "Na šírku, v čo najväčšom rozlíšení.",
      validation: requiredForDetail,
    }),

    // ===== Slogan =====
    // Voliteľný — prázdny slogan web nahradí popisom z Thumbnailu
    // (v rovnakom jazyku). Živý placeholder ukazuje presne ten text,
    // ktorý sa použije.
    defineField({
      name: "slogan",
      title: LANG_LABEL,
      type: "object",
      fieldset: "slogan",
      options: { collapsible: false },
      groups: LANG_GROUPS,
      // Strážca: slogan vyplnený len v niektorých jazykoch — zvyšné
      // jazyky by dostali popis, stránky by neboli jednotné. Upozornenie,
      // publikovaniu nebráni.
      validation: (r) =>
        r
          .custom((v?: { sk?: string; cz?: string; en?: string }) => {
            const filled = [v?.sk, v?.cz, v?.en].filter(Boolean).length;
            return filled === 0 || filled === 3
              ? true
              : "Slogan je vyplnený len v niektorých jazykoch — ostatné by na webe dostali popis z Thumbnailu. Doplňte preklady alebo nechajte všetky prázdne.";
          })
          .warning(),
      fields: [
        defineField({
          name: "sk",
          title: "Slogan (SK)",
          type: "text",
          rows: 3,
          group: "sk",
          components: {
            input: withPlaceholderFrom(
              ["card", "descriptionSk"],
              "Najprv vyplňte popis v Thumbnaili — slogan sa ním predvyplní.",
            ),
          },
        }),
        defineField({
          name: "cz",
          title: "Slogan (CZ)",
          type: "text",
          rows: 3,
          group: "cz",
          components: {
            input: withPlaceholderFrom(
              ["card", "descriptionCz"],
              "Najprv vyplňte popis v Thumbnaili — slogan sa ním predvyplní.",
            ),
          },
        }),
        defineField({
          name: "en",
          title: "Slogan (EN)",
          type: "text",
          rows: 3,
          group: "en",
          components: {
            input: withPlaceholderFrom(
              ["card", "descriptionEn"],
              "Najprv vyplňte popis v Thumbnaili — slogan sa ním predvyplní.",
            ),
          },
        }),
      ],
    }),

    // ===== Informácie o projekte =====
    defineField({
      name: "context",
      title: "Fotka vľavo",
      type: "image",
      fieldset: "info",
      options: { hotspot: true },
      description: "Portrétová fotka po ľavej strane textu (výrez ~564 × 730).",
      validation: requiredForDetail,
    }),
    defineField({
      name: "infoText",
      title: LANG_LABEL,
      type: "object",
      fieldset: "info",
      options: { collapsible: false },
      groups: LANG_GROUPS,
      fields: [
        defineField({
          name: "textSk",
          title: "Text (SK)",
          type: "text",
          rows: 10,
          group: "sk",
          description: "Odseky oddeľte prázdnym riadkom (2× Enter).",
          validation: requiredForDetail,
        }),
        defineField({
          name: "textCz",
          title: "Text (CZ)",
          type: "text",
          rows: 10,
          group: "cz",
          description: "Odseky oddeľte prázdnym riadkom (2× Enter).",
          validation: requiredForDetail,
        }),
        defineField({
          name: "textEn",
          title: "Text (EN)",
          type: "text",
          rows: 10,
          group: "en",
          description: "Odseky oddeľte prázdnym riadkom (2× Enter).",
          validation: requiredForDetail,
        }),
      ],
    }),

    // ===== Údaje o projekte =====
    // Jeden prepínač Jazyk pre celú sekciu: Rok, Klient, Kategória
    // a Architekt sú priradené všetkým jazykom (hodnota je spoločná,
    // vidno ich v každom tabe), prekladá sa len Krajina.
    defineField({
      name: "facts",
      title: LANG_LABEL,
      type: "object",
      fieldset: "udaje",
      options: { collapsible: false },
      groups: LANG_GROUPS,
      description:
        "Rok, Klient, Kategória a Architekt platia rovnako pre všetky jazyky — prekladá sa len Krajina.",
      fields: [
        defineField({
          name: "year",
          title: "Rok",
          type: "string",
          group: ["sk", "cz", "en"],
          components: { input: withPlaceholder("napr. 2025") },
        }),
        defineField({
          name: "client",
          title: "Klient",
          type: "string",
          group: ["sk", "cz", "en"],
          components: { input: withPlaceholder("napr. Peter Karpát") },
        }),
        defineField({
          name: "countrySk",
          title: "Krajina (SK)",
          type: "string",
          group: "sk",
          components: { input: withPlaceholder("napr. Slovensko") },
        }),
        defineField({
          name: "countryCz",
          title: "Krajina (CZ)",
          type: "string",
          group: "cz",
          components: { input: withPlaceholder("např. Slovensko") },
        }),
        defineField({
          name: "countryEn",
          title: "Krajina (EN)",
          type: "string",
          group: "en",
          components: { input: withPlaceholder("e.g. Slovakia") },
        }),
        defineField({
          name: "category",
          title: "Kategória (typ stavby)",
          type: "string",
          group: ["sk", "cz", "en"],
          options: { list: [...CATEGORIES] },
          description:
            "Typy stavieb zo stránky Služby — preklady rieši web. Zobrazuje sa aj v zozname Ďalšie projekty.",
        }),
        defineField({
          name: "architect",
          title: "Architekt",
          type: "string",
          group: ["sk", "cz", "en"],
          initialValue: "Fotta Popadič",
        }),
      ],
    }),

    // ===== Obsah detailu =====
    defineField({
      name: "blocks",
      title: "Bloky obsahu",
      type: "array",
      fieldset: "obsah",
      description: "Poradie blokov = poradie sekcií na stránke.",
      of: [
        defineArrayMember({ type: "photoBlock" }),
        defineArrayMember({ type: "textBlock" }),
        defineArrayMember({ type: "duoBlock" }),
        defineArrayMember({ type: "specBlock" }),
      ],
      // Strážca rytmu: dva textové bloky (text/tabuľka) hneď po sebe.
      // Upozornenie, nie chyba — publikovaniu nebráni.
      validation: (r) =>
        r
          .custom((blocks?: { _type: string }[]) => {
            if (!blocks) return true;
            for (let i = 1; i < blocks.length; i++) {
              if (
                TEXT_LIKE_BLOCKS.includes(blocks[i]._type) &&
                TEXT_LIKE_BLOCKS.includes(blocks[i - 1]._type)
              ) {
                return "Dva textové bloky idú hneď po sebe — stránka sa najlepšie číta, keď texty prekladáte fotografiami.";
              }
            }
            return true;
          })
          .warning(),
    }),
    defineField({
      name: "gallery",
      title: "Drag galéria",
      type: "array",
      fieldset: "obsah",
      description:
        "Pás fotiek na záver — návštevník ho ťahá myšou do strany. Všetky fotky majú jednotnú výšku, šírka sa prispôsobí. Jedna fotka = statická na celú šírku.",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
        }),
      ],
    }),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: { title: "card.titleSk", media: "cover", slug: "slug.current", hasDetail: "hasDetail" },
    prepare: (sel) => ({
      title: (sel.title as string) || "Bez názvu",
      subtitle: sel.hasDetail && sel.slug ? `/projekty/${sel.slug}` : "len karta v mriežke",
      media: sel.media as never,
    }),
  },
});
