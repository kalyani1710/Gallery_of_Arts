
"use client";

import { useEffect, useRef } from "react";
import { Curtains } from "curtainsjs";
import "./FloatingFlowersHero.css";

const FLOWERS = [
  { left: "12%", top: "20%", color: "#F9A8D4", size: 85, delay: "-1s" },
  { left: "78%", top: "17%", color: "#FBCFE8", size: 105, delay: "-3s" },
  { left: "85%", top: "66%", color: "#FDE68A", size: 75, delay: "-2s" },
  { left: "18%", top: "72%", color: "#C4B5FD", size: 100, delay: "-4s" },
  { left: "58%", top: "42%", color: "#FCA5A5", size: 80, delay: "-5s" },
  { left: "42%", top: "15%", color: "#A7F3D0", size: 90, delay: "-2.5s" },
];

export default function FloatingFlowersHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let curtains: Curtains | null = null;

    try {
      curtains = new Curtains({
        container,
        watchScroll: false,
        pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
      });

      curtains.onError(() => {
        container.classList.add("flowers-webgl-fallback");
      });

      curtains.onContextLost(() => {
        container.classList.add("flowers-webgl-fallback");
      });
    } catch (error) {
      console.error("Curtains.js initialization failed:", error);
      container.classList.add("flowers-webgl-fallback");
    }

    return () => {
      curtains?.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="floating-flowers-hero"
      aria-hidden="true"
    >
      {FLOWERS.map((flower, index) => (
        <div
          key={index}
          className="floating-flower-plane"
          style={{
            left: flower.left,
            top: flower.top,
            width: `${flower.size}px`,
            height: `${flower.size}px`,
            animationDelay: flower.delay,
            ["--flower-color" as string]: flower.color,
          }}
        >
          <div className="css-flower">
            {Array.from({ length: 6 }, (_, petal) => (
              <span
                key={petal}
                className="css-flower-petal"
                style={{
                  transform: `translate(-50%, -100%) rotate(${petal * 60}deg)`,
                }}
              />
            ))}
            <span className="css-flower-center" />
          </div>
        </div>
      ))}
    </div>
  );
}
