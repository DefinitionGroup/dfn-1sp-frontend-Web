import { client } from "@/sanity/lib/client";
import { SMART_UNITS_QUERY } from "@/sanity/lib/queries";
import ExpandableCards from "@/components/pagebuilder/Fragments/pg-ExpandableCards";
import type { CardItem, CloudinaryAsset, CTA } from "@/types/sanity.types";

type Unit = {
  _id: string;
  _type: string;
  name?: string;
  slug?: { current: string };
  logoColor?: CloudinaryAsset;
  logo?: CloudinaryAsset;
  backgroundImage?: CloudinaryAsset;
  description?: string;
  tagline?: string;
  cta?: CTA;
  _createdAt?: string;
};

interface UnitsExpandableCardsProps {
  maxItems?: number;
  sortBy?: "recent" | "name-asc" | "name-desc";
  language?: string;
  variant?: "default" | "compact";
  columns?: 3 | 4 | 5;
}

function getSortParams(sortBy: string) {
  switch (sortBy) {
    case "name-asc":
      return { field: "name", direction: "asc" };
    case "name-desc":
      return { field: "name", direction: "desc" };
    case "recent":
    default:
      return { field: "_createdAt", direction: "desc" };
  }
}

function transformUnitsToCards(units: Unit[]): CardItem[] {
  return units.map((unit) => ({
    _type: "cardItem" as const,
    _key: unit._id,
    title: unit.name || "",
    description: unit.tagline || unit.description || "",
    src: unit.backgroundImage || unit.logoColor || unit.logo,
    logo: unit.logoColor || unit.logo,
    content: unit.description || "",
    ctaButton: unit.cta || undefined,
  }));
}

export default async function UnitsExpandableCards({
  maxItems = 6,
  sortBy = "recent",
  language = "en",
  variant = "default",
  columns = 4,
}: UnitsExpandableCardsProps) {
  const sortParams = getSortParams(sortBy);

  // Build the query with dynamic sorting
  const queryWithSort = SMART_UNITS_QUERY.replace(
    "order(_createdAt desc)",
    `order(${sortParams.field} ${sortParams.direction})`
  );

  const units = await client.fetch<Unit[]>(
    queryWithSort,
    { language, maxItems: maxItems - 1 },
    {
      next: { revalidate: 60 },
    }
  );

  if (units.length === 0) {
    return (
      <div className="w-full py-16  flex items-center justify-center">
        <div className="text-gray-400">No units found</div>
      </div>
    );
  }
  const cards = transformUnitsToCards(units);

  return (
    <section className="w-full " data-component="smart-units-gallery">
      <div className="container mx-auto ">
        <ExpandableCards items={cards} variant={variant} columns={columns} />
      </div>
    </section>
  );
}
