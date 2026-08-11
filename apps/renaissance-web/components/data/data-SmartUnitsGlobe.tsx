import { client } from "@1sp/sanity-queries/client";
import { SMART_UNITS_GLOBE_QUERY } from "@1sp/sanity-queries/groq";
import GlobalDataComponent from "@renaissance/components/pagebuilder/pg-GlobalDataComponent";

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

type Unit = {
  _id: string;
  _type: string;
  name: string;
  slug?: { current: string };
  coordinateLat: number;
  coordinateLon: number;
  tagline?: string;
  logo?: CloudinaryAsset;
};

interface SmartUnitsGlobeProps {
  language?: string;
  title?: string;
  description?: string;
  pointSize?: number;
  globeColor?: string;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  initialLat?: number;
  initialLng?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

export default async function SmartUnitsGlobe({
  language = "de",
  title = "We are global.",
  description = "You will find us connecting businesses and people across the world.",
  pointSize = 1,
  globeColor = "#fdfdfd",
  arcTime = 1555,
  arcLength = 0.95,
  rings = 1,
  maxRings = 3,
  initialLat = 40,
  initialLng = 10,
  autoRotate = true,
  autoRotateSpeed = 0.15,
}: SmartUnitsGlobeProps) {
  const units = await client.fetch<Unit[]>(
    SMART_UNITS_GLOBE_QUERY,
    { language },
    {
      next: { revalidate: 60 },
    }
  );

  if (units.length === 0) {
    return (
      <div className="w-full py-16 flex items-center justify-center">
        <div className="text-gray-400">
          No units available for globe display. Please check: (1) Units have
          coordinateLat and coordinateLon filled in Sanity Studio, (2) Units are
          set to isActive=true, (3) Units have showOnGlobe enabled or the field
          is not set, (4) You've saved/published the units in Sanity Studio.
        </div>
      </div>
    );
  }

  // Transform units data into globe arcs format — Renaissance teal family.
  const colors = ["#008da7", "#45b5c9", "#cbeaf0"];

  // Create arcs: each unit connects from the PREVIOUS unit to the CURRENT unit
  // Unit 2 -> Unit 0
  // Unit 0 -> Unit 1
  // Unit 1 -> Unit 2
  // This ensures the "End" of the arc (where the label is) matches the current unit
  const arcs = units.map((unit, index) => {
    // Connect from previous unit (or wrap around to last unit)
    const prevIndex = (index - 1 + units.length) % units.length;
    const prevUnit = units[prevIndex];

    return {
      order: Math.floor(index / 3) + 1,
      startLat: prevUnit.coordinateLat,
      startLng: prevUnit.coordinateLon,
      endLat: unit.coordinateLat,
      endLng: unit.coordinateLon,
      arcAlt: 0.1 + (index % 3) * 0.1,
      color: colors[index % colors.length],
      label: unit.name,
    };
  });

  const globeConfig = {
    pointSize,
    globeColor,
    showAtmosphere: false,
    atmosphereColor: "#ffffff",
    atmosphereAltitude: 0.1,
    emissive: "#ffffff",
    emissiveIntensity: 1,
    shininess: 1,
    polygonColor: "rgba(124,92,255,1)",
    ambientLight: "#ffffff",
    directionalLeftLight: "#ffffff",
    directionalTopLight: "#ffffff",
    pointLight: "#ffffff",
    arcTime,
    arcLength,
    rings,
    maxRings,
    initialPosition: { lat: initialLat, lng: initialLng },
    autoRotate,
    autoRotateSpeed,
  };

  return (
    <GlobalDataComponent
      arcs={arcs}
      globeConfig={globeConfig}
      title={title}
      description={description}
    />
  );
}
