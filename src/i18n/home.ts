/**
 * Homepage i18n dictionary — SK (default) / CZ / EN.
 *
 * Single source of truth for every visible string on the landing page.
 * Each component takes a `lang` prop and reads its slice from `home[lang]`.
 * Routes: `/` = sk, `/cz` = cz, `/en` = en (see src/pages).
 *
 * Translations are a first pass for review — proper nouns (Bardejov,
 * Košice, founder names), legal info (IČO/DIČ) and street addresses stay
 * untranslated by design; only the country word + field labels localise.
 *
 * STRUCTURE-CRITICAL NOTES (don't break the animations):
 *   - about.headline must keep "247" as a standalone word (the counter
 *     scrub in about.ts matches word === "247").
 *   - hero.title is structured into lines → word tokens so the per-word
 *     mask reveal + the two hover-image targets survive translation. A
 *     token's `hover` key ("hlucna" | "priestor") maps to a stacked hero
 *     image; a `phrase` groups words under one shared hover/underline.
 */

export type Lang = "sk" | "cz" | "en";
export const LANGS: Lang[] = ["sk", "cz", "en"];

/** One word in the hero title; `hover` makes it an image-swap trigger. */
interface TitleToken {
  t: string;
  hover?: "hlucna" | "priestor";
}
/** A phrase = several words sharing ONE hover target + underline. */
interface TitlePhrase {
  phrase: string[];
  hover: "hlucna" | "priestor";
}
type TitlePart = TitleToken | TitlePhrase;

export interface HomeContent {
  nav: {
    /** language switch labels, in LANGS order */
    links: { about: string; projects: string; services: string };
    cta: string;
    menu: string;
    menuAria: string;
  };
  hero: {
    /** Each inner array is one rendered line of the <h1>. */
    title: TitlePart[][];
    scroll: string;
  };
  about: {
    headline: string;
    cta: string;
  };
  works: {
    label: string;
    cta: string;
    projects: { title: string; description: string; alt: string }[];
  };
  services: {
    label: string;
    cta: string;
    /** num + image + aspect live in the component (lang-agnostic). */
    items: { title: string; desc: string; alt: string }[];
  };
  leaders: {
    manifest: string;
    eyebrow: string;
    cta: string;
    /** name stays untranslated; only desc + alt localise. */
    people: { desc: string; alt: string }[];
  };
  footer: {
    architekt: string;
    pitch1: string;
    pitch2: string;
    cta: string;
    labels: {
      locations: string;
      info: string;
      navigation: string;
      social: string;
    };
    phone: string;
    email: string;
    country: string;
    nav: { home: string; about: string; projects: string; services: string; careers: string };
    backToTop: string;
  };
  /** Site-wide contact panel (ContactForm.astro). The first five service
   *  pills reuse services.items[].title; serviceOther is the 6th ("Iné"). */
  contact: {
    closeAria: string;
    title: string;
    intro: string;
    serviceLabel: string;
    serviceOther: string;
    detailsLabel: string;
    fields: { name: string; email: string; phone: string; message: string };
    submit: string;
    locationsLabel: string;
  };
  /** Custom-cursor label shown over project tiles (works.ts → .is-view).
   *  Rendered uppercase via attr() in global.css. */
  cursorView: string;
}

