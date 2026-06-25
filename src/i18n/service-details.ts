/**
 * Service detail copy — the long-form text shown in the right-side detail
 * panel (ServiceDetail.astro) when a "Dozvedieť sa viac" link is clicked.
 *
 * `index` ties a detail to its row in the Services spec-sheet (see the
 * `meta` array in Services.astro): 0 Urbanistická, 1 Architektonická,
 * 2 Územné, 3 Stavebné, 4 Realizačná.
 *
 * Only Architektonická štúdia (index 1) is written so far — add more
 * entries (per language) and the matching row's link + panel light up
 * automatically. Indices are the same across languages, so detailIndices
 * is derived from the SK set.
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
  ],
};

/** Row indices that have a written detail (same across languages). */
export const detailIndices = new Set(serviceDetails.sk.map((d) => d.index));
