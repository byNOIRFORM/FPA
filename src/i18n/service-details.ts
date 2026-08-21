/**
 * Service detail copy — the long-form text shown in the right-side detail
 * panel (ServiceDetail.astro) when a "Dozvedieť sa viac" link is clicked.
 *
 * `index` ties a detail to its row in the Services spec-sheet (see the
 * `META` array in lib/services-data.ts): 0 Územná štúdia,
 * 1 Architektonická štúdia, 2 Stavebný zámer, 3 Projekt stavby,
 * 4 Realizačná dokumentácia, 5 3D sken.
 *
 * SHAPE: title → grey lead-in → hairline → body. The lead-in is left
 * EMPTY on purpose: the adapter (lib/services-data.ts) fills it with the
 * service's own row description in both the CMS and the fallback path, so
 * the panel opens on the same sentence the row promised and that sentence
 * is never maintained in two places. Fill `intro` only to override it.
 *
 * The body lives in `sections`, whose `heading` is OPTIONAL — the main
 * text block runs without one, "Legislatíva a štandardy" carries it.
 * Inside a body a BLANK LINE splits paragraphs, while consecutive LINES
 * (no blank line) render as a bullet list — that's the legislation
 * blocks. Same rules apply to what an editor types in Studio.
 *
 * Indices are the same across languages, so detailIndices is derived
 * from the SK set.
 */
import type { Lang } from "./home";

export interface DetailSection {
  /** Empty = the block renders without a subtitle. */
  heading: string;
  body: string;
}

export interface ServiceDetailData {
  index: number;
  title: string;
  /** Empty = the adapter substitutes the service's row description. */
  intro: string;
  sections: DetailSection[];
}

