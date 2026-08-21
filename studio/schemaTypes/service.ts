import { defineArrayMember, defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { withPlaceholder } from "../components/placeholderInput";

/**
 * Služba — jeden riadok spec-sheetu služieb (01–06: päť fáz projektu
 * + 3D sken). Názov a popis sa zobrazujú na hlavnej stránke, na stránke
 * Služby a názvy aj ako výber v kontaktnom formulári; zoznam Obsahuje
 * a modal „Dozvedieť sa viac“ len na stránke Služby.
 *
 * PEVNÝ POČET (Michal, 2026-07-17; rozšírené na 6 dňa 2026-08-21):
 * dokumenty sa v Studiu nevytvárajú ani nemažú, iba upravujú — nová
 * služba je obchodné rozhodnutie, nie obsahová drobnosť. Zámky sú
 * v sanity.config.ts (žiadne Vymazať/Duplikovať, createIntent: false
 * na zozname).
 *
 * UX formulára = rovnaký vzor ako projekty, tím a referencie:
 * jazykové prepínače SK | CZ | EN vnútri sekcií, žiadne taby na úrovni
 * dokumentu.
 *
 *  - Poradie = drag & drop v zozname "Služby" (orderRank spravuje plugin);
 *    čísla 01–06 aj striedanie formátov fotiek dopĺňa web podľa pozície.
 *  - Fotka je VOLITEĽNÁ: bez nej web použije pôvodnú fotku riadku.
 *  - Modal „Dozvedieť sa viac“: odkaz sa na webe zobrazí automaticky pri
 *    službe, ktorá má v modale vyplnený úvod alebo aspoň jednu sekciu —
 *    a zmizne, keď sa modal vyprázdni. Nadpis modalu je názov služby.
 *    Úvod: prázdny riadok = nový odstavec, nevyplnený = popis služby.
 *    Telo sekcie: viac riadkov pod sebou = odrážkový zoznam.
 */

/** Jazykové taby vnútri sekcie — rovnaké ako pri ostatných typoch. */
const LANG_GROUPS = [
  { name: "sk", title: "SK", default: true },
  { name: "cz", title: "CZ" },
  { name: "en", title: "EN" },
];

export const service = defineType({
  name: "service",
  title: "Služba",
  type: "document",
  fieldsets: [
    {
      name: "nazov",
      title: "Názov",
      description:
        "Názov služby — zobrazuje sa v riadku na hlavnej stránke aj na stránke Služby, ako možnosť v kontaktnom formulári a ako nadpis modalu.",
    },
    {
      name: "popis",
      title: "Popis",
      description: "Krátky text v riadku služby (2–3 vety).",
    },
    {
      name: "obsahuje",
      title: "Obsahuje",
      description:
        "Zoznam položiek pod popisom na stránke Služby. Label „Obsahuje:“ dopĺňa web automaticky. Poradie položiek zmeníte ťahaním.",
    },
    {
      name: "modal",
      title: "Modal „Dozvedieť sa viac“",
      description:
        "Vysúvací panel s podrobným textom. Odkaz „Dozvedieť sa viac“ sa pri službe zobrazí automaticky, keď má modal vyplnený úvod alebo aspoň jednu sekciu — a zmizne, keď modal vyprázdnite. Nadpisom modalu je názov služby.",
    },
  ],
  fields: [
    orderRankField({ type: "service" }),
    defineField({
      name: "photo",
      title: "Fotka",
      type: "image",
      options: { hotspot: true },
      description:
        "Fotka pri riadku služby. Formát (na výšku / na šírku) určuje pozícia riadku, o orez sa stará web — dôležité miesto označte terčíkom (hotspot). Voliteľná: bez nej sa použije pôvodná fotka webu.",
    }),
    defineField({
      name: "title",
      title: "Jazyk",
      type: "object",
      fieldset: "nazov",
      options: { collapsible: false },
      groups: LANG_GROUPS,
      fields: [
        defineField({
          name: "sk",
          title: "Názov (SK)",
          type: "string",
          group: "sk",
          components: { input: withPlaceholder("napr. Architektonická štúdia") },
          validation: (r) => r.required().error("Povinné pole."),
        }),
        defineField({
          name: "cz",
          title: "Názov (CZ)",
          type: "string",
          group: "cz",
          components: { input: withPlaceholder("např. Architektonická studie") },
          validation: (r) => r.required().error("Povinné pole — doplňte český preklad."),
        }),
        defineField({
          name: "en",
          title: "Názov (EN)",
          type: "string",
          group: "en",
          components: { input: withPlaceholder("e.g. Architectural study") },
          validation: (r) => r.required().error("Povinné pole — doplňte anglický preklad."),
        }),
      ],
    }),
    defineField({
      name: "desc",
      title: "Jazyk",
      type: "object",
      fieldset: "popis",
      options: { collapsible: false },
      groups: LANG_GROUPS,
      fields: [
        defineField({
          name: "sk",
          title: "Popis (SK)",
          type: "text",
          rows: 4,
          group: "sk",
          validation: (r) => r.required().error("Povinné pole."),
        }),
        defineField({
          name: "cz",
          title: "Popis (CZ)",
          type: "text",
          rows: 4,
          group: "cz",
          validation: (r) => r.required().error("Povinné pole — doplňte český preklad."),
        }),
        defineField({
          name: "en",
          title: "Popis (EN)",
          type: "text",
          rows: 4,
          group: "en",
          validation: (r) => r.required().error("Povinné pole — doplňte anglický preklad."),
        }),
      ],
    }),
    defineField({
      name: "includes",
      title: "Položky",
      type: "array",
      fieldset: "obsahuje",
      validation: (r) => r.min(1).error("Pridajte aspoň jednu položku."),
      of: [
        defineArrayMember({
          type: "object",
          name: "includeItem",
          title: "Položka",
          groups: LANG_GROUPS,
          fields: [
            defineField({
              name: "sk",
              title: "Položka (SK)",
              type: "string",
              group: "sk",
              components: { input: withPlaceholder("napr. 3D vizualizácia") },
              validation: (r) => r.required().error("Povinné pole."),
            }),
            defineField({
              name: "cz",
              title: "Položka (CZ)",
              type: "string",
              group: "cz",
              validation: (r) => r.required().error("Povinné pole — doplňte český preklad."),
            }),
            defineField({
              name: "en",
              title: "Položka (EN)",
              type: "string",
              group: "en",
              validation: (r) => r.required().error("Povinné pole — doplňte anglický preklad."),
            }),
          ],
          preview: {
            select: { title: "sk" },
          },
        }),
      ],
    }),
    defineField({
      name: "modal",
      title: "Obsah modalu",
      type: "object",
      fieldset: "modal",
      options: { collapsible: false },
      fields: [
        defineField({
          name: "intro",
          title: "Úvod (voliteľný)",
          type: "object",
          description:
            "Sivý text pod nadpisom modalu. PRÁZDNY RIADOK medzi odsekmi = na webe nový odstavec. Nevyplnený = použije sa popis služby.",
          options: { collapsible: false },
          groups: LANG_GROUPS,
          fields: [
            defineField({ name: "sk", title: "Úvod (SK)", type: "text", rows: 4, group: "sk" }),
            defineField({ name: "cz", title: "Úvod (CZ)", type: "text", rows: 4, group: "cz" }),
            defineField({ name: "en", title: "Úvod (EN)", type: "text", rows: 4, group: "en" }),
          ],
        }),
        defineField({
          name: "sections",
          title: "Sekcie",
          type: "array",
          description:
            "Samotný obsah panela — všetko pod deliacou čiarou. Nadpis je VOLITEĽNÝ: hlavný text býva bez neho, nadpis nesie až blok ako „Legislatíva a štandardy“.",
          of: [
            defineArrayMember({
              type: "object",
              name: "modalSection",
              title: "Sekcia",
              groups: LANG_GROUPS,
              fields: [
                defineField({
                  name: "headingSk",
                  title: "Nadpis (SK) — voliteľný",
                  type: "string",
                  group: "sk",
                  description: "Nechajte prázdny a blok sa vykreslí ako samotný text bez nadpisu.",
                  components: { input: withPlaceholder("napr. Legislatíva a štandardy") },
                }),
                defineField({
                  name: "bodySk",
                  title: "Text (SK)",
                  type: "text",
                  rows: 4,
                  group: "sk",
                  description:
                    "PRÁZDNY RIADOK medzi odsekmi = nový odstavec. Viac RIADKOV tesne pod sebou = odrážkový zoznam (tak sú spravené zoznamy zákonov a vyhlášok).",
                  validation: (r) => r.required().error("Povinné pole."),
                }),
                defineField({
                  name: "headingCz",
                  title: "Nadpis (CZ) — voliteľný",
                  type: "string",
                  group: "cz",
                }),
                defineField({
                  name: "bodyCz",
                  title: "Text (CZ)",
                  type: "text",
                  rows: 4,
                  group: "cz",
                  validation: (r) => r.required().error("Povinné pole — doplňte český preklad."),
                }),
                defineField({
                  name: "headingEn",
                  title: "Nadpis (EN) — voliteľný",
                  type: "string",
                  group: "en",
                }),
                defineField({
                  name: "bodyEn",
                  title: "Text (EN)",
                  type: "text",
                  rows: 4,
                  group: "en",
                  validation: (r) => r.required().error("Povinné pole — doplňte anglický preklad."),
                }),
              ],
              preview: {
                select: { heading: "headingSk", body: "bodySk" },
                prepare: ({ heading, body }: { heading?: string; body?: string }) => ({
                  title: heading || (body ? body.split("\n")[0] : "Text bez nadpisu"),
                  subtitle: heading ? undefined : "bez nadpisu",
                }),
              },
            }),
          ],
        }),
      ],
    }),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: { title: "title.sk", subtitle: "desc.sk", media: "photo" },
  },
});
