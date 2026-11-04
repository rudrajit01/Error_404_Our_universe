"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

import {
  getPlanetPositions,
  type PlanetName,
} from "@/lib/planetPositions";

import friends from "@/data/friends";
import { planetStyles } from "@/lib/planetStyles";
import ShootingStars from "@/components/ShootingStars";
// --------------------------------------
// TYPES
// --------------------------------------

interface Friend {
  id?: string | number;
  name?: string;
  nickname?: string;
  personality?: string;
  hobbies?: string;
  memory?: string;
  body?: PlanetName;
  profile?: {
    avatar?: string;
    photo?: string;
    birthday?: string;
  };
}

interface PlanetSettings {
  color: string;
  size: number;
}

interface PlanetData
  extends Omit<Friend, "personality" | "hobbies" | "profile">,
    PlanetSettings {
  id: string;
  name: string;
  body: PlanetName;
  nickname: string;

  personality: string | string[];
  hobbies: string | string[];

  skills?: string[];
  memory?: string;
  memories?: string[];

  profile?: {
    photo?: string;
    avatar?: string;
    birthday?: string;
    location?: string;
  };

  favourites?: {
    food?: string;
    music?: string;
    movie?: string;
    color?: string;
  };

  gallery?: string[];
  videos?: string[];

  socialLinks?: {
    instagram?: string;
    facebook?: string;
    github?: string;
    linkedin?: string;
  };
}

type Vector3Position = [number, number, number];

interface PlanetPosition {
  x: number;
  y: number;
  z: number;
}

// --------------------------------------
// PLANET SETTINGS
// --------------------------------------

const planetSettings: PlanetSettings[] = [
  { color: "#ff6b6b", size: 0.35 },
  { color: "#ffd166", size: 0.45 },
  { color: "#06d6a0", size: 0.4 },
  { color: "#4cc9f0", size: 0.55 },
  { color: "#a78bfa", size: 0.42 },
  { color: "#f472b6", size: 0.5 },
  { color: "#fb923c", size: 0.38 },
  { color: "#94a3b8", size: 0.48 },
];

const planetOrder: PlanetName[] = [
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
];

// --------------------------------------
// FRIEND DATA
// --------------------------------------

const friendList: Friend[] = Array.isArray(friends)
  ? (friends as Friend[])
  : [];

const planets: PlanetData[] = friendList
  .slice(0, planetSettings.length)
  .map((friend, index) => ({
    ...friend,
    ...planetSettings[index],

    id: String(friend.id ?? `friend-${index + 1}`),

    name:
      friend.name ??
      `Friend ${String(index + 1).padStart(2, "0")}`,

    body: friend.body ?? planetOrder[index] ?? "earth",

    nickname: friend.nickname ?? "Your Cosmic Friend",
    personality: friend.personality ?? "Not added yet",
    hobbies: friend.hobbies ?? "Not added yet",
    memory:
      friend.memory ?? "Our memories are still being written...",
  }));

// --------------------------------------
// ASTRONOMICAL POSITION SCALING
// --------------------------------------

function getDisplayPosition(position: PlanetPosition): {
  position: Vector3Position;
  displayRadius: number;
} {
  const distance = Math.hypot(position.x, position.y, position.z);

  if (!Number.isFinite(distance) || distance === 0) {
    return { position: [0, 0, 0], displayRadius: 2.4 };
  }

  const displayRadius = 2.4 + Math.log1p(distance) * 2.6;

  return {
    position: [
      (position.x / distance) * displayRadius,
      (position.y / distance) * displayRadius,
      (position.z / distance) * displayRadius,
    ],
    displayRadius,
  };
}

// --------------------------------------
// SUN
// --------------------------------------

