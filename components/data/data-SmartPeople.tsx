import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import { client } from "@/sanity/lib/client";
import { SMART_PEOPLE_QUERY } from "@/sanity/lib/queries";
import PersonCard from "../ui/PersonCard";

type CloudinaryAsset = {
  _type?: string;
  public_id?: string;
  resource_type?: string;
  type?: string;
  format?: string;
  version?: number;
  url?: string;
  secure_url?: string;
  width?: number;
  height?: number;
  [key: string]: any;
};

type Person = {
  _id: string;
  name?: string;
  slug?: { current: string };
  image?: CloudinaryAsset;
  video?: CloudinaryAsset;
  altText?: string;
  fullname?: string;
  position?: string;
  email?: string;
  profileUrl?: string;
  tagline?: string;
  channel?: string[];
  language?: string;
};

interface SmartPeopleProps {
  maxItems?: number;
  language?: string;
  channel?: "1spWeb" | "msmWeb" | "studioco2Web";
}

export default async function SmartPeople({
  maxItems = 6,
  language = "de",
  channel = "1spWeb",
}: SmartPeopleProps) {
  const people = await client.fetch<Person[]>(
    SMART_PEOPLE_QUERY,
    { channel, maxItems: maxItems - 1 },
    {
      next: { revalidate: 60 },
    }
  );

  if (people.length === 0) {
    return (
      <div className="w-full py-16 flex items-center justify-center">
        <div className="text-gray-400">No people found</div>
      </div>
    );
  }

  // Determine grid layout based on number of people
  const getGridClass = () => {
    const count = people.length;
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-3";
    if (count === 4) return "grid-cols-2 md:grid-cols-4";
    if (count === 5) return "grid-cols-3 md:grid-cols-5";
    // 6 or more
    return "grid-cols-3 md:grid-cols-4 lg:grid-cols-6";
  };

  return (
    <section className="w-full  py-8" data-component="smart-people">
      <div className="container mx-auto px-4 ">
        <StaggeredSlideUp className={`grid ${getGridClass()} gap-1`}>
          {people.map((person, index) => (
            <PersonCard key={person._id} person={person} index={index} />
          ))}
        </StaggeredSlideUp>
      </div>
    </section>
  );
}
