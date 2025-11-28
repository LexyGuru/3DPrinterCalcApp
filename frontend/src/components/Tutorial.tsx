import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Settings } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import type { getThemeStyles } from "../utils/themes";
import { generateTutorialDemoData, clearTutorialDemoData, hasExistingData } from "../utils/tutorialDemoData";
import { saveSettings } from "../utils/store";

interface Props {
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof getThemeStyles>;
  isOpen: boolean;
  onComplete: () => void;
  onSkip?: () => void; // Opcionális skip callback, ami nem állítja be a completed-et
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onOpenGlobalSearch?: () => void; // Callback a GlobalSearch megnyitásához
  onCloseGlobalSearch?: () => void; // Callback a GlobalSearch bezárásához
  onDataReload?: () => void; // Callback az adatok újratöltéséhez (demo adatok generálása után)
}

interface TutorialStep {
  id: string;
  target?: string; // CSS selector vagy 'center' ha középre kell
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right" | "center" | "bottom-right";
  page?: string; // Melyik oldalon kell megjelennie
  action?: () => void; // Opcionális akció (pl. navigáció)
}

export const Tutorial: React.FC<Props> = ({
  settings,
  theme,
  themeStyles,
  isOpen,
  onComplete,
  onSkip,
  currentPage = "home",
  onNavigate,
  onOpenGlobalSearch,
  onCloseGlobalSearch,
  onDataReload,
}) => {
  const t = useTranslation(settings.language);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({ display: "none" });
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const updatePositionTimeoutRef = useRef<number | null>(null);
  const retryCountRef = useRef<number>(0);
  const lastPositionRef = useRef<{ top: number; left: number } | null>(null);
  const positionUpdateInProgressRef = useRef<boolean>(false);
  const demoDataGeneratedRef = useRef<boolean>(false); // Tracks if we generated demo data

  // Demo adatok generálása amikor a tutorial elindul
  useEffect(() => {
    if (isOpen && !demoDataGeneratedRef.current) {
      const initializeDemoData = async () => {
        try {
          // Ellenőrizzük, hogy van-e már adat
          const hasData = await hasExistingData();
          if (!hasData) {
            console.log("🎓 Tutorial elindult - demo adatok generálása...");
            await generateTutorialDemoData(settings);
            demoDataGeneratedRef.current = true;
            // Frissítjük az adatokat az App.tsx-ben
            if (onDataReload) {
              onDataReload();
            }
          } else {
            console.log("ℹ️ Már van adat az alkalmazásban, demo adatok nem generálódnak");
          }
        } catch (error) {
          console.error("❌ Hiba a demo adatok generálásakor:", error);
        }
      };
      initializeDemoData();
    }
  }, [isOpen, settings, onDataReload]);

  const steps: TutorialStep[] = [
    {
      id: "welcome",
      target: "center",
      title: t("tutorial.welcome.title") || "Üdvözöllek!",
      description:
        t("tutorial.welcome.description") ||
        "Ez a kezdő tutorial végigvezet az alkalmazás főbb funkcióin. Kattints a 'Következő' gombra a folytatáshoz.",
      position: "center",
      page: "home",
    },
    {
      id: "sidebar",
      target: "aside[data-sidebar], aside[role='navigation'], [data-sidebar='true']",
      title: t("tutorial.sidebar.title") || "Oldalsáv",
      description:
        t("tutorial.sidebar.description") ||
        "Az oldalsávban találod az alkalmazás főbb menüpontjait. Itt navigálhatsz a különböző oldalak között.",
      position: "right",
      page: "home",
    },
    {
      id: "home",
      target: "[data-tutorial='home-content']",
      title: t("tutorial.home.title") || "Kezdőlap",
      description:
        t("tutorial.home.description") ||
        "A kezdőlapon láthatod a statisztikákat és összefoglalókat az árajánlataidról. Ide kerülnek a számított adatok.",
      position: "bottom",
      page: "home",
    },
    {
      id: "quick-actions",
      target: "[data-tutorial='quick-actions'], [data-quick-actions]",
      title: t("tutorial.quickActions.title") || "Gyors műveletek",
      description:
        t("tutorial.quickActions.description") ||
        "A header-ben található gyors művelet gombok lehetővé teszik, hogy gyorsan hozzáadj új filamenteket, nyomtatókat vagy ügyfeleket. A gombok az aktuális oldal alapján változnak.",
      position: "bottom",
      page: "home",
    },
    {
      id: "global-search",
      target: "[data-tutorial='global-search-modal']",
      title: t("tutorial.globalSearch.title") || "Globális keresés",
      description:
        t("tutorial.globalSearch.description") ||
        "Nyomd meg a Ctrl+K (vagy Cmd+K Mac-en) billentyűkombinációt a globális keresés megnyitásához. Itt kereshetsz oldalak, filamentek, árajánlatok és ügyfelek között, és gyorsan navigálhatsz.",
      position: "top",
      page: "home",
      action: () => onOpenGlobalSearch?.(),
    },
    {
      id: "printers",
      target: "[data-page='printers']",
      title: t("tutorial.printers.title") || "Nyomtatók kezelése",
      description:
        t("tutorial.printers.description") ||
        "A Nyomtatók oldalon kezelheted a nyomtatóidat. Itt adhatsz hozzá, szerkeszthetsz vagy törölhetsz nyomtatókat.",
      position: "bottom-right",
      page: "printers",
      action: () => onNavigate?.("printers"),
    },
    {
      id: "filaments",
      target: "[data-page='filaments']",
      title: t("tutorial.filaments.title") || "Filamentek kezelése",
      description:
        t("tutorial.filaments.description") ||
        "A Filamentek oldalon kezelheted a filament kollekciódat. Itt adhatsz hozzá filamenteket árral és egyéb információkkal.",
      position: "bottom-right",
      page: "filaments",
      action: () => onNavigate?.("filaments"),
    },
    {
      id: "filament-library",
      target: "[data-page='filaments']",
      title: t("tutorial.filamentLibrary.title") || "Filament színkönyvtár",
      description:
        t("tutorial.filamentLibrary.description") ||
        "Az alkalmazás több mint 12,000 gyári filament színt tartalmaz! A filament hozzáadása során használhatod a beépített könyvtárat, ahol márka és típus alapján kereshetsz és választhatsz színeket.",
      position: "bottom-right",
      page: "filaments",
    },
    {
      id: "customers",
      target: "[data-page='customers']",
      title: t("tutorial.customers.title") || "Ügyfelek kezelése",
      description:
        t("tutorial.customers.description") ||
        "Az Ügyfelek oldalon kezelheted az ügyfeleidet. Itt adhatsz hozzá ügyfeleket kapcsolattartási adatokkal, és követheted az árajánlat statisztikáikat.",
      position: "bottom-right",
      page: "customers",
      action: () => onNavigate?.("customers"),
    },
    {
      id: "calculator",
      target: "[data-page='calculator']",
      title: t("tutorial.calculator.title") || "Kalkulátor",
      description:
        t("tutorial.calculator.description") ||
        "A Kalkulátorban számíthatod ki a nyomtatási költségeket. Válassz egy nyomtatót és filamenteket, majd add meg a nyomtatási időt.",
      position: "bottom-right",
      page: "calculator",
      action: () => onNavigate?.("calculator"),
    },
    {
      id: "gcode-import",
      target: "[data-page='calculator']",
      title: t("tutorial.gcodeImport.title") || "G-code import",
      description:
        t("tutorial.gcodeImport.description") ||
        "A kalkulátorban importálhatod a G-code vagy JSON fájlokat (Prusa, Cura, Orca, Qidi). Az alkalmazás automatikusan betölti a nyomtatási időt, filament mennyiséget, és létrehoz egy árajánlat draft-ot.",
      position: "bottom-right",
      page: "calculator",
    },
    {
      id: "offers",
      target: "[data-page='offers']",
      title: t("tutorial.offers.title") || "Árajánlatok",
      description:
        t("tutorial.offers.description") ||
        "Az Árajánlatok oldalon láthatod az összes mentett árajánlatodat. Itt kezelheted, szerkesztheted vagy exportálhatod őket PDF formátumban.",
      position: "bottom-right",
      page: "offers",
      action: () => onNavigate?.("offers"),
    },
    {
      id: "settings",
      target: "[data-page='settings']",
      title: t("tutorial.settings.title") || "Beállítások",
      description:
        t("tutorial.settings.description") ||
        "A Beállításokban módosíthatod a nyelvet, témát, és egyéb alkalmazás beállításokat. Itt is elindíthatod újra a tutorialt.",
      position: "bottom-right",
      page: "settings",
      action: () => onNavigate?.("settings"),
    },
    {
      id: "complete",
      target: "center",
      title: t("tutorial.complete.title") || "Tutorial befejezve!",
      description:
        t("tutorial.complete.description") ||
        "Gratulálunk! Most már ismered az alkalmazás főbb funkcióit. Ha újra szeretnéd nézni a tutorialt, a Beállításokban találod a 'Tutorial újranézése' gombot.",
      position: "center",
      page: "home",
    },
  ];

  // Navigáció az aktuális lépés oldalára
  useEffect(() => {
    if (!isOpen) return;
    const step = steps[currentStep];
    if (!step) return;
    
    // Reset retry count új lépésnél
    retryCountRef.current = 0;
    // Reset pozíció referencia új lépésnél, hogy biztosan frissüljön
    lastPositionRef.current = null;
    positionUpdateInProgressRef.current = false;
    
    // Töröljük az előző timeout-ot, ha van
    if (updatePositionTimeoutRef.current) {
      clearTimeout(updatePositionTimeoutRef.current);
      updatePositionTimeoutRef.current = null;
    }
    
    // Ha a global-search lépésnél vagyunk, megnyitjuk a GlobalSearch-et
    if (step.id === "global-search" && onOpenGlobalSearch) {
      // Kis késleltetés, hogy a tutorial overlay megjelenjen
      setTimeout(() => {
        onOpenGlobalSearch();
        // További késleltetés, hogy a GlobalSearch megjelenjen, majd frissítsük a pozíciót
        updatePositionTimeoutRef.current = window.setTimeout(() => {
          updateTargetPosition();
        }, 600);
      }, 300);
    } else if (onCloseGlobalSearch) {
      // Ha nem a global-search lépésnél vagyunk, bezárjuk a GlobalSearch-et
      onCloseGlobalSearch();
    }
    
    // Ha van action és másik oldalon van, navigáljunk
    if (step.action && step.page && currentPage !== step.page && onNavigate) {
      // Kis késleltetés, hogy az overlay megjelenjen
      setTimeout(() => {
        step.action?.();
        // További késleltetés, hogy az oldal betöltődjön
        updatePositionTimeoutRef.current = window.setTimeout(() => {
          updateTargetPosition();
        }, 1000);
      }, 100);
    } else if (step.page && step.page !== currentPage && onNavigate) {
      // Ha nincs action, de másik oldalon van, navigáljunk manuálisan
      setTimeout(() => {
        if (step.page) {
          onNavigate(step.page);
          updatePositionTimeoutRef.current = window.setTimeout(() => {
            updateTargetPosition();
          }, 800);
        }
      }, 100);
    } else {
      // Ha ugyanazon az oldalon vagyunk, csak frissítsük a pozíciót
      // Várunk egy kicsit, hogy az oldal stabilizálódjon
      updatePositionTimeoutRef.current = window.setTimeout(() => {
        updateTargetPosition();
      }, 300);
    }
    
    // Cleanup
    return () => {
      if (updatePositionTimeoutRef.current) {
        clearTimeout(updatePositionTimeoutRef.current);
        updatePositionTimeoutRef.current = null;
      }
    };
  }, [currentStep, isOpen, currentPage]);

  // Cél elem pozíciójának frissítése
  const updateTargetPosition = () => {
    // Ha már folyamatban van egy pozíció frissítés, ne indítsunk újat
    if (positionUpdateInProgressRef.current) return;
    
    const currentStepData = steps[currentStep];
    if (!currentStepData) return;

    if (currentStepData.target === "center") {
      // Középre helyezés
      const centerPos = {
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
      };
      // Csak akkor frissítjük, ha változott
      if (!lastPositionRef.current || 
          lastPositionRef.current.top !== centerPos.top || 
          lastPositionRef.current.left !== centerPos.left) {
        setTargetElement(null);
        setTooltipPosition(centerPos);
        lastPositionRef.current = centerPos;
      }
      return;
    }

    if (currentStepData.target) {
      // Element keresése
      let element: HTMLElement | null = null;
      
      // Próbáljuk meg a selectorral
      try {
        element = document.querySelector<HTMLElement>(currentStepData.target);
      } catch (e) {
        console.warn("Invalid selector:", currentStepData.target);
      }

      // Ha nem található, próbáljuk meg a page alapján
      if (!element && currentStepData.page) {
        const pageElement = document.querySelector(`[data-page="${currentStepData.page}"]`);
        if (pageElement) {
          element = pageElement as HTMLElement;
        }
      }

      if (element) {
        // Csak akkor állítjuk be, ha az elem valóban látható (nem rejtett)
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          // Reset retry count, ha megtaláltuk az elemet
          retryCountRef.current = 0;
          setTargetElement(element);
          
          positionUpdateInProgressRef.current = true;
          
          // Kettős requestAnimationFrame, hogy biztosan renderelődjön a tooltip
          // Plusz egy kis késleltetés, hogy az oldal betöltődjön
          setTimeout(() => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                // Stabil tooltip méretek - fix értékek használata, hogy ne változzon
                // Ha van tooltipRef, próbáljuk meg a valós méretet használni
                let estimatedTooltipWidth = 400;
                let estimatedTooltipHeight = 280;
                
                if (tooltipRef.current) {
                  const tooltipRect = tooltipRef.current.getBoundingClientRect();
                  if (tooltipRect.width > 0) estimatedTooltipWidth = tooltipRect.width;
                  if (tooltipRect.height > 0) estimatedTooltipHeight = tooltipRect.height;
                }
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const padding = 20;
                const gap = 20;
                
                // Újra lekérjük a rect-et, mert változhatott scroll/resize miatt
                const currentRect = element.getBoundingClientRect();
                let top = 0;
                let left = 0;
                let preferredPosition = currentStepData.position || "bottom";

                // Speciális pozíció: bottom-right - intelligens pozícionálás viewport mérethez igazítva
                if (preferredPosition === "bottom-right") {
                  // Próbáljuk meg a jobb alulra pozícionálni
                  let preferredTop = viewportHeight - estimatedTooltipHeight - padding;
                  let preferredLeft = viewportWidth - estimatedTooltipWidth - padding;
                  
                  // Ellenőrizzük, hogy befér-e a viewport-ba
                  const fitsRight = preferredLeft >= padding;
                  const fitsBottom = preferredTop >= padding;
                  const fitsInViewport = fitsRight && fitsBottom && 
                                         preferredLeft + estimatedTooltipWidth <= viewportWidth - padding &&
                                         preferredTop + estimatedTooltipHeight <= viewportHeight - padding;
                  
                  // Ha nem fér be, intelligens pozícionálás
                  if (!fitsInViewport) {
                    // Ha a tooltip nagyobb, mint a viewport, középre igazítjuk
                    if (estimatedTooltipWidth >= viewportWidth - 2 * padding || 
                        estimatedTooltipHeight >= viewportHeight - 2 * padding) {
                      preferredTop = Math.max(padding, Math.floor((viewportHeight - estimatedTooltipHeight) / 2));
                      preferredLeft = Math.max(padding, Math.floor((viewportWidth - estimatedTooltipWidth) / 2));
                    } else {
                      // Ha csak részben nem fér be, korrigáljuk
                      // Jobbra korrekció
                      if (!fitsRight || preferredLeft + estimatedTooltipWidth > viewportWidth - padding) {
                        preferredLeft = Math.max(padding, viewportWidth - estimatedTooltipWidth - padding);
                      }
                      
                      // Alulra korrekció
                      if (!fitsBottom || preferredTop + estimatedTooltipHeight > viewportHeight - padding) {
                        preferredTop = Math.max(padding, viewportHeight - estimatedTooltipHeight - padding);
                      }
                      
                      // Végleges korrekció - biztosan a viewport-on belül
                      preferredTop = Math.max(padding, Math.min(preferredTop, viewportHeight - estimatedTooltipHeight - padding));
                      preferredLeft = Math.max(padding, Math.min(preferredLeft, viewportWidth - estimatedTooltipWidth - padding));
                    }
                  }
                  
                  top = preferredTop;
                  left = preferredLeft;
                  
                  // Skip a normál pozícionálást, mert már elvégeztük
                  const newPosition = { top, left };
                  if (!lastPositionRef.current || 
                      Math.abs(lastPositionRef.current.top - newPosition.top) > 5 || 
                      Math.abs(lastPositionRef.current.left - newPosition.left) > 5) {
                    setTooltipPosition(newPosition);
                    lastPositionRef.current = newPosition;
                  }
                  positionUpdateInProgressRef.current = false;
                  return; // Early return, hogy ne menjen át a normál pozícionálásra
                }

                // Intelligens pozícionálás - automatikusan választja a legjobb pozíciót
                const checkFits = (pos: { top: number; left: number }) => {
                  const fitsTop = pos.top >= padding;
                  const fitsBottom = pos.top + estimatedTooltipHeight <= viewportHeight - padding;
                  const fitsLeft = pos.left >= padding;
                  const fitsRight = pos.left + estimatedTooltipWidth <= viewportWidth - padding;
                  return fitsTop && fitsBottom && fitsLeft && fitsRight;
                };

                // Számított pozíciók a preferált irányban
                const calculatePosition = (posName: string) => {
                  switch (posName) {
                    case "bottom":
                      return {
                        top: currentRect.bottom + gap,
                        left: currentRect.left + currentRect.width / 2 - estimatedTooltipWidth / 2,
                      };
                    case "top":
                      return {
                        top: currentRect.top - estimatedTooltipHeight - gap,
                        left: currentRect.left + currentRect.width / 2 - estimatedTooltipWidth / 2,
                      };
                    case "right":
                      return {
                        top: currentRect.top + currentRect.height / 2 - estimatedTooltipHeight / 2,
                        left: currentRect.right + gap,
                      };
                    case "left":
                      return {
                        top: currentRect.top + currentRect.height / 2 - estimatedTooltipHeight / 2,
                        left: currentRect.left - estimatedTooltipWidth - gap,
                      };
                    default:
                      return {
                        top: currentRect.bottom + gap,
                        left: currentRect.left + currentRect.width / 2 - estimatedTooltipWidth / 2,
                      };
                  }
                };

                const positions = ["bottom", "top", "right", "left"] as const;
                let selectedPosition = calculatePosition(preferredPosition);

                // Ellenőrizzük, hogy a preferált pozícióban fér-e el
                if (!checkFits(selectedPosition)) {
                  // Ha nem fér el, keressük meg a legjobb alternatívát
                  for (const posName of positions) {
                    if (posName === preferredPosition) continue;
                    const pos = calculatePosition(posName);
                    if (checkFits(pos)) {
                      selectedPosition = pos;
                      break;
                    }
                  }
                }

                top = selectedPosition.top;
                left = selectedPosition.left;

                // Végleges ellenőrzés és korrekció - biztosítjuk, hogy a viewport-on belül legyen
                // De NE helyezzük középre, csak korrigáljuk a pozíciót
                // Ha kilóg jobbról, balra toljuk
                if (left + estimatedTooltipWidth > viewportWidth - padding) {
                  left = Math.max(padding, viewportWidth - estimatedTooltipWidth - padding);
                }
                // Ha kilóg balról, jobbra toljuk
                if (left < padding) {
                  left = padding;
                }
                // Ha kilóg alulról, feljebb toljuk
                if (top + estimatedTooltipHeight > viewportHeight - padding) {
                  top = Math.max(padding, viewportHeight - estimatedTooltipHeight - padding);
                }
                // Ha kilóg felülről, lejjebb toljuk
                if (top < padding) {
                  top = padding;
                }
                
                // Ha még mindig nem fér be (nagyon kis viewport), középre igazítjuk
                if (estimatedTooltipWidth >= viewportWidth - 2 * padding || 
                    estimatedTooltipHeight >= viewportHeight - 2 * padding) {
                  // Ha a tooltip nagyobb, mint a viewport, középre igazítjuk
                  top = Math.max(padding, (viewportHeight - estimatedTooltipHeight) / 2);
                  left = Math.max(padding, (viewportWidth - estimatedTooltipWidth) / 2);
                }

                // Csak akkor frissítjük a pozíciót, ha valóban változott (ugrálás elkerülése)
                const newPosition = { top, left };
                if (!lastPositionRef.current || 
                    Math.abs(lastPositionRef.current.top - newPosition.top) > 5 || 
                    Math.abs(lastPositionRef.current.left - newPosition.left) > 5) {
                  setTooltipPosition(newPosition);
                  lastPositionRef.current = newPosition;
                }
                
                positionUpdateInProgressRef.current = false;
              });
            });
          }, 100);
        } else {
          positionUpdateInProgressRef.current = false;
        }
      } else {
        // Ha nem található elem, középre helyezzük
        const centerPos = {
          top: window.innerHeight / 2,
          left: window.innerWidth / 2,
        };
        // Csak akkor frissítjük, ha változott
        if (!lastPositionRef.current || 
            lastPositionRef.current.top !== centerPos.top || 
            lastPositionRef.current.left !== centerPos.left) {
          setTargetElement(null);
          setTooltipPosition(centerPos);
          lastPositionRef.current = centerPos;
        }
      }
    }
  };

  // Pozíció frissítése scroll vagy resize esetén
  useEffect(() => {
    if (!isOpen) return;
    
    // Kis késleltetés, hogy a tooltip renderelődjön
    const timeoutId = window.setTimeout(() => {
      updateTargetPosition();
    }, 500); // Növelt késleltetés, hogy az oldal betöltődjön

    let resizeTimeoutId: number | null = null;
    let scrollTimeoutId: number | null = null;
    
    const handleResize = () => {
      // Debounce a resize eseményt, hogy ne ugráljon
      if (resizeTimeoutId !== null) {
        clearTimeout(resizeTimeoutId);
      }
      resizeTimeoutId = window.setTimeout(() => {
        requestAnimationFrame(() => {
          if (!positionUpdateInProgressRef.current) {
            updateTargetPosition();
          }
        });
      }, 300); // Növelt debounce idő 200ms-ről 300ms-re
    };
    
    const handleScroll = () => {
      // Debounce a scroll eseményt, hogy ne ugráljon
      if (scrollTimeoutId !== null) {
        cancelAnimationFrame(scrollTimeoutId);
      }
      scrollTimeoutId = requestAnimationFrame(() => {
        if (targetElement && document.contains(targetElement)) {
          if (!positionUpdateInProgressRef.current) {
            updateTargetPosition();
          }
        }
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);
    
    // NEM használunk intervalt, hogy ne ugráljon a tutorial ablak

    return () => {
      clearTimeout(timeoutId);
      if (resizeTimeoutId !== null) {
        clearTimeout(resizeTimeoutId);
      }
      if (scrollTimeoutId !== null) {
        cancelAnimationFrame(scrollTimeoutId);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentStep, currentPage, targetElement]);

  // Hook-ok után már nem lehet early return, csak a render részben kezeljük
  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    if (isLast) {
      // Utolsó lépésnél befejezzük és mentjük
      // Bezárjuk a GlobalSearch-et, ha nyitva van
      onCloseGlobalSearch?.();
      
      // Demo adatok törlése, ha generáltuk őket
      if (demoDataGeneratedRef.current) {
        try {
          // Először mentjük el a tutorial completed státuszt, hogy ne jelenjen meg újra
          console.log("💾 Tutorial completed státusz mentése...");
          const updatedSettings = {
            ...settings,
            tutorialCompleted: true,
            showTutorialOnStartup: false,
          };
          await saveSettings(updatedSettings);
          
          console.log("🗑️ Tutorial befejezve - demo adatok törlése...");
          await clearTutorialDemoData();
          demoDataGeneratedRef.current = false;
          
          // Újraindítjuk az alkalmazást, hogy a memóriából is eltűnjenek az adatok
          console.log("🔄 Alkalmazás újraindítása a demo adatok törlése után...");
          setTimeout(() => {
            window.location.reload();
          }, 500); // Kis késleltetés, hogy a törlés biztosan megtörténjen
          return; // Ne hívjuk meg az onComplete-et, mert újraindítjuk az appot
        } catch (error) {
          console.error("❌ Hiba a demo adatok törlésekor:", error);
        }
      }
      
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
      // Kis késleltetés, hogy a pozíció frissüljön
      setTimeout(() => {
        updateTargetPosition();
      }, 200);
    }
  };

  const handlePrevious = () => {
    if (!isFirst) {
      const previousStep = steps[currentStep - 1];
      // Ha az előző lépés másik oldalon van, navigáljunk oda
      if (previousStep?.page && previousStep.page !== currentPage && onNavigate) {
        // Először navigáljunk, hogy az oldal betöltődjön
        onNavigate(previousStep.page);
        // Kis késleltetés, hogy az oldal betöltődjön, majd lépjünk vissza a lépésben
        setTimeout(() => {
          setCurrentStep(currentStep - 1);
          // További késleltetés, hogy a pozíció frissüljön
          setTimeout(() => {
            updateTargetPosition();
          }, 300);
        }, 400);
      } else {
        // Ha ugyanazon az oldalon vagyunk, csak lépjünk vissza
        setCurrentStep(currentStep - 1);
        // Kis késleltetés, hogy a pozíció frissüljön
        setTimeout(() => {
          updateTargetPosition();
        }, 200);
      }
    }
  };

  const handleSkip = async () => {
    // Kihagyáskor csak bezárjuk, de NEM állítjuk be a completed-et
    // Bezárjuk a GlobalSearch-et, ha nyitva van
    onCloseGlobalSearch?.();

    // Skip esetén is mentsük el, hogy indításkor NE induljon el automatikusan újra a tutorial
    try {
      const updatedSettings = {
        ...settings,
        showTutorialOnStartup: false,
      };
      await saveSettings(updatedSettings);
      console.log("⏭️ Tutorial kihagyva - showTutorialOnStartup false-ra állítva");
    } catch (error) {
      console.error("❌ Hiba a tutorial skip beállítás mentésekor:", error);
    }
    
    // Demo adatok törlése, ha generáltuk őket
    if (demoDataGeneratedRef.current) {
      try {
        // Skip esetén nem mentjük el a tutorialCompleted-et, csak a demo adatokat töröljük
        console.log("🗑️ Tutorial kihagyva - demo adatok törlése...");
        await clearTutorialDemoData();
        demoDataGeneratedRef.current = false;
        
        // Újraindítjuk az alkalmazást, hogy a memóriából is eltűnjenek az adatok
        console.log("🔄 Alkalmazás újraindítása a demo adatok törlése után...");
        setTimeout(() => {
          window.location.reload();
        }, 500); // Kis késleltetés, hogy a törlés biztosan megtörténjen
        return; // Ne hívjuk meg az onSkip-et, mert újraindítjuk az appot
      } catch (error) {
        console.error("❌ Hiba a demo adatok törlésekor:", error);
      }
    }
    
    if (onSkip) {
      onSkip();
    } else {
      // Ha nincs onSkip callback, akkor csak bezárjuk (fallback)
      onComplete();
    }
  };

  // Cél elem kiemelése (highlight) - frissítjük, amikor változik a targetElement vagy scroll
  useEffect(() => {
    const step = steps[currentStep];
    // Ha a global-search lépésnél vagyunk (center pozíció), ne jelenítsük meg a highlight-ot
    if (!targetElement || (step && step.target === "center")) {
      setHighlightStyle({ display: "none" });
      return;
    }

    let lastHighlightRect: DOMRect | null = null;
    let highlightUpdateTimeout: number | null = null;

    const updateHighlight = () => {
      // Ellenőrizzük, hogy az elem még létezik-e a DOM-ban
      if (!targetElement || !document.contains(targetElement)) {
        setHighlightStyle({ display: "none" });
        lastHighlightRect = null;
        return;
      }
      
      const rect = targetElement.getBoundingClientRect();
      
      // Csak akkor frissítjük, ha valóban változott a pozíció vagy méret (ugrálás elkerülése)
      if (lastHighlightRect && 
          Math.abs(lastHighlightRect.top - rect.top) < 1 &&
          Math.abs(lastHighlightRect.left - rect.left) < 1 &&
          Math.abs(lastHighlightRect.width - rect.width) < 1 &&
          Math.abs(lastHighlightRect.height - rect.height) < 1) {
        return; // Nem változott jelentősen, ne frissítsük
      }
      
      lastHighlightRect = rect;
      
      setHighlightStyle({
        position: "fixed",
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        borderRadius: "8px",
        border: `3px solid ${theme.colors.primary}`,
        boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px ${theme.colors.primary}`,
        pointerEvents: "none",
        zIndex: 99997, // Magasabb mint a GlobalSearch (9998), de alacsonyabb mint a tooltip (99999)
        transition: "all 0.3s ease",
      });
    };

    updateHighlight();

    // Frissítés scroll és resize esetén - debounce-olva
    const handleScroll = () => {
      if (highlightUpdateTimeout !== null) {
        cancelAnimationFrame(highlightUpdateTimeout);
      }
      highlightUpdateTimeout = requestAnimationFrame(updateHighlight);
    };
    
    const handleResize = () => {
      if (highlightUpdateTimeout !== null) {
        cancelAnimationFrame(highlightUpdateTimeout);
      }
      highlightUpdateTimeout = requestAnimationFrame(updateHighlight);
    };

    // Időszakos frissítés is (pl. amikor a GlobalSearch megnyílik és a DOM változik)
    // De csak ritkábban, hogy ne okozzon ugrálást
    const intervalId = setInterval(() => {
      if (targetElement && document.contains(targetElement)) {
        updateHighlight();
      }
    }, 300); // Növelt intervallum 100ms-ről 300ms-re

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(intervalId);
      if (highlightUpdateTimeout !== null) {
        cancelAnimationFrame(highlightUpdateTimeout);
      }
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [targetElement, theme.colors.primary, currentStep]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 99998, // Magas zIndex, de alacsonyabb mint a tooltip
              cursor: "pointer",
              opacity: 1, // Fix opacity, hogy ne halványodjon el
            }}
          />

          {/* Highlight */}
          {targetElement && (
            <div style={highlightStyle} />
          )}

          {/* Tooltip */}
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              ...themeStyles.card,
              position: step.target === "center" ? "fixed" : "fixed", // Mindig fixed, hogy scroll esetén is jó legyen
              top: step.target === "center" ? "50%" : `${tooltipPosition.top}px`,
              left: step.target === "center" ? "50%" : `${tooltipPosition.left}px`,
              transform: step.target === "center" ? "translate(-50%, -50%)" : "none",
              maxWidth: "400px",
              minWidth: "320px",
              maxHeight: "80vh",
              overflowY: "auto",
              zIndex: 99999, // Nagyon magas zIndex, hogy mindig előtérben legyen
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              boxShadow: `0 10px 40px ${theme.colors.shadow}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress bar */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                backgroundColor: theme.colors.border,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  backgroundColor: theme.colors.primary,
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            {/* Content */}
            <div style={{ padding: "24px", paddingTop: "28px" }}>
              <h3
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "20px",
                  fontWeight: "700",
                  color: theme.colors.text,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  margin: "0 0 24px 0",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: theme.colors.textSecondary,
                }}
              >
                {step.description}
              </p>

              {/* Step indicator */}
              <div
                style={{
                  marginBottom: "20px",
                  fontSize: "12px",
                  color: theme.colors.textMuted,
                  textAlign: "center",
                }}
              >
                {currentStep + 1} / {steps.length}
              </div>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "space-between",
                }}
              >
                <button
                  onClick={handleSkip}
                  style={{
                    ...themeStyles.button,
                    backgroundColor: "transparent",
                    color: theme.colors.textSecondary,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  {t("tutorial.skip") || "Kihagyás"}
                </button>
                <div style={{ display: "flex", gap: "8px" }}>
                  {!isFirst && (
                    <button
                      onClick={handlePrevious}
                      style={{
                        ...themeStyles.button,
                        backgroundColor: "transparent",
                        color: theme.colors.text,
                        border: `1px solid ${theme.colors.border}`,
                      }}
                    >
                      {t("tutorial.previous") || "Előző"}
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    style={{
                      ...themeStyles.button,
                      ...themeStyles.buttonPrimary,
                    }}
                  >
                    {isLast
                      ? t("tutorial.finish") || "Befejezés"
                      : t("tutorial.next") || "Következő"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

