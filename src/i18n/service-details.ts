/**
 * Service detail copy — the long-form text shown in the right-side detail
 * panel (ServiceDetail.astro) when a "Dozvedieť sa viac" link is clicked.
 *
 * `index` ties a detail to its row in the Services spec-sheet (see the
 * `meta` array in Services.astro): 0 Urbanistická, 1 Architektonická,
 * 2 Územné, 3 Stavebné, 4 Realizačná.
 *
 * Only Architektonická štúdia (index 1) is written so far — add more
 * entries here and the matching row's link + panel light up automatically.
 */
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

export const serviceDetails: ServiceDetailData[] = [
  {
    index: 1,
    title: "Architektonická štúdia",
    intro:
      "Architektonická štúdia nie je len prvý načrtnutý výkres. Je to surová DNA celého projektu. V tejto fáze definujeme rovnováhu medzi vašou predstavou, funkciou a kontextom miesta, kde bude objekt stáť. Pracujeme v šiestich základných rovinách:",
    sections: [
      {
        heading: "Estetika a príbeh",
        body: "Hľadáme jedinečnú vizuálnu identitu objektu. Dobrá architektúra nielen dobre vyzerá, ale nesie posolstvo, vyvoláva emócie a vytvára trvácnu estetickú hodnotu, ktorá nestarne.",
      },
      {
        heading: "Funkcia a ľudský komfort",
        body: "Priestor navrhujeme zvnútra von. Sústredíme sa na nekompromisne logické dispozície, prácu s prirodzeným svetlom, vzdušnosť a ideálne proporcie každej jednej miestnosti.",
      },
      {
        heading: "Technická prísnosť",
        body: "Kreatívnu víziu spájame s inžinierskou precíznosťou. Už v štúdii premýšľame nad konštrukčným systémom, hmatateľnými materiálmi a technickými limitmi tak, aby bol projekt reálne postaviteľný.",
      },
      {
        heading: "Ekologická zodpovednosť",
        body: "Hľadáme spôsoby, ako stavbu organicky prepojiť s okolím. Navrhujeme energeticky efektívne riešenia a materiály, ktoré minimalizujú negatívny vplyv na životné prostredie.",
      },
      {
        heading: "Sociálny rozmer",
        body: "Architektúra formuje prostredie, v ktorom žijeme. Či už ide o rodinný dom alebo verejný priestor, vytvárame miesta, ktoré prirodzene podporujú ľudskú interakciu a zvyšujú kvalitu každodenného života.",
      },
      {
        heading: "Investičná hodnota",
        body: "Kvalitný architektonický návrh je investícia, nie náklad. Premyslené priestorové a materiálové riešenia výrazne zvyšujú trhovú hodnotu nehnuteľnosti a zabezpečujú jej dlhodobú nadčasovosť.",
      },
    ],
  },
];

/** Row indices that have a written detail (drives the link visibility). */
export const detailIndices = new Set(serviceDetails.map((d) => d.index));
