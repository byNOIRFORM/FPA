import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { CaseIcon } from "@sanity/icons/Case";
import { CommentIcon } from "@sanity/icons/Comment";
import { DocumentsIcon } from "@sanity/icons/Documents";
import { ImagesIcon } from "@sanity/icons/Images";
import { InfoOutlineIcon } from "@sanity/icons/InfoOutline";
import { StarIcon } from "@sanity/icons/Star";
import { UsersIcon } from "@sanity/icons/Users";
import { schemaTypes } from "./schemaTypes";
import { StudioLayout } from "./components/StudioLayout";
import { skBundles } from "./i18n/sk";

// Singletony — vždy jeden pripnutý dokument: bez Vymazať/Duplikovať/
// Zrušiť publikovanie a mimo dialógu „Vytvoriť nový dokument".
const SINGLETONS = ["teamSettings", "homepageProjects"];

export default defineConfig({
  name: "default",
  title: "Fotta Popadič architekt",
  projectId: "o7vy0va0",
  dataset: "production",
  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title("Obsah")
          .items([
            // Všetok obsah stránky Projekty pod jedným uzlom.
            S.listItem()
              .title("Projekty")
              .id("projekty")
              .icon(DocumentsIcon)
              .child(
                S.list()
                  .title("Projekty")
                  .items([
                    // Výber + poradie 6 projektov na hlavnej stránke — singleton.
                    S.listItem()
                      .title("Na hlavnej stránke")
                      .id("homepageProjects")
                      .icon(StarIcon)
                      .child(
                        S.document()
                          .schemaType("homepageProjects")
                          .documentId("homepageProjects"),
                      ),
                    S.divider(),
                    // Všetky projekty — drag & drop poradie = poradie na /projekty.
                    orderableDocumentListDeskItem({
                      type: "project",
                      title: "Všetky projekty",
                      icon: ImagesIcon,
                      S,
                      context,
                    }),
                  ]),
              ),
            // Všetok obsah stránky O nás pod jedným uzlom.
            S.listItem()
              .title("O nás")
              .id("o-nas")
              .icon(InfoOutlineIcon)
              .child(
                S.list()
                  .title("O nás")
                  .items([
                    // Členovia tímu — drag & drop poradie (žiadne čísla).
                    orderableDocumentListDeskItem({
                      type: "teamMember",
                      title: "Členovia tímu",
                      icon: UsersIcon,
                      S,
                      context,
                    }),
                    S.divider(),
                    // Kariéra — singleton (vždy ten istý dokument, žiadny zoznam).
                    S.listItem()
                      .title("Kariéra")
                      .id("teamSettings")
                      .icon(CaseIcon)
                      .child(
                        S.document()
                          .schemaType("teamSettings")
                          .documentId("teamSettings"),
                      ),
                    S.divider(),
                    // Referencie klientov — drag & drop poradie = poradie
                    // v carouseli "Čo hovoria naši klienti". Pod Kariérou,
                    // v poradí sekcií na stránke O nás (Michal, 2026-07-17).
                    orderableDocumentListDeskItem({
                      type: "testimonial",
                      title: "Referencie klientov",
                      icon: CommentIcon,
                      S,
                      context,
                    }),
                  ]),
              ),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    actions: (prev, context) =>
      SINGLETONS.includes(context.schemaType)
        ? prev.filter(
            ({ action }) =>
              !["delete", "duplicate", "unpublish"].includes(action ?? ""),
          )
        : prev,
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global"
        ? prev.filter((tmpl) => !SINGLETONS.includes(tmpl.templateId))
        : prev,
  },
  studio: {
    components: {
      layout: StudioLayout,
    },
  },
  i18n: {
    bundles: skBundles,
  },
});
