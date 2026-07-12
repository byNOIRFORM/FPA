/**
 * /o-nas (About) page copy — Figma "oNás" (node 3227:348), built section by
 * section as the design lands (currently: hero → word-scrub intro →
 * "Počiatky ateliéru" → photo story → team block [word-scrub intro → Pavol →
 * Tomáš + Dominik → "Náš tím" drag carousel] → footer).
 *
 * Values are per-language, 1:1 with a future CMS "about" document.
 */
import type { Lang } from "./home";

export interface AboutPageCopy {
  metaTitle: string;
  heroTitle: string; // word-mask reveal on load
  intro: string; // big word-scrub sentence (also the meta description)
  origins: {
    label: string; // left-column section label
    col1: string[]; // first text column, paragraphs
    col2: string[]; // second text column, paragraphs
    caption: string; // photo caption
  };
  /** Photo-story blocks after "Počiatky" — pair row (tall 445 + mid 680)
   *  then the wide 1147 photo; order matches the Figma left→right, top→down.
   *  Images are lang-agnostic and live in AboutPage.astro. */
  story: { alt: string; caption: string }[];
  /** Team block (Figma "Sekcia 4" → "Náš tím" editorial grid, oNás_V2
   *  3393:216). Images are lang-agnostic and live in AboutPage.astro;
   *  `members` order matches the grid photos team-1…team-7 reading-order
   *  (a member may have no photo yet → dark placeholder tile). */
  team: {
    intro: string; // second big word-scrub sentence
    pavol: { bio: string[]; name: string; role: string };
    duo: { bio: string[]; members: { name: string; role: string }[] };
    galleryLabel: string;
    members: { name: string; role: string }[];
  };
}

