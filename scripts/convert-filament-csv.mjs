import { readFileSync, writeFileSync, mkdirSync } from "fs";
import os from "os";
const COLOR_TRANSLATIONS = {
  black: { hu: "fekete", de: "schwarz" },
  white: { hu: "fehér", de: "weiß" },
  blue: { hu: "kék", de: "blau" },
  red: { hu: "piros", de: "rot" },
  green: { hu: "zöld", de: "grün" },
  yellow: { hu: "sárga", de: "gelb" },
  orange: { hu: "narancs", de: "orange" },
  purple: { hu: "lila", de: "lila" },
  violet: { hu: "ibolya", de: "violett" },
  magenta: { hu: "bíbor", de: "magenta" },
  pink: { hu: "rózsaszín", de: "rosa" },
  grey: { hu: "szürke", de: "grau" },
  gray: { hu: "szürke", de: "grau" },
  silver: { hu: "ezüst", de: "silber" },
  gold: { hu: "arany", de: "gold" },
  copper: { hu: "réz", de: "kupfer" },
  bronze: { hu: "bronz", de: "bronze" },
  brown: { hu: "barna", de: "braun" },
  beige: { hu: "bézs", de: "beige" },
  cream: { hu: "krém", de: "creme" },
  ivory: { hu: "elefántcsont", de: "elfenbein" },
  transparent: { hu: "átlátszó", de: "transparent" },
  translucent: { hu: "félig áttetsző", de: "transluzent" },
  clear: { hu: "áttetsző", de: "klar" },
  natural: { hu: "natúr", de: "natur" },
  marble: { hu: "márvány", de: "marmor" },
  wood: { hu: "fa", de: "holz" },
  walnut: { hu: "dió", de: "walnuss" },
  oak: { hu: "tölgy", de: "eiche" },
  birch: { hu: "nyír", de: "birke" },
  maple: { hu: "juhar", de: "ahorn" },
  metallic: { hu: "metál", de: "metallisch" },
  metal: { hu: "fém", de: "metall" },
  matte: { hu: "matt", de: "matt" },
  gloss: { hu: "fényes", de: "glanz" },
  glossy: { hu: "fényes", de: "glänzend" },
  silk: { hu: "selyem", de: "seide" },
  satin: { hu: "szatén", de: "satin" },
  pearl: { hu: "gyöngyház", de: "perlmutt" },
  pearly: { hu: "gyöngyház", de: "perlig" },
  pastel: { hu: "pasztell", de: "pastell" },
  neon: { hu: "neon", de: "neon" },
  fluorescent: { hu: "fluoreszkáló", de: "fluoreszierend" },
  glow: { hu: "világító", de: "leuchtend" },
  dark: { hu: "sötét", de: "dunkel" },
  light: { hu: "világos", de: "hell" },
  deep: { hu: "mély", de: "tief" },
  bright: { hu: "élénk", de: "hell" },
  soft: { hu: "lágy", de: "weich" },
  warm: { hu: "meleg", de: "warm" },
  cool: { hu: "hideg", de: "kühl" },
  vivid: { hu: "élénk", de: "kräftig" },
  rich: { hu: "gazdag", de: "satt" },
  sky: { hu: "ég", de: "himmel" },
  ocean: { hu: "óceán", de: "ozean" },
  sea: { hu: "tenger", de: "see" },
  marine: { hu: "tengerész", de: "marine" },
  aqua: { hu: "akva", de: "aqua" },
  turquoise: { hu: "türkiz", de: "türkis" },
  teal: { hu: "pávakék", de: "teal" },
  mint: { hu: "menta", de: "minze" },
  lime: { hu: "lime", de: "limette" },
  forest: { hu: "erdő", de: "wald" },
  army: { hu: "katonai", de: "armee" },
  khaki: { hu: "khaki", de: "khaki" },
  desert: { hu: "sivatagi", de: "wüsten" },
  sand: { hu: "homok", de: "sand" },
  coffee: { hu: "kávé", de: "kaffee" },
  chocolate: { hu: "csokoládé", de: "schokolade" },
  caramel: { hu: "karamell", de: "karamell" },
  honey: { hu: "méz", de: "honig" },
  peach: { hu: "barack", de: "pfirsich" },
  apricot: { hu: "sárgabarack", de: "aprikose" },
  coral: { hu: "korall", de: "koralle" },
  lavender: { hu: "levendula", de: "lavendel" },
  lilac: { hu: "orgonalila", de: "flieder" },
  rose: { hu: "rózsa", de: "rose" },
  ruby: { hu: "rubin", de: "rubin" },
  sapphire: { hu: "zafír", de: "saphir" },
  emerald: { hu: "smaragd", de: "smaragd" },
  amethyst: { hu: "ametiszt", de: "amethyst" },
  smoke: { hu: "füst", de: "rauch" },
  smoky: { hu: "füstös", de: "rauchig" },
  stone: { hu: "kő", de: "stein" },
  slate: { hu: "pala", de: "schiefer" },
  granite: { hu: "gránit", de: "granit" },
  steel: { hu: "acél", de: "stahl" },
  gunmetal: { hu: "grafitszürke", de: "gunmetal" },
  midnight: { hu: "éjféli", de: "mitternacht" },
  night: { hu: "éjszakai", de: "nacht" },
  moon: { hu: "hold", de: "mond" },
  star: { hu: "csillag", de: "stern" },
  snowy: { hu: "havas", de: "verschneit" },
  snow: { hu: "hó", de: "schnee" },
  frost: { hu: "zúzmara", de: "frost" },
  icy: { hu: "jeges", de: "eisig" },
  coolblue: { hu: "hűvös kék", de: "kühlblau" },
  pastelblue: { hu: "pasztellkék", de: "pastellblau" },
  dual: { hu: "kétszínű", de: "zweifarbig" },
  tricolor: { hu: "háromszínű", de: "dreifarbig" },
  multicolor: { hu: "többszínű", de: "mehrfarbig" },
  mixed: { hu: "kevert", de: "gemischt" },
  gradient: { hu: "átmenetes", de: "verlauf" },
  rainbow: { hu: "szivárvány", de: "regenbogen" },
  galaxy: { hu: "galaxis", de: "galaxie" },
  cosmic: { hu: "kozmikus", de: "kosmisch" },
  space: { hu: "űr", de: "raum" },
  pastelpink: { hu: "pasztell rózsaszín", de: "pastellrosa" },
  pastelgreen: { hu: "pasztellzöld", de: "pastellgrün" },
  pastelpurple: { hu: "pasztelllila", de: "pastelllila" },
  pearlwhite: { hu: "gyöngyházfehér", de: "perlmuttweiß" },
  pearlblue: { hu: "gyöngyházkék", de: "perlmuttblau" },
  pearlpink: { hu: "gyöngyházrózsaszín", de: "perlmuttrosa" },
};

