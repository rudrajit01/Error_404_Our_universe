
import { Body, HelioVector } from "astronomy-engine";

const planetBodies = {
  mercury: Body.Mercury,
  venus: Body.Venus,
  earth: Body.Earth,
  mars: Body.Mars,
  jupiter: Body.Jupiter,
  saturn: Body.Saturn,
  uranus: Body.Uranus,
  neptune: Body.Neptune,
};

export type PlanetName = keyof typeof planetBodies;

export interface PlanetPosition {
  x: number;
  y: number;
  z: number;
}

export function getPlanetPositions(
  date: Date = new Date()
): Record<PlanetName, PlanetPosition> {
  const obliquity = (23.43928 * Math.PI) / 180;

  return Object.fromEntries(
    Object.entries(planetBodies).map(([name, body]) => {
      const vector = HelioVector(body, date);

      // Convert equatorial coordinates to ecliptic coordinates.
      const eclipticY =
        vector.y * Math.cos(obliquity) +
        vector.z * Math.sin(obliquity);

      const eclipticZ =
        -vector.y * Math.sin(obliquity) +
        vector.z * Math.cos(obliquity);

      return [
        name,
        {
          x: vector.x,
          y: eclipticZ,
          z: -eclipticY,
        },
      ];
    })
  ) as Record<PlanetName, PlanetPosition>;
}
