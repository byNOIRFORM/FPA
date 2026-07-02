/**
 * Projects i18n + data — project detail pages (Figma "projektDetail_final",
 * node 3227:622). Values are taken 1:1 from that frame at the 1440 canvas
 * (28px gutters → 1384 content), then scaled responsively in
 * ProjectPage.astro the same way the rest of the site scales.
 *
 * CMS-READY (still phase 1 = hardcoded): the page is a fixed spine —
 * hero → word-scrub intro → context + meta → [content blocks] → drag
 * gallery → related → footer — where the middle is an ORDERED ARRAY of
 * typed content blocks. A future CMS renders exactly this array; block
 * order + `kind` drive the layout with zero component changes. Text on
 * blocks is a per-language map (`Localized<T>`), so one project document
 * carries all three languages exactly like a field-i18n CMS entry would.
 *
 * Optional meta rows: each row is an object in an array. A row with an
 * empty `value` is dropped at render time (no "—", no empty line) — the
 * behaviour the CMS needs when a field is left blank.
 *
 * Images are the real per-slot shots exported from the Figma frame
 * (public/images/projects/chata/{hero,context,block-*,duo-*,gallery-*}.jpg),
 * one file per slot. Future projects supply their own set via the CMS.
 */
import { home, type Lang } from "./home";

/** A value that exists in every site language. */
export type Localized<T> = Record<Lang, T>;

/** One image reference + its intrinsic ratio (keeps the parallax / gallery
 *  frame proportional to the exact Figma px dimensions). */
export interface ProjectImage {
  image: string;
  ratio: string; // e.g. "1384 / 1024"
  alt?: string;
}

/** One key/value line in a spec-style table. Dropped when `value` is empty. */
export interface SpecRow {
  label: string;
  value: string;
}

/**
 * Ordered content blocks between the context section and the drag gallery.
 *  - photo : full-bleed image, inner parallax (Sekcia 4 / 6 / 10)
 *  - text  : 48px title in the left column · body paragraphs on the right
 *            (Sekcia 5 / 7 / 9)
 *  - duo   : small landscape image (left) + tall portrait image (right)
 *            (Sekcia 8)
 *  - spec  : 48px title (left) · key/value table on the right
 *            ("Technické špecifikácie")
 */
export type ContentBlock =
  | { kind: "photo"; media: ProjectImage }
  | { kind: "text"; title: Localized<string>; body: Localized<string[]> }
  | { kind: "duo"; left: ProjectImage; right: ProjectImage }
  | { kind: "spec"; title: Localized<string>; rows: Localized<SpecRow[]> };

/** The fixed, per-language content of the spine sections. */
export interface ProjectLocale {
  title: string; // hero + <title>
  intro: string; // big word-scrub sentence (Sekcia 2)
  contextBody: string[]; // "Kontext a osadenie" paragraphs (Sekcia 3, right col)
  meta: SpecRow[]; // Rok / Klient / Krajina / Kategória / Architekt
  heroAlt: string;
  contextAlt: string;
}

export interface ProjectDetail {
  slug: string;
  heroImage: string;
  contextImage: string; // Sekcia 3 portrait
  blocks: ContentBlock[]; // Sekcia 4 … Technické špecifikácie
  gallery: ProjectImage[]; // drag gallery (1 = static full-width, 2+ = draggable)
  locales: Record<Lang, ProjectLocale>;
}

/* ============================================================
   Section labels per language (fixed UI chrome, not content).
   ============================================================ */
export const projectsUI: Record<
  Lang,
  { contextLabel: string; relatedLabel: string; relatedCta: string; dragLabel: string }
> = {
  sk: {
    contextLabel: "Kontext a osadenie",
    relatedLabel: "Ďalšie projekty",
    relatedCta: "Všetky projekty",
    dragLabel: "Ťahajte",
  },
  cz: {
    contextLabel: "Kontext a osazení",
    relatedLabel: "Další projekty",
    relatedCta: "Všechny projekty",
    dragLabel: "Táhněte",
  },
  en: {
    contextLabel: "Context & setting",
    relatedLabel: "More projects",
    relatedCta: "All projects",
    dragLabel: "Drag",
  },
};

/* ============================================================
   Works grid ↔ projects. Index-aligned with home[lang].works.projects
   so a tile knows its slug, image and (localised) category.
   ============================================================ */
