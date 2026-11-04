
import type { PlanetName } from "./planetPositions";

export interface PlanetStyle {
  color: string;
  roughness: number;
  metalness: number;
  atmosphereColor: string;
}

export const planetStyles: Record<PlanetName, PlanetStyle> = {
  mercury: {
    color: "#969696",
    roughness: 1,
    metalness: 0.05,
    atmosphereColor: "#A8A8A8",
  },
  venus: {
    color: "#D9B878",
    roughness: 0.95,
    metalness: 0,
    atmosphereColor: "#E8C990",
  },
  earth: {
    color: "#2878C8",
    roughness: 0.8,
    metalness: 0.05,
    atmosphereColor: "#65BFFF",
  },
  mars: {
    color: "#C65B3A",
    roughness: 1,
    metalness: 0,
    atmosphereColor: "#D87852",
  },
  jupiter: {
    color: "#C69B73",
    roughness: 0.95,
    metalness: 0,
    atmosphereColor: "#D9B18A",
  },
  saturn: {
    color: "#D8C18C",
    roughness: 0.9,
    metalness: 0.05,
    atmosphereColor: "#E8D5A5",
  },
  uranus: {
    color: "#8EDDE0",
    roughness: 0.85,
    metalness: 0,
    atmosphereColor: "#A6F0F0",
  },
  neptune: {
    color: "#3156B8",
    roughness: 0.85,
    metalness: 0.05,
    atmosphereColor: "#527FEA",
  },
};
