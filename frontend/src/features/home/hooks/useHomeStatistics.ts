/**
 * useHomeStatistics hook
 * Home statisztikák számítás hook
 */

import { useMemo } from "react";
import type { Offer, Settings } from "../../../types";
import { calculateStatistics } from "../utils/statistics";
import { filterOffersByPeriod, type PeriodFilter } from "../utils/filtering";

interface UseHomeStatisticsParams {
  offers: Offer[];
  settings: Settings;
  selectedPeriod?: PeriodFilter;
}

/**
 * Hook a Home statisztikák számításához
 */
export function useHomeStatistics({
  offers,
  settings,
  selectedPeriod = "all",
}: UseHomeStatisticsParams) {
  // Összes statisztika
  const statistics = useMemo(() => {
    return calculateStatistics(offers, settings.electricityPrice || 70);
  }, [offers, settings.electricityPrice]);

  // Heti statisztikák
  const weeklyStats = useMemo(() => {
    const filtered = filterOffersByPeriod(offers, "week");
    return calculateStatistics(filtered, settings.electricityPrice || 70);
  }, [offers, settings.electricityPrice]);

  // Havi statisztikák
  const monthlyStats = useMemo(() => {
    const filtered = filterOffersByPeriod(offers, "month");
    return calculateStatistics(filtered, settings.electricityPrice || 70);
  }, [offers, settings.electricityPrice]);

  // Éves statisztikák
  const yearlyStats = useMemo(() => {
    const filtered = filterOffersByPeriod(offers, "year");
    return calculateStatistics(filtered, settings.electricityPrice || 70);
  }, [offers, settings.electricityPrice]);

  // Aktuális statisztikák a kiválasztott időszak alapján
  const currentStats = useMemo(() => {
    const filtered = filterOffersByPeriod(offers, selectedPeriod);
    return calculateStatistics(filtered, settings.electricityPrice || 70);
  }, [offers, selectedPeriod, settings.electricityPrice]);

  return {
    statistics,
    weeklyStats,
    monthlyStats,
    yearlyStats,
    currentStats,
  };
}

