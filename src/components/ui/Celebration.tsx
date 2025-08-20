import React, { useMemo } from "react";

interface CelebrationProps {
  visible: boolean;
  durationMs?: number;
  bursts?: Array<{
    id: string;
    x: number;
    y: number;
    durationMs?: number;
  }>;
}

export const Celebration: React.FC<CelebrationProps> = ({
  visible,
  durationMs = 5200,
  bursts = [],
}) => {
  const rainConfetti = useMemo(() => {
    const colors = [
      "#FF5A5F",
      "#FDBA74",
      "#34D399",
      "#60A5FA",
      "#A78BFA",
      "#F472B6",
    ];
    return new Array(80).fill(null).map((_, index) => {
      const left = Math.random() * 100;
      const delay = Math.random() * 0.8;
      const duration = 3 + Math.random() * 2.8;
      const size = 8 + Math.random() * 14;
      const rotate = Math.random() * 540;
      const color = colors[index % colors.length];
      const swing = 0.9 + Math.random() * 1.4;
      return {
        left,
        delay,
        duration,
        size,
        rotate,
        color,
        id: index,
        swing,
      } as const;
    });
  }, []);

  if (!visible) return null;

  // 默认提供一个中心爆发以增强首次反馈（当无 bursts 时）
  const defaultBursts = [
    {
      id: "center-1",
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.4,
      durationMs: durationMs * 0.45,
    },
  ];

  const activeBursts = bursts.length > 0 ? bursts : defaultBursts;

  return (
    <div className="celebration-overlay pointer-events-none">
      {/* 当没有指定 bursts 时，使用顶部雨幕增强背景氛围 */}
      {bursts.length === 0 &&
        rainConfetti.map((item) => (
          <span
            key={`rain-${item.id}`}
            className="confetti-piece"
            style={{
              left: `${item.left}%`,
              width: `${item.size}px`,
              height: `${item.size * 0.6}px`,
              backgroundColor: item.color,
              transform:
                `rotate(${item.rotate}deg)` as React.CSSProperties["transform"],
              // @ts-expect-error custom CSS variable
              "--confetti-fall-delay": `${item.delay}s`,
              // @ts-expect-error custom CSS variable
              "--confetti-fall-duration": `${item.duration}s`,
              // @ts-expect-error custom CSS variable
              "--confetti-swing-duration": `${(item as any).swing}s`,
            }}
          />
        ))}

      {/* 多点爆发：每个爆发点生成扇形彩带（无中心红点） */}
      {activeBursts.map((b) => {
        const pieces = Array.from({ length: 34 }).map((_, i) => {
          const angle = (i / 34) * Math.PI * 2;
          const radius = 160 + Math.random() * 100;
          const dx = Math.cos(angle) * radius;
          const dy = Math.sin(angle) * radius + 160; // 向下偏移，营造下落感
          const size = 7 + Math.random() * 12;
          const spin = 240 + Math.random() * 480;
          const delay = (i % 8) * 0.015;
          const colors = [
            "#FF5A5F",
            "#FDBA74",
            "#34D399",
            "#60A5FA",
            "#A78BFA",
            "#F472B6",
          ];
          const color = colors[i % colors.length];
          return { i, dx, dy, size, spin, delay, color };
        });

        return (
          <React.Fragment key={b.id}>
            {pieces.map((p) => (
              <span
                key={`${b.id}-${p.i}`}
                className="confetti-piece-burst"
                style={{
                  left: `${b.x}px`,
                  top: `${b.y}px`,
                  width: `${p.size}px`,
                  height: `${p.size * 0.6}px`,
                  backgroundColor: p.color,
                  // @ts-expect-error custom CSS variable
                  "--dx": `${p.dx}px`,
                  // @ts-expect-error custom CSS variable
                  "--dy": `${p.dy}px`,
                  // @ts-expect-error custom CSS variable
                  "--spin": `${p.spin}deg`,
                  // @ts-expect-error custom CSS variable
                  "--burst-delay": `${p.delay}s`,
                  // @ts-expect-error custom CSS variable
                  "--burst-duration": `${
                    (b as any).durationMs ?? durationMs * 0.45
                  }ms`,
                }}
              />
            ))}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Celebration;
