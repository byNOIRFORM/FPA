/**
 * Jednorazový seed sekcie Služby — nahrá 6 služieb (01–06) vrátane
 * zoznamov Obsahuje, modalu „Dozvedieť sa viac“ (dnes ho má
 * Architektonická štúdia a 3D sken) a fotiek z ../public/images/services/.
 *
 * Texty sa NEPREPISUJÚ ručne: skript ich importuje priamo z i18n webu
 * (home.ts + services-page.ts + service-details.ts), takže obsah v CMS
 * je zaručene 1:1 s fallbackom a build pred/po seede sa líši len
 * URL fotiek (cdn.sanity.io namiesto /images/services/).
 *
 * Spustenie (z priečinka studio/, používa prihlásenie zo `sanity login`):
 *   npx sanity exec scripts/seed-services.ts --with-user-token
 *
 * Deterministické _id (service-N) → opakované spustenie dokumenty
 * len prepíše, nič neduplikuje.
 */
import { getCliClient } from "sanity/cli";
import { LexoRank } from "lexorank";
import fs from "node:fs";
import path from "node:path";
import { home } from "../../src/i18n/home";
import { servicesPage } from "../../src/i18n/services-page";
import { serviceDetails } from "../../src/i18n/service-details";

const client = getCliClient({ apiVersion: "2026-07-01" });
// sanity exec transpiluje na CJS — __dirname je k dispozícii.
const IMG_DIR = path.resolve(__dirname, "../../public/images/services");

const PHOTOS = [
  "01-urbanisticka.jpg",
  "02-architektonicka.jpg",
  "03-uzemne.jpg",
  "04-stavebne.jpg",
  "05-realizacna.jpg",
  "06-3d-sken.jpg",
];

async function main(): Promise<void> {
  const items = {
    sk: home.sk.services.items,
    cz: home.cz.services.items,
    en: home.en.services.items,
  };
  const includes = {
    sk: servicesPage.sk.spec.includes,
    cz: servicesPage.cz.spec.includes,
    en: servicesPage.en.spec.includes,
  };

  if (items.sk.length !== 6 || items.cz.length !== 6 || items.en.length !== 6) {
    throw new Error("Očakávam presne 6 služieb v každom jazyku (home.ts services.items).");
  }

  let rank = LexoRank.middle();
  for (const [i, sk] of items.sk.entries()) {
    const incSk = includes.sk[i] ?? [];
    const incCz = includes.cz[i] ?? [];
    const incEn = includes.en[i] ?? [];
    if (incSk.length !== incCz.length || incSk.length !== incEn.length) {
      throw new Error(
        `Služba ${i + 1}: zoznamy Obsahuje majú rôzne dĺžky (SK ${incSk.length} / CZ ${incCz.length} / EN ${incEn.length}).`,
      );
    }

    // Modal — dnes Architektonická štúdia a 3D sken; entry musí existovať vo
    // všetkých jazykoch, sekcie po riadkoch zipujeme podľa indexu.
    const dSk = serviceDetails.sk.find((d) => d.index === i);
    const dCz = serviceDetails.cz.find((d) => d.index === i);
    const dEn = serviceDetails.en.find((d) => d.index === i);
    let modal: Record<string, unknown> | undefined;
    if (dSk) {
      if (!dCz || !dEn || dCz.sections.length !== dSk.sections.length || dEn.sections.length !== dSk.sections.length) {
        throw new Error(`Služba ${i + 1}: modal nie je kompletný vo všetkých jazykoch.`);
      }
      modal = {
        intro: { sk: dSk.intro, cz: dCz.intro, en: dEn.intro },
        sections: dSk.sections.map((sec, j) => ({
          _key: `sec-${j + 1}`,
          _type: "modalSection",
          headingSk: sec.heading,
          bodySk: sec.body,
          headingCz: dCz.sections[j].heading,
          bodyCz: dCz.sections[j].body,
          headingEn: dEn.sections[j].heading,
          bodyEn: dEn.sections[j].body,
        })),
      };
    }

    const file = path.join(IMG_DIR, PHOTOS[i]);
    const asset = await client.assets.upload("image", fs.createReadStream(file), {
      filename: PHOTOS[i],
    });

    await client.createOrReplace({
      _id: `service-${i + 1}`,
      _type: "service",
      title: { sk: sk.title, cz: items.cz[i].title, en: items.en[i].title },
      desc: { sk: sk.desc, cz: items.cz[i].desc, en: items.en[i].desc },
      includes: incSk.map((it, j) => ({
        _key: `itm-${j + 1}`,
        _type: "includeItem",
        sk: it,
        cz: incCz[j],
        en: incEn[j],
      })),
      photo: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
      ...(modal ? { modal } : {}),
      orderRank: rank.toString(),
    });
    await client.delete(`drafts.service-${i + 1}`);
    console.log(`✓ ${sk.title} (${PHOTOS[i]}${modal ? ", modal" : ""})`);
    rank = rank.genNext();
  }
  console.log("Seed hotový.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