function Sun() {
  const sunRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={sunRef}>
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshBasicMaterial color="#ff9d00" />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.85, 48, 48]} />
        <meshBasicMaterial
          color="#ff8c00"
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.15, 48, 48]} />
        <meshBasicMaterial
          color="#ff6b00"
          transparent
          opacity={0.045}
          depthWrite={false}
        />
      </mesh>

      <pointLight
        color="#ff9d00"
        intensity={100}
        distance={50}
        decay={2}
      />
    </group>
  );
}

// --------------------------------------
// ORBIT PATH
// --------------------------------------

function OrbitPath({ radius }: { radius: number }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.012, radius + 0.012, 128]} />
      <meshBasicMaterial
        color="#64748b"
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// --------------------------------------
// PLANET
// --------------------------------------

function Planet({
  planet,
  position,
  onSelect,
  showLabel,
}: {
  planet: PlanetData;
  position: Vector3Position;
  onSelect: (name: string) => void;
  showLabel: boolean;
}) {
  const planetRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <>
      <mesh
        ref={planetRef}
        position={position}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(planet.name);
        }}
      >
        <sphereGeometry args={[planet.size, 48, 48]} />
        <meshStandardMaterial
          color={planet.color}
          emissive={planet.color}
          emissiveIntensity={0.35}
          roughness={0.45}
          metalness={0.3}
        />
      </mesh>

      {planet.body === "saturn" && (
        <mesh
          position={position}
          rotation={[Math.PI / 2.5, 0, 0]}
        >
          <ringGeometry
            args={[planet.size + 0.12, planet.size + 0.55, 64]}
          />
          <meshStandardMaterial
            color="#d6b98c"
            side={THREE.DoubleSide}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {showLabel && (
        <Html
          position={[
            position[0],
            position[1] + planet.size + 0.4,
            position[2],
          ]}
          center
          distanceFactor={15}
          occlude={false}
        >
          <div className="pointer-events-none whitespace-nowrap rounded-full border border-cyan-300/30 bg-black/75 px-3 py-1 font-mono text-[10px] text-white shadow-lg backdrop-blur-md">
            {planet.name}
          </div>
        </Html>
      )}
    </>
  );
}

// --------------------------------------
// SOLAR SCENE
// --------------------------------------

function SolarScene({
  onSelect,
  showLabels,
}: {
  onSelect: (name: string) => void;
  showLabels: boolean;
}) {
  const [positions, setPositions] = useState<
    Record<PlanetName, PlanetPosition>
  >(() => getPlanetPositions(new Date()));

  const simulationTimeRef = useRef(Date.now());
  const lastFrameRef = useRef<number | null>(null);

  const TIME_SPEED = 86400; // 1 real second = 1 simulated day

  useEffect(() => {
    let animationId = 0;

    const animate = (timestamp: number) => {
      if (lastFrameRef.current !== null) {
        const delta = Math.min(
          (timestamp - lastFrameRef.current) / 1000,
          0.05,
        );

        simulationTimeRef.current += delta * TIME_SPEED * 1000;

        const simulatedDate = new Date(simulationTimeRef.current);

        setPositions(getPlanetPositions(simulatedDate));
      }

      lastFrameRef.current = timestamp;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      lastFrameRef.current = null;
    };
  }, []);

  const positionedPlanets = useMemo(
    () =>
      planets.map((planet) => {
        const astronomicalPosition = positions[planet.body];
        const result = getDisplayPosition(astronomicalPosition);

        return {
          planet,
          position: result.position,
          displayRadius: result.displayRadius,
        };
      }),
    [positions],
  );

  return (
    <>
      <ambientLight intensity={0.7} />

      <Stars
        radius={300}
        depth={200}
        count={15000}
        factor={6}
        saturation={0.8}
        fade={false}
        speed={0.3}
      />

      <Sun />

      {positionedPlanets.map(({ planet, displayRadius }) => (
        <OrbitPath
          key={`orbit-${planet.id}`}
          radius={displayRadius}
        />
      ))}

      {positionedPlanets.map(({ planet, position }) => (
        <Planet
          key={planet.id}
          planet={planet}
          position={position}
          onSelect={onSelect}
          showLabel={showLabels}
        />
      ))}

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        minDistance={15}
        maxDistance={45}
        maxPolarAngle={Math.PI / 1.7}
      />
    </>
  );
}

