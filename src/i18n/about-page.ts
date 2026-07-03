/**
 * /o-nas (About) page copy — Figma "oNás" (node 3227:348), built section by
 * section as the design lands (currently: hero → word-scrub intro →
 * "Počiatky spoločnosti" → footer; more sections will follow).
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
}

export const aboutPage: Record<Lang, AboutPageCopy> = {
  sk: {
    metaTitle: "O nás — Fotta // Popadič",
    heroTitle: "Za každou čiarou vidíme ľudské príbehy",
    intro:
      "Tvoríme tiché priestory pre skutočný život. Naša architektúra nemá byť hlučná, ale pravdivá – rodí sa z dialógu a poctivého remesla. Pozrite sa, ako tento postoj formujeme už od úplného začiatku.",
    origins: {
      label: "Počiatky spoločnosti",
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
        alt: "Autorský dozor priamo na stavbe",
        caption:
          "Papier znesie všetko, no realita surového betónu neodpúšťa chyby. Príbeh projektu preto nekončí odovzdaním výkresov. Sme s vami priamo na stavbe, kde formou autorského dozoru garantujeme, že to, čo sme nakreslili, bude v reálnom svete bezchybne fungovať.",
      },
    ],
  },
  cz: {
    metaTitle: "O nás — Fotta // Popadič",
    heroTitle: "Za každou čárou vidíme lidské příběhy",
    intro:
      "Tvoříme tiché prostory pro skutečný život. Naše architektura nemá být hlučná, ale pravdivá – rodí se z dialogu a poctivého řemesla. Podívejte se, jak tento postoj formujeme už od úplného začátku.",
    origins: {
      label: "Počátky společnosti",
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
        alt: "Autorský dozor přímo na stavbě",
        caption:
          "Papír snese všechno, ale realita surového betonu chyby neodpouští. Příběh projektu proto nekončí odevzdáním výkresů. Jsme s vámi přímo na stavbě, kde formou autorského dozoru garantujeme, že to, co jsme nakreslili, bude v reálném světě bezchybně fungovat.",
      },
    ],
  },
  en: {
    metaTitle: "About us — Fotta // Popadič",
    heroTitle: "Behind every line we see human stories",
    intro:
      "We create quiet spaces for real life. Our architecture is not meant to be loud but truthful – born of dialogue and honest craft. See how we have been shaping this stance from the very beginning.",
    origins: {
      label: "Company origins",
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
        alt: "Author's supervision directly on site",
        caption:
          "Paper can bear anything, but the reality of raw concrete forgives no mistakes. That is why a project's story does not end with the handover of drawings. We stand with you directly on site, where our author's supervision guarantees that what we drew will work flawlessly in the real world.",
      },
    ],
  },
};
