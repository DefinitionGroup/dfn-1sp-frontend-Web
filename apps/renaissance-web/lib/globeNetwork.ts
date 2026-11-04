import { stegaClean } from "@sanity/client/stega";
import type { GlobeLocationType } from "@1sp/sanity-types";

/** CMS value to location type; anything but "partner" (including unset) is an office. */
export function getGlobeLocationType(value: unknown): GlobeLocationType {
  return stegaClean(value) === "partner" ? "partner" : "office";
}

/** One CMS location, normalised for the globe. */
export type NetworkLocation = {
  key: string;
  name: string;
  lat: number;
  lng: number;
  type: GlobeLocationType;
};

export type NetworkArc = {
  from: NetworkLocation;
  to: NetworkLocation;
  /** Animation order, starting at 1. */
  order: number;
  /** Arc height as a fraction of the globe radius. */
  altitude: number;
};

/** A group of nearby locations the camera tour shows in one stop. */
export type NetworkRegion = {
  lat: number;
  lng: number;
  /** Angle in radians from the region centre to its farthest location. */
  spread: number;
  keys: string[];
};

/** Marker, label and arc colours per location type. */
export const GLOBE_LOCATION_PALETTE: Record<
  GlobeLocationType,
  { marker: string; ring: string; label: string; labelText: string; arc: string }
> = {
  // Colours of the approved location icons: orange pin, ink label text.
  office: {
    marker: "#ff9500",
    ring: "#ff9500",
    label: "#ff9500",
    labelText: "#163f45",
    arc: "#ff9500",
  },
  // Green partner-agency icon; the pulse and arcs use Action Teal so they
  // read on the petrol land dots.
  partner: {
    marker: "#006067",
    ring: "#3b9ca7",
    label: "#006067",
    labelText: "#ffffff",
    arc: "#3b9ca7",
  },
};

const EARTH_RADIUS_KM = 6371;
/** Locations closer than this to any member join the same tour region. */
const REGION_LINK_KM = 3000;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const toDegrees = (radians: number) => (radians * 180) / Math.PI;

function unitVector(lat: number, lng: number): [number, number, number] {
  const phi = toRadians(lat);
  const lambda = toRadians(lng);
  return [
    Math.cos(phi) * Math.cos(lambda),
    Math.cos(phi) * Math.sin(lambda),
    Math.sin(phi),
  ];
}

/** Great-circle angle between two points, in radians. */
export function angularDistance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const [ax, ay, az] = unitVector(a.lat, a.lng);
  const [bx, by, bz] = unitVector(b.lat, b.lng);
  return Math.acos(Math.min(1, Math.max(-1, ax * bx + ay * by + az * bz)));
}

/** Arc height grows with the distance it spans, so long hops clear the globe. */
export function arcAltitude(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
) {
  return 0.05 + 0.3 * (angularDistance(from, to) / Math.PI);
}

function nearest(target: NetworkLocation, candidates: NetworkLocation[]) {
  let best = candidates[0];
  let bestDistance = Infinity;
  for (const candidate of candidates) {
    const distance = angularDistance(target, candidate);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

/**
 * Hub and spoke: the first office links to every other office, and each
 * partner agency links to its nearest office.
 */
export function buildNetworkArcs(locations: NetworkLocation[]): NetworkArc[] {
  const offices = locations.filter((location) => location.type === "office");
  const hubs = offices.length ? offices : locations.slice(0, 1);
  const hub = hubs[0];
  if (!hub) return [];

  return locations
    .filter((location) => location !== hub)
    .map((location, index) => {
      const from = location.type === "office" ? hub : nearest(location, hubs);
      return {
        from,
        to: location,
        order: index + 1,
        altitude: arcAltitude(from, location),
      };
    });
}

function regionCentre(members: NetworkLocation[]) {
  let [x, y, z] = [0, 0, 0];
  for (const member of members) {
    const [mx, my, mz] = unitVector(member.lat, member.lng);
    x += mx;
    y += my;
    z += mz;
  }
  const length = Math.hypot(x, y, z);
  // Antipodal members cancel out; fall back to the first one.
  if (length < 1e-6) return { lat: members[0].lat, lng: members[0].lng };
  return {
    lat: toDegrees(Math.asin(z / length)),
    lng: toDegrees(Math.atan2(y, x)),
  };
}

/**
 * Groups locations into tour regions: any two locations within
 * REGION_LINK_KM of each other share a region. Regions keep the CMS order
 * of their first location.
 */
export function buildNetworkRegions(
  locations: NetworkLocation[],
  linkKm = REGION_LINK_KM,
): NetworkRegion[] {
  const linkAngle = linkKm / EARTH_RADIUS_KM;
  const parent = locations.map((_, index) => index);
  const root = (index: number): number => {
    while (parent[index] !== index) {
      parent[index] = parent[parent[index]];
      index = parent[index];
    }
    return index;
  };

  for (let a = 0; a < locations.length; a++) {
    for (let b = a + 1; b < locations.length; b++) {
      if (angularDistance(locations[a], locations[b]) <= linkAngle) {
        const [ra, rb] = [root(a), root(b)];
        // Keep the lower index as root so regions follow the CMS order.
        if (ra !== rb) parent[Math.max(ra, rb)] = Math.min(ra, rb);
      }
    }
  }

  const groups = new Map<number, NetworkLocation[]>();
  locations.forEach((location, index) => {
    const key = root(index);
    groups.set(key, [...(groups.get(key) ?? []), location]);
  });

  return Array.from(groups.entries())
    .sort(([a], [b]) => a - b)
    .map(([, members]) => {
      const centre = regionCentre(members);
      return {
        ...centre,
        spread: Math.max(...members.map((member) => angularDistance(centre, member))),
        keys: members.map((member) => member.key),
      };
    });
}