export const home: Record<Lang, HomeContent> = {
  // ===========================================================
  // SK — Slovak (default / source copy)
  // ===========================================================
  sk: {
    nav: {
      links: { about: "O nás,", projects: "Projekty,", services: "Služby" },
      cta: "Kontaktujte nás",
      menu: "Menu",
      menuAria: "Otvoriť menu",
    },
    hero: {
      title: [
        [{ t: "Architektúra" }, { t: "nemá" }, { t: "byť" }, { t: "hlučná.", hover: "hlucna" }],
        [{ t: "Má" }, { t: "dať" }, { phrase: ["priestor", "životu."], hover: "priestor" }],
      ],
      scroll: "SCROLL",
    },
    about: {
      headline:
        "Na to myslíme pri každom zadaní už od roku 1998. Za 27 rokov sme dali reálnu tvár 247 projektom naprieč Slovenskom a Českom — bez hlučných gest, no s rešpektom k detailu. Dnes už tvoríme z dvoch ateliérov: v Bardejove a Košiciach.",
      cta: "Spoznajte nás",
    },
    works: {
      label: "Výber našich prác",
      cta: "Ďalšie projekty",
      projects: [
        {
          title: "Chata pod korunami",
          description:
            "Harmonické prepojenie surového kameňa a hrejivého dreva v objatí prírody. Architektúra, ktorá rešpektuje vertikalitu okolitého lesa.",
          alt: "Chata pod korunami — exteriér v lese",
        },
        {
          title: "Vila Na kopci",
          description:
            "Otvorená panoráma, kde sa betónová strohosť stretáva s jemnosťou horskej lúky. Navrhnuté pre splynutie s horizontom.",
          alt: "Vila Na kopci — pohľad zhora",
        },
        {
          title: "Dom pri vodnej hladine",
          description:
            "Práca s odrazom, svetlom a mierkou. Odvážna hmota, ktorá vďaka prírodným materiálom a vodnému prvku pôsobí prirodzene a stabilne.",
          alt: "Dom pri vodnej hladine",
        },
        {
          title: "Bistro Koncept",
          description:
            "Mestský interiér postavený na textúrach, poctivom detaile a tlmenej farebnosti. Priestor, ktorý namiesto vizuálneho smogu ponúka pokoj.",
          alt: "Bistro Koncept — mestský interiér",
        },
        {
          title: "Ateliér Linea",
          description:
            "Prepojenie industriálnej konštrukcie s mäkkosťou interiérových detailov.",
          alt: "Ateliér Linea — industriálny interiér",
        },
        {
          title: "Knižnica Archív",
          description:
            "Monumentálny interiér venovaný vedomostiam. Drevená architektúra schodiska tvorí dominantné srdce celého priestoru.",
          alt: "Knižnica Archív — drevené schodisko",
        },
      ],
    },
    services: {
      label: "Služby",
      cta: "Dozvedieť sa viac",
      items: [
        {
          title: "Urbanistická štúdia",
          desc: "Komplexná analýza územia a návrh urbanistickej koncepcie pre rozsiahle rozvojové projekty alebo revitalizáciu existujúcich celkov. Začíname tu, keď je v hre viac než jedna budova.",
          alt: "Urbanistická štúdia — situačný model územia",
        },
        {
          title: "Architektonická štúdia",
          desc: "Preklopenie Vašich predstáv na papier s architektonickou koordináciou.",
          alt: "Architektonická štúdia — skice a materiálové vzorky",
        },
        {
          title: "Územné rozhodnutie",
          desc: "Rozhodnutie o umiestnení stavby, ktorým sa určuje stavebný pozemok, podmienky a jeho využitie.",
          alt: "Územné rozhodnutie — vymeriavanie pozemku",
        },
        {
          title: "Stavebné povolenie",
          desc: "Určuje záväzné podmienky uskutočnenia a užívania stavby a rozhodne o námietkach účastníkov konania.",
          alt: "Stavebné povolenie — projektová dokumentácia",
        },
        {
          title: "Realizačná dokumentácia",
          desc: "Podrobná dokumentácia nevyhnutná pre realizáciu stavby. Obsahuje jednotlivé profesie a špecifikáciu detailov.",
          alt: "Realizačná dokumentácia — detaily a špecifikácie",
        },
      ],
    },
    leaders: {
      manifest:
        "Dve generácie, tri pohľady a jedna nekompromisná prísnosť. Lídri ateliéru Fotta Popadič spoločne s rozrastajúcim sa tímom formujú priestor pre život.",
      eyebrow: "Lídri ateliéru",
      cta: "Spoznajte nás",
      people: [
        {
          desc: "Technický pilier ateliéru. Svojou 27-ročnou konštrukčnou praxou a nekompromisnou precíznosťou.",
          alt: "Ing. Pavol Fotta — portrét",
        },
        {
          desc: "Motor a evolúcia štúdia. Spája rodinnú tradíciu s technologickými inováciami digitálnej éry.",
          alt: "Dominik Fotta — portrét",
        },
        {
          desc: "Kreatívna sila, ktorá spája koncepčnú čistotu so zmyslom pre detail.",
          alt: "Ing. arch. Ing. Tomáš Popadič — portrét",
        },
      ],
    },
    footer: {
      architekt: "architekt",
      pitch1:
        "Ak hľadáte partnera, ktorý spojí mladistvú energiu s bohatými skúsenosťami a vášňou k architektúre, ste na správnom mieste.",
      pitch2: "Pre cenovú ponuku nás kontaktujte telefonicky alebo emailom.",
      cta: "Kontaktujte nás",
      labels: {
        locations: "Kde nás najdete",
        info: "Informácie",
        navigation: "Navigácia",
        social: "Sociálne siete",
      },
      phone: "Telefón:",
      email: "Email:",
      country: "Slovensko",
      nav: { home: "Domov", about: "O nás", projects: "Projekty", services: "Služby", careers: "Kariéra" },
      backToTop: "Späť na vrch",
    },
    contact: {
      closeAria: "Zavrieť formulár",
      title: "Kontaktujte nás",
      intro:
        "Na úvod by sme vás chceli požiadať, aby ste nám poskytli základné informácie o vašom projekte, ktoré nám pomôžu lepšie pochopiť vaše potreby.",
      serviceLabel: "O akú službu máte záujem",
      serviceOther: "Iné",
      detailsLabel: "Vaše kontaktné údaje",
      fields: {
        name: "Meno",
        email: "Emailová adresa",
        phone: "Telefónne číslo",
        message: "Vaša správa",
      },
      submit: "Odoslať",
      locationsLabel: "Kde nás nájdete",
    },
    cursorView: "Pozrieť",
  },

  // ===========================================================
  // CZ — Czech
  // ===========================================================
  cz: {
    nav: {
      links: { about: "O nás,", projects: "Projekty,", services: "Služby" },
      cta: "Kontaktujte nás",
      menu: "Menu",
      menuAria: "Otevřít menu",
    },
    hero: {
      title: [
        [{ t: "Architektura" }, { t: "nemá" }, { t: "být" }, { t: "hlučná.", hover: "hlucna" }],
        [{ t: "Má" }, { t: "dávat" }, { phrase: ["prostor", "životu."], hover: "priestor" }],
      ],
      scroll: "SCROLL",
    },
    about: {
      headline:
        "Na to myslíme při každém zadání už od roku 1998. Za 27 let jsme dali reálnou tvář 247 projektům napříč Slovenskem a Českem — bez hlučných gest, ale s respektem k detailu. Dnes už tvoříme ze dvou ateliérů: v Bardejově a Košicích.",
      cta: "Poznejte nás",
    },
    works: {
      label: "Výběr našich prací",
      cta: "Další projekty",
      projects: [
        {
          title: "Chata pod korunami",
          description:
            "Harmonické propojení surového kamene a hřejivého dřeva v objetí přírody. Architektura, která respektuje vertikalitu okolního lesa.",
          alt: "Chata pod korunami — exteriér v lese",
        },
        {
          title: "Vila Na kopci",
          description:
            "Otevřené panorama, kde se betonová strohost setkává s jemností horské louky. Navrženo pro splynutí s horizontem.",
          alt: "Vila Na kopci — pohled shora",
        },
        {
          title: "Dům u vodní hladiny",
          description:
            "Práce s odrazem, světlem a měřítkem. Odvážná hmota, která díky přírodním materiálům a vodnímu prvku působí přirozeně a stabilně.",
          alt: "Dům u vodní hladiny",
        },
        {
          title: "Bistro Koncept",
          description:
            "Městský interiér postavený na texturách, poctivém detailu a tlumené barevnosti. Prostor, který místo vizuálního smogu nabízí klid.",
          alt: "Bistro Koncept — městský interiér",
        },
        {
          title: "Ateliér Linea",
          description:
            "Propojení industriální konstrukce s měkkostí interiérových detailů.",
          alt: "Ateliér Linea — industriální interiér",
        },
        {
          title: "Knihovna Archiv",
          description:
            "Monumentální interiér věnovaný vědění. Dřevěná architektura schodiště tvoří dominantní srdce celého prostoru.",
          alt: "Knihovna Archiv — dřevěné schodiště",
        },
      ],
    },
    services: {
      label: "Služby",
      cta: "Dozvědět se více",
      items: [
        {
          title: "Urbanistická studie",
          desc: "Komplexní analýza území a návrh urbanistické koncepce pro rozsáhlé rozvojové projekty nebo revitalizaci stávajících celků. Začínáme zde, když je ve hře víc než jedna budova.",
          alt: "Urbanistická studie — situační model území",
        },
        {
          title: "Architektonická studie",
          desc: "Převedení vašich představ na papír s architektonickou koordinací.",
          alt: "Architektonická studie — skici a materiálové vzorky",
        },
        {
          title: "Územní rozhodnutí",
          desc: "Rozhodnutí o umístění stavby, kterým se určuje stavební pozemek, podmínky a jeho využití.",
          alt: "Územní rozhodnutí — vyměřování pozemku",
        },
        {
          title: "Stavební povolení",
          desc: "Určuje závazné podmínky uskutečnění a užívání stavby a rozhodne o námitkách účastníků řízení.",
          alt: "Stavební povolení — projektová dokumentace",
        },
        {
          title: "Realizační dokumentace",
          desc: "Podrobná dokumentace nezbytná pro realizaci stavby. Obsahuje jednotlivé profese a specifikaci detailů.",
          alt: "Realizační dokumentace — detaily a specifikace",
        },
      ],
    },
    leaders: {
      manifest:
        "Dvě generace, tři pohledy a jedna nekompromisní přísnost. Lídři ateliéru Fotta Popadič společně s rozrůstajícím se týmem formují prostor pro život.",
      eyebrow: "Lídři ateliéru",
      cta: "Poznejte nás",
      people: [
        {
          desc: "Technický pilíř ateliéru. Se svou 27letou konstrukční praxí a nekompromisní precizností.",
          alt: "Ing. Pavol Fotta — portrét",
        },
        {
          desc: "Motor a evoluce studia. Spojuje rodinnou tradici s technologickými inovacemi digitální éry.",
          alt: "Dominik Fotta — portrét",
        },
        {
          desc: "Kreativní síla, která spojuje koncepční čistotu se smyslem pro detail.",
          alt: "Ing. arch. Ing. Tomáš Popadič — portrét",
        },
      ],
    },
    footer: {
      architekt: "architekt",
      pitch1:
        "Pokud hledáte partnera, který spojí mladistvou energii s bohatými zkušenostmi a vášní pro architekturu, jste na správném místě.",
      pitch2: "Pro cenovou nabídku nás kontaktujte telefonicky nebo e-mailem.",
      cta: "Kontaktujte nás",
      labels: {
        locations: "Kde nás najdete",
        info: "Informace",
        navigation: "Navigace",
        social: "Sociální sítě",
      },
      phone: "Telefon:",
      email: "E-mail:",
      country: "Slovensko",
      nav: { home: "Domů", about: "O nás", projects: "Projekty", services: "Služby", careers: "Kariéra" },
      backToTop: "Zpět nahoru",
    },
    contact: {
      closeAria: "Zavřít formulář",
      title: "Kontaktujte nás",
      intro:
        "Na úvod bychom vás chtěli požádat, abyste nám poskytli základní informace o vašem projektu, které nám pomohou lépe pochopit vaše potřeby.",
      serviceLabel: "O jakou službu máte zájem",
      serviceOther: "Jiné",
      detailsLabel: "Vaše kontaktní údaje",
      fields: {
        name: "Jméno",
        email: "E-mailová adresa",
        phone: "Telefonní číslo",
        message: "Vaše zpráva",
      },
      submit: "Odeslat",
      locationsLabel: "Kde nás najdete",
    },
    cursorView: "Zobrazit",
  },

  // ===========================================================
  // EN — English
  // ===========================================================
  en: {
    nav: {
      links: { about: "About,", projects: "Projects,", services: "Services" },
      cta: "Contact us",
      menu: "Menu",
      menuAria: "Open menu",
    },
    hero: {
      title: [
        [{ t: "Architecture" }, { t: "shouldn’t" }, { t: "be" }, { t: "loud.", hover: "hlucna" }],
        [{ t: "It" }, { t: "should" }, { t: "make" }, { phrase: ["space", "for", "life."], hover: "priestor" }],
      ],
      scroll: "SCROLL",
    },
    about: {
      headline:
        "We’ve kept this in mind on every commission since 1998. In 27 years we’ve given real shape to 247 projects across Slovakia and Czechia — without loud gestures, but with respect for detail. Today we work from two studios: in Bardejov and Košice.",
      cta: "Get to know us",
    },
    works: {
      label: "Selected works",
      cta: "More projects",
      projects: [
        {
          title: "Cabin Beneath the Canopy",
          description:
            "A harmonious bond between raw stone and warm timber in nature’s embrace. Architecture that respects the verticality of the surrounding forest.",
          alt: "Cabin Beneath the Canopy — exterior in the forest",
        },
        {
          title: "Hilltop Villa",
          description:
            "An open panorama where concrete austerity meets the softness of a mountain meadow. Designed to merge with the horizon.",
          alt: "Hilltop Villa — view from above",
        },
        {
          title: "House by the Water",
          description:
            "Working with reflection, light and scale. A bold mass that, thanks to natural materials and a water feature, feels natural and grounded.",
          alt: "House by the Water",
        },
        {
          title: "Bistro Concept",
          description:
            "An urban interior built on textures, honest detail and a muted palette. A space that offers calm instead of visual noise.",
          alt: "Bistro Concept — urban interior",
        },
        {
          title: "Studio Linea",
          description:
            "A meeting of industrial structure and the softness of interior detail.",
          alt: "Studio Linea — industrial interior",
        },
        {
          title: "Archive Library",
          description:
            "A monumental interior devoted to knowledge. The timber architecture of the staircase forms the commanding heart of the space.",
          alt: "Archive Library — timber staircase",
        },
      ],
    },
    services: {
      label: "Services",
      cta: "Learn more",
      items: [
        {
          title: "Urban Study",
          desc: "A comprehensive analysis of the site and a proposal for an urban concept for large-scale development projects or the revitalisation of existing complexes. We start here when more than one building is at stake.",
          alt: "Urban study — site situation model",
        },
        {
          title: "Architectural Study",
          desc: "Translating your ideas onto paper with full architectural coordination.",
          alt: "Architectural study — sketches and material samples",
        },
        {
          title: "Zoning Decision",
          desc: "The decision on the placement of the building, defining the plot, the conditions and its use.",
          alt: "Zoning decision — surveying the plot",
        },
        {
          title: "Building Permit",
          desc: "It sets the binding conditions for constructing and using the building, and decides on the objections of the parties to the proceedings.",
          alt: "Building permit — project documentation",
        },
        {
          title: "Construction Documentation",
          desc: "Detailed documentation essential for building the project. It covers the individual trades and the specification of details.",
          alt: "Construction documentation — details and specifications",
        },
      ],
    },
    leaders: {
      manifest:
        "Two generations, three perspectives and one uncompromising rigour. The leaders of the Fotta Popadič studio, together with a growing team, shape space for life.",
      eyebrow: "Studio leaders",
      cta: "Get to know us",
      people: [
        {
          desc: "The technical backbone of the studio. With 27 years of structural practice and uncompromising precision.",
          alt: "Ing. Pavol Fotta — portrait",
        },
        {
          desc: "The drive and evolution of the studio. He blends family tradition with the technological innovation of the digital era.",
          alt: "Dominik Fotta — portrait",
        },
        {
          desc: "The creative force that unites conceptual clarity with an eye for detail.",
          alt: "Ing. arch. Ing. Tomáš Popadič — portrait",
        },
      ],
    },
    footer: {
      architekt: "architect",
      pitch1:
        "If you’re looking for a partner who unites youthful energy with deep experience and a passion for architecture, you’re in the right place.",
      pitch2: "For a quote, contact us by phone or email.",
      cta: "Contact us",
      labels: {
        locations: "Where to find us",
        info: "Information",
        navigation: "Navigation",
        social: "Social",
      },
      phone: "Phone:",
      email: "Email:",
      country: "Slovakia",
      nav: { home: "Home", about: "About", projects: "Projects", services: "Services", careers: "Careers" },
      backToTop: "Back to top",
    },
    contact: {
      closeAria: "Close form",
      title: "Contact us",
      intro:
        "To begin, we’d like to ask you to share some basic information about your project, which will help us better understand your needs.",
      serviceLabel: "Which service are you interested in",
      serviceOther: "Other",
      detailsLabel: "Your contact details",
      fields: {
        name: "Name",
        email: "Email address",
        phone: "Phone number",
        message: "Your message",
      },
      submit: "Send",
      locationsLabel: "Where to find us",
    },
    cursorView: "View",
  },
};

