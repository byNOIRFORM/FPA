/**
 * Jednorazový seed sekcie "Čo hovoria naši klienti" — nahrá 5 aktuálnych
 * referencií (citáty + roly v SK/CZ/EN z i18n webu) a fotky z
 * ../public/images/about/ref-*.jpg ako Sanity image assety.
 *
 * Fotku majú len VYMYSLENÉ persony (placeholder tváre, Michal 2026-07-15);
 * Jozef Marcin je skutočný recenzent — zostáva bez fotky, kým nepríde
 * jeho reálna fotka so súhlasom. Lenka Kravcová drží čisto textový variant.
 *
 * Spustenie (z priečinka studio/, používa prihlásenie zo `sanity login`):
 *   npx sanity exec scripts/seed-testimonials.ts --with-user-token
 *
 * Deterministické _id (testimonial-N) → opakované spustenie dokumenty
 * len prepíše, nič neduplikuje.
 */
import { getCliClient } from "sanity/cli";
import { LexoRank } from "lexorank";
import fs from "node:fs";
import path from "node:path";

const client = getCliClient({ apiVersion: "2026-07-01" });
// sanity exec transpiluje na CJS — __dirname je k dispozícii.
const IMG_DIR = path.resolve(__dirname, "../../public/images/about");

const testimonials: {
  name: string;
  quote: { sk: string; cz: string; en: string };
  role: { sk: string; cz: string; en: string };
  photo: string | null;
}[] = [
  {
    name: "Jozef Marcin",
    quote: {
      sk: "Tomáš a Dominik mi robili projekt domu. Vždy si na mňa našli čas, odborne odpovedali na moje otázky a prípadne ma usmernili. Projekt domu odovzdali vo veľmi vysokej kvalite. Tým však naša spolupráca neskončila, keďže stavbu navštevovali počas výstavby v rámci kontroly postupu prác. Moja osobná skúsenosť bola veľmi dobrá, vrelo odporúčam!",
      cz: "Tomáš a Dominik mi dělali projekt domu. Vždy si na mě našli čas, odborně odpověděli na mé otázky a případně mě usměrnili. Projekt domu odevzdali ve velmi vysoké kvalitě. Tím však naše spolupráce neskončila, protože stavbu navštěvovali během výstavby v rámci kontroly postupu prací. Moje osobní zkušenost byla velmi dobrá, vřele doporučuji!",
      en: "Tomáš and Dominik designed our house. They always found time for me, answered my questions with real expertise and steered me in the right direction when needed. The design was delivered in excellent quality — and our cooperation did not end there, as they kept visiting the site during construction to check on the progress of the works. My personal experience was very good, I warmly recommend them!",
    },
    role: { sk: "Majiteľ domu", cz: "Majitel domu", en: "Homeowner" },
    photo: null, // skutočný recenzent — bez placeholder tváre
  },
  {
    name: "Martin Vaľko",
    quote: {
      sk: "Profesionálny prístup od prvej konzultácie až po kolaudáciu. Nič nebolo problém. Odporúčam každému, kto to so stavbou myslí vážne.",
      cz: "Profesionální přístup od první konzultace až po kolaudaci. Nic nebylo problém. Doporučuji každému, kdo to se stavbou myslí vážně.",
      en: "A professional approach from the first consultation to the final sign-off. Nothing was ever a problem. I recommend them to anyone who is serious about building.",
    },
    role: {
      sk: "Majiteľ rodinného domu",
      cz: "Majitel rodinného domu",
      en: "Family house owner",
    },
    photo: "ref-valko.jpg",
  },
  {
    name: "Zuzana Vargová",
    quote: {
      sk: "S ateliérom sme prerábali starší dom a báli sme sa, že sa v tom stratíme. Opak bol pravdou – všetko nám vysvetlili ľudsky, bez zbytočných odborných rečí, a výsledok predčil naše očakávania. Dom konečne funguje tak, ako naša rodina žije.",
      cz: "S ateliérem jsme předělávali starší dům a báli jsme se, že se v tom ztratíme. Opak byl pravdou – všechno nám vysvětlili lidsky, bez zbytečných odborných řečí, a výsledek předčil naše očekávání. Dům konečně funguje tak, jak naše rodina žije.",
      en: "We renovated an older house with the studio and were afraid we would get lost in the process. The opposite was true – they explained everything in plain human terms, without unnecessary jargon, and the result exceeded our expectations. The house finally works the way our family lives.",
    },
    role: {
      sk: "Rekonštrukcia rodinného domu",
      cz: "Rekonstrukce rodinného domu",
      en: "Family house renovation",
    },
    photo: "ref-vargova.jpg",
  },
  {
    name: "Ing. Marek Šimko",
    quote: {
      sk: "Pre našu firmu navrhli administratívnu budovu so skladom. Ocenil som najmä to, ako dokázali skĺbiť naše prevádzkové požiadavky s architektúrou, za ktorú sa nemusíme hanbiť. Rozpočet aj termíny sa dodržali, komunikácia bola vecná a rýchla. Už teraz s nimi riešime ďalšiu etapu areálu.",
      cz: "Pro naši firmu navrhli administrativní budovu se skladem. Ocenil jsem především to, jak dokázali skloubit naše provozní požadavky s architekturou, za kterou se nemusíme stydět. Rozpočet i termíny se dodržely, komunikace byla věcná a rychlá. Už teď s nimi řešíme další etapu areálu.",
      en: "They designed an office building with a warehouse for our company. What I valued most was how they combined our operational requirements with architecture we can be proud of. Budget and deadlines were kept, communication was quick and to the point. We are already working with them on the next phase of the site.",
    },
    role: {
      sk: "Konateľ spoločnosti",
      cz: "Jednatel společnosti",
      en: "Company director",
    },
    photo: "ref-simko.jpg",
  },
  {
    name: "Lenka Kravcová",
    quote: {
      sk: "Kúpili sme pozemok vo svahu, z ktorého mali iní architekti rešpekt. Fotta Popadič z neho spravili najsilnejšiu stránku domu. Terasa s výhľadom, na ktorej sedíme každý večer, je ich zásluha.",
      cz: "Koupili jsme pozemek ve svahu, ze kterého měli jiní architekti respekt. Fotta Popadič z něj udělali nejsilnější stránku domu. Terasa s výhledem, na které sedíme každý večer, je jejich zásluha.",
      en: "We bought a sloped plot that other architects were wary of. Fotta Popadič turned it into the strongest feature of the house. The terrace with a view, where we sit every evening, is their doing.",
    },
    role: { sk: "Majiteľka domu", cz: "Majitelka domu", en: "Homeowner" },
    photo: null, // čisto textový variant zostáva v prevádzke
  },
];

async function main(): Promise<void> {
  let rank = LexoRank.middle();
  for (const [i, item] of testimonials.entries()) {
    let photo: { _type: "image"; asset: { _type: "reference"; _ref: string } } | undefined;
    if (item.photo) {
      const file = path.join(IMG_DIR, item.photo);
      const asset = await client.assets.upload("image", fs.createReadStream(file), {
        filename: item.photo,
      });
      photo = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
    }
    await client.createOrReplace({
      _id: `testimonial-${i + 1}`,
      _type: "testimonial",
      name: item.name,
      quote: item.quote,
      role: item.role,
      ...(photo ? { photo } : {}),
      orderRank: rank.toString(),
    });
    await client.delete(`drafts.testimonial-${i + 1}`);
    console.log(`✓ ${item.name}${item.photo ? ` (${item.photo})` : " (bez fotky)"}`);
    rank = rank.genNext();
  }
  console.log("Seed hotový.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