// --------------------------------------
// BACKGROUND COMPONENTS (Moved outside!)
// --------------------------------------



function NebulaBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-2 overflow-hidden">
      <div className="nebula nebula-blue" />
      <div className="nebula nebula-purple" />
      <div className="nebula nebula-cyan" />
    </div>
  );
}

// --------------------------------------
// COSMIC CLOCK
// --------------------------------------

function CosmicClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());

    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  if (!now) return null;

  const time = now.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const date = now.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="absolute right-4 top-4 z-15 w-50 overflow-hidden rounded-xl border border-cyan-400/30 bg-[#020817]/85 p-3 text-white shadow-[0_0_20px_rgba(0,220,255,0.18)] backdrop-blur-xl sm:right-6 sm:top-6">
      {/* Animated top line */}
      <div className="absolute left-0 top-0 h-0.5 w-full animate-pulse bg-linear-to-r from-transparent via-cyan-300 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] tracking-[0.2em] text-cyan-300">
          SYSTEM CLOCK
        </span>

        <span className="flex items-center gap-1 text-[8px] tracking-widest text-emerald-300">
          <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          ONLINE
        </span>
      </div>

      {/* Clock */}
      <div className="relative my-2 text-center">
        <div className="absolute inset-0 rounded-full bg-cyan-400/5 blur-xl" />
        <p className="relative font-mono text-[24px] font-bold tracking-[0.08em] text-cyan-100 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]">
          {time}
        </p>
        <div className="mx-auto mt-1 h-px w-3/4 bg-linear-to-r from-transparent via-cyan-400/60 to-transparent" />
      </div>

      {/* Date */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[8px] tracking-widest text-slate-400">
          DATE
        </span>
        <span className="font-mono text-[9px] tracking-wider text-cyan-200">
          {date.toUpperCase()}
        </span>
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between border-t border-cyan-400/15 pt-1.5">
        <span className="font-mono text-[8px] tracking-[0.2em] text-slate-500">
          INDIA // IST
        </span>
        <span className="font-mono text-[8px] text-cyan-400">
          UTC +05:30
        </span>
      </div>

      {/* Corner decoration */}
      <div className="absolute right-0 top-0 h-2 w-2 border-r border-t border-cyan-300/70" />
      <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-cyan-300/70" />
    </div>
  );
}

