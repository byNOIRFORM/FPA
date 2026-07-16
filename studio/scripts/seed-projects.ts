/**
 * Jednorazový seed sekcie Projekty — nahrá 12 existujúcich projektov
 * (6 z mriežky Works + 6 listing-only z /projekty) vrátane fotiek,
 * plný detail zatiaľ len Chata pod korunami (jediný má na webe detail),
 * a singleton homepageProjects s výberom + poradím 6 works projektov.
 *
 * Dáta sa NEKOPÍRUJÚ ručne — importujú sa priamo z webových i18n
 * súborov (src/i18n/projects.ts, src/i18n/home.ts), takže seed je vždy
 * 1:1 s tým, čo web dnes zobrazuje z fallbacku.
 *
 * Spustenie (z priečinka studio/, používa prihlásenie zo `sanity login`):
 *   npx sanity exec scripts/seed-projects.ts --with-user-token
 *
 * Deterministické _id (project-<slug>) → opakované spustenie dokumenty
 * len prepíše, nič neduplikuje (a identické fotky Sanity dedupuje).
 */
import { getCliClient } from "sanity/cli";
import { LexoRank } from "lexorank";
import fs from "node:fs";
import path from "node:path";
import { home } from "../../src/i18n/home";
import {
  projects as detailProjects,
  extraProjects,
  worksProjectSlugs,
  worksImages,
  relatedCategories,
  type ContentBlock,
} from "../../src/i18n/projects";

const client = getCliClient({ apiVersion: "2026-07-01" });
// sanity exec transpiluje na CJS — __dirname je k dispozícii.
const PUBLIC_DIR = path.resolve(__dirname, "../../public");

// SK label kategórie (relatedCategories) → jazykovo neutrálny kľúč
// (project.ts → CATEGORIES; musí sedieť aj so src/lib/projects.ts).
const CATEGORY_KEY_BY_SK: Record<string, string> = {
  "Rodinné domy": "rodinne-domy",
  "Bytové domy": "bytove-domy",
  "Verejné budovy": "verejne-budovy",
  "Priemyselné stavby": "priemyselne-stavby",
  "Rekreačné a športové stavby": "rekreacne-a-sportove-stavby",
  "Parky a verejný priestor": "parky-a-verejny-priestor",
};

// Listing-only projekty nemajú slug na webe — deterministické id rúčne.
const EXTRA_IDS = [
  "dom-pri-jazere",
  "vila-na-svahu",
  "rezidencia-s-terasou",
  "knihkupectvo-a-kaviaren",
  "tvorivy-priestor",
  "pavilon-v-luke",
];

type ImageRef = { _type: "image"; asset: { _type: "reference"; _ref: string } };

const uploaded = new Map<string, ImageRef>();

/** Nahrá lokálnu fotku (web cesta "/images/...") a vráti referenciu. */
async function uploadImage(webPath: string): Promise<ImageRef> {
  const cached = uploaded.get(webPath);
  if (cached) return cached;
  const file = path.join(PUBLIC_DIR, webPath);
  const asset = await client.assets.upload("image", fs.createReadStream(file), {
    filename: path.basename(file),
  });
  const ref: ImageRef = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
  uploaded.set(webPath, ref);
  console.log(`  ↑ ${webPath} → ${asset._id}`);
  return ref;
}

async function buildBlocks(blocks: ContentBlock[]): Promise<Record<string, unknown>[]> {
  const out: Record<string, unknown>[] = [];
  for (const [i, b] of blocks.entries()) {
    const _key = `block-${i + 1}`;
    if (b.kind === "photo") {
      out.push({ _type: "photoBlock", _key, image: await uploadImage(b.media.image) });
    } else if (b.kind === "text") {
      out.push({
        _type: "textBlock",
        _key,
        titleSk: b.title.sk,
        titleCz: b.title.cz,
        titleEn: b.title.en,
        bodySk: b.body.sk.join("\n\n"),
        bodyCz: b.body.cz.join("\n\n"),
        bodyEn: b.body.en.join("\n\n"),
      });
    } else if (b.kind === "duo") {
      out.push({
        _type: "duoBlock",
        _key,
        left: await uploadImage(b.left.image),
        right: await uploadImage(b.right.image),
      });
    } else {
      out.push({
        _type: "specBlock",
        _key,
        titleSk: b.title.sk,
        titleCz: b.title.cz,
        titleEn: b.title.en,
        rows: b.rows.sk.map((row, ri) => ({
          _type: "specRow",
          _key: `row-${ri + 1}`,
          labelSk: row.label,
          valueSk: row.value,
          labelCz: b.rows.cz[ri]?.label ?? row.label,
          valueCz: b.rows.cz[ri]?.value ?? row.value,
          labelEn: b.rows.en[ri]?.label ?? row.label,
          valueEn: b.rows.en[ri]?.value ?? row.value,
        })),
      });
    }
  }
  return out;
}

