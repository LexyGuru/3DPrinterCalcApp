import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Settings } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import type { getThemeStyles } from "../utils/themes";

interface Props {
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof getThemeStyles>;
  isOpen: boolean;
  onComplete: () => void;
  onSkip?: () => void; // Opcionális skip callback, ami nem állítja be a completed-et
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

interface TutorialStep {
  id: string;
  target?: string; // CSS selector vagy 'center' ha középre kell
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
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
}) => {
  const t = useTranslation(settings.language);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({ display: "none" });
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

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
      id: "printers",
      title: t("tutorial.printers.title") || "Nyomtatók kezelése",
      description:
        t("tutorial.printers.description") ||
        "A Nyomtatók oldalon kezelheted a nyomtatóidat. Itt adhatsz hozzá, szerkeszthetsz vagy törölhetsz nyomtatókat.",
      position: "center",
      page: "printers",
      action: () => onNavigate?.("printers"),
    },
    {
      id: "filaments",
      title: t("tutorial.filaments.title") || "Filamentek kezelése",
      description:
        t("tutorial.filaments.description") ||
        "A Filamentek oldalon kezelheted a filament kollekciódat. Itt adhatsz hozzá filamenteket árral és egyéb információkkal.",
      position: "center",
      page: "filaments",
      action: () => onNavigate?.("filaments"),
    },
    {
      id: "calculator",
      title: t("tutorial.calculator.title") || "Kalkulátor",
      description:
        t("tutorial.calculator.description") ||
        "A Kalkulátorban számíthatod ki a nyomtatási költségeket. Válassz egy nyomtatót és filamenteket, majd add meg a nyomtatási időt.",
      position: "center",
      page: "calculator",
      action: () => onNavigate?.("calculator"),
    },
    {
      id: "offers",
      title: t("tutorial.offers.title") || "Árajánlatok",
      description:
        t("tutorial.offers.description") ||
        "Az Árajánlatok oldalon láthatod az összes mentett árajánlatodat. Itt kezelheted, szerkesztheted vagy exportálhatod őket PDF formátumban.",
      position: "center",
      page: "offers",
      action: () => onNavigate?.("offers"),
    },
    {
      id: "settings",
      title: t("tutorial.settings.title") || "Beállítások",
      description:
        t("tutorial.settings.description") ||
        "A Beállításokban módosíthatod a nyelvet, témát, és egyéb alkalmazás beállításokat. Itt is elindíthatod újra a tutorialt.",
      position: "center",
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
    
    // Ha van action és másik oldalon van, navigáljunk
    if (step.action && step.page && currentPage !== step.page && onNavigate) {
      // Kis késleltetés, hogy az overlay megjelenjen
      setTimeout(() => {
        step.action?.();
        // További késleltetés, hogy az oldal betöltődjön
        setTimeout(() => {
          updateTargetPosition();
        }, 800);
      }, 100);
    } else if (step.page && step.page !== currentPage && onNavigate) {
      // Ha nincs action, de másik oldalon van, navigáljunk manuálisan
      setTimeout(() => {
        if (step.page) {
          onNavigate(step.page);
          setTimeout(() => {
            updateTargetPosition();
          }, 600);
        }
      }, 100);
    } else {
      // Ha ugyanazon az oldalon vagyunk, csak frissítsük a pozíciót
      setTimeout(() => {
        updateTargetPosition();
      }, 200);
    }
  }, [currentStep, isOpen, currentPage]);

  // Cél elem pozíciójának frissítése
  const updateTargetPosition = () => {
    const step = steps[currentStep];
    if (!step) return;

    if (step.target === "center") {
      // Középre helyezés
      setTargetElement(null);
      setTooltipPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
      });
      return;
    }

    if (step.target) {
      // Element keresése
      let element: HTMLElement | null = null;
      
      // Próbáljuk meg a selectorral
      try {
        element = document.querySelector<HTMLElement>(step.target);
      } catch (e) {
        console.warn("Invalid selector:", step.target);
      }

      // Ha nem található, próbáljuk meg a page alapján
      if (!element && step.page) {
        const pageElement = document.querySelector(`[data-page="${step.page}"]`);
        if (pageElement) {
          element = pageElement as HTMLElement;
        }
      }

      if (element) {
        setTargetElement(element);
        // Kettős requestAnimationFrame, hogy biztosan renderelődjön a tooltip
        // Plusz egy kis késleltetés, hogy az oldal betöltődjön
        setTimeout(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
            const rect = element.getBoundingClientRect();
            // Valós tooltip méretek, ha elérhető, különben becsült
            const tooltipRect = tooltipRef.current?.getBoundingClientRect();
            const estimatedTooltipWidth = tooltipRect?.width || 400;
            const estimatedTooltipHeight = tooltipRect?.height || 280;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const padding = 20;
            const gap = 20;
            
            let top = 0;
            let left = 0;
            let preferredPosition = step.position || "bottom";

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
                    top: rect.bottom + gap,
                    left: rect.left + rect.width / 2 - estimatedTooltipWidth / 2,
                  };
                case "top":
                  return {
                    top: rect.top - estimatedTooltipHeight - gap,
                    left: rect.left + rect.width / 2 - estimatedTooltipWidth / 2,
                  };
                case "right":
                  return {
                    top: rect.top + rect.height / 2 - estimatedTooltipHeight / 2,
                    left: rect.right + gap,
                  };
                case "left":
                  return {
                    top: rect.top + rect.height / 2 - estimatedTooltipHeight / 2,
                    left: rect.left - estimatedTooltipWidth - gap,
                  };
                default:
                  return {
                    top: rect.bottom + gap,
                    left: rect.left + rect.width / 2 - estimatedTooltipWidth / 2,
                  };
              }
            };

            const positions = ["bottom", "top", "right", "left", "center"] as const;
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
            // Ha kilóg jobbról, balra toljuk
            if (left + estimatedTooltipWidth > viewportWidth - padding) {
              left = viewportWidth - estimatedTooltipWidth - padding;
            }
            // Ha kilóg balról, jobbra toljuk
            if (left < padding) {
              left = padding;
            }
            // Ha kilóg alulról, feljebb toljuk
            if (top + estimatedTooltipHeight > viewportHeight - padding) {
              top = viewportHeight - estimatedTooltipHeight - padding;
            }
            // Ha kilóg felülről, lejjebb toljuk
            if (top < padding) {
              top = padding;
            }

            // Ha még mindig nem fér el (nagyon kicsi viewport), középre helyezzük
            if (top + estimatedTooltipHeight > viewportHeight - padding || 
                left + estimatedTooltipWidth > viewportWidth - padding ||
                top < padding || left < padding) {
              top = Math.max(padding, Math.min((viewportHeight - estimatedTooltipHeight) / 2, viewportHeight - estimatedTooltipHeight - padding));
              left = Math.max(padding, Math.min((viewportWidth - estimatedTooltipWidth) / 2, viewportWidth - estimatedTooltipWidth - padding));
            }

            setTooltipPosition({ top, left });
            });
          });
        }, 100);
      } else {
        // Ha nem található elem, középre helyezzük
        setTargetElement(null);
        setTooltipPosition({
          top: window.innerHeight / 2,
          left: window.innerWidth / 2,
        });
      }
    }
  };

  // Pozíció frissítése scroll vagy resize esetén
  useEffect(() => {
    if (!isOpen) return;
    
    // Kis késleltetés, hogy a tooltip renderelődjön
    const timeoutId = setTimeout(() => {
      updateTargetPosition();
    }, 200);

    const handleResize = () => {
      requestAnimationFrame(() => {
        updateTargetPosition();
      });
    };
    const handleScroll = () => {
      requestAnimationFrame(() => {
        updateTargetPosition();
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);
    
    // Frissítés időszakonként is (ha az elem mozog)
    const intervalId = setInterval(() => {
      if (targetElement) {
        updateTargetPosition();
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
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

  const handleNext = () => {
    if (isLast) {
      // Utolsó lépésnél befejezzük és mentjük
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

  const handleSkip = () => {
    // Kihagyáskor csak bezárjuk, de NEM állítjuk be a completed-et
    if (onSkip) {
      onSkip();
    } else {
      // Ha nincs onSkip callback, akkor csak bezárjuk (fallback)
      onComplete();
    }
  };

  // Cél elem kiemelése (highlight) - frissítjük, amikor változik a targetElement vagy scroll
  useEffect(() => {
    if (!targetElement) {
      setHighlightStyle({ display: "none" });
      return;
    }

    const updateHighlight = () => {
      const rect = targetElement.getBoundingClientRect();
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
        zIndex: 10000,
        transition: "all 0.3s ease",
      });
    };

    updateHighlight();

    // Frissítés scroll és resize esetén
    const handleScroll = () => {
      requestAnimationFrame(updateHighlight);
    };
    const handleResize = () => {
      requestAnimationFrame(updateHighlight);
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [targetElement, theme.colors.primary]);

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
              zIndex: 9999,
              cursor: "pointer",
            }}
            onClick={(e) => {
              // Csak akkor zárjuk be, ha az overlay-re kattintunk (nem a tooltip-re)
              if (e.target === overlayRef.current) {
                handleSkip();
              }
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
              zIndex: 10001,
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

