import { client } from "@/sanity/lib/client";
import { SMART_PEOPLE_QUERY } from "@/sanity/lib/queries";
import PeopleShowcaseHero, {
  type MemberItem,
} from "@/components/pagebuilder/Fragments/pg-PeopleShowcaseHero";

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

  // Transform Person[] to MemberItem[] for PeopleShowcaseHero
  const members: MemberItem[] = people.map((person) => ({
    name: person.name,
    media: (person.video || person.image) as MemberItem["media"],
    altText: person.altText,
    fullname: person.fullname,
    email: person.email,
    profileUrl: person.profileUrl,
    position: person.position,
  }));

  return (
    <section className="w-full py-8" data-component="smart-people">
      <div className="container mx-auto px-4">
        <PeopleShowcaseHero members={members} />
      </div>
    </section>
  );
}