const applyCase = (original, translated) => {
  if (!translated) return translated;
  if (!original) return translated;
  if (original === original.toUpperCase()) {
    return translated.toUpperCase();
  }
  const firstChar = original.charAt(0);
  if (firstChar === firstChar.toUpperCase()) {
    return translated.charAt(0).toUpperCase() + translated.slice(1);
  }
  return translated.toLowerCase();
};

const translateColorLabel = (raw, target) => {
  if (!raw) return "";
  const parts = raw.split(/(\s+|[-/&,()+]+)/);
  return parts
    .map((part) => {
      const word = part.replace(/[^a-zA-Z]/g, "");
      if (!word) {
        return part;
      }
      const lower = word.toLowerCase();
      const translation = COLOR_TRANSLATIONS[lower];
      if (!translation) {
        return part;
      }
      const translated = translation[target];
      if (!translated) {
        return part;
      }
      const formatted = applyCase(word, translated);
      return part.replace(word, formatted);
    })
    .join("")
    .replace(/\s+/g, (match) => (match.length > 1 ? " " : match))
    .trim();
};
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");

const DEFAULT_SOURCE = "/Users/lekszikov/PycharmProjects/pythonProject4/filament_adatok_TELJES_ADATBAZIS.csv";
const DEFAULT_OUTPUT = resolve(projectRoot, "frontend/src/data/filamentLibraryFromCsv.json");

const MULTICOLOR_KEYWORDS = [
  /rainbow/i,
  /multi[\s-]?color/i,
  /multicolou?r/i,
  /dual[\s-]?color/i,
  /bi[\s-]?color/i,
  /tri[\s-]?color/i,
  /tricolou?r/i,
  /color\s*(?:shift|change)/i,
  /gradient/i,
  /mix(?:ed)?\s*color/i,
  /marble/i,
  /silk\s*rainbow/i,
];

const normalizeText = (value) => (value ?? "").trim();

const slugify = (value) =>
  normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const generateId = (manufacturer, material, color) =>
  [manufacturer, material, color].map(slugify).filter(Boolean).join("-");

