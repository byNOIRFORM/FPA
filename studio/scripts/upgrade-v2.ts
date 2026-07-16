/**
 * Migrácia na "verziu 2" schémy (jednorazová, ale bezpečne opakovateľná):
 *  1. teamMember: číselné pole `order` → lexorank string `orderRank`
 *     (drag & drop plugin) — poradie sa zachová.
 *  2. Vytvorí singleton "Nastavenia tímu" (_id: teamSettings) s dnešným
 *     stavom: dlaždica Voľné miesto zapnutá + aktuálny profesia.sk link.
 *     createIfNotExists — existujúce nastavenia nikdy neprepíše.
 *
 * Spustenie (z priečinka studio/):
 *   npx sanity exec scripts/upgrade-v2.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";
import { LexoRank } from "lexorank";

const client = getCliClient({ apiVersion: "2026-07-01" });

const CAREERS_URL = "https://www.profesia.sk/praca/fotta-popadic-architekt/O5302133";

async function main(): Promise<void> {
  // Drafty aj publikované, zoradené podľa starého čísla (drafty hneď za
  // svojím publikovaným originálom, aby dostali susedný rank).
  const docs: { _id: string; name: string }[] = await client.fetch(
    `*[_type == "teamMember"] | order(coalesce(order, 999) asc, _id asc) { _id, name }`,
  );
  let rank = LexoRank.middle();
  for (const d of docs) {
    await client.patch(d._id).set({ orderRank: rank.toString() }).unset(["order"]).commit();
    console.log(`✓ ${d.name} (${d._id}) → ${rank.toString()}`);
    rank = rank.genNext();
  }

  await client.createIfNotExists({
    _id: "teamSettings",
    _type: "teamSettings",
    careersOpen: true,
    careersUrl: CAREERS_URL,
  });
  console.log("✓ Nastavenia tímu (teamSettings)");
  console.log("Migrácia hotová.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
