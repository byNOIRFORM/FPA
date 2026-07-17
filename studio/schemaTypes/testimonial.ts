import { defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { withPlaceholder } from "../components/placeholderInput";

/**
 * Referencia klienta — sekcia "Čo hovoria naši klienti" na stránke O nás
 * (drag/snap carousel citátov).
 *
 * UX formulára = rovnaký vzor ako tím a projekty:
 * ŽIADNE jazykové taby na úrovni dokumentu — preložený citát a rola žijú
 * v objektoch s jednotným labelom „Jazyk" a prepínačom SK | CZ | EN.
 *
 *  - Poradie referencií sa neťuká číslom: v zozname "Referencie klientov"
 *    sa presúvajú myšou (drag & drop, @sanity/orderable-document-list) —
 *    skryté pole orderRank spravuje plugin.
 *  - Fotka je VOLITEĽNÁ a nahráva sa LEN so súhlasom klienta (fluid.glass
 *    vzor, 2026-07-15): referencia bez nej sa na webe zobrazí ako čistý
 *    textový citát — nič sa neposúva.
 */

/** Jazykové taby vnútri sekcie — rovnaké ako pri tíme a projektoch. */
const LANG_GROUPS = [
  { name: "sk", title: "SK", default: true },
  { name: "cz", title: "CZ" },
  { name: "en", title: "EN" },
];

export const testimonial = defineType({
  name: "testimonial",
  title: "Referencia",
  type: "document",
  fieldsets: [
    {
      name: "citat",
      title: "Citát",
      description:
        "Text referencie — zobrazuje sa ako veľký citát v carouseli. Ideálny počet referencií je 5 až 7. Novú pridajte vtedy, keď hovorí niečo, čo v ostatných ešte nezaznelo — iný typ projektu, iná skúsenosť. Ak len opakuje už povedané, radšej ňou nahraďte najslabšiu v zozname.",
    },
    {
      name: "rola",
      title: "Rola alebo projekt",
      description:
        "Krátky popis pod menom — kto klient je alebo čo sme preňho robili (napr. „Majiteľ domu“ alebo „Rekonštrukcia rodinného domu“).",
    },
  ],
  fields: [
    orderRankField({ type: "testimonial" }),
    defineField({
      name: "photo",
      title: "Fotka klienta",
      type: "image",
      options: { hotspot: true },
      description:
        "Voliteľná — nahrajte LEN so súhlasom klienta. Na výšku, pomer strán približne 2 : 3; zobrazuje sa malá (šírka vizitky). Referencia bez fotky sa zobrazí ako čistý textový citát.",
      // Strážca kvality: rozmery sú zakódované priamo v _ref assetu
      // (image-<id>-<š>x<v>-<formát>), netreba nič doťahovať zo servera.
      // Warning, nie error — publikovaniu nebráni. Fotka sa renderuje malá
      // (max 160 px), preto stačí 400 px šírky.
      validation: (r) =>
        r
          .custom((img?: { asset?: { _ref?: string } }) => {
            const dims = img?.asset?._ref?.match(/-(\d+)x(\d+)-/);
            if (!dims) return true;
            const w = Number(dims[1]);
            const h = Number(dims[2]);
            if (w > h)
              return "Fotka je na šírku — citát potrebuje formát na výšku (približne 2 : 3).";
            if (w < 400)
              return `Fotka má len ${w} px na šírku — pre ostré zobrazenie nahrajte aspoň 400 px.`;
            return true;
          })
          .warning(),
    }),
    defineField({
      name: "quote",
      title: "Jazyk",
      type: "object",
      fieldset: "citat",
      options: { collapsible: false },
      groups: LANG_GROUPS,
      fields: [
        defineField({
          name: "sk",
          title: "Citát (SK)",
          type: "text",
          rows: 5,
          group: "sk",
          validation: (r) => r.required().error("Povinné pole."),
        }),
        defineField({
          name: "cz",
          title: "Citát (CZ)",
          type: "text",
          rows: 5,
          group: "cz",
          validation: (r) => r.required().error("Povinné pole — doplňte český preklad."),
        }),
        defineField({
          name: "en",
          title: "Citát (EN)",
          type: "text",
          rows: 5,
          group: "en",
          validation: (r) => r.required().error("Povinné pole — doplňte anglický preklad."),
        }),
      ],
    }),
    defineField({
      name: "name",
      title: "Meno klienta",
      type: "string",
      components: { input: withPlaceholder("napr. Jozef Marcin") },
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
          title: "Rola / projekt (SK)",
          type: "string",
          group: "sk",
          components: { input: withPlaceholder("napr. Majiteľ domu") },
          validation: (r) => r.required().error("Povinné pole."),
        }),
        defineField({
          name: "cz",
          title: "Rola / projekt (CZ)",
          type: "string",
          group: "cz",
          components: { input: withPlaceholder("např. Majitel domu") },
          validation: (r) => r.required().error("Povinné pole — doplňte český preklad."),
        }),
        defineField({
          name: "en",
          title: "Rola / projekt (EN)",
          type: "string",
          group: "en",
          components: { input: withPlaceholder("e.g. Homeowner") },
          validation: (r) => r.required().error("Povinné pole — doplňte anglický preklad."),
        }),
      ],
    }),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: { title: "name", subtitle: "quote.sk", media: "photo" },
  },
});
