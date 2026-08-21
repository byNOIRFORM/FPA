/**
 * Service detail copy — the long-form text shown in the right-side detail
 * panel (ServiceDetail.astro) when a "Dozvedieť sa viac" link is clicked.
 *
 * `index` ties a detail to its row in the Services spec-sheet (see the
 * `META` array in lib/services-data.ts): 0 Územná štúdia,
 * 1 Architektonická štúdia, 2 Stavebný zámer, 3 Projekt stavby,
 * 4 Realizačná dokumentácia, 5 3D sken.
 *
 * Architektonická štúdia (index 1) and 3D sken (index 5) are written —
 * add more entries (per language) and the matching row's link + panel
 * light up automatically. Indices are the same across languages, so
 * detailIndices is derived from the SK set.
 */
import type { Lang } from "./home";

export interface DetailSection {
  heading: string;
  body: string;
}

export interface ServiceDetailData {
  index: number;
  title: string;
  intro: string;
  sections: DetailSection[];
}

export const serviceDetails: Record<Lang, ServiceDetailData[]> = {
  sk: [
    {
      index: 1,
      title: "Architektonická štúdia",
      intro:
        "Architektonická štúdia nie je len prvý načrtnutý výkres. Je to surová DNA celého projektu. V tejto fáze definujeme rovnováhu medzi vašou predstavou, funkciou a kontextom miesta, kde bude objekt stáť. Pracujeme v šiestich základných rovinách:",
      sections: [
        { heading: "Estetika a príbeh", body: "Hľadáme jedinečnú vizuálnu identitu objektu. Dobrá architektúra nielen dobre vyzerá, ale nesie posolstvo, vyvoláva emócie a vytvára trvácnu estetickú hodnotu, ktorá nestarne." },
        { heading: "Funkcia a ľudský komfort", body: "Priestor navrhujeme zvnútra von. Sústredíme sa na nekompromisne logické dispozície, prácu s prirodzeným svetlom, vzdušnosť a ideálne proporcie každej jednej miestnosti." },
        { heading: "Technická prísnosť", body: "Kreatívnu víziu spájame s inžinierskou precíznosťou. Už v štúdii premýšľame nad konštrukčným systémom, hmatateľnými materiálmi a technickými limitmi tak, aby bol projekt reálne postaviteľný." },
        { heading: "Ekologická zodpovednosť", body: "Hľadáme spôsoby, ako stavbu organicky prepojiť s okolím. Navrhujeme energeticky efektívne riešenia a materiály, ktoré minimalizujú negatívny vplyv na životné prostredie." },
        { heading: "Sociálny rozmer", body: "Architektúra formuje prostredie, v ktorom žijeme. Či už ide o rodinný dom alebo verejný priestor, vytvárame miesta, ktoré prirodzene podporujú ľudskú interakciu a zvyšujú kvalitu každodenného života." },
        { heading: "Investičná hodnota", body: "Kvalitný architektonický návrh je investícia, nie náklad. Premyslené priestorové a materiálové riešenia výrazne zvyšujú trhovú hodnotu nehnuteľnosti a zabezpečujú jej dlhodobú nadčasovosť." },
      ],
    },
    {
      index: 5,
      title: "3D sken",
      intro:
        "Presné digitálne zameranie budov, interiérov a konštrukčných detailov technológiou 3D laserového skenovania. Používame ju pri vlastnej projekčnej činnosti a zároveň ju ponúkame ako samostatnú službu architektom, projektantom, developerom, pamiatkarom a realizátorom stavieb.",
      sections: [
        { heading: "Technológia a presnosť", body: "Skener kombinuje laserové meranie s HDR fotografiou: presnosť 4 mm na vzdialenosť 10 m, dosah do 45 metrov od stanovišťa a jedno 360° skenovanie v rozsahu od 28 sekúnd do 3 minút. Trojica 13 MP kamier k meraniu dopĺňa sférické panorámy." },
        { heading: "Zameranie skutočného stavu", body: "As-Built dokumentácia pre rekonštrukcie, prestavby a obnovu pamiatok. Namiesto ručného premeriavania dostávate vernú kópiu skutočného stavu vrátane deformácií, ktoré by pásmo nezachytilo." },
        { heading: "Podklady pre BIM a CAD", body: "Z mračna bodov staviame parametrický 3D model alebo klasické 2D výkresy. Projekt tak od prvej čiary sedí na realite, nie na archívnej dokumentácii spred desaťročí." },
        { heading: "Stavebná kontrola", body: "Porovnanie skutočného vyhotovenia s projektom odhalí odchýlky ešte v priebehu stavby — kým je ich oprava otázkou dní, nie búrania." },
        { heading: "Dokumentácia pred zakrytím", body: "Zameranie rozvodov a konštrukcií tesne pred ich zakrytím. Presná poloha inžinierskych sietí tak ostáva zdokumentovaná pre celú životnosť stavby." },
        { heading: "Formáty výstupov", body: "Mračno bodov v .E57, .RCP alebo .LGS, panoramatické dáta a podľa dohody aj 2D výkresová dokumentácia či 3D BIM model postavený zo skenu." },
      ],
    },
  ],

  cz: [
    {
      index: 1,
      title: "Architektonická studie",
      intro:
        "Architektonická studie není jen první načrtnutý výkres. Je to syrová DNA celého projektu. V této fázi definujeme rovnováhu mezi vaší představou, funkcí a kontextem místa, kde bude objekt stát. Pracujeme v šesti základních rovinách:",
      sections: [
        { heading: "Estetika a příběh", body: "Hledáme jedinečnou vizuální identitu objektu. Dobrá architektura nejen dobře vypadá, ale nese poselství, vyvolává emoce a vytváří trvalou estetickou hodnotu, která nestárne." },
        { heading: "Funkce a lidský komfort", body: "Prostor navrhujeme zevnitř ven. Soustředíme se na nekompromisně logické dispozice, práci s přirozeným světlem, vzdušnost a ideální proporce každé jednotlivé místnosti." },
        { heading: "Technická přísnost", body: "Kreativní vizi spojujeme s inženýrskou precizností. Už ve studii přemýšlíme nad konstrukčním systémem, hmatatelnými materiály a technickými limity tak, aby byl projekt reálně postavitelný." },
        { heading: "Ekologická zodpovědnost", body: "Hledáme způsoby, jak stavbu organicky propojit s okolím. Navrhujeme energeticky efektivní řešení a materiály, které minimalizují negativní vliv na životní prostředí." },
        { heading: "Sociální rozměr", body: "Architektura formuje prostředí, ve kterém žijeme. Ať už jde o rodinný dům nebo veřejný prostor, vytváříme místa, která přirozeně podporují lidskou interakci a zvyšují kvalitu každodenního života." },
        { heading: "Investiční hodnota", body: "Kvalitní architektonický návrh je investice, nikoli náklad. Promyšlená prostorová a materiálová řešení výrazně zvyšují tržní hodnotu nemovitosti a zajišťují její dlouhodobou nadčasovost." },
      ],
    },
    {
      index: 5,
      title: "3D sken",
      intro:
        "Přesné digitální zaměření budov, interiérů a konstrukčních detailů technologií 3D laserového skenování. Používáme ji při vlastní projekční činnosti a zároveň ji nabízíme jako samostatnou službu architektům, projektantům, developerům, památkářům a realizátorům staveb.",
      sections: [
        { heading: "Technologie a přesnost", body: "Skener kombinuje laserové měření s HDR fotografií: přesnost 4 mm na vzdálenost 10 m, dosah do 45 metrů od stanoviště a jedno 360° skenování v rozsahu od 28 sekund do 3 minut. Trojice 13Mpx kamer měření doplňuje o sférická panoramata." },
        { heading: "Zaměření skutečného stavu", body: "As-Built dokumentace pro rekonstrukce, přestavby a obnovu památek. Místo ručního přeměřování dostáváte věrnou kopii skutečného stavu včetně deformací, které by pásmo nezachytilo." },
        { heading: "Podklady pro BIM a CAD", body: "Z mračna bodů stavíme parametrický 3D model nebo klasické 2D výkresy. Projekt tak od první čáry sedí na realitě, ne na archivní dokumentaci staré desítky let." },
        { heading: "Stavební kontrola", body: "Porovnání skutečného provedení s projektem odhalí odchylky ještě v průběhu stavby — dokud je jejich oprava otázkou dní, ne bourání." },
        { heading: "Dokumentace před zakrytím", body: "Zaměření rozvodů a konstrukcí těsně před jejich zakrytím. Přesná poloha inženýrských sítí tak zůstává zdokumentována po celou životnost stavby." },
        { heading: "Formáty výstupů", body: "Mračno bodů v .E57, .RCP nebo .LGS, panoramatická data a podle dohody i 2D výkresová dokumentace či 3D BIM model postavený ze skenu." },
      ],
    },
  ],

  en: [
    {
      index: 1,
      title: "Architectural Study",
      intro:
        "An architectural study is not just the first sketched drawing. It is the raw DNA of the whole project. In this phase we define the balance between your vision, function and the context of the place where the building will stand. We work across six fundamental layers:",
      sections: [
        { heading: "Aesthetics and story", body: "We look for a unique visual identity for the building. Good architecture not only looks good — it carries a message, evokes emotion and creates a lasting aesthetic value that doesn't age." },
        { heading: "Function and human comfort", body: "We design space from the inside out. We focus on uncompromisingly logical layouts, working with natural light, airiness and the ideal proportions of every single room." },
        { heading: "Technical rigour", body: "We pair creative vision with engineering precision. Already in the study we think about the structural system, tangible materials and technical limits so that the project is genuinely buildable." },
        { heading: "Ecological responsibility", body: "We look for ways to connect the building organically with its surroundings. We design energy-efficient solutions and materials that minimise the negative impact on the environment." },
        { heading: "Social dimension", body: "Architecture shapes the environment we live in. Whether it's a family house or a public space, we create places that naturally support human interaction and raise the quality of everyday life." },
        { heading: "Investment value", body: "A quality architectural design is an investment, not a cost. Thoughtful spatial and material solutions significantly increase a property's market value and secure its long-term timelessness." },
      ],
    },
    {
      index: 5,
      title: "3D Scan",
      intro:
        "A precise digital survey of buildings, interiors and structural details using 3D laser scanning. We use it in our own design work and offer it as a standalone service to architects, engineers, developers, heritage specialists and contractors.",
      sections: [
        { heading: "Technology and accuracy", body: "The scanner pairs laser measurement with HDR photography: 4 mm accuracy at a distance of 10 m, a range of up to 45 metres from the station, and a single 360° scan taking anywhere from 28 seconds to 3 minutes. Three 13 MP cameras add spherical panoramas to the measurement." },
        { heading: "As-built survey", body: "As-built documentation for renovations, conversions and heritage restoration. Instead of measuring by hand, you get a faithful copy of the real state of the building — including the deformations a tape measure would never catch." },
        { heading: "Data for BIM and CAD", body: "From the point cloud we build a parametric 3D model or conventional 2D drawings. The project then sits on reality from the very first line, not on archive documentation drawn decades ago." },
        { heading: "Construction control", body: "Comparing what has actually been built against the design reveals deviations while the building is still going up — while fixing them is a matter of days, not demolition." },
        { heading: "Documentation before concealment", body: "A survey of services and structures just before they are covered up. The exact position of the utilities then stays documented for the entire life of the building." },
        { heading: "Output formats", body: "A point cloud in .E57, .RCP or .LGS, panoramic data and, by agreement, 2D drawing documentation or a 3D BIM model built from the scan." },
      ],
    },
  ],
};

/** Row indices that have a written detail (same across languages). */
export const detailIndices = new Set(serviceDetails.sk.map((d) => d.index));
