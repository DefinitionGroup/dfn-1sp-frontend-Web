export type FlzrLocationLocale = "en" | "de" | "pl";

export type FlzrEuropeanLocation = {
  code: string;
  name: string;
  coordinateLat: number;
  coordinateLon: number;
  labelOffsetX?: number;
  labelOffsetY?: number;
};

type EuropeanLocationDefinition = Omit<FlzrEuropeanLocation, "name"> & {
  names: Record<FlzrLocationLocale, string>;
};

const EUROPEAN_LOCATION_DEFINITIONS: EuropeanLocationDefinition[] = [
  {
    code: "PL",
    names: { en: "Poland", de: "Polen", pl: "Polska" },
    coordinateLat: 51.9194,
    coordinateLon: 19.1451,
    labelOffsetX: 36,
    labelOffsetY: -28,
  },
  {
    code: "DE",
    names: { en: "Germany", de: "Deutschland", pl: "Niemcy" },
    coordinateLat: 51.1657,
    coordinateLon: 10.4515,
    labelOffsetX: -40,
    labelOffsetY: 28,
  },
  {
    code: "AT",
    names: { en: "Austria", de: "Österreich", pl: "Austria" },
    coordinateLat: 47.5162,
    coordinateLon: 14.5501,
  },
  {
    code: "FR",
    names: { en: "France", de: "Frankreich", pl: "Francja" },
    coordinateLat: 46.2276,
    coordinateLon: 2.2137,
  },
  {
    code: "IT",
    names: { en: "Italy", de: "Italien", pl: "Włochy" },
    coordinateLat: 41.8719,
    coordinateLon: 12.5674,
  },
  {
    code: "GB",
    names: {
      en: "United Kingdom",
      de: "Vereinigtes Königreich",
      pl: "Wielka Brytania",
    },
    coordinateLat: 55.3781,
    coordinateLon: -3.436,
  },
  {
    code: "SE",
    names: { en: "Sweden", de: "Schweden", pl: "Szwecja" },
    coordinateLat: 60.1282,
    coordinateLon: 18.6435,
  },
  {
    code: "ES",
    names: { en: "Spain", de: "Spanien", pl: "Hiszpania" },
    coordinateLat: 40.4637,
    coordinateLon: -3.7492,
  },
];

function normalizeLocale(locale?: string): FlzrLocationLocale {
  return locale === "de" || locale === "pl" ? locale : "en";
}

export function getFlzrEuropeanLocations(
  locale?: string,
): FlzrEuropeanLocation[] {
  const normalizedLocale = normalizeLocale(locale);

  return EUROPEAN_LOCATION_DEFINITIONS.map(({ names, ...location }) => ({
    ...location,
    name: names[normalizedLocale],
  }));
}

export function getFlzrGlobeSectionId(sectionTitle?: string): string {
  if (!sectionTitle) return "globe-component";

  return (
    sectionTitle
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase() || "globe-component"
  );
}