export const worksImages = [
  "/images/works/work-1.jpg",
  "/images/works/work-2.jpg",
  "/images/works/work-3.jpg",
  "/images/works/work-4.jpg",
  "/images/works/work-5.jpg",
  "/images/works/work-6.jpg",
];

export const worksProjectSlugs = [
  "chata-pod-korunami",
  "vila-na-kopci",
  "dom-pri-vodnej-hladine",
  "bistro-koncept",
  "atelier-linea",
  "kniznica-archiv",
];

// Categories = the building types offered in /sluzby (services-page.ts →
// buildingTypes), index-aligned with home[lang].works.projects:
//   Chata → Rekreačné a športové stavby, Vila / Dom → Rodinné domy,
//   Bistro / Knižnica → Verejné budovy, Ateliér → Priemyselné stavby.
export const relatedCategories: Record<Lang, string[]> = {
  sk: ["Rekreačné a športové stavby", "Rodinné domy", "Rodinné domy", "Verejné budovy", "Priemyselné stavby", "Verejné budovy"],
  cz: ["Rekreační a sportovní stavby", "Rodinné domy", "Rodinné domy", "Veřejné budovy", "Průmyslové stavby", "Veřejné budovy"],
  en: ["Leisure & sports facilities", "Family houses", "Family houses", "Public buildings", "Industrial structures", "Public buildings"],
};

/* ============================================================
   The projects. Phase 1 = one fully built sample.
   ============================================================ */

// Reused block texts, kept out of the object literal for readability.
const constructionText = {
  title: {
    sk: "Surová úprimnosť konštrukcie",
    cz: "Surová upřímnost konstrukce",
    en: "The raw honesty of structure",
  },
  body: {
    sk: [
      "Sme presvedčení, že pravdivá architektúra nemá pred užívateľom nič skrývať a jej konštrukčná podstata by mala byť čitateľná na prvý pohľad. Počas realizačnej fázy sme preto pristúpili k radikálnemu riešeniu a ponechali sme kompletný nosný systém stĺpikovej drevenej konštrukcie v interiéri plne obnažený. Masívne smrekové trámy boli ošetrené výhradne transparentným prírodným olejom s prímesou včelieho vosku, čo materiálu umožňuje voľne dýchať, pracovať a rozvíjať prirodzenú patinu.",
      "Drevo tak zámerne priznáva svoju surovú textúru, drobné praskliny, hrče aj postupné tmavnutie vplyvom času a slnka. Každý tesársky spoj, čap a kovový svorník zostal odhalený, čím stavba vizuálne komunikuje samotný proces svojho vzniku a nekompromisnú remeselnú presnosť, s akou musela byť poskladaná priamo na odľahlom horskom pozemku.",
      "Tento prístup úplne eliminoval potrebu dodatočných sadrokartónových obkladov, znížil celkovú uhlíkovú stopu interiéru a vytvoril hlboké akustické a hmatové teplo, ktoré človeka po vstupe okamžite obklopí.",
    ],
    cz: [
      "Jsme přesvědčeni, že pravdivá architektura nemá před uživatelem nic skrývat a její konstrukční podstata by měla být čitelná na první pohled. Během realizační fáze jsme proto přistoupili k radikálnímu řešení a ponechali jsme kompletní nosný systém sloupkové dřevěné konstrukce v interiéru plně obnažený. Masivní smrkové trámy byly ošetřeny výhradně transparentním přírodním olejem s příměsí včelího vosku, což materiálu umožňuje volně dýchat, pracovat a rozvíjet přirozenou patinu.",
      "Dřevo tak záměrně přiznává svou surovou texturu, drobné praskliny, suky i postupné tmavnutí vlivem času a slunce. Každý tesařský spoj, čep a kovový svorník zůstal odhalený, čímž stavba vizuálně komunikuje samotný proces svého vzniku a nekompromisní řemeslnou přesnost, s jakou musela být poskládána přímo na odlehlém horském pozemku.",
      "Tento přístup zcela eliminoval potřebu dodatečných sádrokartonových obkladů, snížil celkovou uhlíkovou stopu interiéru a vytvořil hluboké akustické a hmatové teplo, které člověka po vstupu okamžitě obklopí.",
    ],
    en: [
      "We are convinced that truthful architecture should hide nothing from its occupant, and that its structural essence ought to be legible at first glance. During construction we therefore took a radical route and left the entire load-bearing system of the timber post-and-beam frame fully exposed inside. The solid spruce beams were treated with nothing but a transparent natural oil blended with beeswax, letting the material breathe, move and develop its own patina.",
      "The wood thus deliberately admits its raw texture, its small cracks and knots and its gradual darkening under time and sun. Every carpentry joint, dowel and steel bolt was left visible, so the building openly communicates the very process of its making and the uncompromising craftsmanship with which it had to be assembled on a remote mountain site.",
      "This approach removed the need for any additional plasterboard lining, lowered the interior's overall carbon footprint and created a deep acoustic and tactile warmth that wraps around you the moment you step inside.",
    ],
  },
};

