import { defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { withPlaceholder } from "../components/placeholderInput";

/**
 * Člen tímu — sekcia "Náš tím" na stránke O nás.
 *
 * UX formulára = rovnaký vzor ako projekty (Michal, 2026-07-16):
 * ŽIADNE jazykové taby na úrovni dokumentu — preložená rola žije
 * v objekte s jednotným labelom „Jazyk" a prepínačom SK | CZ | EN.
 *
 *  - Poradie členov sa neťuká číslom: v zozname "Členovia tímu" sa
 *    presúvajú myšou (drag & drop, @sanity/orderable-document-list) —
 *    skryté pole orderRank spravuje plugin.
 *  - Fotka je VOLITEĽNÁ: člen bez nej dostane na webe tmavú placeholder
 *    dlaždicu (dizajnový prípad "pridaný pred fotením").
 */

/** Jazykové taby vnútri sekcie — rovnaké ako pri projektoch. */
const LANG_GROUPS = [
  { name: "sk", title: "SK", default: true },
  { name: "cz", title: "CZ" },
  { name: "en", title: "EN" },
];

export const teamMember = defineType({
  name: "teamMember",
  title: "Člen tímu",
  type: "document",
  fieldsets: [
    {
      name: "rola",
      title: "Rola",
      description: "Pozícia v ateliéri — zobrazuje sa pod menom člena.",
    },
  ],
  fields: [
    orderRankField({ type: "teamMember" }),
    defineField({
      name: "portrait",
      title: "Fotka",
      type: "image",
      options: { hotspot: true },
      description:
        "Na výšku, pomer strán približne 2 : 3 (dlaždica na webe má 328 × 470 px), tvár v hornej polovici. Voliteľná — člen bez fotky dostane tmavú dlaždicu.",
      // Strážca kvality: rozmery sú zakódované priamo v _ref assetu
      // (image-<id>-<š>x<v>-<formát>), netreba nič doťahovať zo servera.
      // Warning, nie error — publikovaniu nebráni.
      validation: (r) =>
        r
          .custom((img?: { asset?: { _ref?: string } }) => {
            const dims = img?.asset?._ref?.match(/-(\d+)x(\d+)-/);
            if (!dims) return true;
            const w = Number(dims[1]);
            const h = Number(dims[2]);
            if (w > h)
              return "Fotka je na šírku — dlaždica potrebuje formát na výšku (približne 2 : 3).";
            if (w < 800)
              return `Fotka má len ${w} px na šírku — pre ostrú dlaždicu nahrajte aspoň 800 px.`;
            return true;
          })
          .warning(),
    }),
    defineField({
      name: "name",
      title: "Meno a priezvisko (aj s titulom)",
      type: "string",
      components: { input: withPlaceholder("napr. Ing. Marek Dufala") },
      validation: (r) => r.required().error("Povinné pole."),
    }),
    defineField({
      name: "role",
      title: "Jazyk",
      type: "object",
      fieldset: "rola",
      options: { collapsible: false },
      groups: LANG_GROUPS,
      fields: [
        defineField({
          name: "sk",
          title: "Rola (SK)",
          type: "string",
          group: "sk",
          components: { input: withPlaceholder("napr. architekt") },
          validation: (r) => r.required().error("Povinné pole."),
        }),
        defineField({
          name: "cz",
          title: "Rola (CZ)",
          type: "string",
          group: "cz",
          components: { input: withPlaceholder("např. architekt") },
          validation: (r) => r.required().error("Povinné pole — doplňte český preklad."),
        }),
        defineField({
          name: "en",
          title: "Rola (EN)",
          type: "string",
          group: "en",
          components: { input: withPlaceholder("e.g. architect") },
          validation: (r) => r.required().error("Povinné pole — doplňte anglický preklad."),
        }),
      ],
    }),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: { title: "name", subtitle: "role.sk", media: "portrait" },
  },
});
