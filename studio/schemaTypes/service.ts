import { defineArrayMember, defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { withPlaceholder } from "../components/placeholderInput";

/**
 * Služba — jeden riadok spec-sheetu služieb (5 fáz projektu, 01–05).
 * Názov a popis sa zobrazujú na hlavnej stránke, na stránke Služby a názvy
 * aj ako výber v kontaktnom formulári; zoznam Obsahuje a modal „Dozvedieť
 * sa viac“ len na stránke Služby.
 *
 * PEVNÁ PÄŤKA (Michal, 2026-07-17): dokumenty sa v Studiu nevytvárajú ani
 * nemažú, iba upravujú — 5 služieb = 5 fáz projektu, čo je obchodné
 * rozhodnutie, nie obsahová drobnosť. Zámky sú v sanity.config.ts
 * (žiadne Vymazať/Duplikovať, createIntent: false na zozname).
 *
 * UX formulára = rovnaký vzor ako projekty, tím a referencie:
 * jazykové prepínače SK | CZ | EN vnútri sekcií, žiadne taby na úrovni
 * dokumentu.
 *
 *  - Poradie = drag & drop v zozname "Služby" (orderRank spravuje plugin);
 *    čísla 01–05 aj striedanie formátov fotiek dopĺňa web podľa pozície.
 *  - Fotka je VOLITEĽNÁ: bez nej web použije pôvodnú fotku riadku.
 *  - Modal „Dozvedieť sa viac“: odkaz sa na webe zobrazí automaticky pri
 *    službe, ktorá má v modale aspoň jednu sekciu — a zmizne, keď sa
 *    sekcie zmažú. Nadpis modalu je názov služby; úvod je voliteľný
 *    (prázdny = použije sa popis služby).
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
        "Vysúvací panel s podrobným textom. Odkaz „Dozvedieť sa viac“ sa pri službe zobrazí automaticky, keď má modal aspoň jednu sekciu. Nadpisom modalu je názov služby.",
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
          description: "Sivý odstavec pod nadpisom modalu. Prázdny = použije sa popis služby.",
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
            "Bloky nadpis + odstavec pod úvodom. Aspoň jedna sekcia = odkaz „Dozvedieť sa viac“ sa na webe zobrazí.",
          of: [
            defineArrayMember({
              type: "object",
              name: "modalSection",
              title: "Sekcia",
              groups: LANG_GROUPS,
              fields: [
                defineField({
                  name: "headingSk",
                  title: "Nadpis (SK)",
                  type: "string",
                  group: "sk",
                  components: { input: withPlaceholder("napr. Estetika a príbeh") },
                  validation: (r) => r.required().error("Povinné pole."),
                }),
                defineField({
                  name: "bodySk",
                  title: "Text (SK)",
                  type: "text",
                  rows: 4,
                  group: "sk",
                  validation: (r) => r.required().error("Povinné pole."),
                }),
                defineField({
                  name: "headingCz",
                  title: "Nadpis (CZ)",
                  type: "string",
                  group: "cz",
                  validation: (r) => r.required().error("Povinné pole — doplňte český preklad."),
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
                  title: "Nadpis (EN)",
                  type: "string",
                  group: "en",
                  validation: (r) => r.required().error("Povinné pole — doplňte anglický preklad."),
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
                select: { title: "headingSk" },
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