const nonDominantText = {
  title: {
    sk: "Architektúra, ktorá nedominuje",
    cz: "Architektura, která nedominuje",
    en: "Architecture that does not dominate",
  },
  body: {
    sk: [
      "Hlavným koncepčným zámerom bolo vytvoriť priestorový zážitok, ktorý vedome očistí myseľ užívateľa od akéhokoľvek vizuálneho šumu mestského prostredia. Celková hmota chaty bola preto tvarovaná s prísnym ohľadom na siluetu okolitých vrchov a rytmus starých smrekov – ostrý sklon sedlovej strechy takmer dokonale kopíruje prirodzenú líniu svahu.",
      "Vonkajší plášť objektu je tvorený vertikálnym obkladom zo sibírskeho smrekovca bez umelých chemických povrchových úprav, vďaka čomu objekt v priebehu rokov prirodzene zosivie a vizuálne takmer úplne splynie s kôrou okolitých stromov.",
      "Rytmus fasádnych lamiel vytvára hlbokú hru svetla a tieňa, ktorá sa mení s každou pribúdajúcou hodinou a vizuálne rozbíja monolitický objem stavby na drobnejšie textúry.",
      "Kým spodný kamenný trakt slúži ako pevná, nepoddajná základňa odolávajúca vlhkosti a prívalom snehu, vrchná drevená časť pôsobí odľahčene, akoby jemne levitovala nad samotným terénom. Tento tektonický kontrast jasne definuje vnútorné rozdelenie chaty na intímnu, chránenú zónu a otvorený, svetlom zaliaty spoločný priestor.",
    ],
    cz: [
      "Hlavním koncepčním záměrem bylo vytvořit prostorový zážitek, který vědomě očistí mysl uživatele od jakéhokoli vizuálního šumu městského prostředí. Celková hmota chaty byla proto tvarována s přísným ohledem na siluetu okolních vrchů a rytmus starých smrků – ostrý sklon sedlové střechy téměř dokonale kopíruje přirozenou linii svahu.",
      "Vnější plášť objektu je tvořen vertikálním obkladem ze sibiřského modřínu bez umělých chemických povrchových úprav, díky čemuž objekt v průběhu let přirozeně zešediví a vizuálně téměř úplně splyne s kůrou okolních stromů.",
      "Rytmus fasádních lamel vytváří hlubokou hru světla a stínu, která se mění s každou přibývající hodinou a vizuálně rozbíjí monolitický objem stavby na drobnější textury.",
      "Zatímco spodní kamenný trakt slouží jako pevná, nepoddajná základna odolávající vlhkosti a přívalům sněhu, vrchní dřevěná část působí odlehčeně, jako by jemně levitovala nad samotným terénem. Tento tektonický kontrast jasně definuje vnitřní rozdělení chaty na intimní, chráněnou zónu a otevřený, světlem zalitý společný prostor.",
    ],
    en: [
      "The chief conceptual aim was to create a spatial experience that consciously clears the occupant's mind of any visual noise carried over from the urban environment. The overall mass of the cabin was therefore shaped in strict deference to the silhouette of the surrounding peaks and the rhythm of the old spruces – the steep pitch of the gabled roof almost perfectly traces the natural line of the slope.",
      "The building's outer skin is a vertical cladding of Siberian larch left free of any artificial chemical treatment, so that over the years the structure greys naturally and visually all but merges with the bark of the surrounding trees.",
      "The rhythm of the façade battens creates a deep play of light and shadow that shifts with every passing hour and visually breaks the monolithic volume of the building down into finer textures.",
      "While the lower stone tract serves as a firm, unyielding base resisting damp and heavy snowfall, the upper timber part feels weightless, as if gently levitating above the terrain itself. This tectonic contrast clearly defines the cabin's internal division into an intimate, sheltered zone and an open, light-filled shared space.",
    ],
  },
};