/** Hodnota meta riadku podľa indexu (Rok/Klient/Krajina/Kategória/Architekt). */
const metaValue = (rows: { value: string }[], i: number): string | undefined =>
  rows[i]?.value || undefined;

async function main(): Promise<void> {
  let rank = LexoRank.middle();
  const nextRank = () => {
    const r = rank.toString();
    rank = rank.genNext();
    return r;
  };

  // ---------- 6 Works projektov (poradie = mriežka na webe) ----------
  for (const [i, slug] of worksProjectSlugs.entries()) {
    const _id = `project-${slug}`;
    const detail = detailProjects.find((p) => p.slug === slug);
    console.log(`Projekt: ${slug}${detail ? " (s detailom)" : ""}`);

    // Texty sekcií sú vnorené do objektov card / slogan / infoText —
    // presne ako v schéme (jazykový prepínač per sekcia).
    const doc: Record<string, unknown> = {
      _id,
      _type: "project",
      orderRank: nextRank(),
      cover: await uploadImage(worksImages[i]),
      facts: {
        category: CATEGORY_KEY_BY_SK[relatedCategories.sk[i]],
        architect: "Fotta Popadič",
      },
      hasDetail: Boolean(detail),
      card: {
        titleSk: home.sk.works.projects[i].title,
        titleCz: home.cz.works.projects[i].title,
        titleEn: home.en.works.projects[i].title,
        descriptionSk: home.sk.works.projects[i].description,
        descriptionCz: home.cz.works.projects[i].description,
        descriptionEn: home.en.works.projects[i].description,
      },
    };

    if (detail) {
      const { sk, cz, en } = detail.locales;
      Object.assign(doc, {
        slug: { _type: "slug", current: slug },
        hero: await uploadImage(detail.heroImage),
        context: await uploadImage(detail.contextImage),
        blocks: await buildBlocks(detail.blocks),
        gallery: await Promise.all(
          detail.gallery.map(async (g, gi) => ({
            ...(await uploadImage(g.image)),
            _key: `gallery-${gi + 1}`,
          })),
        ),
        slogan: { sk: sk.intro, cz: cz.intro, en: en.intro },
        infoText: {
          textSk: sk.contextBody.join("\n\n"),
          textCz: cz.contextBody.join("\n\n"),
          textEn: en.contextBody.join("\n\n"),
        },
        facts: {
          category: CATEGORY_KEY_BY_SK[relatedCategories.sk[i]],
          year: metaValue(sk.meta, 0),
          client: metaValue(sk.meta, 1),
          countrySk: metaValue(sk.meta, 2),
          countryCz: metaValue(cz.meta, 2),
          countryEn: metaValue(en.meta, 2),
          architect: metaValue(sk.meta, 4) ?? "Fotta Popadič",
        },
      });
    }

    await client.createOrReplace(doc as never);
    // Rozpracovaný draft zo staršej verzie schémy by v Studiu hlásil
    // "Unknown fields" — po reseede ho zahodíme (publikovaná verzia
    // je zdroj pravdy).
    await client.delete(`drafts.${_id}`);
    console.log(`✓ ${_id}`);
  }

  // ---------- 6 listing-only projektov (/projekty za works) ----------
  for (const [i, p] of extraProjects.entries()) {
    const _id = `project-${EXTRA_IDS[i]}`;
    console.log(`Projekt: ${EXTRA_IDS[i]} (len karta)`);
    await client.createOrReplace({
      _id,
      _type: "project",
      orderRank: nextRank(),
      cover: await uploadImage(p.image),
      hasDetail: false,
      card: {
        titleSk: p.title.sk,
        titleCz: p.title.cz,
        titleEn: p.title.en,
        descriptionSk: p.description.sk,
        descriptionCz: p.description.cz,
        descriptionEn: p.description.en,
      },
      facts: { architect: "Fotta Popadič" },
    } as never);
    await client.delete(`drafts.${_id}`);
    console.log(`✓ ${_id}`);
  }

  // ---------- Singleton: výber 6 na hlavnú stránku ----------
  await client.createOrReplace({
    _id: "homepageProjects",
    _type: "homepageProjects",
    projects: worksProjectSlugs.map((slug, i) => ({
      _type: "reference",
      _ref: `project-${slug}`,
      _key: `hp-${i + 1}`,
    })),
  } as never);
  await client.delete("drafts.homepageProjects");
  console.log("✓ homepageProjects (6 works projektov v pôvodnom poradí)");

  console.log("Seed hotový.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
