/**
 * useFilamentSort hook
 * Filament rendezés kezelés hook
 */

import { useState, useMemo, useCallback } from "react";
import type { Filament } from "../types";
import type { FilamentSortConfig } from "../types";
import { sortFilaments } from "../utils/sorting";

interface UseFilamentSortParams {
  filaments: Filament[];
  initialSortConfig?: FilamentSortConfig[];
}

/**
 * Hook filament rendezés kezeléséhez
 */
export function useFilamentSort({
  filaments,
  initialSortConfig = [],
}: UseFilamentSortParams) {
  const [sortConfig, setSortConfig] = useState<FilamentSortConfig[]>(
    initialSortConfig
  );

  // Rendezett filamentek
  const sortedFilaments = useMemo(() => {
    return sortFilaments(filaments, sortConfig);
  }, [filaments, sortConfig]);

  // Rendezés váltása (Shift+click = többszörös rendezés)
  const handleSort = useCallback(
    (
      column: keyof Filament,
      event?: React.MouseEvent<HTMLTableHeaderCellElement>
    ) => {
      const isShiftClick = event?.shiftKey;

      setSortConfig((prev) => {
        const existingIndex = prev.findIndex((cfg) => cfg.column === column);
        const existing = existingIndex >= 0 ? prev[existingIndex] : null;

        // Nincs Shift: single-column mód
        if (!isShiftClick) {
          let next: FilamentSortConfig[];
          if (!existing) {
            // új oszlop, növekvő rendezés
            next = [{ column, direction: "asc" }];
          } else if (existing.direction === "asc") {
            // ugyanaz az oszlop: asc -> desc
            next = [{ column, direction: "desc" }];
          } else {
            // desc -> töröljük a rendezést teljesen
            next = [];
          }

          return next;
        }

        // Shift+click: többszörös rendezés
        let next: FilamentSortConfig[];

        if (!existing) {
          // hozzáadjuk a lánc végére asc irányban
          next = [...prev, { column, direction: "asc" as const }];
        } else if (existing.direction === "asc") {
          // asc -> desc ugyanazon oszlopnál
          const updated = [...prev];
          updated[existingIndex] = { column, direction: "desc" };
          next = updated;
        } else {
          // desc -> eltávolítjuk az oszlopot
          next = prev.filter((_, idx) => idx !== existingIndex);
        }

        return next;
      });
    },
    []
  );

  const resetSort = useCallback(() => {
    setSortConfig([]);
  }, []);

  return {
    sortedFilaments,
    sortConfig,
    handleSort,
    resetSort,
    setSortConfig,
  };
}

