import ExpandableCards from "@/components/pagebuilder/Fragments/pg-ExpandableCards";
import { getSmartUnits } from "@/lib/sanity/queries";
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
  const units = await getSmartUnits(language, maxItems, sortBy) as Unit[];

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
        <ExpandableCards
          items={cards}
          variant={variant}
          columns={columns}
          initialVisibleCount={Math.min(8, cards.length)}
        />
      </div>
    </section>
  );
}
