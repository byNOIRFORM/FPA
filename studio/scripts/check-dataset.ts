/**
 * Kontrola čistoty datasetu po migráciách (raw = aj drafty):
 * legacy polia, chýbajúce povinné časti, integrita homepage výberu.
 * Spustenie: npx sanity exec <path> --with-user-token (z priečinka studio/)
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-07-01" });

async function main(): Promise<void> {
  const raw = { perspective: "raw" as const };

  const members = await client.fetch<
    { _id: string; legacy: boolean; role?: { sk?: string; cz?: string; en?: string } }[]
  >(
    `*[_type == "teamMember"]{ _id, "legacy": defined(roleSk) || defined(roleCz) || defined(roleEn), role }`,
    {},
    raw,
  );
  const badMembers = members.filter(
    (m) => m.legacy || !m.role?.sk || !m.role?.cz || !m.role?.en,
  );
  console.log(`teamMember: ${members.length} dokumentov (aj drafty), problémových: ${badMembers.length}`);
  badMembers.forEach((m) => console.log(`  ✖ ${m._id}`, JSON.stringify(m)));

  const projects = await client.fetch<
    { _id: string; legacy: boolean; hasDetail?: boolean; cardOk: boolean; detailOk: boolean }[]
  >(
    `*[_type == "project"]{
      _id, hasDetail,
      "legacy": defined(titleSk) || defined(introSk) || defined(contextBodySk)
        || defined(countrySk) || defined(year) || defined(client)
        || defined(category) || defined(architect) || defined(country) || defined(infoText.countrySk),
      "cardOk": defined(card.titleSk) && defined(card.titleCz) && defined(card.titleEn)
        && defined(card.descriptionSk) && defined(card.descriptionCz) && defined(card.descriptionEn)
        && defined(cover.asset),
      "detailOk": hasDetail != true || (defined(slug.current) && defined(hero.asset)
        && defined(context.asset) && defined(infoText.textSk) && defined(infoText.textCz)
        && defined(infoText.textEn) && count(blocks) > 0 && count(gallery) > 0)
    }`,
    {},
    raw,
  );
  const badProjects = projects.filter((p) => p.legacy || !p.cardOk || !p.detailOk);
  console.log(`project: ${projects.length} dokumentov (aj drafty), problémových: ${badProjects.length}`);
  badProjects.forEach((p) => console.log(`  ✖ ${p._id}`, JSON.stringify(p)));

  const hp = await client.fetch<{
    count: number;
    unique: number;
    resolved: number;
    drafts: number;
  }>(
    `{
      "count": count(*[_id == "homepageProjects"][0].projects),
      "unique": count(array::unique(*[_id == "homepageProjects"][0].projects[]._ref)),
      "resolved": count(*[_id == "homepageProjects"][0].projects[]->_id),
      "drafts": count(*[_id == "drafts.homepageProjects"])
    }`,
    {},
    raw,
  );
  console.log(
    `homepageProjects: ${hp.count} referencií, unikátnych ${hp.unique}, rozriešených ${hp.resolved}, draftov ${hp.drafts}`,
  );

  const settings = await client.fetch<{ ok: boolean } | null>(
    `*[_id == "teamSettings"][0]{ "ok": defined(careersOpen) }`,
    {},
    raw,
  );
  console.log(`teamSettings: ${settings?.ok ? "OK" : "CHÝBA/NEÚPLNÝ"}`);

  const orphanDrafts = await client.fetch<string[]>(
    `*[_id in path("drafts.**") && _type in ["project", "teamMember", "homepageProjects"]]._id`,
    {},
    raw,
  );
  console.log(`drafty (project/teamMember/homepageProjects): ${orphanDrafts.length}`);
  orphanDrafts.forEach((id) => console.log(`  • ${id}`));

  const clean = badMembers.length === 0 && badProjects.length === 0 && hp.count === 6 && hp.unique === 6 && hp.resolved === 6;
  console.log(clean ? "VÝSLEDOK: dataset čistý ✓" : "VÝSLEDOK: našli sa problémy ✖");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
