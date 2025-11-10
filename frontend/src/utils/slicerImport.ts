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
  extrudersUsed?: number[];
  filamentPerExtruderGrams?: number[];
  filamentPerExtruderMillimeters?: number[];
  filamentPerExtruderMeters?: number[];
  totalHeaderGrams?: number[];
  totalHeaderMillimeters?: number[];
  totalHeaderVolumeCm3?: number[];
  totalVolumeCm3?: number;
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
  "; estimated printing time (normal mode) =",
];
const FILAMENT_USED_G_KEYS = [
  "; filament used [g] =",
  ";FILAMENT_USED:",
  "; FILAMENT_USED:",
  "; total filament weight =",
  "; total filament weight [g] :",
  "; total filament used [g] =",
  ";FilamentWeight: ",
];
const FILAMENT_USED_MM_KEYS = [
  "; filament used [mm] =",
  ";FilamentLength: ",
  "; FILAMENT_USED_MM:",
  "; total filament length [mm] :",
];
const FILAMENT_USED_M_KEYS = ["; filament_used =", ";total_filament_used ="];
const TOTAL_FILAMENT_WEIGHT_KEYS = ["; total filament weight [g] :"];
const TOTAL_FILAMENT_LENGTH_KEYS = ["; total filament length [mm] :"];
const TOTAL_FILAMENT_VOLUME_KEYS = ["; total filament volume [cm^3] :"];

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