export const serviceDetails: Record<Lang, ServiceDetailData[]> = {
  sk: [
    {
      index: 0,
      title: "Územná štúdia",
      intro: "",
      sections: [
        { heading: "", body: "Územná štúdia (podkladová štúdia) podrobne analyzuje danú lokalitu a navrhuje jej optimálne funkčné využitie. Podľa aktuálnej legislatívy slúži ako oficiálny územnoplánovací podklad, ktorým overujeme zastavovaciu reguláciu a zosúlaďujeme rozvojové zámery s existujúcim prostredím.\n\nTento krok je nevyhnutný pri plánovaní polyfunkčných štvrtí, obytných zón či priemyselných areálov, alebo v situácii, keď je potrebné zosúladiť investičný zámer s mestom a otvoriť cestu k zmene územného plánu. Štúdia včas odhaľuje limity pozemku a eliminuje investičné riziká ešte pred fázou samotného projektovania." },
        { heading: "Legislatíva a štandardy", body: "Zákon č. 200/2022 Z. z. o územnom plánovaní (§ 16)\nVyhláška č. 392/2023 Z. z. o územnoplánovacích podkladoch (§ 4)\nVyhláška č. 153/2024 Z. z. o štandardoch spracovania podkladov" },
      ],
    },
    {
      index: 1,
      title: "Architektonická štúdia",
      intro: "",
      sections: [
        { heading: "", body: "Architektonická štúdia je najdôležitejšou kreatívnou fázou celého procesu. Predstavuje koncept ušitý na mieru, ktorý rieši hmotové, dispozičné a funkčné usporiadanie stavby. Práve tu definujeme architektúru, dizajn a základné materiálové zloženie budúceho objektu.\n\nSúčasťou štúdie je aj overenie súladu s územným plánom a regulatívmi daného územia. Výstupom je čistý architektonický základ, ktorý obsahuje situačný výkres, schémy, 3D vizualizácie a sprievodnú správu s výmerami plôch. Hlavným benefitom je získanie pevného a overeného základu pre oficiálne projektovanie, čím sa predchádza drahým zmenám a kompromisom v neskorších fázach." },
      ],
    },
    {
      index: 2,
      title: "Stavebný zámer",
      intro: "",
      sections: [
        { heading: "", body: "Podľa novej legislatívy nahrádza Stavebný zámer (SZ) pôvodné územné konanie a spája ho so stavebným povolením do jedného integrovaného procesu. Všetky kľúčové parametre stavby sa tak riešia hneď na začiatku, čo prispieva k plynulejšiemu schvaľovaniu.\n\nPre projekt kompletne pripravujeme digitálny balík, ktorý rieši urbanisticko-architektonický vzhľad, presné osadenie objektu na pozemku, trasovanie prípojok, požiarnu bezpečnosť a vyhodnotenie stanovísk dotknutých orgánov. Dokumentáciu nahrávame priamo do Informačného systému výstavby. Výstupom úspešného konania je právoplatné Rozhodnutie o povolení stavebného zámeru, na ktoré plynule nadväzujeme vypracovaním Projektu stavby (PS)." },
        { heading: "Legislatíva a štandardy", body: "Stavebný zákon č. 25/2025 Z. z. (integrované povoľovanie stavieb)\nVyhláška ÚÚPV SR č. 60/2025 Z. z., Príloha č. 15 (štruktúra dokumentácie)\nVyhláška č. 59/2025 Z. z. (zatriedenie stavby)" },
      ],
    },
    {
      index: 3,
      title: "Projekt stavby",
      intro: "",
      sections: [
        { heading: "", body: "Projekt stavby logicky nasleduje po schválení stavebného zámeru. V tejto fáze sa architektonický koncept transformuje do exaktných technických výkresov a špecifikácií potrebných pre zhotovenie stavby a kalkuláciu nákladov.\n\nCelú dokumentáciu, vrátane všetkých profesií (statika, zdravotechnika, elektroinštalácie atď.), spracovávame v prostredí BIM (Building Information Modeling). Vďaka koordinácii priamo v 3D modeli odhaľujeme a eliminujeme prípadné kolízie ešte pred samotným výkopom.\n\nAby bolo možné legálne začať stavať, dokumentácia musí získať Doložku súladu od dotknutých orgánov a následné oficiálne Overenie projektu stavebným úradom. Celý inžiniering a komunikáciu s úradmi zastrešujeme kompletne za vás." },
        { heading: "Legislatíva a štandardy", body: "Zákon č. 25/2025 Z. z. (Stavebný zákon)\nVyhláška č. 60/2025 Z. z. (rozsah a obsah projektu pre Portál výstavby)\nZákon č. 138/1992 Zb. (o autorizovaných architektoch)\nZáväzné technické normy STN a Eurokódy" },
      ],
    },
    {
      index: 4,
      title: "Realizačná dokumentácia",
      intro: "",
      sections: [
        { heading: "", body: "Súčasná legislatíva striktne oddeľuje dokumentáciu projektanta od realizačných podkladov zhotoviteľa. Naša služba pokrýva celý tento proces, čím chránime vaše záujmy ako investora. Pre náročné stavby vypracúvame samostatný Vykonávací projekt, ktorý presne špecifikuje trasovanie inštalácií a konštrukčné detaily, aby stavebná firma vedela, čo a ako má postaviť.\n\nZároveň poskytujeme zhotoviteľom súčinnosť pri ich výrobnej príprave (kladačské plány, dielenské výkresy) a prostredníctvom autorského dozoru sme vašimi očami na stavenisku. Na konci stavebného procesu koordinujeme finálny pasport stavby (DSZ). Detailná realizačná dokumentácia znamená presný rozpočet bez prekvapení, koniec improvizácii na stavbe a hladký priebeh kolaudácie." },
        { heading: "Legislatíva a štandardy", body: "Stavebný zákon č. 25/2025 Z. z.\nVyhláška ÚÚPV SR č. 60/2025 Z. z. (Príloha č. 18, 19 a 21)\nZákon č. 124/2006 Z. z. (BOZP)" },
      ],
    },
    {
      index: 5,
      title: "3D sken",
      intro: "",
      sections: [
        { heading: "", body: "Zabezpečujeme presné digitálne zameranie budov a konštrukčných detailov pomocou kompaktného zariadenia, ktoré kombinuje vysokorýchlostné laserové meranie s HDR fotografickým snímaním. Technológia dosahuje presnosť merania 4 mm na vzdialenosť 10 metrov a je optimalizovaná aj na prácu v stiesnených priestoroch (šachty, podkrovia).\n\nVýstupom skenovania je presné mračno bodov (Point Cloud) a súbor sférických fotografií pre vizuálnu kontrolu objektu z prehliadača. Dáta primárne slúžia ako nepriestrelný podklad pre rekonštrukcie, pasportizáciu objektov a pamiatkovú obnovu. Službu poskytujeme aj externe, pričom na základe skenu vieme vypracovať kompletnú 2D výkresovú dokumentáciu alebo parametrický 3D model pre softvéry Archicad či Revit." },
      ],
    },
  ],

  cz: [
    {
      index: 0,
      title: "Územní studie",
      intro: "",
      sections: [
        { heading: "", body: "Územní studie (podkladová studie) podrobně analyzuje danou lokalitu a navrhuje její optimální funkční využití. Podle aktuální legislativy slouží jako oficiální územněplánovací podklad, kterým ověřujeme zastavovací regulaci a sjednocujeme rozvojové záměry s existujícím prostředím.\n\nTento krok je nezbytný při plánování polyfunkčních čtvrtí, obytných zón či průmyslových areálů, nebo v situaci, kdy je potřeba sladit investiční záměr s městem a otevřít cestu ke změně územního plánu. Studie včas odhaluje limity pozemku a eliminuje investiční rizika ještě před fází samotného projektování." },
        { heading: "Legislativa a standardy", body: "Zákon č. 200/2022 Z. z. o územnom plánovaní (§ 16)\nVyhláška č. 392/2023 Z. z. o územnoplánovacích podkladoch (§ 4)\nVyhláška č. 153/2024 Z. z. o štandardoch spracovania podkladov" },
      ],
    },
    {
      index: 1,
      title: "Architektonická studie",
      intro: "",
      sections: [
        { heading: "", body: "Architektonická studie je nejdůležitější kreativní fází celého procesu. Představuje koncept ušitý na míru, který řeší hmotové, dispoziční a funkční uspořádání stavby. Právě zde definujeme architekturu, design a základní materiálové složení budoucího objektu.\n\nSoučástí studie je i ověření souladu s územním plánem a regulativy daného území. Výstupem je čistý architektonický základ, který obsahuje situační výkres, schémata, 3D vizualizace a průvodní zprávu s výměrami ploch. Hlavním přínosem je získání pevného a ověřeného základu pro oficiální projektování, čímž se předchází drahým změnám a kompromisům v pozdějších fázích." },
      ],
    },
    {
      index: 2,
      title: "Stavební záměr",
      intro: "",
      sections: [
        { heading: "", body: "Podle nové legislativy nahrazuje Stavební záměr (SZ) původní územní řízení a spojuje ho se stavebním povolením do jednoho integrovaného procesu. Všechny klíčové parametry stavby se tak řeší hned na začátku, což přispívá k plynulejšímu schvalování.\n\nPro projekt kompletně připravujeme digitální balík, který řeší urbanisticko-architektonický vzhled, přesné osazení objektu na pozemku, trasování přípojek, požární bezpečnost a vyhodnocení stanovisek dotčených orgánů. Dokumentaci nahráváme přímo do Informačního systému výstavby. Výstupem úspěšného řízení je pravomocné Rozhodnutí o povolení stavebního záměru, na které plynule navazujeme vypracováním Projektu stavby (PS)." },
        { heading: "Legislativa a standardy", body: "Stavebný zákon č. 25/2025 Z. z. (integrované povolování staveb)\nVyhláška ÚÚPV SR č. 60/2025 Z. z., Príloha č. 15 (struktura dokumentace)\nVyhláška č. 59/2025 Z. z. (zatřídění stavby)" },
      ],
    },
    {
      index: 3,
      title: "Projekt stavby",
      intro: "",
      sections: [
        { heading: "", body: "Projekt stavby logicky následuje po schválení stavebního záměru. V této fázi se architektonický koncept transformuje do exaktních technických výkresů a specifikací potřebných pro zhotovení stavby a kalkulaci nákladů.\n\nCelou dokumentaci, včetně všech profesí (statika, zdravotechnika, elektroinstalace atd.), zpracováváme v prostředí BIM (Building Information Modeling). Díky koordinaci přímo ve 3D modelu odhalujeme a eliminujeme případné kolize ještě před samotným výkopem.\n\nAby bylo možné legálně začít stavět, musí dokumentace získat Doložku souladu od dotčených orgánů a následné oficiální Ověření projektu stavebním úřadem. Celý inženýring a komunikaci s úřady zastřešujeme kompletně za vás." },
        { heading: "Legislativa a standardy", body: "Zákon č. 25/2025 Z. z. (Stavebný zákon)\nVyhláška č. 60/2025 Z. z. (rozsah a obsah projektu pro Portál výstavby)\nZákon č. 138/1992 Zb. (o autorizovaných architektech)\nZávazné technické normy STN a Eurokódy" },
      ],
    },
    {
      index: 4,
      title: "Realizační dokumentace",
      intro: "",
      sections: [
        { heading: "", body: "Současná legislativa striktně odděluje dokumentaci projektanta od realizačních podkladů zhotovitele. Naše služba pokrývá celý tento proces, čímž chráníme vaše zájmy jako investora. Pro náročné stavby vypracováváme samostatný Prováděcí projekt, který přesně specifikuje trasování instalací a konstrukční detaily, aby stavební firma věděla, co a jak má postavit.\n\nZároveň poskytujeme zhotovitelům součinnost při jejich výrobní přípravě (kladečské plány, dílenské výkresy) a prostřednictvím autorského dozoru jsme vašima očima na staveništi. Na konci stavebního procesu koordinujeme finální pasport stavby (DSPS). Detailní realizační dokumentace znamená přesný rozpočet bez překvapení, konec improvizacím na stavbě a hladký průběh kolaudace." },
        { heading: "Legislativa a standardy", body: "Stavebný zákon č. 25/2025 Z. z.\nVyhláška ÚÚPV SR č. 60/2025 Z. z. (Príloha č. 18, 19 a 21)\nZákon č. 124/2006 Z. z. (BOZP)" },
      ],
    },
    {
      index: 5,
      title: "3D sken",
      intro: "",
      sections: [
        { heading: "", body: "Zajišťujeme přesné digitální zaměření budov a konstrukčních detailů pomocí kompaktního zařízení, které kombinuje vysokorychlostní laserové měření s HDR fotografickým snímáním. Technologie dosahuje přesnosti měření 4 mm na vzdálenost 10 metrů a je optimalizovaná i na práci ve stísněných prostorách (šachty, podkroví).\n\nVýstupem skenování je přesné mračno bodů (Point Cloud) a soubor sférických fotografií pro vizuální kontrolu objektu z prohlížeče. Data primárně slouží jako neprůstřelný podklad pro rekonstrukce, pasportizaci objektů a památkovou obnovu. Službu poskytujeme i externě, přičemž na základě skenu umíme vypracovat kompletní 2D výkresovou dokumentaci nebo parametrický 3D model pro softwary Archicad či Revit." },
      ],
    },
  ],

  en: [
    {
      index: 0,
      title: "Land-Use Study",
      intro: "",
      sections: [
        { heading: "", body: "A land-use study analyses a given site in detail and proposes its optimal functional use. Under the current legislation it serves as an official land-use planning document, the one we use to verify the development regulations and align the development intentions with the existing environment.\n\nThis step is essential when planning mixed-use districts, residential zones or industrial parks, or in a situation where an investment plan has to be agreed with the city and the way opened to an amendment of the zoning plan. The study reveals the limits of the plot early and eliminates investment risk before the design phase itself begins." },
        { heading: "Legislation and standards", body: "Zákon č. 200/2022 Z. z. o územnom plánovaní (§ 16)\nVyhláška č. 392/2023 Z. z. o územnoplánovacích podkladoch (§ 4)\nVyhláška č. 153/2024 Z. z. o štandardoch spracovania podkladov" },
      ],
    },
    {
      index: 1,
      title: "Architectural Study",
      intro: "",
      sections: [
        { heading: "", body: "The architectural study is the most important creative phase of the whole process. It is a tailor-made concept that resolves the massing, the layout and the functional arrangement of the building. This is where we define the architecture, the design and the basic material composition of the future object.\n\nThe study also verifies compliance with the zoning plan and the regulations of the given area. The result is a clean architectural foundation containing a site plan, schemes, 3D visualisations and an accompanying report with area schedules. The main benefit is a firm, verified basis for the official design work, which prevents expensive changes and compromises in later phases." },
      ],
    },
    {
      index: 2,
      title: "Building Intent",
      intro: "",
      sections: [
        { heading: "", body: "Under the new legislation, the Building Intent (SZ) replaces the former zoning procedure and merges it with the building permit into a single integrated process. All the key parameters of the building are therefore resolved right at the start, which makes approval run more smoothly.\n\nFor the project we prepare a complete digital package covering the urban and architectural appearance, the exact siting of the building on the plot, the routing of the utility connections, fire safety and the assessment of the statements of the authorities concerned. We upload the documentation directly into the construction information system. A successful procedure ends in a legally valid Decision permitting the building intent, which we follow up seamlessly with the Building Project (PS)." },
        { heading: "Legislation and standards", body: "Stavebný zákon č. 25/2025 Z. z. (integrated construction permitting)\nVyhláška ÚÚPV SR č. 60/2025 Z. z., Príloha č. 15 (structure of the documentation)\nVyhláška č. 59/2025 Z. z. (classification of the building)" },
      ],
    },
    {
      index: 3,
      title: "Building Project",
      intro: "",
      sections: [
        { heading: "", body: "The building project follows logically once the building intent has been approved. In this phase the architectural concept is transformed into the exact technical drawings and specifications needed to construct the building and to calculate its cost.\n\nWe process the entire documentation, including every engineering trade (structure, plumbing, electrical installations and so on), in BIM (Building Information Modeling). Coordinating directly in the 3D model lets us find and eliminate any clashes before the first trench is dug.\n\nTo start building legally, the documentation must obtain a certificate of compliance from the authorities concerned and then the official verification of the project by the building authority. We handle the entire engineering process and all communication with the authorities for you." },
        { heading: "Legislation and standards", body: "Zákon č. 25/2025 Z. z. (Building Act)\nVyhláška č. 60/2025 Z. z. (scope and content of the project for the construction portal)\nZákon č. 138/1992 Zb. (on chartered architects)\nBinding STN technical standards and Eurocodes" },
      ],
    },
    {
      index: 4,
      title: "Construction Documentation",
      intro: "",
      sections: [
        { heading: "", body: "Current legislation draws a strict line between the designer's documentation and the contractor's execution documents. Our service covers that whole process, which protects your interests as the investor. For demanding buildings we prepare a separate detailed design that specifies the routing of the installations and the structural details precisely, so the construction company knows exactly what to build and how.\n\nAt the same time we support contractors in their shop-drawing preparation (setting-out and workshop drawings) and, through author's supervision, we are your eyes on the site. At the end of the construction process we coordinate the final as-built record. Detailed construction documentation means an accurate budget with no surprises, an end to improvisation on site and a smooth final approval." },
        { heading: "Legislation and standards", body: "Stavebný zákon č. 25/2025 Z. z.\nVyhláška ÚÚPV SR č. 60/2025 Z. z. (Príloha č. 18, 19 a 21)\nZákon č. 124/2006 Z. z. (occupational health and safety)" },
      ],
    },
    {
      index: 5,
      title: "3D Scan",
      intro: "",
      sections: [
        { heading: "", body: "We provide precise digital surveying of buildings and structural details with a compact device that combines high-speed laser measurement with HDR photographic capture. The technology reaches a measuring accuracy of 4 mm at a distance of 10 metres and is optimised for work in confined spaces as well (shafts, attics).\n\nThe scan produces an accurate point cloud and a set of spherical photographs for inspecting the building visually from a browser. The data primarily serves as a bulletproof basis for renovations, building records and heritage restoration. We also offer the service externally: from the scan we can prepare complete 2D drawing documentation or a parametric 3D model for Archicad or Revit." },
      ],
    },
  ],
};

/** Row indices that have a written detail (same across languages). */
export const detailIndices = new Set(serviceDetails.sk.map((d) => d.index));
