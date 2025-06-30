import React from "react";
import { useParallax } from "../../hooks/useParallax";
import { useDotPhysics } from "../../hooks/useDotPhysics";

const DOTS = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  speed: Math.random() * 0.4 + 0.1,
  size: Math.random() * 20 + 10,
  position: { top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` },
  color: `rgba(0, 123, 255, ${Math.random() * 0.3 + 0.1})`,
  delay: `${Math.random() * 4}s`,
}));

type DotProps = { dot: (typeof DOTS)[0] };

const ParallaxDot = ({ dot }: DotProps) => {
  const ref = useDotPhysics<HTMLDivElement>({
    scrollSpeed: dot.speed,
    repulsionStrength: 60,
    repulsionRadius: 200,
    easing: 0.02,
  });

  return (
    <div
      ref={ref}
      className="absolute rounded-full animate-pulse"
      style={{
        width: `${dot.size}px`,
        height: `${dot.size}px`,
        top: dot.position.top,
        left: dot.position.left,
        backgroundColor: dot.color,
        animationDelay: dot.delay,
      }}
    />
  );
};

export const ParallaxBackground = React.memo(() => {
  const gridRef = useParallax<HTMLDivElement>(0.5);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        ref={gridRef}
        className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23007BFF%22%20fill-opacity%3D%220.08%22%3E%3Ccircle%20cx%3D%225%22%20cy%3D%225%22%20r%3D%221.5%22%2F%3E%3Ccircle%20cx%3D%2215%22%20cy%3D%2210%22%20r%3D%221%22%2F%3E%3Ccircle%20cx%3D%2225%22%20cy%3D%2215%22%20r%3D%221.2%22%2F%3E%3Ccircle%20cx%3D%2235%22%20cy%3D%225%22%20r%3D%220.8%22%2F%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2225%22%20r%3D%221.3%22%2F%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221.1%22%2F%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2235%22%20r%3D%220.9%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]"
      />
      {DOTS.map((dot) => (
        <ParallaxDot key={dot.id} dot={dot} />
      ))}
    </div>
  );
});
