const svgTemplate = (hex: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="12" fill="#1F2937"/>
  <circle cx="40" cy="40" r="26" stroke="${hex}" stroke-width="6" fill="none"/>
  <circle cx="40" cy="40" r="10" fill="${hex}" opacity="0.8"/>
</svg>`;

const toDataUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

export function getFilamentPlaceholder(hex: string): string {
  const sanitizedHex = /#[0-9a-fA-F]{6}/.test(hex) ? hex.toUpperCase() : "#9CA3AF";
  const svg = svgTemplate(sanitizedHex.toUpperCase());
  return toDataUri(svg);
}

