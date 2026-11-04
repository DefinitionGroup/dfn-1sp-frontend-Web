// TEMPORARY test page: the global-reach globe on its own, with hardcoded
// locations and no navigation, footer, title or subheadline. Remove once the
// globe review is done.
import type { Metadata } from "next";
import type { GlobeComponent as GlobeComponentType } from "@1sp/sanity-types";
import GlobeComponent from "@renaissance/components/pagebuilder/pg-GlobeComponent";

export const metadata: Metadata = {
  title: "Globe test",
  robots: { index: false, follow: false },
};

type Location = NonNullable<GlobeComponentType["locations"]>[number];

const location = (
  _key: string,
  name: string,
  subtitle: string,
  coordinateLat: number,
  coordinateLon: number,
  locationType: Location["locationType"],
): Location => ({ _key, name, subtitle, coordinateLat, coordinateLon, locationType });

// Mirrors the published home page block (Missouri and Ontario at their capitals).
const GLOBE: GlobeComponentType = {
  _type: "globeComponent",
  locations: [
    location("london", "London", "England", 51.5074, -0.1278, "office"),
    location("manchester", "Manchester", "England", 53.4808, -2.2426, "office"),
    location("los-angeles", "Los Angeles", "USA", 34.0522, -118.2437, "office"),
    location("new-york", "New York", "USA", 40.7128, -74.006, "office"),
    location("missouri", "Missouri", "USA", 38.5767, -92.1735, "office"),
    location("ontario", "Ontario", "Canada", 43.6532, -79.3832, "office"),
    location("paris", "Paris", "France", 48.8566, 2.3522, "partner"),
    location("madrid", "Madrid", "Spain", 40.4168, -3.7038, "partner"),
    location("hamburg", "Hamburg", "Germany", 53.5511, 9.9937, "partner"),
    location("sao-paulo", "São Paulo", "Brazil", -23.5505, -46.6333, "partner"),
    location("porto", "Porto", "Portugal", 41.1579, -8.6291, "partner"),
    location("milan", "Milan", "Italy", 45.4642, 9.19, "partner"),
    location("gothenburg", "Gothenburg", "Sweden", 57.7089, 11.9746, "partner"),
    location("shanghai", "Shanghai", "China", 31.2304, 121.4737, "partner"),
  ],
};

export default function GlobeTestPage() {
  return (
    <main className="min-h-screen bg-renaissance-mist">
      <GlobeComponent data={GLOBE} language="en" hideCopy minHeight="100svh" />
    </main>
  );
}