const detailText = {
  title: {
    sk: "Detail, ktorý dýcha",
    cz: "Detail, který dýchá",
    en: "A detail that breathes",
  },
  body: {
    sk: [
      "Dispozícia interiéru je striktne organizovaná okolo vertikálneho betónového jadra s integrovaným krbom, ktorý tvorí gravitačné a spoločenské centrum celej chaty. Surový, ručne odlievaný pohľadový betón so stopami po tesárskom debnení tu vstupuje do priameho materiálového dialógu s mäkkým, hrejivým tónom celodreveného obkladu stien a stropu. Vnútorný priestor sa vertikálne otvára až do samotného krovu, čím dosahuje prekvapivú vzdušnosť, veľkorysosť a monumentalitu na relatívne racionálnej a malej zastavanej ploche.",
      "Všetok zabudovaný nábytok a interiérové prvky boli navrhnuté na mieru z rovnakej dreviny ako obklady stien. Vďaka tomu jednotlivé interiérové dvere, úložné priestory a technické niky dokonale splývajú s vertikálnym rastrom panelov a nevytvárajú v priestore žiadne vizuálne bariéry ani optický hluk. Umelé osvetlenie bolo integrované skryto priamo do konštrukčných spojov v trámoch, takže svetlo neoslňuje, ale mäkko steká po surových štruktúrach materiálov. Nasledujúca séria kurátorsky vybraných záberov dokumentuje tieto plynulé prechody medzi jednotlivými zónami, kde bol kladený absolútny dôraz na hmatový detail, čistotu nadväznosti plôch a nekompromisnú materiálovú kontinuitu.",
    ],
    cz: [
      "Dispozice interiéru je striktně organizována okolo vertikálního betonového jádra s integrovaným krbem, které tvoří gravitační a společenské centrum celé chaty. Surový, ručně litý pohledový beton se stopami po tesařském bednění zde vstupuje do přímého materiálového dialogu s měkkým, hřejivým tónem celodřevěného obkladu stěn a stropu. Vnitřní prostor se vertikálně otevírá až do samotného krovu, čímž dosahuje překvapivé vzdušnosti, velkorysosti a monumentality na relativně racionální a malé zastavěné ploše.",
      "Veškerý zabudovaný nábytek a interiérové prvky byly navrženy na míru ze stejné dřeviny jako obklady stěn. Díky tomu jednotlivé interiérové dveře, úložné prostory a technické niky dokonale splývají s vertikálním rastrem panelů a nevytvářejí v prostoru žádné vizuální bariéry ani optický hluk. Umělé osvětlení bylo integrováno skrytě přímo do konstrukčních spojů v trámech, takže světlo neoslňuje, ale měkce stéká po surových strukturách materiálů. Následující série kurátorsky vybraných záběrů dokumentuje tyto plynulé přechody mezi jednotlivými zónami, kde byl kladen absolutní důraz na hmatový detail, čistotu návaznosti ploch a nekompromisní materiálovou kontinuitu.",
    ],
    en: [
      "The interior layout is strictly organised around a vertical concrete core with an integrated hearth, which forms the gravitational and social centre of the whole cabin. Raw, hand-cast exposed concrete bearing the marks of its timber formwork enters here into a direct material dialogue with the soft, warm tone of the all-timber lining of the walls and ceiling. The interior opens vertically all the way up into the roof structure, achieving a surprising airiness, generosity and monumentality on a relatively rational and small footprint.",
      "All the built-in furniture and interior elements were designed bespoke from the same timber as the wall lining. As a result the individual interior doors, storage spaces and service niches merge perfectly with the vertical grid of panels and create no visual barriers or optical noise in the space. Artificial lighting was integrated invisibly into the structural joints within the beams, so that the light does not glare but flows softly across the raw material structures. The following series of curated frames documents these seamless transitions between zones, where absolute emphasis was placed on tactile detail, purity of surface continuity and uncompromising material continuity.",
    ],
  },
};

