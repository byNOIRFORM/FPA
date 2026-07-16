import { defineLocaleResourceBundle } from "sanity";

/**
 * Slovenské preklady najviditeľnejších reťazcov Studia — oficiálny locale
 * balík sk-SK neexistuje (overené na npm), preto bodovo prepisujeme en-US
 * zdroje cez i18n bundles. Kľúče sú vytiahnuté z nainštalovanej verzie
 * (sanity 6.5); ak niektorý v budúcej verzii zmizne, reťazec sa len ticho
 * vráti do angličtiny — nič sa nerozbije.
 *
 * Zámerne NEprekladáme reťazce s vloženým relatívnym časom
 * ("Edited {{date}}" — date príde anglicky ako "2 minutes ago"),
 * aby nevznikali jazykové hybridy.
 */

// Jadro Studia: fotky/súbory, tvorba dokumentu, taby skupín polí.
const studioSk = defineLocaleResourceBundle({
  locale: "en-US",
  namespace: "studio",
  resources: {
    "inputs.object.field-group-tabs.all-fields-title": "Všetky polia",
    // Fotky a súbory
    "input.files.common.upload-placeholder.file-input-button.text": "Nahrať",
    "inputs.files.common.placeholder.drag-or-paste-to-upload_image":
      "Sem pretiahnite alebo vložte fotku",
    "inputs.files.common.placeholder.drag-or-paste-to-upload_file":
      "Sem pretiahnite alebo vložte súbor",
    "inputs.files.common.drop-message.drop-to-upload": "Pustite pre nahratie",
    "inputs.image.drag-overlay.drop-to-upload-image": "Pustite fotku pre nahratie",
    "inputs.files.common.actions-menu.upload.label": "Nahrať",
    "inputs.files.common.actions-menu.replace.label": "Vymeniť",
    "inputs.files.common.actions-menu.clear-field.label": "Odstrániť z poľa",
    "inputs.files.common.actions-menu.download.label": "Stiahnuť",
    "inputs.files.common.actions-menu.copy-url.label": "Kopírovať URL",
    "inputs.image.actions-menu.crop-image-tooltip": "Orezať fotku",
    "inputs.image.hotspot-dialog.title": "Výrez a orez fotky",
    "asset-source.browse-button.text": "Vybrať",
    "asset-source.dialog.button.select": "Vybrať",
    // Nový dokument + stav publikovania
    "new-document.title": "Vytvoriť nový dokument",
    "document-status.not-published": "Zatiaľ nepublikované",
  },
});

// Structure tool: akcie dokumentu, hlavičky, zoznamy.
const structureSk = defineLocaleResourceBundle({
  locale: "en-US",
  namespace: "structure",
  resources: {
    "action.publish.label": "Publikovať",
    "action.publish.draft.label": "Publikovať",
    "action.publish.running.label": "Publikuje sa…",
    "action.publish.published.label": "Publikované",
    "action.publish.no-changes.tooltip": "Žiadne nepublikované zmeny",
    "action.discard-changes.label": "Zahodiť zmeny",
    "action.discard-changes.confirm-dialog.confirm-discard-changes":
      "Naozaj chcete zahodiť všetky zmeny od posledného publikovania?",
    "action.discard-changes.confirm-dialog.confirm-discard-changes-draft":
      "Naozaj chcete zahodiť všetky zmeny a vymazať tento koncept?",
    "action.delete.label": "Vymazať",
    "action.delete.running.label": "Maže sa…",
    "action.duplicate.label": "Duplikovať",
    "action.duplicate.running.label": "Duplikuje sa…",
    "action.unpublish.label": "Zrušiť publikovanie",
    "action.restore.label": "Vrátiť na túto verziu",
    "panes.document-header-title.new.text": "Nový dokument: {{schemaType}}",
    "panes.document-header-title.untitled.text": "Bez názvu",
    "panes.document-list-pane.no-documents.text": "Žiadne výsledky",
    "panes.document-list-pane.no-documents-of-type.text": "Zatiaľ žiadne dokumenty",
    "panes.document-list-pane.search-input.placeholder": "Hľadať v zozname",
  },
});

export const skBundles = [studioSk, structureSk];