/** Path each language's homepage lives at. */
export const langHref: Record<Lang, string> = {
  sk: "/",
  cz: "/cz",
  en: "/en",
};

/** Label shown in the SK/CZ/EN switcher (trailing comma matches design). */
export const langLabel: Record<Lang, string> = {
  sk: "SK,",
  cz: "CZ,",
  en: "EN",
};

/** Path to the services subpage per language (SK has no prefix). */
export const servicesHref: Record<Lang, string> = {
  sk: "/sluzby",
  cz: "/cz/sluzby",
  en: "/en/sluzby",
};

/**
 * Map the CURRENT pathname to its equivalent in every language, so the
 * SK/CZ/EN switch keeps you on the same page (homepage ↔ homepage,
 * /sluzby ↔ /cz/sluzby ↔ /en/sluzby) instead of always bouncing to the
 * homepage. Used by Nav + SideNav.
 */
export function localizedHrefs(pathname: string): Record<Lang, string> {
  // Strip a leading /cz or /en prefix → the canonical (SK) path.
  const stripped = pathname.replace(/^\/(cz|en)(?=\/|$)/, "");
  const base = stripped === "" ? "/" : stripped;
  const join = (prefix: string) =>
    base === "/" ? prefix || "/" : `${prefix}${base}`;
  return { sk: join(""), cz: join("/cz"), en: join("/en") };
}
