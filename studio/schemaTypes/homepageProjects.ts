import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Na hlavnej stránke — JEDINÝ dokument (singleton, _id: "homepageProjects"),
 * pripnutý v štruktúre pod uzlom Projekty. Drží výber PRESNE 6 projektov
 * pre mriežku „Výber našich prác" na hlavnej stránke; PORADIE v poli
 * (drag & drop za ľavý úchyt) = poradie dlaždíc v mriežke.
 *
 * Mriežka je dizajnovo zamknutá na 6 dlaždíc — preto tvrdá validácia
 * presne 6 a bez duplicít. Projekt, ktorý je vo výbere, sa nedá zmazať
 * (referencia ho drží) — najprv ho treba z výberu vyhodiť.
 */
export const homepageProjects = defineType({
  name: "homepageProjects",
  title: "Na hlavnej stránke",
  type: "document",
  fields: [
    defineField({
      name: "projects",
      title: "Projekty na homepage",
      type: "array",
      description:
        "Výber našich prác na hlavnej stránke — vždy presne 6 projektov. Poradie v zozname zodpovedá mriežke na webe (prvý projekt je veľká úvodná dlaždica); mení sa ťahaním za úchyt vľavo.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "project" }],
        }),
      ],
      validation: (r) => [
        r.required().min(6).error("Mriežka na hlavnej stránke potrebuje presne 6 projektov."),
        r.max(6).error("Mriežka na hlavnej stránke je zamknutá na presne 6 projektov."),
        r.unique().error("Každý projekt môže byť vo výbere len raz."),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Na hlavnej stránke" }),
  },
});
