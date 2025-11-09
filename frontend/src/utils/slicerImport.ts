/* eslint-disable @typescript-eslint/prefer-as-const */
/**
 * Utilities for parsing slicer generated files (G-code / JSON meta).
 * Initial support targets PrusaSlicer, Cura, OrcaSlicer és Qidi Studio.
 * A visszatérő adat egységesített formátumban használható kalkulációhoz.
 */

export type SlicerType =
  | "prusa-slicer"
  | "cura"
  | "orca-slicer"
  | "qidi-studio"
  | "unknown";

export interface SlicerJobData {
  slicer: SlicerType;
  filePath: string;
  projectName?: string;
  profileName?: string;
  material?: string;
  estimatedPrintTimeSec?: number;
  filamentUsedGrams?: number;
  filamentUsedMillimeters?: number;
  filamentUsedMeters?: number;
  filamentUsedCubicMm?: number;
  nozzleTemperature?: number;
  bedTemperature?: number;
  warnings: string[];
  rawMeta?: Record<string, unknown>;
}

export class SlicerParseError extends Error {
  constructor(message: string, public readonly slicer: SlicerType = "unknown") {
    super(message);
    this.name = "SlicerParseError";
  }
}

interface DetectionResult {
  slicer: SlicerType;
  reasons: string[];
}

const GCODE_TIME_KEYS = [
  ";TIME:",
  ";TIME_ELAPSED:",
  ";TOTAL_TIME:",
  "; PRINT_TIME:",
  ";PRINT_TIME:",
];
const FILAMENT_USED_G_KEYS = [
  "; filament used [g] =",
  ";FILAMENT_USED:",
  "; FILAMENT_USED:",
  "; total filament weight =",
  ";FilamentWeight: ",
];
const FILAMENT_USED_MM_KEYS = [
  "; filament used [mm] =",
  ";FilamentLength: ",
  "; FILAMENT_USED_MM:",
];
const FILAMENT_USED_M_KEYS = ["; filament_used =", ";total_filament_used ="];

/**
 * Fő belépési pont: automatikus slicer detektálás és metaadat kinyerés.
 */
export async function parseSlicerFile(
  filePath: string,
  fileContent: string
): Promise<SlicerJobData> {
  const detection = detectSlicer(filePath, fileContent);
  const base: SlicerJobData = {
    slicer: detection.slicer,
    filePath,
    warnings: [],
  };

  if (fileContent.trim().length === 0) {
    throw new SlicerParseError("Üres fájl – nincs feldolgozható adat.", detection.slicer);
  }

  if (isLikelyGcode(filePath, fileContent)) {
    return {
      ...base,
      ...parseGcodeMeta(fileContent, detection),
    };
  }

  if (filePath.toLowerCase().endsWith(".json")) {
    return {
      ...base,
      ...parseJsonMeta(fileContent, detection),
    };
  }

  if (filePath.toLowerCase().endsWith(".3mf")) {
    throw new SlicerParseError(
      "3MF projekt fájl támogatása még nincs implementálva. Exportálj G-code/JSON fájlt a slicerből.",
      detection.slicer
    );
  }

  throw new SlicerParseError(
    "Ismeretlen fájlformátum. Támogatott kiterjesztések: .gcode, .json",
    detection.slicer
  );
}

function detectSlicer(filePath: string, content: string): DetectionResult {
  const lower = filePath.toLowerCase();
  const reasons: string[] = [];

  if (content.includes("PrusaSlicer") || content.includes("PRUSA")) {
    reasons.push("PrusaSlicer nyomok a fájlban");
    return { slicer: "prusa-slicer", reasons };
  }
  if (content.includes("Cura_SteamEngine") || content.includes("CURADefault")) {
    reasons.push("Cura nyomok a fájlban");
    return { slicer: "cura", reasons };
  }
  if (content.includes("ORCA SLICER") || content.includes("OrcaSlicer")) {
    reasons.push("OrcaSlicer nyomok a fájlban");
    return { slicer: "orca-slicer", reasons };
  }
  if (content.includes("QIDI") || content.includes("QidiPrint")) {
    reasons.push("Qidi Studio nyomok a fájlban");
    return { slicer: "qidi-studio", reasons };
  }

  if (lower.includes("prusa")) {
    reasons.push("Fájlnév prusa kulcsszót tartalmaz");
    return { slicer: "prusa-slicer", reasons };
  }
  if (lower.includes("cura")) {
    reasons.push("Fájlnév cura kulcsszót tartalmaz");
    return { slicer: "cura", reasons };
  }
  if (lower.includes("orca")) {
    reasons.push("Fájlnév orca kulcsszót tartalmaz");
    return { slicer: "orca-slicer", reasons };
  }
  if (lower.includes("qidi")) {
    reasons.push("Fájlnév qidi kulcsszót tartalmaz");
    return { slicer: "qidi-studio", reasons };
  }

  return { slicer: "unknown", reasons };
}

function isLikelyGcode(filePath: string, content: string): boolean {
  return (
    filePath.toLowerCase().endsWith(".gcode") ||
    content.trimStart().startsWith(";") ||
    content.includes("G1 ") ||
    content.includes("M104")
  );
}