const techSpec = {
  title: {
    sk: "Technické špecifikácie",
    cz: "Technické specifikace",
    en: "Technical specifications",
  },
  rows: {
    sk: [
      { label: "Zastavaná plocha", value: "114 m²" },
      { label: "Úžitková plocha", value: "142 m²" },
      { label: "Obstavaný priestor", value: "510 m³" },
      { label: "Konštrukčný systém", value: "Celodrevená stĺpiková konštrukcia (KVH)" },
      { label: "Hlavné materiály", value: "Lokálny pieskovec, sibírsky smrekovec, pohľadový betón" },
    ],
    cz: [
      { label: "Zastavěná plocha", value: "114 m²" },
      { label: "Užitná plocha", value: "142 m²" },
      { label: "Obestavěný prostor", value: "510 m³" },
      { label: "Konstrukční systém", value: "Celodřevěná sloupková konstrukce (KVH)" },
      { label: "Hlavní materiály", value: "Lokální pískovec, sibiřský modřín, pohledový beton" },
    ],
    en: [
      { label: "Built-up area", value: "114 m²" },
      { label: "Usable floor area", value: "142 m²" },
      { label: "Enclosed volume", value: "510 m³" },
      { label: "Structural system", value: "All-timber post-and-beam frame (KVH)" },
      { label: "Primary materials", value: "Local sandstone, Siberian larch, exposed concrete" },
    ],
  },
};

