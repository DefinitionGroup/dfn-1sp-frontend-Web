import assert from "node:assert/strict";
import test from "node:test";

import {
  angularDistance,
  buildNetworkArcs,
  buildNetworkRegions,
  type NetworkLocation,
} from "../apps/renaissance-web/lib/globeNetwork";

const office = (name: string, lat: number, lng: number): NetworkLocation => ({
  key: name,
  name,
  lat,
  lng,
  type: "office",
});
const partner = (name: string, lat: number, lng: number): NetworkLocation => ({
  ...office(name, lat, lng),
  type: "partner",
});

// The Renaissance network as published in November 2026.
const LOCATIONS = [
  office("London", 51.5074, -0.1278),
  office("Manchester", 53.4808, -2.2426),
  office("Los Angeles", 34.0522, -118.2437),
  office("New York", 40.7128, -74.006),
  office("Missouri", 38.5767, -92.1735),
  office("Ontario", 43.6532, -79.3832),
  partner("Paris", 48.8566, 2.3522),
  partner("Madrid", 40.4168, -3.7038),
  partner("Hamburg", 53.5511, 9.9937),
  partner("São Paulo", -23.5505, -46.6333),
  partner("Porto", 41.1579, -8.6291),
  partner("Milan", 45.4642, 9.19),
  partner("Gothenburg", 57.7089, 11.9746),
  partner("Shanghai", 31.2304, 121.4737),
];

test("London to Paris is about 344 km", () => {
  const km = angularDistance(LOCATIONS[0], LOCATIONS[6]) * 6371;
  assert.ok(Math.abs(km - 344) < 5, `${km}`);
});

test("the first office is the hub and partners link to their nearest office", () => {
  const arcs = buildNetworkArcs(LOCATIONS);
  assert.equal(arcs.length, LOCATIONS.length - 1);
  const source = Object.fromEntries(arcs.map((arc) => [arc.to.name, arc.from.name]));

  for (const name of ["Manchester", "Los Angeles", "New York", "Missouri", "Ontario"]) {
    assert.equal(source[name], "London", name);
  }
  assert.equal(source["São Paulo"], "New York");
  // The two UK offices sit within 100 km of each other's distance to these.
  assert.ok(["London", "Manchester"].includes(source.Shanghai));
  assert.ok(["London", "Manchester"].includes(source.Gothenburg));
  assert.deepEqual(
    arcs.map((arc) => arc.order),
    arcs.map((_, index) => index + 1),
  );
  // Longer hops arc higher.
  const altitude = Object.fromEntries(arcs.map((arc) => [arc.to.name, arc.altitude]));
  assert.ok(altitude.Shanghai > altitude.Paris);
});

test("locations group into four tour regions in CMS order", () => {
  const regions = buildNetworkRegions(LOCATIONS);
  assert.deepEqual(
    regions.map((region) => region.keys),
    [
      ["London", "Manchester", "Paris", "Madrid", "Hamburg", "Porto", "Milan", "Gothenburg"],
      ["Los Angeles", "New York", "Missouri", "Ontario"],
      ["São Paulo"],
      ["Shanghai"],
    ],
  );
  const [europe, northAmerica, saoPaulo] = regions;
  assert.ok(europe.lat > 45 && europe.lat < 52 && europe.lng > -3 && europe.lng < 6);
  assert.ok(northAmerica.lng < -85 && northAmerica.lng > -100);
  assert.equal(saoPaulo.spread, 0);
  assert.ok(europe.spread < northAmerica.spread);
});

test("a network without offices uses its first location as the hub", () => {
  const arcs = buildNetworkArcs([LOCATIONS[6], LOCATIONS[7], LOCATIONS[8]]);
  assert.deepEqual(
    arcs.map((arc) => `${arc.from.name}>${arc.to.name}`),
    ["Paris>Madrid", "Paris>Hamburg"],
  );
  assert.deepEqual(buildNetworkArcs([]), []);
  assert.deepEqual(buildNetworkRegions([]), []);
});
