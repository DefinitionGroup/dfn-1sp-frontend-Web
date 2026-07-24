"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  PerspectiveCamera,
  Scene,
  Vector3,
} from "three";
import ThreeGlobe from "three-globe";
import { useThree, Canvas, extend, useFrame } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import { cellToLatLng, polygonToCells } from "h3-js";
import countries from "@/data/globe.json";
declare module "@react-three/fiber" {
  interface ThreeElements {
    threeGlobe: ThreeElements["mesh"] & {
      new(): ThreeGlobe;
    };
  }
}

extend({ ThreeGlobe: ThreeGlobe });

const RING_PROPAGATION_SPEED = 1;
const aspect = 1;
const CAMERA_TARGET = new Vector3(0, 0, 0);
const CAMERA_RADIUS = 165;
const DEFAULT_VIEW = { lat: 50, lng: 10 };
const LAND_DOT_RESOLUTION = 5;
const LAND_DOT_SIZE_MULTIPLIER = 0.75;
const LAND_DOT_BASE_SIZE = 0.32;
const LAND_DOT_SIZE = LAND_DOT_BASE_SIZE * LAND_DOT_SIZE_MULTIPLIER;
const LAND_DOT_ALTITUDE = 0.002;
const LABEL_CONNECTOR_START_ALTITUDE = 0.012;
const LABEL_ALTITUDE = 0.08;
const LABEL_HORIZONTAL_OFFSET = 5;
const LABEL_VERTICAL_OFFSET = 4;

/** Camera position facing a lat/lng point using ThreeGlobe's coordinate
 *  orientation, so the configured location lands in the opening view. */
function latLngToCameraPosition(lat: number, lng: number, radius: number) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((90 - lng) * Math.PI) / 180;
  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ] as const;
}

type Position = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
  label: string;
  labelOffsetX?: number;
  labelOffsetY?: number;
};

export type GlobeConfig = {
  pointSize?: number;
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  pointLight?: string;
  arcStroke?: number;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  initialPosition?: {
    lat: number;
    lng: number;
  };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  verticalOffset?: number;
};

interface WorldProps {
  globeConfig: GlobeConfig;
  data: Position[];
}

const numbersOfRings = [0];
const GLOBE_RADIUS = 100;

type GlobeFeatureGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
};

function buildLandDotPositions() {
  const landCells = new Set<string>();

  for (const feature of countries.features) {
    const geometry = feature.geometry as GlobeFeatureGeometry;
    const polygons =
      geometry.type === "Polygon"
        ? [geometry.coordinates as number[][][]]
        : (geometry.coordinates as number[][][][]);

    for (const polygon of polygons) {
      for (const cell of polygonToCells(
        polygon,
        LAND_DOT_RESOLUTION,
        true
      )) {
        landCells.add(cell);
      }
    }
  }

  // Keep every cell at one resolution. Partial child-cell sampling creates
  // visible gaps; a complete H3 lattice keeps the land dots evenly spaced.
  const cells = Array.from(landCells);
  const positions = new Float32Array(cells.length * 3);
  let positionIndex = 0;

  const addCellPosition = (cell: string) => {
    const [lat, lng] = cellToLatLng(cell);
    const position = latLngToVector3(lat, lng, LAND_DOT_ALTITUDE);
    positions[positionIndex] = position.x;
    positions[positionIndex + 1] = position.y;
    positions[positionIndex + 2] = position.z;
    positionIndex += 3;
  };

  for (const cell of cells) addCellPosition(cell);

  return positions;
}

function LandDotPattern({ color }: { color: string }) {
  const positions = useMemo(() => buildLandDotPositions(), []);
  const geometry = useMemo(() => {
    const nextGeometry = new BufferGeometry();
    nextGeometry.setAttribute("position", new BufferAttribute(positions, 3));
    return nextGeometry;
  }, [positions]);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d");

    if (context) {
      context.fillStyle = "#ffffff";
      context.beginPath();
      context.arc(16, 16, 15, 0, Math.PI * 2);
      context.fill();
    }

    return new CanvasTexture(canvas);
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      texture.dispose();
    },
    [geometry, texture]
  );

  return (
    <points geometry={geometry}>
      <pointsMaterial
        alphaTest={0.5}
        color={color}
        depthWrite={false}
        map={texture}
        size={LAND_DOT_SIZE}
        sizeAttenuation
        transparent
      />
    </points>
  );
}

