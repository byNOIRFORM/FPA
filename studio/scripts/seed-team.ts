/**
 * Jednorazový seed sekcie "Náš tím" — nahrá 8 aktuálnych členov
 * (mená + roly v SK/CZ/EN z i18n webu) a ich portréty z
 * ../public/images/about/team-N.jpg ako Sanity image assety.
 *
 * Spustenie (z priečinka studio/, používa prihlásenie zo `sanity login`):
 *   npx sanity exec scripts/seed-team.ts --with-user-token
 *
 * Deterministické _id (team-member-N) → opakované spustenie dokumenty
 * len prepíše, nič neduplikuje.
 */
import { getCliClient } from "sanity/cli";
import { LexoRank } from "lexorank";
import fs from "node:fs";
import path from "node:path";

const client = getCliClient({ apiVersion: "2026-07-01" });
// sanity exec transpiluje na CJS — __dirname je k dispozícii.
const IMG_DIR = path.resolve(__dirname, "../../public/images/about");

const members = [
  { name: "Ing. Marek Dufala", roleSk: "Projektant", roleCz: "Projektant", roleEn: "Project engineer", photo: "team-1.jpg" },
  { name: "Ing. arch. Natália Čuntová", roleSk: "Externá architektka", roleCz: "Externí architektka", roleEn: "External architect", photo: "team-2.jpg" },
  { name: "Petra Lacová", roleSk: "Študentka architektúry", roleCz: "Studentka architektury", roleEn: "Architecture student", photo: "team-3.jpg" },
  { name: "Ing. arch. Miriam Sabolová", roleSk: "Projektantka", roleCz: "Projektantka", roleEn: "Project engineer", photo: "team-4.jpg" },
  { name: "Ing. Jozef Bajus", roleSk: "Projektant", roleCz: "Projektant", roleEn: "Project engineer", photo: "team-5.jpg" },
  { name: "Ing. arch. Lenka Semanová", roleSk: "Architektka", roleCz: "Architektka", roleEn: "Architect", photo: "team-6.jpg" },
  { name: "Ing. Peter Hudák", roleSk: "Statik", roleCz: "Statik", roleEn: "Structural engineer", photo: "team-7.jpg" },
  { name: "Ing. Katarína Onuferová", roleSk: "Stavebná inžinierka", roleCz: "Stavební inženýrka", roleEn: "Civil engineer", photo: "team-8.jpg" },
];

async function main(): Promise<void> {
  let rank = LexoRank.middle();
  for (const [i, m] of members.entries()) {
    const file = path.join(IMG_DIR, m.photo);
    const asset = await client.assets.upload("image", fs.createReadStream(file), {
      filename: m.photo,
    });
    await client.createOrReplace({
      _id: `team-member-${i + 1}`,
      _type: "teamMember",
      name: m.name,
      // v3: rola je vnorená v objekte s prepínačom Jazyk.
      role: { sk: m.roleSk, cz: m.roleCz, en: m.roleEn },
      portrait: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
      },
      orderRank: rank.toString(),
    });
    await client.delete(`drafts.team-member-${i + 1}`);
    console.log(`✓ ${m.name} (${m.photo} → ${asset._id})`);
    rank = rank.genNext();
  }
  console.log("Seed hotový.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
