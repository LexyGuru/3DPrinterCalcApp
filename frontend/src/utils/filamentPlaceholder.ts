import { DEFAULT_COLOR_HEX, normalizeHex } from "./filamentColors";

const clampChannel = (value: number) => Math.min(255, Math.max(0, value));

const adjustHex = (hex: string, percent: number) => {
  const normalized = normalizeHex(hex) || DEFAULT_COLOR_HEX;
  const intVal = parseInt(normalized.slice(1), 16);
  let r = (intVal >> 16) & 255;
  let g = (intVal >> 8) & 255;
  let b = intVal & 255;

  const adjust = (channel: number) => {
    const amount = percent >= 0 ? (255 - channel) * percent : channel * percent;
    return clampChannel(Math.round(channel + amount));
  };

  r = adjust(r);
  g = adjust(g);
  b = adjust(b);

  const result = (r << 16) + (g << 8) + b;
  return `#${result.toString(16).padStart(6, "0").toUpperCase()}`;
};

const svgTemplate = (hex: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="12" fill="#1F2937"/>
  <circle cx="40" cy="40" r="26" stroke="${hex}" stroke-width="6" fill="none"/>
  <circle cx="40" cy="40" r="10" fill="${hex}" opacity="0.8"/>
</svg>`;

const toDataUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

export function getFilamentPlaceholder(hex: string): string {
  const sanitizedHex = /#[0-9a-fA-F]{6}/.test(hex) ? hex : "#9CA3AF";
  const svg = svgTemplate(sanitizedHex.toUpperCase());
  return toDataUri(svg);
}

