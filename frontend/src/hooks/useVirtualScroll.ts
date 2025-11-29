import { useState, useEffect, useRef, useMemo } from "react";

interface UseVirtualScrollOptions<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  overscan?: number; // Hány extra elemet rendereljünk a látható terület körül (performance)
}

interface VirtualScrollResult {
  startIndex: number;
  endIndex: number;
  visibleItems: number[];
  totalHeight: number;
  offsetY: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Virtuális scroll hook - csak a látható elemeket rendereli
 * 
 * @example
 * ```typescript
 * const { startIndex, endIndex, visibleItems, totalHeight, offsetY, containerRef } = useVirtualScroll({
 *   items: filteredEntries,
 *   itemHeight: 60, // fix magasság
 *   containerHeight: 600,
 *   overscan: 5
 * });
 * ```
 */
export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: UseVirtualScrollOptions<T>): VirtualScrollResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Scroll pozíció követése
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Összmagasság kiszámítása
  const totalHeight = useMemo(() => {
    if (typeof itemHeight === "number") {
      return items.length * itemHeight;
    } else {
      // Dinamikus magasság esetén számoljuk ki az összmagasságot
      let height = 0;
      for (let i = 0; i < items.length; i++) {
        height += itemHeight(i);
      }
      return height;
    }
  }, [items.length, itemHeight]);

  // Látható elemek kiszámítása
  const { startIndex, endIndex, offsetY } = useMemo(() => {
    if (items.length === 0) {
      return { startIndex: 0, endIndex: 0, offsetY: 0 };
    }

    const getItemHeight = (index: number): number => {
      return typeof itemHeight === "number" ? itemHeight : itemHeight(index);
    };

    // Keresés: melyik elem van a scroll pozícióban
    let startIdx = 0;

    // Bináris keresés a pontos start index-hez (hatékonyabb nagy listáknál)
    if (typeof itemHeight === "number") {
      // Fix magasság esetén egyszerű osztás
      startIdx = Math.floor(scrollTop / itemHeight);
    } else {
      // Dinamikus magasság esetén bináris keresés
      let low = 0;
      let high = items.length - 1;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        let offset = 0;
        for (let i = 0; i < mid; i++) {
          offset += getItemHeight(i);
        }

        if (offset < scrollTop) {
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      startIdx = Math.max(0, low - 1);
    }

    // Offset számítás (fix magasság esetén egyszerűbb)
    let offset = 0;
    if (typeof itemHeight === "number") {
      offset = startIdx * itemHeight;
    } else {
      for (let i = 0; i < startIdx; i++) {
        offset += getItemHeight(i);
      }
    }

    // End index számítás (mennyi elem fér el a container-ben)
    let visibleHeight = 0;
    let endIdx = startIdx;

    while (endIdx < items.length && visibleHeight < containerHeight) {
      visibleHeight += getItemHeight(endIdx);
      if (visibleHeight < containerHeight) {
        endIdx++;
      }
    }

    // Overscan hozzáadása
    startIdx = Math.max(0, startIdx - overscan);
    endIdx = Math.min(items.length - 1, endIdx + overscan);

    return {
      startIndex: startIdx,
      endIndex: endIdx,
      offsetY: offset,
    };
  }, [scrollTop, items.length, itemHeight, containerHeight, overscan]);

  // Látható elemek indexei
  const visibleItems = useMemo(() => {
    const items: number[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      items.push(i);
    }
    return items;
  }, [startIndex, endIndex]);

  return {
    startIndex,
    endIndex,
    visibleItems,
    totalHeight,
    offsetY,
    containerRef,
  };
}