export const projects: ProjectDetail[] = [
  {
    slug: "chata-pod-korunami",
    heroImage: "/images/projects/chata/hero.jpg",
    contextImage: "/images/projects/chata/context.jpg",
    blocks: [
      { kind: "photo", media: { image: "/images/projects/chata/block-1.jpg", ratio: "1384 / 780" } },
      { kind: "text", title: constructionText.title, body: constructionText.body },
      { kind: "photo", media: { image: "/images/projects/chata/block-2.jpg", ratio: "1384 / 780" } },
      { kind: "text", title: nonDominantText.title, body: nonDominantText.body },
      {
        kind: "duo",
        left: { image: "/images/projects/chata/duo-left.jpg", ratio: "445 / 478" },
        right: { image: "/images/projects/chata/duo-right.jpg", ratio: "680 / 698" },
      },
      { kind: "text", title: detailText.title, body: detailText.body },
      { kind: "photo", media: { image: "/images/projects/chata/block-3.jpg", ratio: "1384 / 780" } },
      { kind: "spec", title: techSpec.title, rows: techSpec.rows },
    ],
    // Drag gallery — uniform 780px height (matches the full-width photos +
    // /sluzby stages band); widths from each frame's ratio (Figma: four
    // 1267-wide landscapes + one 480-wide portrait).
    gallery: [
      { image: "/images/projects/chata/gallery-1.jpg", ratio: "1267 / 780" },
      { image: "/images/projects/chata/gallery-2.jpg", ratio: "480 / 780" },
      { image: "/images/projects/chata/gallery-3.jpg", ratio: "1267 / 780" },
      { image: "/images/projects/chata/gallery-4.jpg", ratio: "1267 / 780" },
      { image: "/images/projects/chata/gallery-5.jpg", ratio: "1267 / 780" },
    ],
    locales: {
      sk: {
        title: home.sk.works.projects[0].title,
        intro:
          "Harmonické prepojenie surového kameňa a hrejivého dreva v objatí prírody. Architektúra, ktorá rešpektuje vertikalitu okolitého lesa.",
        heroAlt: home.sk.works.projects[0].alt,
        contextAlt: "Chata pod korunami — interiér s presklením do lesa",
        contextBody: [
          "Pozemok na severovýchodnom svahu na okraji hustého ihličnatého lesa si vyžadoval prístup, ktorý stavbu nepovýši nad okolité prostredie, ale hlboko integrovaným spôsobom ju včlení do existujúceho ekosystému. Chata dôsledne rešpektuje vrstevnice a prudký sklon horského terénu – namiesto masívnych výkopových prác a hrubých zásahov do krajiny radšej organicky stúpa spolu s ním.",
          "Architektonické riešenie stavia na dvoch protichodných, no doplňujúcich sa prvkoch: masívnom sokli z lokálneho lomového kameňa, ktorý stavbu nekompromisne ukotvuje v podloží, a subtílnej, vertikálne orientovanej drevenej konštrukcii. Tá sa vo vrchnej časti otvára smerom do korún stromov a maximálne prepája interiér s bezprostredným okolím. Orientácia zasklených plôch bola precízne simulovaná vzhľadom na dráhu slnka počas zimných a letných mesiacov.",
          "Každý výrez vo fasáde tak nefunguje len ako pasívny zdroj svetla a tepla, ale ako presne orezaný živý obraz. Ten bez filtra reaguje na drsné premeny tatranskej klímy – od ostrého poludňajšieho azúru až po hustú rannú hmlu, ktorá sa pravidelne prevaľuje pomedzi smrekové kmene priamo pred oknami obývacej izby.",
        ],
        meta: [
          { label: "Rok", value: "2025" },
          { label: "Klient", value: "Peter Karpát" },
          { label: "Krajina", value: "Slovensko" },
          { label: "Kategória", value: "Rekreačné a športové stavby" },
          { label: "Architekt", value: "Fotta Popadič" },
        ],
      },
      cz: {
        title: home.cz.works.projects[0].title,
        intro:
          "Harmonické propojení surového kamene a hřejivého dřeva v objetí přírody. Architektura, která respektuje vertikalitu okolního lesa.",
        heroAlt: home.cz.works.projects[0].alt,
        contextAlt: "Chata pod korunami — interiér s prosklením do lesa",
        contextBody: [
          "Pozemek na severovýchodním svahu na okraji hustého jehličnatého lesa vyžadoval přístup, který stavbu nepovýší nad okolní prostředí, ale hluboce integrovaným způsobem ji včlení do stávajícího ekosystému. Chata důsledně respektuje vrstevnice a prudký sklon horského terénu – namísto masivních výkopových prací a hrubých zásahů do krajiny raději organicky stoupá spolu s ním.",
          "Architektonické řešení staví na dvou protichůdných, avšak doplňujících se prvcích: masivním soklu z lokálního lomového kamene, který stavbu nekompromisně ukotvuje v podloží, a subtilní, vertikálně orientované dřevěné konstrukci. Ta se ve vrchní části otevírá směrem do korun stromů a maximálně propojuje interiér s bezprostředním okolím. Orientace zasklených ploch byla precizně simulována vzhledem k dráze slunce během zimních a letních měsíců.",
          "Každý výřez ve fasádě tak nefunguje jen jako pasivní zdroj světla a tepla, ale jako přesně oříznutý živý obraz. Ten bez filtru reaguje na drsné proměny tatranského klimatu – od ostrého poledního azuru až po hustou ranní mlhu, která se pravidelně převaluje pomezi smrkové kmeny přímo před okny obývacího pokoje.",
        ],
        meta: [
          { label: "Rok", value: "2025" },
          { label: "Klient", value: "Peter Karpát" },
          { label: "Země", value: "Slovensko" },
          { label: "Kategorie", value: "Rekreační a sportovní stavby" },
          { label: "Architekt", value: "Fotta Popadič" },
        ],
      },
      en: {
        title: home.en.works.projects[0].title,
        intro:
          "A harmonious pairing of raw stone and warm timber in the embrace of nature. Architecture that respects the verticality of the surrounding forest.",
        heroAlt: home.en.works.projects[0].alt,
        contextAlt: "Cabin Beneath the Canopy — interior glazing onto the forest",
        contextBody: [
          "A plot on the north-eastern slope at the edge of a dense coniferous forest called for an approach that would not raise the building above its surroundings but weave it, in a deeply integrated way, into the existing ecosystem. The cabin consistently respects the contour lines and the steep incline of the mountain terrain – instead of massive excavation and crude interventions in the landscape, it would rather climb organically together with it.",
          "The architectural solution rests on two opposing yet complementary elements: a massive plinth of local quarried stone that anchors the building uncompromisingly into the bedrock, and a slender, vertically oriented timber structure. In its upper part the latter opens toward the treetops and connects the interior with its immediate surroundings to the fullest. The orientation of the glazed surfaces was precisely simulated with respect to the path of the sun through the winter and summer months.",
          "Each opening in the façade therefore works not merely as a passive source of light and heat but as a precisely cropped living picture. It responds, unfiltered, to the harsh shifts of the Tatra climate – from the sharp midday azure to the dense morning fog that rolls regularly between the spruce trunks right in front of the living-room windows.",
        ],
        meta: [
          { label: "Year", value: "2025" },
          { label: "Client", value: "Peter Karpát" },
          { label: "Country", value: "Slovakia" },
          { label: "Category", value: "Leisure & sports facilities" },
          { label: "Architect", value: "Fotta Popadič" },
        ],
      },
    },
  },
];

export const projectsBySlug = new Map(projects.map((p) => [p.slug, p]));
export const availableProjectSlugs = new Set(projects.map((p) => p.slug));

/** Language-aware path to a project detail page (SK has no prefix). */
export function projectHref(lang: Lang, slug: string): string {
  const prefix = lang === "sk" ? "" : `/${lang}`;
  return `${prefix}/projekty/${slug}`;
}
