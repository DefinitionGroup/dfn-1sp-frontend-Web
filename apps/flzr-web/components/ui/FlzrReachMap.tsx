import Image from "next/image";
import type { FlzrEuropeanLocation } from "@flzr/data/europeanLocations";

const LABEL_POSITIONS: Record<string, { left: string; top: string }> = {
  DE: { left: "48.4%", top: "20.9%" },
  PL: { left: "55.3%", top: "12.8%" },
  ES: { left: "15.2%", top: "78.9%" },
  AT: { left: "42.3%", top: "33.1%" },
  FR: { left: "32.1%", top: "50.4%" },
  IT: { left: "39.4%", top: "72.9%" },
};

export default function FlzrReachMap({
  locations,
}: {
  locations: FlzrEuropeanLocation[];
}) {
  const visibleLabels = locations.filter(
    (location) => location.code in LABEL_POSITIONS,
  );

  return (
    <div className="flzr-reach-map" aria-label="FLZR European markets">
      <Image
        src="/units/FLZR/reach-europe-map.png"
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 62vw"
        className="object-contain"
        aria-hidden="true"
      />
      {visibleLabels.map((location) => (
        <span
          key={location.code}
          className="flzr-reach-map__label"
          style={LABEL_POSITIONS[location.code]}
        >
          {location.name}
        </span>
      ))}
    </div>
  );
}
