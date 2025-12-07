import React, { useMemo } from "react";
import type { Theme } from "../utils/themes";

interface LoadingSkeletonPageProps {
  theme: Theme;
}

const lighten = (hex: string, factor: number) => {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return hex;
  const value = parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const adjust = (channel: number) => {
    const result = channel + (255 - channel) * factor;
    return Math.min(255, Math.max(0, Math.round(result)));
  };
  const toHex = (channel: number) => channel.toString(16).padStart(2, "0");
  return `#${[adjust(r), adjust(g), adjust(b)].map(toHex).join("").toUpperCase()}`;
};

const SkeletonBlock: React.FC<{ width?: string; height?: string; radius?: string; baseColor: string; highlightColor: string }> = ({
  width = "100%",
  height = "16px",
  radius = "8px",
  baseColor,
  highlightColor,
}) => (
  <div
    style={{
      width,
      height,
      borderRadius: radius,
      backgroundImage: `linear-gradient(90deg, ${baseColor}, ${highlightColor}, ${baseColor})`,
      backgroundSize: "200% 100%",
      animation: "skeleton-shimmer 1.6s ease-in-out infinite",
    }}
  />
);

export const LoadingSkeletonPage: React.FC<LoadingSkeletonPageProps> = ({ theme }) => {
  const baseSurface = theme.colors.surface;
  const highlight = useMemo(() => lighten(baseSurface, 0.18), [baseSurface]);
  const dimmed = useMemo(() => lighten(baseSurface, 0.08), [baseSurface]);

  return (
    <>
      <style>
        {`
          @keyframes skeleton-shimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}
      </style>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          height: "100%",
          gap: "24px",
        }}
      >
        <div
          style={{
            backgroundColor: dimmed,
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <SkeletonBlock baseColor={baseSurface} highlightColor={highlight} height="18px" width="120px" />
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonBlock
              key={`sidebar-skeleton-${index}`}
              baseColor={baseSurface}
              highlightColor={highlight}
              height="12px"
              width={index % 2 === 0 ? "80%" : "60%"}
            />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              backgroundColor: dimmed,
              borderRadius: "16px",
              padding: "24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`card-skeleton-${index}`}
                style={{
                  backgroundColor: baseSurface,
                  borderRadius: "14px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <SkeletonBlock baseColor={baseSurface} highlightColor={highlight} height="14px" width="60%" />
                <SkeletonBlock baseColor={baseSurface} highlightColor={highlight} height="28px" width="40%" />
                <SkeletonBlock baseColor={baseSurface} highlightColor={highlight} height="10px" width="70%" />
              </div>
            ))}
          </div>

          <div
            style={{
              backgroundColor: dimmed,
              borderRadius: "16px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <SkeletonBlock baseColor={baseSurface} highlightColor={highlight} height="18px" width="180px" />
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`row-skeleton-${index}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: "16px",
                  alignItems: "center",
                  backgroundColor: baseSurface,
                  padding: "14px 18px",
                  borderRadius: "12px",
                }}
              >
                <SkeletonBlock baseColor={baseSurface} highlightColor={highlight} height="14px" width="70%" />
                <SkeletonBlock baseColor={baseSurface} highlightColor={highlight} height="12px" width="40%" />
                <SkeletonBlock baseColor={baseSurface} highlightColor={highlight} height="12px" width="55%" />
                <SkeletonBlock baseColor={baseSurface} highlightColor={highlight} height="32px" width="48%" radius="10px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