function parseGcodeMeta(content: string, detection: DetectionResult): Partial<SlicerJobData> {
  const lines = content.split(/\r?\n/);
  let projectName: string | undefined;
  let profileName: string | undefined;
  let material: string | undefined;
  let estimatedPrintTimeSec: number | undefined;
  let filamentUsedGrams: number | undefined;
  let filamentUsedMillimeters: number | undefined;
  let filamentUsedMeters: number | undefined;
  const warnings: string[] = [];

  const takeNumber = (line: string, prefix: string) => {
    const value = line.split(prefix)[1]?.trim();
    if (!value) return undefined;
    const numeric = parseFloat(value.replace(/[^0-9.+-]/g, ""));
    return Number.isFinite(numeric) ? numeric : undefined;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!projectName && trimmed.startsWith(";PROJECT_NAME:")) {
      projectName = trimmed.split(":")[1]?.trim();
    }
    if (!profileName && trimmed.toLowerCase().startsWith("; print_settings_id")) {
      profileName = trimmed.split("=")[1]?.trim();
    }
    if (!profileName && trimmed.toLowerCase().startsWith("; print_profile =")) {
      profileName = trimmed.split("=")[1]?.trim();
    }
    if (!material && trimmed.toLowerCase().includes("filament_type")) {
      const [, value] = trimmed.split(/[:=]/);
      if (value) material = value.trim();
    }

    if (!estimatedPrintTimeSec) {
      const timeEntry = GCODE_TIME_KEYS.find(key => trimmed.startsWith(key));
      if (timeEntry) {
        const numeric = takeNumber(trimmed, timeEntry);
        if (numeric !== undefined) {
          estimatedPrintTimeSec = Math.round(numeric);
        }
      }
    }

    if (!filamentUsedGrams) {
      const grammEntry = FILAMENT_USED_G_KEYS.find(key => trimmed.startsWith(key));
      if (grammEntry) {
        const numeric = takeNumber(trimmed, grammEntry);
        if (numeric !== undefined) {
          filamentUsedGrams = numeric;
        }
      }
    }

    if (!filamentUsedMillimeters) {
      const mmEntry = FILAMENT_USED_MM_KEYS.find(key => trimmed.startsWith(key));
      if (mmEntry) {
        const numeric = takeNumber(trimmed, mmEntry);
        if (numeric !== undefined) {
          filamentUsedMillimeters = numeric;
          filamentUsedMeters = numeric / 1000;
        }
      }
    }

    if (!filamentUsedMeters) {
      const mEntry = FILAMENT_USED_M_KEYS.find(key => trimmed.startsWith(key));
      if (mEntry) {
        const cleaned = trimmed.slice(mEntry.length).trim();
        const parsed = parseFloat(cleaned.replace(/[^0-9.+-]/g, ""));
        if (Number.isFinite(parsed)) {
          filamentUsedMeters = parsed;
          filamentUsedMillimeters ??= parsed * 1000;
        }
      }
    }
  }

  if (!estimatedPrintTimeSec) {
    warnings.push(
      "A G-code header nem tartalmazott nyomtatási idő becslést. Add meg manuálisan a kalkulátorban."
    );
  }
  if (!filamentUsedGrams && !filamentUsedMeters && !filamentUsedMillimeters) {
    warnings.push(
      "A G-code header nem tartalmazott filament mennyiséget. Ellenőrizd a slicer export beállításait."
    );
  }

  return {
    projectName,
    profileName,
    material,
    estimatedPrintTimeSec,
    filamentUsedGrams,
    filamentUsedMillimeters,
    filamentUsedMeters,
    warnings,
    rawMeta: {
      detection: detection.reasons,
    },
  };
}

function parseJsonMeta(content: string, detection: DetectionResult): Partial<SlicerJobData> {
  try {
    const data = JSON.parse(content) as Record<string, unknown>;
    const warnings: string[] = [];
    let estimatedPrintTimeSec: number | undefined;
    let filamentUsedGrams: number | undefined;
    let filamentUsedMeters: number | undefined;
    let projectName: string | undefined;
    let profileName: string | undefined;
    let material: string | undefined;

    if (typeof data.printTime === "number") {
      estimatedPrintTimeSec = data.printTime;
    } else if (typeof data.estimated_print_time === "number") {
      estimatedPrintTimeSec = data.estimated_print_time;
    }

    if (typeof data.filament_weight === "number") {
      filamentUsedGrams = data.filament_weight;
    } else if (typeof data.filamentUsed === "number") {
      filamentUsedGrams = data.filamentUsed;
    }

    if (typeof data.filament_length === "number") {
      filamentUsedMeters = data.filament_length / 1000;
    }

    if (typeof data.projectName === "string") {
      projectName = data.projectName;
    }
    if (typeof data.profileName === "string") {
      profileName = data.profileName;
    }
    if (typeof data.material === "string") {
      material = data.material;
    }

    if (!estimatedPrintTimeSec) {
      warnings.push("A JSON meta nem tartalmazott nyomtatási időt.");
    }
    if (!filamentUsedGrams && !filamentUsedMeters) {
      warnings.push("A JSON meta nem tartalmazott filament mennyiséget.");
    }

    return {
      estimatedPrintTimeSec,
      filamentUsedGrams,
      filamentUsedMeters,
      projectName,
      profileName,
      material,
      warnings,
      rawMeta: {
        detection: detection.reasons,
        original: data,
      },
    };
  } catch (error) {
    throw new SlicerParseError(
      `Nem sikerült JSON formátumként értelmezni a fájlt: ${(error as Error).message}`,
      detection.slicer
    );
  }
}