function parseDurationString(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const colonParts = trimmed.split(":");
  if (colonParts.length >= 2 && colonParts.length <= 3 && colonParts.every(part => /^\d+$/.test(part.trim()))) {
    const reversed = colonParts.map(part => parseInt(part.trim(), 10)).reverse();
    let total = 0;
    if (reversed[0]) total += reversed[0];
    if (reversed[1]) total += reversed[1] * 60;
    if (reversed[2]) total += reversed[2] * 3600;
    return total;
  }

  const pattern = /(?<value>\d+)\s*(?<unit>h|hr|hrs|hour|hours|m|min|mins|minute|minutes|s|sec|secs|second|seconds)/gi;
  let match: RegExpExecArray | null;
  let totalSeconds = 0;
  let matched = false;
  while ((match = pattern.exec(trimmed)) !== null) {
    matched = true;
    const numeric = parseInt(match.groups?.value ?? "0", 10);
    const unit = match.groups?.unit?.toLowerCase();
    if (!Number.isFinite(numeric)) continue;
    if (!unit) continue;
    if (unit.startsWith("h")) {
      totalSeconds += numeric * 3600;
    } else if (unit.startsWith("m")) {
      totalSeconds += numeric * 60;
    } else if (unit.startsWith("s")) {
      totalSeconds += numeric;
    }
  }
  if (matched) {
    return totalSeconds;
  }

  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : undefined;
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
  let extrudersUsed: number[] | undefined;
  let filamentPerExtruderGrams: number[] | undefined;
  let filamentPerExtruderMillimeters: number[] | undefined;
  let filamentPerExtruderMeters: number[] | undefined;
  let totalHeaderGrams: number[] | undefined;
  let totalHeaderMillimeters: number[] | undefined;
  let totalHeaderVolumeCm3: number[] | undefined;

  const extractNumbers = (value: string) => {
    const matches = value.match(/[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g);
    return matches ? matches.map(Number).filter(num => Number.isFinite(num)) : [];
  };

  const takeNumber = (line: string, prefix: string, mode: "first" | "sum" = "first") => {
    const remainder = line.split(prefix)[1]?.trim();
    if (!remainder) return undefined;
    const numbers = extractNumbers(remainder);
    if (!numbers.length) return undefined;
    return mode === "sum" ? numbers.reduce((acc, value) => acc + value, 0) : numbers[0];
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

    if (!extrudersUsed && trimmed.toLowerCase().startsWith("; used_extruders")) {
      const parts = trimmed.split("=")[1]?.trim();
      if (parts) {
        const parsed = parts
          .split(/[;,\s]+/)
          .map(token => parseInt(token, 10))
          .filter(num => Number.isFinite(num));
        if (parsed.length) {
          extrudersUsed = parsed;
        }
      }
    }

    if (!estimatedPrintTimeSec) {
      const timeEntry = GCODE_TIME_KEYS.find(key => trimmed.startsWith(key));
      if (timeEntry) {
        const rawValue = trimmed.slice(timeEntry.length).trim();
        const durationSeconds = parseDurationString(rawValue);
        if (durationSeconds !== undefined && Number.isFinite(durationSeconds)) {
          estimatedPrintTimeSec = Math.round(durationSeconds);
        } else {
          const numeric = takeNumber(trimmed, timeEntry);
          if (numeric !== undefined) {
            estimatedPrintTimeSec = Math.round(numeric);
          }
        }
      }
    }

    const grammEntry = FILAMENT_USED_G_KEYS.find(key => trimmed.startsWith(key));
    if (grammEntry) {
      const numbers = extractNumbers(trimmed.slice(grammEntry.length));
      if (numbers.length) {
        filamentPerExtruderGrams ??= numbers;
        filamentUsedGrams = numbers.reduce((acc, value) => acc + value, 0);
      }
    }

    const totalWeightEntry = TOTAL_FILAMENT_WEIGHT_KEYS.find(key => trimmed.startsWith(key));
    if (totalWeightEntry) {
      const numbers = extractNumbers(trimmed.slice(totalWeightEntry.length));
      if (numbers.length) {
        totalHeaderGrams = numbers;
      }
    }

    const mmEntry = FILAMENT_USED_MM_KEYS.find(key => trimmed.startsWith(key));
    if (mmEntry) {
      const numbers = extractNumbers(trimmed.slice(mmEntry.length));
      if (numbers.length) {
        filamentPerExtruderMillimeters ??= numbers;
        filamentUsedMillimeters = numbers.reduce((acc, value) => acc + value, 0);
        filamentPerExtruderMeters ??= numbers.map(value => value / 1000);
        filamentUsedMeters = numbers.reduce((acc, value) => acc + value, 0) / 1000;
      }
    }

    const totalLengthEntry = TOTAL_FILAMENT_LENGTH_KEYS.find(key => trimmed.startsWith(key));
    if (totalLengthEntry) {
      const numbers = extractNumbers(trimmed.slice(totalLengthEntry.length));
      if (numbers.length) {
        totalHeaderMillimeters = numbers;
      }
    }

    const mEntry = FILAMENT_USED_M_KEYS.find(key => trimmed.startsWith(key));
    if (mEntry) {
      const numbers = extractNumbers(trimmed.slice(mEntry.length));
      if (numbers.length) {
        filamentPerExtruderMeters ??= numbers;
        const total = numbers.reduce((acc, value) => acc + value, 0);
        filamentUsedMeters = total;
        filamentPerExtruderMillimeters ??= numbers.map(value => value * 1000);
        filamentUsedMillimeters ??= total * 1000;
      }
    }

    const totalVolumeEntry = TOTAL_FILAMENT_VOLUME_KEYS.find(key => trimmed.startsWith(key));
    if (totalVolumeEntry) {
      const numbers = extractNumbers(trimmed.slice(totalVolumeEntry.length));
      if (numbers.length) {
        totalHeaderVolumeCm3 = numbers;
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

  if (material) {
    const uniqueMaterials = Array.from(
      new Set(
        material
          .split(/[;,]/)
          .map(token => token.trim())
          .filter(Boolean)
      )
    );
    if (uniqueMaterials.length) {
      material = uniqueMaterials.join(", ");
    }
  }

  if (filamentPerExtruderMillimeters && !filamentPerExtruderMeters) {
    filamentPerExtruderMeters = filamentPerExtruderMillimeters.map(value => value / 1000);
  }
  if (filamentPerExtruderMeters && !filamentPerExtruderMillimeters) {
    filamentPerExtruderMillimeters = filamentPerExtruderMeters.map(value => value * 1000);
  }
  if (!filamentUsedGrams && filamentPerExtruderGrams) {
    filamentUsedGrams = filamentPerExtruderGrams.reduce((acc, value) => acc + value, 0);
  }
  if (!filamentUsedMillimeters && filamentPerExtruderMillimeters) {
    filamentUsedMillimeters = filamentPerExtruderMillimeters.reduce((acc, value) => acc + value, 0);
  }
  if (!filamentUsedMeters && filamentPerExtruderMeters) {
    filamentUsedMeters = filamentPerExtruderMeters.reduce((acc, value) => acc + value, 0);
  }

  if (totalHeaderGrams && totalHeaderGrams.length) {
    filamentPerExtruderGrams = totalHeaderGrams;
    filamentUsedGrams = totalHeaderGrams.reduce((acc, value) => acc + value, 0);
  } else if (!filamentUsedGrams && filamentPerExtruderGrams) {
    filamentUsedGrams = filamentPerExtruderGrams.reduce((acc, value) => acc + value, 0);
  }

  if (totalHeaderMillimeters && totalHeaderMillimeters.length) {
    filamentPerExtruderMillimeters = totalHeaderMillimeters;
    filamentUsedMillimeters = totalHeaderMillimeters.reduce((acc, value) => acc + value, 0);
    filamentPerExtruderMeters = totalHeaderMillimeters.map(value => value / 1000);
    filamentUsedMeters = filamentUsedMillimeters / 1000;
  } else {
    if (filamentPerExtruderMillimeters && !filamentPerExtruderMeters) {
      filamentPerExtruderMeters = filamentPerExtruderMillimeters.map(value => value / 1000);
    }
    if (filamentPerExtruderMeters && !filamentPerExtruderMillimeters) {
      filamentPerExtruderMillimeters = filamentPerExtruderMeters.map(value => value * 1000);
    }
    if (!filamentUsedMillimeters && filamentPerExtruderMillimeters) {
      filamentUsedMillimeters = filamentPerExtruderMillimeters.reduce((acc, value) => acc + value, 0);
    }
    if (!filamentUsedMeters && filamentPerExtruderMeters) {
      filamentUsedMeters = filamentPerExtruderMeters.reduce((acc, value) => acc + value, 0);
    }
  }

  const totalVolume = totalHeaderVolumeCm3 && totalHeaderVolumeCm3.length
    ? totalHeaderVolumeCm3.reduce((acc, value) => acc + value, 0)
    : undefined;

  if (filamentUsedMillimeters !== undefined && filamentUsedMeters === undefined) {
    filamentUsedMeters = filamentUsedMillimeters / 1000;
  }
  if (filamentUsedMeters !== undefined && filamentUsedMillimeters === undefined) {
    filamentUsedMillimeters = filamentUsedMeters * 1000;
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
    extrudersUsed,
    filamentPerExtruderGrams,
    filamentPerExtruderMillimeters,
    filamentPerExtruderMeters,
    totalHeaderGrams,
    totalHeaderMillimeters,
    totalHeaderVolumeCm3,
    totalVolumeCm3: totalVolume,
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