// --------------------------------------
// 
function FriendModal({
  planet,
  onClose,
}: {
  planet: PlanetData;
  onClose: () => void;
}) {
  const imageSrc = planet.profile?.photo || null;

  const toList = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.filter(
        (item): item is string => typeof item === "string" && item.trim() !== ""
      );
    }

    if (typeof value === "string" && value.trim()) {
      return [value];
    }

    return [];
  };

  const personality = toList(planet.personality);
  const hobbies = toList(planet.hobbies);
  const skills = toList(planet.skills);
  const memories = toList(planet.memories);
  const socialLinks = planet.socialLinks;

  const sections = [
    { title: "PERSONALITY", icon: "⭐", items: personality },
    { title: "HOBBIES & INTERESTS", icon: "🎮", items: hobbies },
    { title: "SKILLS & TALENTS", icon: "💻", items: skills },
  ];

  const favourites = [
    { icon: "🍜", label: "FOOD", value: planet.favourites?.food },
    { icon: "🎵", label: "MUSIC", value: planet.favourites?.music },
    { icon: "🎬", label: "MOVIE", value: planet.favourites?.movie },
    { icon: "🎨", label: "COLOR", value: planet.favourites?.color },
  ];

  const socials = [
    { label: "INSTAGRAM", url: socialLinks?.instagram, icon: "📸" },
    { label: "FACEBOOK", url: socialLinks?.facebook, icon: "👥" },
    { label: "GITHUB", url: socialLinks?.github, icon: "💻" },
    { label: "LINKEDIN", url: socialLinks?.linkedin, icon: "💼" },
  ].filter((item) => item.url);

  return (
    <div
      className="absolute inset-0 z-20 pointer-events-none"
      onClick={onClose}
    >
      <div
        className="pointer-events-auto absolute right-4 top-24 w-[min(420px,calc(100%-32px))] max-h-[calc(100vh-120px)] overflow-y-auto rounded-[28px] border border-cyan-300/70 bg-linear-to-br from-[#071a38]/95 via-[#061329]/95 to-[#020817]/95 p-5 text-white shadow-[0_0_35px_rgba(0,170,255,0.35)] backdrop-blur-xl sm:right-8 sm:top-28 sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close profile"
          className="absolute right-4 top-4 text-2xl text-gray-300 transition hover:rotate-90 hover:text-cyan-300"
        >
          ×
        </button>

        <div className="mb-5 flex items-center justify-center gap-3 pr-7">
          <span className="h-px flex-1 bg-cyan-400/60" />
          <p className="whitespace-nowrap font-mono text-xs tracking-[0.2em] text-cyan-300">
            FRIENDSHIP UNIVERSE
          </p>
          <span className="h-px flex-1 bg-cyan-400/60" />
        </div>

        {/* PROFILE PHOTO */}
        <div
          className="mx-auto flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl border-2 bg-[#101e38]"
          style={{
            borderColor: planet.color,
            boxShadow: `0 0 25px ${planet.color}99`,
          }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={planet.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-6xl">{planet.profile?.avatar || "👽"}</span>
          )}
        </div>

        {/* BASIC INFORMATION */}
        <div className="mt-4 text-center">
          <h2 className="text-2xl font-black tracking-wide sm:text-3xl">
            {planet.name}
          </h2>

          <p className="mt-1 font-mono text-xs tracking-widest text-cyan-300">
            — {planet.nickname} —
          </p>

          <p className="mt-2 text-[9px] tracking-[0.25em] text-slate-400">
            MEMBER OF ERROR 404
          </p>
        </div>

        {/* BASIC DETAILS */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            { icon: "🎂", label: "BIRTHDAY", value: planet.profile?.birthday },
            { icon: "📍", label: "LOCATION", value: planet.profile?.location },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-cyan-300/20 bg-cyan-400/5 p-3"
            >
              <p className="text-xs text-cyan-300">
                {item.icon} {item.label}
              </p>
              <p className="mt-2 wrap-break-word text-sm">
                {item.value || "Not added yet"}
              </p>
            </div>
          ))}
        </div>

        {/* PERSONALITY, HOBBIES, SKILLS */}
        {sections.map((section) => (
          <section key={section.title} className="mt-5">
            <h3 className="mb-3 font-mono text-xs tracking-widest text-cyan-300">
              {section.icon} {section.title}
            </h3>

            {section.items.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {section.items.map((item, index) => (
                  <span
                    key={`${section.title}-${index}`}
                    className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1.5 text-xs text-slate-100"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Not added yet</p>
            )}
          </section>
        ))}

        {/* FAVOURITES */}
        <section className="mt-6">
          <h3 className="mb-3 font-mono text-xs tracking-widest text-cyan-300">
            ❤️ PERSONAL FAVOURITES
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {favourites.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-purple-300/20 bg-purple-400/5 p-3"
              >
                <p className="text-xs text-purple-300">
                  {item.icon} {item.label}
                </p>
                <p className="mt-2 wrap-break-word text-sm">
                  {item.value || "Not added yet"}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* MEMORIES */}
        {memories.length > 0 && (
          <section className="mt-6">
            <h3 className="mb-3 font-mono text-xs tracking-widest text-cyan-300">
              ✨ MEMORIES
            </h3>

            <div className="space-y-2">
              {memories.map((memory, index) => (
                <p
                  key={index}
                  className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm"
                >
                  {memory}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* GALLERY */}
        {(planet.gallery?.length ?? 0) > 0 && (
          <section className="mt-6">
            <h3 className="mb-3 font-mono text-xs tracking-widest text-cyan-300">
              🖼️ PHOTO GALLERY
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {(planet.gallery ?? []).map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`${planet.name} memory ${index + 1}`}
                  className="aspect-square w-full rounded-xl border border-cyan-300/20 object-cover"
                />
              ))}
            </div>
          </section>
        )}

        {/* VIDEOS */}
        {(planet.videos?.length ?? 0) > 0 && (
          <section className="mt-6">
            <h3 className="mb-3 font-mono text-xs tracking-widest text-cyan-300">
              🎥 VIDEOS
            </h3>

            <div className="space-y-3">
              {(planet.videos ?? []).map((video, index) => (
                <video
                  key={index}
                  src={video}
                  controls
                  className="w-full rounded-xl border border-cyan-300/20"
                />
              ))}
            </div>
          </section>
        )}

        {/* SOCIAL LINKS */}
        {socials.length > 0 && (
          <section className="mt-6">
            <h3 className="mb-3 font-mono text-xs tracking-widest text-cyan-300">
              🌐 CONNECT
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-cyan-300/20 bg-cyan-400/5 p-3 text-xs transition hover:border-cyan-300/60 hover:bg-cyan-400/15"
                >
                  {social.icon} {social.label} ↗
                </a>
              ))}
            </div>
          </section>
        )}

        <div className="mt-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-cyan-400/50" />
          <p className="whitespace-nowrap font-mono text-[9px] tracking-widest text-cyan-300">
            ONE UNIVERSE · EIGHT SOULS
          </p>
          <span className="h-px flex-1 bg-cyan-400/50" />
        </div>
      </div>
    </div>
  );
}


