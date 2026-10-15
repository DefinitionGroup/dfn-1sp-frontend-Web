"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Color, Scene, PerspectiveCamera, Vector3, Group } from "three";
import ThreeGlobe from "three-globe";
import { useThree, Canvas, extend, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
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
const CAMERA_FORWARD = 160;
const CAMERA_HEIGHT = 100;
const CAMERA_TARGET = new Vector3(0, 30, 0);
const CAMERA_RADIUS = Math.sqrt(
  CAMERA_FORWARD * CAMERA_FORWARD + CAMERA_HEIGHT * CAMERA_HEIGHT
);

type Position = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
  label: string;
};

export type GlobeConfig = {
  pointSize?: number;
  /** Location dot radius in degrees (default 2). */
  pointRadius?: number;
  /** Land cell gap, 0–1; higher draws smaller land marks (default 0.3). */
  hexMargin?: number;
  /** Draw land as round dots instead of hexagons (default false). */
  hexUseDots?: boolean;
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
};

interface WorldProps {
  globeConfig: GlobeConfig;
  data: Position[];
  /** OrbitControls auto-rotate speed (default 1.1). */
  rotateSpeed?: number;
  /** Stop the render loop, e.g. while the globe is offscreen. */
  paused?: boolean;
  /** Static arcs, no rings and no auto-rotation. */
  reducedMotion?: boolean;
  /** Camera distance multiplier; above 1 shows more of the globe (default 1). */
  distance?: number;
}

const numbersOfRings = [0];
const Y_AXIS = new Vector3(0, 1, 0);
const GLOBE_RADIUS = 100;

export function Globe({ globeConfig, data, reducedMotion = false }: WorldProps) {
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
      .hexPolygonsData(countries.features)
      .hexPolygonResolution(4)
      .hexPolygonMargin(globeConfig.hexMargin ?? 0.3)
      .hexPolygonUseDots(globeConfig.hexUseDots ?? false)
      .showAtmosphere(defaultProps.showAtmosphere)
      .atmosphereColor(defaultProps.atmosphereColor)
      .atmosphereAltitude(defaultProps.atmosphereAltitude)
      .hexPolygonColor(() => defaultProps.polygonColor);

    globeRef.current
      .arcsData(data)
      .arcStartLat((d) => (d as { startLat: number }).startLat * 1)
      .arcStartLng((d) => (d as { startLng: number }).startLng * 1)
      .arcEndLat((d) => (d as { endLat: number }).endLat * 1)
      .arcEndLng((d) => (d as { endLng: number }).endLng * 1)
      .arcColor((e: any) => (e as { color: string }).color)
      .arcAltitude((e) => (e as { arcAlt: number }).arcAlt * 1)
      .arcStroke(() => [0.32, 0.28, 0.3][Math.round(Math.random() * 2)])
      .arcDashLength(reducedMotion ? 1 : defaultProps.arcLength)
      .arcDashInitialGap((e) => (reducedMotion ? 0 : (e as { order: number }).order * 1))
      .arcDashGap(reducedMotion ? 0 : 15)
      .arcDashAnimateTime(() => (reducedMotion ? 0 : defaultProps.arcTime));

    globeRef.current
      .pointsData(filteredPoints)
      .pointColor((e) => (e as { color: string }).color)
      .pointsMerge(true)
      .pointAltitude(0.0)
      .pointRadius(globeConfig.pointRadius ?? 2);

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
    defaultProps.arcLength,
    defaultProps.arcTime,
    defaultProps.rings,
    defaultProps.maxRings,
    globeConfig.pointRadius,
    globeConfig.hexMargin,
    globeConfig.hexUseDots,
    reducedMotion,
  ]);

  // Handle rings animation with cleanup
  useEffect(() => {
    if (!globeRef.current || !isInitialized || !data || reducedMotion) return;

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
  }, [isInitialized, data, reducedMotion]);

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

function ArcLabels({ data, rotationY = 0 }: Pick<WorldProps, "data"> & { rotationY?: number }) {
  const { camera } = useThree();
  const labelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const labelPoints = useMemo(
    () =>
      data.map((arc, idx) => {
        const vector = latLngToVector3(arc.endLat, arc.endLng, 0.08).applyAxisAngle(Y_AXIS, rotationY);
        return {
          key: `${arc.label}-${idx}`,
          vector,
          normal: vector.clone().normalize(),
          position: vector.toArray() as [number, number, number],
          color: arc.color,
          text: arc.label,
        };
      }),
    [data, rotationY]
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
        <Html
          key={point.key}
          ref={(instance) => {
            if (instance) {
              labelRefs.current[point.key] = instance;
            } else {
              delete labelRefs.current[point.key];
            }
          }}
          position={point.position}
          center
          distanceFactor={120}
          style={{
            color: point.color,
            fontWeight: "inherit",
            fontSize: "0.5rem",
            letterSpacing: "0.12em",
            backgroundColor: "rgba(10,12,13,0.72)",
            padding: "0.13rem 0.3rem",
            borderRadius: 0,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {point.text}
        </Html>
      ))}
    </group>
  );
}

export function WebGLRendererConfig() {
  const { gl, size } = useThree();

  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    gl.setSize(size.width, size.height);
    gl.setClearColor(0xffaaff, 0);
  }, [gl, size]);

  return null;
}

function CameraAspectController() {
  const { camera, size } = useThree();

  useEffect(() => {
    const perspectiveCamera = camera as PerspectiveCamera;
    perspectiveCamera.aspect = size.width / size.height;
    perspectiveCamera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

function CameraTopHalfFocus({ distance = 1 }: { distance?: number }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, CAMERA_HEIGHT, CAMERA_FORWARD).sub(CAMERA_TARGET).multiplyScalar(distance).add(CAMERA_TARGET);
    camera.lookAt(CAMERA_TARGET);
  }, [camera, distance]);

  return null;
}

export function World(props: WorldProps) {
  const { globeConfig, data, rotateSpeed = 1.1, paused = false, reducedMotion = false, distance = 1 } = props;
  // Keep the orbit radius consistent with the camera's offset from the target.
  const orbitRadius = new Vector3(0, CAMERA_HEIGHT, CAMERA_FORWARD).sub(CAMERA_TARGET).length() * distance;
  const scene = useMemo(() => new Scene(), []);
  const camera = useMemo(() => new PerspectiveCamera(50, aspect, 0.1, 2000), []);
  // Face the configured longitude: lng 0 sits on +z, towards the camera.
  const rotationY = (-(globeConfig.initialPosition?.lng ?? 0) * Math.PI) / 180;

  return (
    <Canvas scene={scene} camera={camera} frameloop={paused ? "never" : "always"}>
      <WebGLRendererConfig />
      <CameraAspectController />
      <CameraTopHalfFocus distance={distance} />
      <ambientLight color={globeConfig.ambientLight} intensity={1.8} />

      <group rotation={[0, rotationY, 0]}>
        <Globe {...props} />
      </group>
      <ArcLabels data={data} rotationY={rotationY} />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={distance === 1 ? CAMERA_RADIUS : orbitRadius}
        maxDistance={distance === 1 ? CAMERA_RADIUS : orbitRadius}
        target={[CAMERA_TARGET.x, CAMERA_TARGET.y, CAMERA_TARGET.z]}
        autoRotateSpeed={rotateSpeed}
        autoRotate={!reducedMotion}
        minPolarAngle={Math.PI / 3.2}
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