const normalizeHex = (value) => {
  if (!value) return "";
  const match = value.trim().match(/^#?([0-9a-fA-F]{6})$/);
  return match ? `#${match[1].toUpperCase()}` : "";
};

const detectColorMode = (colorName, hexValue) => {
  if (!hexValue) return "multicolor";
  if (MULTICOLOR_KEYWORDS.some((regex) => regex.test(colorName))) {
    return "multicolor";
  }
  return "solid";
};

const sourcePath = process.env.SOURCE_FILAMENT_CSV || DEFAULT_SOURCE;
const outputPath = process.env.OUTPUT_FILAMENT_JSON || DEFAULT_OUTPUT;

const rawContent = readFileSync(sourcePath, "utf8");
const lines = rawContent
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

if (lines.length <= 1) {
  console.error("[ConvertFilamentCsv] A CSV fájl üres vagy csak fejlécet tartalmaz.");
  process.exit(1);
}

const header = lines[0].split(",").map((cell) => cell.trim());
const expectedHeader = ["Márka", "Anyag", "Színnév", "HEX Kód"];
const headerMatch = expectedHeader.every((expected, index) => (header[index] || "").toLowerCase() === expected.toLowerCase());

if (!headerMatch) {
  console.warn("[ConvertFilamentCsv] Figyelem: a CSV fejléc nem egyezik a várt formátummal.", { header });
}

const rows = lines.slice(1);
const entriesMap = new Map();

rows.forEach((line, index) => {
  const cells = line.split(",").map((cell) => cell.trim());
  const [brand, material, rawColor, hexRaw] = cells;

  if (!brand || !material || !rawColor) {
    return;
  }

  const normalizedHex = normalizeHex(hexRaw);
  const colorMode = detectColorMode(rawColor, normalizedHex);
  const multiColorHint = colorMode === "multicolor" ? rawColor : undefined;

  const id = generateId(brand, material, rawColor);

  if (!id) {
    return;
  }

  const huLabel = translateColorLabel(rawColor, "hu") || rawColor;
  const deLabel = translateColorLabel(rawColor, "de") || rawColor;

  const entry = {
    id,
    manufacturer: brand,
    material,
    color: rawColor,
    name: rawColor,
    finish: "standard",
    hex: normalizedHex || undefined,
    labels: {
      hu: huLabel,
      en: rawColor,
      de: deLabel,
    },
    colorMode,
    multiColorHint,
  };

  entriesMap.set(id, entry);
});

const entries = Array.from(entriesMap.values()).sort((a, b) => {
  const brandCompare = a.manufacturer.localeCompare(b.manufacturer, "hu", { sensitivity: "base" });
  if (brandCompare !== 0) return brandCompare;
  const materialCompare = a.material.localeCompare(b.material, "hu", { sensitivity: "base" });
  if (materialCompare !== 0) return materialCompare;
  return (a.color || "").localeCompare(b.color || "", "hu", { sensitivity: "base" });
});

writeFileSync(outputPath, JSON.stringify(entries, null, 2) + "\n");

console.log(
  `[ConvertFilamentCsv] Feldolgozva ${rows.length} sor -> ${entries.length} egyedi bejegyzés (${outputPath})`
);

const WRITE_APP_CONFIG = process.env.WRITE_APP_CONFIG !== "false";

const resolveAppConfigDirectory = () => {
  const bundleId = "com.lekszikov.3dprintercalcapp";
  if (process.platform === "darwin") {
    return resolve(os.homedir(), "Library", "Application Support", bundleId);
  }
  if (process.platform === "win32") {
    const appData = process.env.APPDATA || resolve(os.homedir(), "AppData", "Roaming");
    return resolve(appData, bundleId);
  }
  return resolve(os.homedir(), ".config", bundleId);
};

if (WRITE_APP_CONFIG) {
  try {
    const appConfigDir = resolveAppConfigDirectory();
    mkdirSync(appConfigDir, { recursive: true });
    const updatePath = resolve(appConfigDir, "update_filamentLibrary.json");
    writeFileSync(updatePath, JSON.stringify(entries, null, 2) + "\n");
    console.log(`[ConvertFilamentCsv] Update könyvtár frissítve: ${updatePath}`);
  } catch (error) {
    console.warn("[ConvertFilamentCsv] Nem sikerült frissíteni a helyi filamentLibrary.json fájlt", error);
  }
}

