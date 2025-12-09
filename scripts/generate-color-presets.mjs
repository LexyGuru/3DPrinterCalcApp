import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Támogatott nyelvek
const ALL_LANGUAGES = ['hu', 'en', 'de', 'fr', 'it', 'es', 'pl', 'cs', 'sk', 'zh', 'pt-BR', 'uk', 'ru'];
const BASE_LANGUAGES = ['hu', 'en', 'de'];

// Material típusok
const MATERIAL_TYPES = ['PLA', 'PETG', 'ABS', 'TPU', 'NYLON'];

// Finish típusok
const FINISH_TYPES = ['standard', 'matte', 'silk', 'transparent', 'metallic', 'glow'];

// Beolvassuk a JSON fájlt
const jsonPath = join(projectRoot, 'frontend/src/data/filamentLibraryFromCsv.json');
const libraryData = JSON.parse(readFileSync(jsonPath, 'utf-8'));

console.log(`📚 Beolvasva ${libraryData.length} bejegyzés a filament library-ból`);

// Színnév normalizálása (kisbetűs, ékezetek eltávolítása)
function normalizeColorName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Színnév egyezés ellenőrzése
function colorNamesMatch(name1, name2) {
  return normalizeColorName(name1) === normalizeColorName(name2);
}

// Színnév fordítása minden nyelvre
const COLOR_TRANSLATIONS = {
  // Alap színek
  black: { hu: "fekete", en: "black", de: "schwarz", fr: "noir", it: "nero", es: "negro", pl: "czarny", cs: "černá", sk: "čierna", zh: "黑色", "pt-BR": "preto", uk: "чорний", ru: "черный" },
  white: { hu: "fehér", en: "white", de: "weiß", fr: "blanc", it: "bianco", es: "blanco", pl: "biały", cs: "bílá", sk: "biely", zh: "白色", "pt-BR": "branco", uk: "білий", ru: "белый" },
  blue: { hu: "kék", en: "blue", de: "blau", fr: "bleu", it: "blu", es: "azul", pl: "niebieski", cs: "modrá", sk: "modrá", zh: "蓝色", "pt-BR": "azul", uk: "синій", ru: "синий" },
  red: { hu: "piros", en: "red", de: "rot", fr: "rouge", it: "rosso", es: "rojo", pl: "czerwony", cs: "červená", sk: "červená", zh: "红色", "pt-BR": "vermelho", uk: "червоний", ru: "красный" },
  green: { hu: "zöld", en: "green", de: "grün", fr: "vert", it: "verde", es: "verde", pl: "zielony", cs: "zelená", sk: "zelená", zh: "绿色", "pt-BR": "verde", uk: "зелений", ru: "зеленый" },
  yellow: { hu: "sárga", en: "yellow", de: "gelb", fr: "jaune", it: "giallo", es: "amarillo", pl: "żółty", cs: "žlutá", sk: "žltá", zh: "黄色", "pt-BR": "amarelo", uk: "жовтий", ru: "желтый" },
  orange: { hu: "narancs", en: "orange", de: "orange", fr: "orange", it: "arancione", es: "naranja", pl: "pomarańczowy", cs: "oranžová", sk: "oranžová", zh: "橙色", "pt-BR": "laranja", uk: "помаранчевий", ru: "оранжевый" },
  purple: { hu: "lila", en: "purple", de: "lila", fr: "violet", it: "viola", es: "morado", pl: "fioletowy", cs: "fialová", sk: "fialová", zh: "紫色", "pt-BR": "roxo", uk: "фіолетовий", ru: "фиолетовый" },
  pink: { hu: "rózsaszín", en: "pink", de: "rosa", fr: "rose", it: "rosa", es: "rosa", pl: "różowy", cs: "růžová", sk: "ružová", zh: "粉色", "pt-BR": "rosa", uk: "рожевий", ru: "розовый" },
  grey: { hu: "szürke", en: "grey", de: "grau", fr: "gris", it: "grigio", es: "gris", pl: "szary", cs: "šedá", sk: "šedá", zh: "灰色", "pt-BR": "cinza", uk: "сірий", ru: "серый" },
  gray: { hu: "szürke", en: "gray", de: "grau", fr: "gris", it: "grigio", es: "gris", pl: "szary", cs: "šedá", sk: "šedá", zh: "灰色", "pt-BR": "cinza", uk: "сірий", ru: "серый" },
  brown: { hu: "barna", en: "brown", de: "braun", fr: "marron", it: "marrone", es: "marrón", pl: "brązowy", cs: "hnědá", sk: "hnedá", zh: "棕色", "pt-BR": "marrom", uk: "коричневий", ru: "коричневый" },
  gold: { hu: "arany", en: "gold", de: "gold", fr: "or", it: "oro", es: "dorado", pl: "złoty", cs: "zlatá", sk: "zlatá", zh: "金色", "pt-BR": "dourado", uk: "золотий", ru: "золотой" },
  silver: { hu: "ezüst", en: "silver", de: "silber", fr: "argent", it: "argento", es: "plateado", pl: "srebrny", cs: "stříbrná", sk: "strieborná", zh: "银色", "pt-BR": "prata", uk: "срібний", ru: "серебряный" },
  transparent: { hu: "átlátszó", en: "transparent", de: "transparent", fr: "transparent", it: "trasparente", es: "transparente", pl: "przezroczysty", cs: "průhledná", sk: "priehľadná", zh: "透明", "pt-BR": "transparente", uk: "прозорий", ru: "прозрачный" },
  coffee: { hu: "kávé", en: "coffee", de: "kaffee", fr: "café", it: "caffè", es: "café", pl: "kawa", cs: "kávová", sk: "kávová", zh: "咖啡色", "pt-BR": "café", uk: "кавовий", ru: "кофейный" },
  // Módosító szavak
  reddish: { hu: "vöröses", en: "reddish", de: "rötlich", fr: "rougeâtre", it: "rossastro", es: "rojizo", pl: "czerwonawy", cs: "načervenalý", sk: "načervenalý", zh: "偏红", "pt-BR": "avermelhado", uk: "червонуватий", ru: "красноватый" },
  dark: { hu: "sötét", en: "dark", de: "dunkel", fr: "foncé", it: "scuro", es: "oscuro", pl: "ciemny", cs: "tmavý", sk: "tmavý", zh: "深", "pt-BR": "escuro", uk: "темний", ru: "темный" },
  light: { hu: "világos", en: "light", de: "hell", fr: "clair", it: "chiaro", es: "claro", pl: "jasny", cs: "světlý", sk: "svetlý", zh: "浅", "pt-BR": "claro", uk: "світлий", ru: "светлый" },
  bright: { hu: "élénk", en: "bright", de: "hell", fr: "vif", it: "brillante", es: "brillante", pl: "jasny", cs: "jasný", sk: "jasný", zh: "亮", "pt-BR": "brilhante", uk: "яскравий", ru: "яркий" },
  pale: { hu: "halvány", en: "pale", de: "blass", fr: "pâle", it: "pallido", es: "pálido", pl: "blady", cs: "bledý", sk: "bledý", zh: "淡", "pt-BR": "pálido", uk: "блідий", ru: "бледный" },
};

