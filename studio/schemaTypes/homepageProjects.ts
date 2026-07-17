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
        "Výber našich prác na hlavnej stránke — vždy presne 6 projektov. Prvý projekt v zozname je veľká úvodná dlaždica. Poradie zmeníte ťahaním za úchyt vľavo.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "project" }],
          options: {
            // Ponuka „Add item“ skrýva projekty, ktoré už vo výbere sú —
            // vyberá sa len z tých, čo v mriežke ešte chýbajú. Vylučujeme
            // aj drafts.<id>, aby sa už vybratý projekt nevrátil do ponuky
            // ako svoj rozpracovaný koncept.
            filter: ({ parent }) => {
              const taken = (Array.isArray(parent) ? parent : [])
                .map((item) => (item as { _ref?: string })._ref)
                .filter((ref): ref is string => Boolean(ref))
                .flatMap((ref) => [ref, `drafts.${ref}`]);
              return { filter: "!(_id in $taken)", params: { taken } };
            },
          },
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