// --------------------------------------
// MAIN SOLAR SYSTEM COMPONENT
// --------------------------------------

export default function SolarSystem() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedPlanet = planets.find(
    (planet) => planet.name === selected,
  );

  return (
    <div
      className="relative h-screen min-h-150 w-full overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at 50% 45%, rgba(30, 64, 175, 0.25), transparent 55%),
          radial-gradient(ellipse at 15% 25%, rgba(147, 51, 234, 0.25), transparent 45%),
          radial-gradient(ellipse at 85% 70%, rgba(6, 182, 212, 0.20), transparent 45%),
          radial-gradient(ellipse at 75% 15%, rgba(126, 34, 206, 0.15), transparent 40%),
          radial-gradient(ellipse at 25% 85%, rgba(37, 99, 235, 0.15), transparent 45%),
          #02030b
        `,
      }}
    >
      {/* ✅ Backgrounds placed correctly as components inside JSX */}
      <ShootingStars />
      <NebulaBackground />

      <Canvas
        camera={{ position: [0, 22, 30], fov: 50, near: 0.1, far: 1000 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          background: "transparent",
        }}
      >
        
        <SolarScene onSelect={setSelected} showLabels={!selected} />
      </Canvas>

      <CosmicClock />

      <div className="pointer-events-none absolute left-0 top-8 z-10 w-full px-4 text-center">
        <p className="font-mono text-xs tracking-[0.5em] text-cyan-300">
          WELCOME TO OUR UNIVERSE
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-widest text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] md:text-6xl">
          ERROR 404
        </h1>
        <p className="mt-3 text-sm text-gray-400">
          Eight friends. One universe. Infinite memories.
        </p>
      </div>

      <div className="pointer-events-none absolute bottom-7 left-0 z-10 w-full px-4 text-center">
        <p className="font-mono text-[10px] tracking-[0.3em] text-cyan-300/80 sm:text-xs">
          CLICK A PLANET TO EXPLORE ITS SOUL
        </p>
      </div>

      {selectedPlanet && (
        <FriendModal
          planet={selectedPlanet}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}