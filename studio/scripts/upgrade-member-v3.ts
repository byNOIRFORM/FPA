/**
 * Migrácia teamMember v2 → v3: ploché roleSk/roleCz/roleEn sa presúvajú
 * do objektu role { sk, cz, en } (formulár prešiel na sekčný vzor
 * s prepínačom „Jazyk" ako pri projektoch).
 *
 * Hodnoty sa ZACHOVÁVAJÚ (žiadny reseed — členov mohol niekto upravovať).
 * Spracuje publikované dokumenty aj drafty; opakované spustenie je
 * neškodné (docs bez plochých polí preskočí).
 *
 * Spustenie (z priečinka studio/):
 *   npx sanity exec scripts/upgrade-member-v3.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-07-01" });

type Row = {
  _id: string;
  roleSk?: string;
  roleCz?: string;
  roleEn?: string;
  role?: { sk?: string; cz?: string; en?: string };
};

async function main(): Promise<void> {
  // POZOR: novšie API verzie majú default perspektívu "published" —
  // drafty treba vypýtať explicitne cez raw, inak migrácii utečú
  // (presne to sa stalo pri prvom spustení).
  const docs = await client.fetch<Row[]>(
    `*[_type == "teamMember"]{ _id, roleSk, roleCz, roleEn, role }`,
    {},
    { perspective: "raw" },
  );

  for (const d of docs) {
    if (!d.roleSk && !d.roleCz && !d.roleEn) {
      console.log(`– ${d._id} (už zmigrovaný)`);
      continue;
    }
    await client
      .patch(d._id)
      .set({
        role: {
          sk: d.role?.sk ?? d.roleSk ?? "",
          cz: d.role?.cz ?? d.roleCz ?? "",
          en: d.role?.en ?? d.roleEn ?? "",
        },
      })
      .unset(["roleSk", "roleCz", "roleEn"])
      .commit();
    console.log(`✓ ${d._id}`);
  }
  console.log("Migrácia hotová.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