export const aboutPage: Record<Lang, AboutPageCopy> = {
  sk: {
    metaTitle: "O nás — Fotta Popadič",
    heroTitle: "Za každou čiarou vidíme ľudské príbehy",
    intro:
      "Tvoríme tiché priestory pre skutočný život. Naša architektúra nemá byť hlučná, ale pravdivá – rodí sa z dialógu a poctivého remesla. Pozrite sa, ako tento postoj formujeme už od úplného začiatku.",
    origins: {
      label: "Počiatky ateliéru",
      col1: [
        "Príbeh ateliéru začal písať Pavol Fotta v roku 1998 v Bardejove. Od prvej skice stavil na nekompromisné stavebné remeslo, priamosť a architektúru, ktorá sa nepotrebuje predvádzať. Viac ako dve desaťročia budoval základy očistené od prvoplánových katalógových trendov a prázdneho marketingu. Každá čiara na výkrese musela mať jasné statické a racionálne opodstatnenie – stavba musela dávať zmysel v prvom rade na stavenisku, nie iba dobre vyzerať na papieri.",
        "Sústredil sa na surovú podstatu: ako dom komunikuje s miestom, ako narába s prirodzeným svetlom a ako dokáže fungovať desiatky rokov bez straty hodnoty. Tento prísny, inžiniersky prístup k materiálu vytvoril pevnú konštrukčnú DNA, na ktorej ateliér stojí dodnes a z ktorej prirodzene vyrástla naša súčasnosť.",
      ],
      col2: [
        "Túto kontinuitu a budúcnosť značky prebrala druhá generácia – Dominik Fotta a Tomáš Popadič. Ako rodina a partneri sme preklopili poctivú remeselnú bázu do modernej éry a sformovali dnešnú podobu ateliéru Fotta Popadič.",
        "Dnes už z dvoch plnohodnotných štúdií v Bardejove a Košiciach vedieme stabilný tím projektantov a inžinierov. Prekročili sme hranice lokálneho štúdia a s rešpektom k odkazu predchodcov preberáme plnú zodpovednosť za priestor, v ktorom žijete svoje každodenné rituály.",
      ],
      caption: "Pavol Fotta, Dominik Fotta a Tomáš Popadič pri návrhu konceptu.",
    },
    story: [
      {
        alt: "Kontrola realizačnej dokumentácie v ateliéri",
        caption:
          "Koncept preklápame do prísnych čísiel. Každý detail kontrolujeme, pretože vieme, že dobrá stavba stojí na bezchybnej realizačnej dokumentácii.",
      },
      {
        alt: "Tím ateliéru pri diskusii nad prvými skicami",
        caption:
          "Architektúra pre nás nie je prácou jednotlivca. Každý projekt prechádza otvorenou diskusiou celého tímu. Pri veľkom stole konfrontujeme prvé skice s čistou logikou priestoru a hľadáme ideálny prienik medzi odvahou konceptu a realitou statiky.",
      },
      {
        alt: "3D tlačený model domu v rukách klienta",
        caption:
          "Priestor sa nedá úplne navnímať na plochom monitore. Pre zložitejšie projekty preto vytvárame verné 3D tlačené modely celých domov, aby klient držal zmenšenú realitu vo svojich rukách.",
      },
      {
        alt: "Vzorky materiálov v ateliéri — betón, drevo a oceľ",
        caption:
          "Architektúru netvoríme len pre oči, musíte ju ucítiť na dotyk. V ateliéri fyzicky ladíme vzorky surového betónu, dreva a ocele – hľadáme kombinácie, ktoré budú prirodzene a dôstojne starnúť.",
      },
      {
        alt: "Autorský dozor priamo na stavbe",
        caption:
          "Papier znesie všetko, no realita surového betónu neodpúšťa chyby. Príbeh projektu preto nekončí odovzdaním výkresov. Sme s vami priamo na stavbe, kde formou autorského dozoru garantujeme, že to, čo sme nakreslili, bude v reálnom svete bezchybne fungovať.",
      },
    ],
    team: {
      intro:
        "Architektúra nie je produktom softvéru, ale ľudí. Naše tri dekády overených stavbárskych skúseností preto spájame s energiou novej generácie. Sme dve generácie, tri pohľady a jeden rozrastajúci sa tím, ktorý spoločne formuje tichý priestor pre život.",
      pavol: {
        bio: [
          "Človek, ktorý stál pri samotnom zrode ateliéru a položil mu pevné základy, na ktorých dodnes staviame. S viac ako tromi dekádami neoceniteľných inžinierskych a stavbárskych skúseností vniesol do našej tvorby prísnu technickú disciplínu, nekompromisnú prísnosť a hlboký rešpekt k poctivému stavebnému detailu. Pre Pavla architektúra nikdy nekončila pri čiarach na papieri – skutočná pravda o priestore sa preňho vždy overovala až priamo na stavenisku.",
          "Jeho celoživotná prax formovala identitu ateliéru ako miesta, kde odvážna kreativita podlieha prísnej logike realizovateľnosti. Dnes, keď vedenie plynule preberá nová generácia, jeho odkaz technickej dokonalosti a remeselnej pravdivosti zostáva naším najpevnejším pilierom.",
        ],
        name: "Ing. Pavol Fotta",
        role: "Zakladateľ ateliéru",
      },
      duo: {
        bio: [
          "Nová energia, ktorá posúva hranice ateliéru. Tomáš a Dominik plynule prebrali vedenie rodinnej firmy s jasnou víziou – spojiť dekády overených inžinierskych základov s čistým minimalizmom a progresívnymi technológiami.",
          "Prinášajú do procesu nové štandardy, od 3D tlače a skenovania až po hľadanie surových, pravdivých materiálov. Ich spoločným cieľom je tvoriť architektúru, ktorá vizuálne nekričí, no v reálnom svete funguje absolútne bezchybne.",
        ],
        members: [
          { name: "Dominik Fotta", role: "Partner ateliéru" },
          { name: "Ing. arch. Ing. Tomáš Popadič", role: "Partner ateliéru" },
        ],
      },
      galleryLabel: "Náš tím",
      members: [
        { name: "Ing. Marek Dufala", role: "Projektant" },
        { name: "Ing. arch. Natália Čuntová", role: "Externá architektka" },
        { name: "Petra Lacová", role: "Študentka architektúry" },
        { name: "Ing. arch. Miriam Sabolová", role: "Projektantka" },
        { name: "Ing. Jozef Bajus", role: "Projektant" },
        { name: "Ing. arch. Lenka Semanová", role: "Architektka" },
        { name: "Ing. Peter Hudák", role: "Statik" },
        { name: "Ing. Katarína Onuferová", role: "Stavebná inžinierka" },
      ],
    },
  },
  cz: {
    metaTitle: "O nás — Fotta Popadič",
    heroTitle: "Za každou čárou vidíme lidské příběhy",
    intro:
      "Tvoříme tiché prostory pro skutečný život. Naše architektura nemá být hlučná, ale pravdivá – rodí se z dialogu a poctivého řemesla. Podívejte se, jak tento postoj formujeme už od úplného začátku.",
    origins: {
      label: "Počátky ateliéru",
      col1: [
        "Příběh ateliéru začal psát Pavol Fotta v roce 1998 v Bardejově. Od první skici vsadil na nekompromisní stavební řemeslo, přímost a architekturu, která se nepotřebuje předvádět. Více než dvě desetiletí budoval základy očištěné od prvoplánových katalogových trendů a prázdného marketingu. Každá čára na výkrese musela mít jasné statické a racionální opodstatnění – stavba musela dávat smysl v první řadě na staveništi, ne jen dobře vypadat na papíře.",
        "Soustředil se na syrovou podstatu: jak dům komunikuje s místem, jak nakládá s přirozeným světlem a jak dokáže fungovat desítky let bez ztráty hodnoty. Tento přísný, inženýrský přístup k materiálu vytvořil pevnou konstrukční DNA, na které ateliér stojí dodnes a ze které přirozeně vyrostla naše současnost.",
      ],
      col2: [
        "Tuto kontinuitu a budoucnost značky převzala druhá generace – Dominik Fotta a Tomáš Popadič. Jako rodina a partneři jsme překlopili poctivou řemeslnou bázi do moderní éry a zformovali dnešní podobu ateliéru Fotta Popadič.",
        "Dnes už ze dvou plnohodnotných studií v Bardejově a Košicích vedeme stabilní tým projektantů a inženýrů. Překročili jsme hranice lokálního studia a s respektem k odkazu předchůdců přebíráme plnou odpovědnost za prostor, ve kterém žijete své každodenní rituály.",
      ],
      caption: "Pavol Fotta, Dominik Fotta a Tomáš Popadič při návrhu konceptu.",
    },
    story: [
      {
        alt: "Kontrola realizační dokumentace v ateliéru",
        caption:
          "Koncept překlápíme do přísných čísel. Každý detail kontrolujeme, protože víme, že dobrá stavba stojí na bezchybné realizační dokumentaci.",
      },
      {
        alt: "Tým ateliéru při diskusi nad prvními skicami",
        caption:
          "Architektura pro nás není prací jednotlivce. Každý projekt prochází otevřenou diskusí celého týmu. U velkého stolu konfrontujeme první skici s čistou logikou prostoru a hledáme ideální průnik mezi odvahou konceptu a realitou statiky.",
      },
      {
        alt: "3D tištěný model domu v rukou klienta",
        caption:
          "Prostor se nedá úplně vnímat na plochém monitoru. Pro složitější projekty proto vytváříme věrné 3D tištěné modely celých domů, aby klient držel zmenšenou realitu ve svých rukou.",
      },
      {
        alt: "Vzorky materiálů v ateliéru — beton, dřevo a ocel",
        caption:
          "Architekturu netvoříme jen pro oči, musíte ji ucítit na dotek. V ateliéru fyzicky ladíme vzorky surového betonu, dřeva a oceli – hledáme kombinace, které budou přirozeně a důstojně stárnout.",
      },
      {
        alt: "Autorský dozor přímo na stavbě",
        caption:
          "Papír snese všechno, ale realita surového betonu chyby neodpouští. Příběh projektu proto nekončí odevzdáním výkresů. Jsme s vámi přímo na stavbě, kde formou autorského dozoru garantujeme, že to, co jsme nakreslili, bude v reálném světě bezchybně fungovat.",
      },
    ],
    team: {
      intro:
        "Architektura není produktem softwaru, ale lidí. Naše tři dekády ověřených stavařských zkušeností proto spojujeme s energií nové generace. Jsme dvě generace, tři pohledy a jeden rozrůstající se tým, který společně formuje tichý prostor pro život.",
      pavol: {
        bio: [
          "Člověk, který stál u samotného zrodu ateliéru a položil mu pevné základy, na kterých dodnes stavíme. S více než třemi dekádami neocenitelných inženýrských a stavařských zkušeností vnesl do naší tvorby přísnou technickou disciplínu, nekompromisní přísnost a hluboký respekt k poctivému stavebnímu detailu. Pro Pavla architektura nikdy nekončila u čar na papíře – skutečná pravda o prostoru se pro něj vždy ověřovala až přímo na staveništi.",
          "Jeho celoživotní praxe formovala identitu ateliéru jako místa, kde odvážná kreativita podléhá přísné logice realizovatelnosti. Dnes, kdy vedení plynule přebírá nová generace, zůstává jeho odkaz technické dokonalosti a řemeslné pravdivosti naším nejpevnějším pilířem.",
        ],
        name: "Ing. Pavol Fotta",
        role: "Zakladatel ateliéru",
      },
      duo: {
        bio: [
          "Nová energie, která posouvá hranice ateliéru. Tomáš a Dominik plynule převzali vedení rodinné firmy s jasnou vizí – spojit dekády ověřených inženýrských základů s čistým minimalismem a progresivními technologiemi.",
          "Přinášejí do procesu nové standardy, od 3D tisku a skenování až po hledání syrových, pravdivých materiálů. Jejich společným cílem je tvořit architekturu, která vizuálně nekřičí, ale v reálném světě funguje naprosto bezchybně.",
        ],
        members: [
          { name: "Dominik Fotta", role: "Partner ateliéru" },
          { name: "Ing. arch. Ing. Tomáš Popadič", role: "Partner ateliéru" },
        ],
      },
      galleryLabel: "Náš tým",
      members: [
        { name: "Ing. Marek Dufala", role: "Projektant" },
        { name: "Ing. arch. Natália Čuntová", role: "Externí architektka" },
        { name: "Petra Lacová", role: "Studentka architektury" },
        { name: "Ing. arch. Miriam Sabolová", role: "Projektantka" },
        { name: "Ing. Jozef Bajus", role: "Projektant" },
        { name: "Ing. arch. Lenka Semanová", role: "Architektka" },
        { name: "Ing. Peter Hudák", role: "Statik" },
        { name: "Ing. Katarína Onuferová", role: "Stavební inženýrka" },
      ],
    },
  },
  en: {
    metaTitle: "About us — Fotta Popadič",
    heroTitle: "Behind every line we see human stories",
    intro:
      "We create quiet spaces for real life. Our architecture is not meant to be loud but truthful – born of dialogue and honest craft. See how we have been shaping this stance from the very beginning.",
    origins: {
      label: "Studio origins",
      col1: [
        "The studio's story was begun by Pavol Fotta in 1998 in Bardejov. From the first sketch he bet on uncompromising building craft, directness and architecture that has no need to show off. For more than two decades he built foundations cleansed of shallow catalogue trends and empty marketing. Every line on the drawing had to have a clear structural and rational justification – a building had to make sense on the construction site first, not merely look good on paper.",
        "He focused on the raw essence: how a house speaks to its place, how it works with natural light and how it can serve for decades without losing value. This strict, engineering-minded approach to material created the firm structural DNA the studio stands on to this day — and out of which our present naturally grew.",
      ],
      col2: [
        "That continuity and the brand's future were taken up by the second generation – Dominik Fotta and Tomáš Popadič. As family and partners we carried the honest craft base into the modern era and shaped today's Fotta Popadič studio.",
        "Today, from two fully-fledged studios in Bardejov and Košice, we lead a stable team of designers and engineers. We have outgrown the bounds of a local studio and, with respect for our predecessors' legacy, we take full responsibility for the space in which you live your everyday rituals.",
      ],
      caption: "Pavol Fotta, Dominik Fotta and Tomáš Popadič working on a concept.",
    },
    story: [
      {
        alt: "Reviewing construction documentation in the studio",
        caption:
          "We translate the concept into strict numbers. We check every detail, because we know that a good building stands on flawless construction documentation.",
      },
      {
        alt: "The studio team discussing first sketches",
        caption:
          "For us, architecture is never the work of an individual. Every project passes through an open discussion of the whole team. At the big table we confront the first sketches with the pure logic of space, looking for the ideal balance between a bold concept and the reality of structural engineering.",
      },
      {
        alt: "A 3D-printed model of a house in the client's hands",
        caption:
          "Space can never be fully grasped on a flat screen. For more complex projects we therefore create faithful 3D-printed models of entire houses, so the client can hold a scaled-down reality in their own hands.",
      },
      {
        alt: "Material samples in the studio — concrete, wood and steel",
        caption:
          "We do not create architecture for the eyes alone — you have to feel it. In the studio we physically tune samples of raw concrete, wood and steel, looking for combinations that will age naturally and with dignity.",
      },
      {
        alt: "Author's supervision directly on site",
        caption:
          "Paper can bear anything, but the reality of raw concrete forgives no mistakes. That is why a project's story does not end with the handover of drawings. We stand with you directly on site, where our author's supervision guarantees that what we drew will work flawlessly in the real world.",
      },
    ],
    team: {
      intro:
        "Architecture is not a product of software, but of people. That is why we pair three decades of proven building experience with the energy of a new generation. We are two generations, three perspectives and one growing team, shaping quiet space for life together.",
      pavol: {
        bio: [
          "The man who stood at the very birth of the studio and laid the firm foundations we still build on today. With more than three decades of invaluable engineering and construction experience, he brought strict technical discipline, uncompromising rigour and a deep respect for honest building detail into our work. For Pavol, architecture never ended with lines on paper – the real truth about a space was always proven directly on the construction site.",
          "His lifelong practice shaped the studio's identity as a place where bold creativity answers to the strict logic of buildability. Today, as the new generation smoothly takes over the lead, his legacy of technical excellence and craft truthfulness remains our firmest pillar.",
        ],
        name: "Ing. Pavol Fotta",
        role: "Founder of the studio",
      },
      duo: {
        bio: [
          "New energy pushing the studio's boundaries. Tomáš and Dominik smoothly took over the family firm with a clear vision – to combine decades of proven engineering foundations with clean minimalism and progressive technologies.",
          "They bring new standards into the process, from 3D printing and scanning to the search for raw, truthful materials. Their shared goal is to create architecture that never shouts visually, yet performs absolutely flawlessly in the real world.",
        ],
        members: [
          { name: "Dominik Fotta", role: "Studio partner" },
          { name: "Ing. arch. Ing. Tomáš Popadič", role: "Studio partner" },
        ],
      },
      galleryLabel: "Our team",
      members: [
        { name: "Ing. Marek Dufala", role: "Project engineer" },
        { name: "Ing. arch. Natália Čuntová", role: "External architect" },
        { name: "Petra Lacová", role: "Architecture student" },
        { name: "Ing. arch. Miriam Sabolová", role: "Project engineer" },
        { name: "Ing. Jozef Bajus", role: "Project engineer" },
        { name: "Ing. arch. Lenka Semanová", role: "Architect" },
        { name: "Ing. Peter Hudák", role: "Structural engineer" },
        { name: "Ing. Katarína Onuferová", role: "Civil engineer" },
      ],
    },
  },
};