// Színnév fordítása - intelligens fordítás összetett színnevekre
function translateColorName(colorName, targetLang) {
  if (!colorName) return '';
  
  const normalized = colorName.toLowerCase().trim();
  let result = colorName;
  
  // Keresünk színneveket a fordítótárban és lecseréljük őket
  // Rendezzük hossz szerint csökkenő sorrendben, hogy a hosszabb egyezéseket először találjuk
  const sortedKeys = Object.keys(COLOR_TRANSLATIONS).sort((a, b) => b.length - a.length);
  
  for (const key of sortedKeys) {
    const keyLower = key.toLowerCase();
    const translations = COLOR_TRANSLATIONS[key];
    
    // Regex a szóhatárokkal, hogy ne cseréljünk le részszavakat
    const regex = new RegExp(`\\b${keyLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(result)) {
      const translated = translations[targetLang] || translations.en || key;
      // Cseréljük le az összes előfordulást
      result = result.replace(regex, (match) => {
        // Megtartjuk az eredeti nagybetűket
        if (match === match.toUpperCase()) {
          return translated.toUpperCase();
        } else if (match[0] === match[0].toUpperCase()) {
          return translated.charAt(0).toUpperCase() + translated.slice(1);
        }
        return translated;
      });
    }
  }
  
  return result;
}

// Fallback logika: ha nincs fordítás, akkor próbáljuk lefordítani a színnevet
function getLabel(labels, lang) {
  if (labels[lang]) return labels[lang];
  
  // Ha van angol vagy magyar, próbáljuk lefordítani
  const sourceText = labels.en || labels.hu || labels.de || '';
  if (sourceText && lang !== 'en' && lang !== 'hu' && lang !== 'de') {
    const translated = translateColorName(sourceText, lang);
    if (translated && translated !== sourceText) {
      return translated;
    }
  }
  
  // Fallback az alap nyelvekre
  if (lang !== 'en' && labels.en) return labels.en;
  if (lang !== 'hu' && labels.hu) return labels.hu;
  if (lang !== 'de' && labels.de) return labels.de;
  return labels.en || labels.hu || labels.de || '';
}

// Kinyerjük az egyedi színeket material és finish szerint
const colorMap = new Map(); // key: "MATERIAL-FINISH-COLOR", value: { hex, labels }

for (const entry of libraryData) {
  const material = entry.material?.toUpperCase();
  const finish = entry.finish || 'standard';
  const color = entry.color || entry.name;
  const hex = entry.hex;
  const labels = entry.labels || {};

  if (!material || !color || !hex) continue;
  if (!MATERIAL_TYPES.includes(material)) continue;
  if (!FINISH_TYPES.includes(finish)) continue;

  const key = `${material}-${finish}-${normalizeColorName(color)}`;
  
  // Ha már van ilyen kulcs, akkor összevonjuk a label-eket (ha az új jobb)
  if (colorMap.has(key)) {
    const existing = colorMap.get(key);
    // Ha az új entry-nek több nyelvű fordítása van, akkor frissítjük
    const existingLangCount = Object.keys(existing.labels).filter(k => existing.labels[k]).length;
    const newLangCount = Object.keys(labels).filter(k => labels[k]).length;
    if (newLangCount > existingLangCount) {
      colorMap.set(key, { hex, labels: { ...existing.labels, ...labels } });
    }
  } else {
    colorMap.set(key, { hex, labels });
  }
}

console.log(`🎨 Talált ${colorMap.size} egyedi szín kombináció`);

// Csoportosítás material szerint
const presetsByMaterial = {};

for (const [key, { hex, labels }] of colorMap.entries()) {
  const [material] = key.split('-');
  
  if (!presetsByMaterial[material]) {
    presetsByMaterial[material] = [];
  }

  // Kinyerjük a finish-t és a color-t
  const parts = key.split('-');
  const finish = parts[1];
  const colorName = parts.slice(2).join('-');

  // Az alap nyelvek kötelezőek
  const baseLabels = {
    hu: labels.hu || getLabel(labels, 'hu'),
    en: labels.en || getLabel(labels, 'en'),
    de: labels.de || getLabel(labels, 'de'),
  };

  // Hozzáadjuk a többi nyelvet, ha van
  for (const lang of ALL_LANGUAGES) {
    if (!BASE_LANGUAGES.includes(lang)) {
      const label = getLabel(labels, lang);
      if (label) {
        baseLabels[lang] = label;
      }
    }
  }

  // ID generálása: csak alfanumerikus karakterek és kötőjelek
  const safeId = `${material.toLowerCase()}-${finish}-${normalizeColorName(colorName)
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')}`;

  const option = {
    id: safeId,
    finish: finish,
    hex: hex,
    labels: baseLabels,
  };

  presetsByMaterial[material].push(option);
}

// Rendezzük a színeket (először standard finish, aztán színnév szerint)
for (const material of Object.keys(presetsByMaterial)) {
  presetsByMaterial[material].sort((a, b) => {
    // Először finish szerint
    const finishOrder = { standard: 0, matte: 1, silk: 2, transparent: 3, metallic: 4, glow: 5 };
    const finishDiff = (finishOrder[a.finish] || 99) - (finishOrder[b.finish] || 99);
    if (finishDiff !== 0) return finishDiff;
    
    // Aztán színnév szerint (angol alapján)
    const nameA = (a.labels.en || a.labels.hu || '').toLowerCase();
    const nameB = (b.labels.en || b.labels.hu || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });
}

// Generáljuk a TypeScript kódot
let output = `import type { Settings, ColorMode, LocaleStringMap } from "../types";

export type FilamentFinish =
  | "standard"
  | "matte"
  | "silk"
  | "transparent"
  | "metallic"
  | "glow";

export interface FilamentColorOption {
  id: string;
  finish: FilamentFinish;
  hex: string;
  labels: LocaleStringMap<string>;
  colorMode?: ColorMode;
  multiColorHint?: string;
}

export const DEFAULT_COLOR_HEX = "#9CA3AF";

const FINISH_LABELS: Record<FilamentFinish, LocaleStringMap<string>> = {
  standard: { hu: "Standard", en: "Standard", de: "Standard" },
  matte: { hu: "Matt", en: "Matte", de: "Matt" },
  silk: { hu: "Selyem", en: "Silk", de: "Seide" },
  transparent: { hu: "Átlátszó", en: "Transparent", de: "Transparent" },
  metallic: { hu: "Metál", en: "Metallic", de: "Metallisch" },
  glow: { hu: "Világító", en: "Glow", de: "Leuchtend" },
};

export const COLOR_PRESETS: Record<string, FilamentColorOption[]> = {
`;

// Hozzáadjuk az összes material típust
for (const material of MATERIAL_TYPES) {
  const options = presetsByMaterial[material] || [];
  output += `  ${material}: [\n`;
  
  for (const option of options) {
    // Formázzuk a labels objektumot - JSON.stringify automatikusan escape-eli a speciális karaktereket
    const labelsStr = JSON.stringify(option.labels, null, 6).replace(/\n/g, '\n      ');
    // Escape-eljük az ID-t is, ha szükséges
    const safeId = option.id.replace(/"/g, '\\"');
    output += `    { id: "${safeId}", finish: "${option.finish}", hex: "${option.hex}", labels: ${labelsStr} },\n`;
  }
  
  output += `  ],\n`;
}

// DEFAULT preset (leggyakoribb színek)
const defaultColors = ['white', 'black', 'grey', 'blue', 'red', 'green', 'yellow', 'orange', 'purple'];
const defaultOptions = [];

for (const colorName of defaultColors) {
  // Keresünk egy standard finish-ű színt bármelyik material-ból
  for (const material of MATERIAL_TYPES) {
    const found = presetsByMaterial[material]?.find(
      opt => opt.finish === 'standard' && 
      normalizeColorName(opt.labels.en || opt.labels.hu || '') === colorName
    );
    if (found) {
      defaultOptions.push({
        ...found,
        id: `default-${colorName}`,
      });
      break;
    }
  }
}

output += `  DEFAULT: [\n`;
for (const option of defaultOptions) {
  const labelsStr = JSON.stringify(option.labels, null, 6).replace(/\n/g, '\n      ');
  const safeId = option.id.replace(/"/g, '\\"');
  output += `    { id: "${safeId}", finish: "${option.finish}", hex: "${option.hex}", labels: ${labelsStr} },\n`;
}
output += `  ],\n`;

output += `};

const ALL_COLOR_OPTIONS: FilamentColorOption[] = Object.values(COLOR_PRESETS).flat();

`;

// Hozzáadjuk a többi függvényt az eredeti fájlból
const originalFile = readFileSync(join(projectRoot, 'frontend/src/utils/filamentColors.ts'), 'utf-8');
const restOfFile = originalFile.substring(originalFile.indexOf('const COLOR_KEYWORD_HEX'));

output += restOfFile;

// Írjuk ki a fájlt
const outputPath = join(projectRoot, 'frontend/src/utils/filamentColors.ts');
writeFileSync(outputPath, output, 'utf-8');

console.log(`✅ COLOR_PRESETS generálva: ${outputPath}`);
console.log(`📊 Összesítés:`);
for (const material of MATERIAL_TYPES) {
  const count = presetsByMaterial[material]?.length || 0;
  console.log(`   ${material}: ${count} szín`);
}
console.log(`   DEFAULT: ${defaultOptions.length} szín`);

