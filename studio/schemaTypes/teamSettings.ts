import { defineField, defineType } from "sanity";
import { withPlaceholder } from "../components/placeholderInput";

/**
 * Kariéra — JEDINÝ dokument (singleton, _id: "teamSettings"), pripnutý
 * v štruktúre Studia pod uzlom O nás. Riadi dlaždicu "Voľné miesto"
 * v mriežke Náš tím: checkbox ju zapína/vypína, URL vedie na aktuálny
 * inzerát. (V dátach sa typ ďalej volá teamSettings — premenovanie typu
 * by vyžadovalo migráciu dokumentu; mení sa len názov v UI.)
 */
export const teamSettings = defineType({
  name: "teamSettings",
  title: "Kariéra",
  type: "document",
  fields: [
    defineField({
      name: "careersOpen",
      title: "Zobraziť dlaždicu „Voľné miesto“",
      type: "boolean",
      initialValue: true,
      description:
        "Zapnuté = mriežka tímu končí dlaždicou s odkazom na inzerát. Vypnuté = dlaždica sa na webe vôbec nezobrazí.",
    }),
    defineField({
      name: "careersUrl",
      title: "Odkaz na inzerát",
      type: "url",
      description: "Napr. aktuálny inzerát na profesia.sk.",
      components: { input: withPlaceholder("https://www.profesia.sk/praca/…") },
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
      hidden: ({ document }) => !document?.careersOpen,
    }),
  ],
  preview: {
    prepare: () => ({ title: "Kariéra" }),
  },
});