export function Globe({ globeConfig, data }: WorldProps) {
  const globeRef = useRef<ThreeGlobe | null>(null);
  const groupRef = useRef<Group | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const defaultProps = {
    pointSize: 1,
    atmosphereColor: "#f4f4f4",
    showAtmosphere: false,
    atmosphereAltitude: 0.1,
    polygonColor: "rgba(200.200.200,1)",
    globeColor: "#1d072e",
    emissive: "#ffffff",
    emissiveIntensity: 1.0,
    shininess: 1,
    arcStroke: 0.3,
    arcTime: 2000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 2,
    ...globeConfig,
  };

  // Initialize globe only once
  useEffect(() => {
    if (!globeRef.current && groupRef.current) {
      globeRef.current = new ThreeGlobe();
      (groupRef.current as any).add(globeRef.current);
      setIsInitialized(true);
    }
  }, []);

  // Build material when globe is initialized or when relevant props change
  useEffect(() => {
    if (!globeRef.current || !isInitialized) return;

    const globeMaterial = globeRef.current.globeMaterial() as unknown as {
      color: Color;
      emissive: Color;
      emissiveIntensity: number;
      shininess: number;
    };
    globeMaterial.color = new Color(globeConfig.globeColor);
    globeMaterial.emissive = new Color(globeConfig.emissive);
    globeMaterial.emissiveIntensity = globeConfig.emissiveIntensity || 0.1;
    globeMaterial.shininess = globeConfig.shininess || 0.9;
  }, [
    isInitialized,
    globeConfig.globeColor,
    globeConfig.emissive,
    globeConfig.emissiveIntensity,
    globeConfig.shininess,
  ]);

  // Build data when globe is initialized or when data changes
  useEffect(() => {
    if (!globeRef.current || !isInitialized || !data) return;

    const arcs = data;
    const points = [];
    for (let i = 0; i < arcs.length; i++) {
      const arc = arcs[i];
      const rgb = hexToRgb(arc.color) as { r: number; g: number; b: number };
      points.push({
        size: defaultProps.pointSize,
        order: arc.order,
        color: arc.color,
        lat: arc.startLat,
        lng: arc.startLng,
      });
      points.push({
        size: defaultProps.pointSize,
        order: arc.order,
        color: arc.color,
        lat: arc.endLat,
        lng: arc.endLng,
      });
    }

    // remove duplicates for same lat and lng
    const filteredPoints = points.filter(
      (v, i, a) =>
        a.findIndex((v2) =>
          ["lat", "lng"].every(
            (k) => v2[k as "lat" | "lng"] === v[k as "lat" | "lng"]
          )
        ) === i
    );

    globeRef.current
      .showAtmosphere(defaultProps.showAtmosphere)
      .atmosphereColor(defaultProps.atmosphereColor)
      .atmosphereAltitude(defaultProps.atmosphereAltitude);

    globeRef.current
      .arcsData(data)
      .arcStartLat((d) => (d as { startLat: number }).startLat * 1)
      .arcStartLng((d) => (d as { startLng: number }).startLng * 1)
      .arcEndLat((d) => (d as { endLat: number }).endLat * 1)
      .arcEndLng((d) => (d as { endLng: number }).endLng * 1)
      .arcColor((e: any) => (e as { color: string }).color)
      .arcAltitude((e) => (e as { arcAlt: number }).arcAlt * 1)
      .arcStroke(defaultProps.arcStroke)
      .arcDashLength(defaultProps.arcLength)
      .arcDashInitialGap((e) => (e as { order: number }).order * 1)
      .arcDashGap(15)
      .arcDashAnimateTime(() => defaultProps.arcTime);

    globeRef.current
      .pointsData(filteredPoints)
      .pointColor((e) => (e as { color: string }).color)
      .pointsMerge(true)
      .pointAltitude(0.0)
      .pointRadius((e) => (e as { size: number }).size);

    globeRef.current
      .ringsData([])
      .ringColor(() => defaultProps.polygonColor)
      .ringMaxRadius(defaultProps.maxRings)
      .ringPropagationSpeed(RING_PROPAGATION_SPEED)
      .ringRepeatPeriod(
        (defaultProps.arcTime * defaultProps.arcLength) / defaultProps.rings
      );
  }, [
    isInitialized,
    data,
    defaultProps.pointSize,
    defaultProps.showAtmosphere,
    defaultProps.atmosphereColor,
    defaultProps.atmosphereAltitude,
    defaultProps.polygonColor,
    defaultProps.arcStroke,
    defaultProps.arcLength,
    defaultProps.arcTime,
    defaultProps.rings,
    defaultProps.maxRings,
  ]);

  // Handle rings animation with cleanup
  useEffect(() => {
    if (!globeRef.current || !isInitialized || !data) return;

    const interval = setInterval(() => {
      if (!globeRef.current) return;

      const newNumbersOfRings = genRandomNumbers(
        0,
        data.length,
        Math.floor((data.length * 4) / 5)
      );

      const ringsData = data
        .filter((d, i) => newNumbersOfRings.includes(i))
        .map((d) => ({
          lat: d.startLat,
          lng: d.startLng,
          color: d.color,
        }));

      globeRef.current.ringsData(ringsData);
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [isInitialized, data]);

  return <group ref={groupRef} />;
}

function latLngToVector3(lat: number, lng: number, altitude = 0.05) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (90 - lng) * (Math.PI / 180);
  const radius = GLOBE_RADIUS * (1 + altitude);
  const sinPhi = Math.sin(phi);

  return new Vector3(
    radius * sinPhi * Math.cos(theta),
    radius * Math.cos(phi),
    radius * sinPhi * Math.sin(theta)
  );
}

function ArcLabels({ data }: Pick<WorldProps, "data">) {
  const { camera } = useThree();
  const labelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const labelPoints = useMemo(
    () =>
      data.map((arc, idx) => {
        const connectorStart = latLngToVector3(
          arc.endLat,
          arc.endLng,
          LABEL_CONNECTOR_START_ALTITUDE
        );
        const normal = connectorStart.clone().normalize();
        const horizontalTangent = new Vector3(
          -normal.z,
          0,
          normal.x
        ).normalize();
        const verticalTangent = horizontalTangent
          .clone()
          .cross(normal)
          .normalize();
        const side = idx % 2 === 0 ? 1 : -1;
        const vector = latLngToVector3(
          arc.endLat,
          arc.endLng,
          LABEL_ALTITUDE
        )
          .add(horizontalTangent.multiplyScalar(side * LABEL_HORIZONTAL_OFFSET))
          .add(
            verticalTangent.multiplyScalar(
              LABEL_VERTICAL_OFFSET + (idx % 3) * 1.5
            )
          );
        return {
          key: `${arc.label}-${idx}`,
          vector,
          normal: vector.clone().normalize(),
          position: vector.toArray() as [number, number, number],
          connectorStart: connectorStart.toArray() as [number, number, number],
          color: arc.color,
          text: arc.label,
          labelOffsetX: arc.labelOffsetX ?? 0,
          labelOffsetY: arc.labelOffsetY ?? 0,
        };
      }),
    [data]
  );

  const labelPointsRef = useRef(labelPoints);
  useEffect(() => {
    labelPointsRef.current = labelPoints;
  }, [labelPoints]);

  const cameraWorldPosition = useMemo(() => new Vector3(), []);
  const cameraDirection = useMemo(() => new Vector3(), []);

  useFrame(() => {
    camera.getWorldPosition(cameraWorldPosition);
    cameraDirection.copy(cameraWorldPosition).normalize();
    const points = labelPointsRef.current;
    for (const point of points) {
      const element = labelRefs.current[point.key];
      if (!element) continue;
      const isVisible = cameraDirection.dot(point.normal) > 0;
      element.style.opacity = isVisible ? "1" : "0";
      element.style.visibility = isVisible ? "visible" : "hidden";
      element.style.pointerEvents = isVisible ? "auto" : "none";
    }
  });

  return (
    <group>
      {labelPoints.map((point) => (
        <group key={point.key}>
          <Line
            points={[point.connectorStart, point.position]}
            color={point.color}
            lineWidth={1}
            opacity={0.72}
            transparent
          />
          <Html
            ref={(instance) => {
              if (instance) {
                labelRefs.current[point.key] = instance;
              } else {
                delete labelRefs.current[point.key];
              }
            }}
            position={point.position}
            center
            distanceFactor={45}
            style={{ pointerEvents: "none" }}
          >
            <span
              data-globe-label={point.text}
              style={{
                display: "block",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "1.125rem",
                backgroundColor: "#7c5cff",
                padding: "0.195rem 0.45rem",
                borderRadius: "100px",
                textTransform: "uppercase",
                transform: `translate3d(${point.labelOffsetX}px, ${point.labelOffsetY}px, 0)`,
                whiteSpace: "nowrap",
              }}
            >
              {point.text}
            </span>
          </Html>
        </group>
      ))}
    </group>
  );
}

export function WebGLRendererConfig() {
  const { gl, size } = useThree();

  useEffect(() => {
    gl.setPixelRatio(window.devicePixelRatio);
    gl.setSize(size.width, size.height);
    gl.setClearColor(0xffaaff, 0);
  }, [gl, size]);

  return null;
}

function CameraAspectController({
  verticalOffset,
}: {
  verticalOffset: number;
}) {
  const { camera, size } = useThree();

  useEffect(() => {
    const perspectiveCamera = camera as PerspectiveCamera;
    perspectiveCamera.aspect = size.width / size.height;
    perspectiveCamera.clearViewOffset();

    if (verticalOffset !== 0) {
      perspectiveCamera.setViewOffset(
        size.width,
        size.height,
        0,
        -size.height * verticalOffset,
        size.width,
        size.height
      );
    } else {
      perspectiveCamera.updateProjectionMatrix();
    }
  }, [camera, size, verticalOffset]);

  return null;
}

function CameraInitialView({
  initialPosition,
}: {
  initialPosition?: { lat: number; lng: number };
}) {
  const { camera } = useThree();
  const lat = initialPosition?.lat ?? DEFAULT_VIEW.lat;
  const lng = initialPosition?.lng ?? DEFAULT_VIEW.lng;

  useEffect(() => {
    const [x, y, z] = latLngToCameraPosition(lat, lng, CAMERA_RADIUS);
    camera.position.set(x, y, z);
    camera.lookAt(CAMERA_TARGET);
  }, [camera, lat, lng]);

  return null;
}

export function World(props: WorldProps) {
  const { globeConfig, data } = props;
  const scene = new Scene();

  return (
    <Canvas scene={scene} camera={new PerspectiveCamera(50, aspect, 0.1, 2000)}>
      <WebGLRendererConfig />
      <CameraAspectController
        verticalOffset={globeConfig.verticalOffset ?? 0}
      />
      <CameraInitialView initialPosition={globeConfig.initialPosition} />
      <ambientLight color={globeConfig.ambientLight} intensity={1.8} />

      <Globe {...props} />
      <LandDotPattern color={globeConfig.polygonColor ?? "#7c5cff"} />
      <ArcLabels data={data} />
      {/* enableZoom=false: distance is pinned anyway (min === max), and a
          wheel listener here would swallow page scrolling over the globe */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minDistance={CAMERA_RADIUS}
        maxDistance={CAMERA_RADIUS}
        target={[CAMERA_TARGET.x, CAMERA_TARGET.y, CAMERA_TARGET.z]}
        autoRotateSpeed={globeConfig.autoRotateSpeed ?? 0.15}
        autoRotate={globeConfig.autoRotate ?? true}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}

export function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : null;
}

export function genRandomNumbers(min: number, max: number, count: number) {
  const arr = [];
  while (arr.length < count) {
    const r = Math.floor(Math.random() * (max - min)) + min;
    if (arr.indexOf(r) === -1) arr.push(r);
  }

  return arr;
}
