
"use client";

import { useEffect, useState } from "react";

interface Star {
  id: number;
  top: number;
  left: number;
  angle: number;
  duration: number;
  distance: number;
}

export default function ShootingStars() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    let nextId = 0;
    let spawnTimer: ReturnType<typeof setTimeout>;
    let active = true;

    const spawnStar = () => {
      if (!active) return;

      const star: Star = {
        id: nextId++,
        top: Math.random() * 90 + 5,
        left: Math.random() * 90 + 5,
        angle: Math.random() * 360,
        duration: 7 + Math.random() * 5,
        distance: 220 + Math.random() * 180,
      };

      setStars((current) => [...current, star]);

      setTimeout(() => {
        setStars((current) =>
          current.filter((item) => item.id !== star.id)
        );
      }, star.duration * 1000);

      spawnTimer = setTimeout(
        spawnStar,
        1800 + Math.random() * 3500
      );
    };

    spawnStar();

    return () => {
      active = false;
      clearTimeout(spawnTimer);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {stars.map((star) => {
        const radians = (star.angle * Math.PI) / 180;
        const x = Math.cos(radians) * star.distance;
        const y = Math.sin(radians) * star.distance;

        return (
          <div
            key={star.id}
            className="random-shooting-star"
            style={
              {
                top: `${star.top}%`,
                left: `${star.left}%`,
                rotate: `${star.angle}deg`,
                animationDuration: `${star.duration}s`,
                "--star-x": `${x}px`,
                "--star-y": `${y}px`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
