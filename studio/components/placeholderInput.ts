import { useFormValue, type StringInputProps } from "sanity";

/**
 * Vráti input komponent, ktorý do natívneho <input> doplní placeholder —
 * schémové polia v Sanity vlastnosť `placeholder` nemajú.
 * Funguje pre string, text aj url polia (všetky renderujú textový input).
 *
 * Použitie: components: { input: withPlaceholder("napr. Ing. Marek Dufala") }
 */
export function withPlaceholder(placeholder: string) {
  return function PlaceholderInput(props: StringInputProps) {
    return props.renderDefault({
      ...props,
      elementProps: { ...props.elementProps, placeholder },
    });
  };
}

/**
 * Predvyplnenie ŽIVÉ z iného poľa dokumentu — editor vidí presne ten
 * text, ktorý web použije, kým pole nechá prázdne (napr. Slogan ← popis
 * z Thumbnailu). Zobrazuje sa v NORMÁLNEJ farbe textu (sivá je u nás
 * vyhradená pre placeholdery — rieši CSS v StudioLayout cez data
 * atribút); keď editor začne písať, nahradí ho vlastný text. Keď je
 * zdrojové pole tiež prázdne, ukáže sa `hint` — ten už klasicky sivý.
 *
 * Použitie: components: { input: withPlaceholderFrom(["card", "descriptionSk"], "…") }
 */
export function withPlaceholderFrom(path: string[], hint: string) {
  return function LivePlaceholderInput(props: StringInputProps) {
    const source = useFormValue(path);
    const hasSource = typeof source === "string" && source.trim() !== "";
    return props.renderDefault({
      ...props,
      elementProps: {
        ...props.elementProps,
        placeholder: hasSource ? (source as string) : hint,
        // Marker pre StudioLayout: predvyplnený text ukazuj plnou farbou.
        ...(hasSource ? { "data-live-default": "" } : {}),
      } as typeof props.elementProps,
    });
  };
}
