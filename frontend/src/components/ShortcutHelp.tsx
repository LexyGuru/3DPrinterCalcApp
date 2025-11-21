import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { Settings } from "../types";
import { useTranslation } from "../utils/translations";
import { keyboardShortcuts, type KeyboardShortcut } from "../utils/keyboardShortcuts";
import { saveSettings } from "../utils/store";

interface Props {
  settings: Settings;
  theme: any;
  themeStyles: any;
  onClose: () => void;
  onSettingsChange?: (newSettings: Settings) => void;
}

// Egyedi kulcs generálása (normalizálva - ctrl és meta ugyanaz)
const getUniqueKey = (shortcut: KeyboardShortcut): string => {
  const key = shortcut.key.toLowerCase();
  const hasModifier = shortcut.ctrl || shortcut.meta; // ctrl és meta ugyanaz
  const shift = shortcut.shift || false;
  const alt = shortcut.alt || false;
  return `${key}-${hasModifier}-${shift}-${alt}`;
};

// Shortcut ID generálása a Settings-hez (konzisztens formátum)
const getShortcutId = (shortcut: KeyboardShortcut): string => {
  const key = shortcut.key.toLowerCase();
  const ctrl = shortcut.ctrl || false;
  const shift = shortcut.shift || false;
  const alt = shortcut.alt || false;
  const meta = shortcut.meta || false;
  return `${key}-${ctrl}-${shift}-${alt}-${meta}`;
};

export const ShortcutHelp: React.FC<Props> = ({ settings, theme, themeStyles, onClose, onSettingsChange }) => {
  const t = useTranslation(settings.language);
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [capturedShortcut, setCapturedShortcut] = useState<{ key: string; ctrl: boolean; shift: boolean; alt: boolean; meta: boolean } | null>(null);
  
  // Stabil referenciát használunk a customShortcuts-hoz, hogy elkerüljük a végtelen ciklust
  // JSON.stringify-elt verziót használunk, hogy csak akkor frissüljön, ha a tartalom változott
  const customShortcutsString = JSON.stringify(settings.customShortcuts || {});
  const prevCustomShortcutsRef = useRef<string | null>(null);
  const prevLanguageRef = useRef<string | null>(null);

  useEffect(() => {
    // Az első betöltéskor vagy ha változott a customShortcuts vagy a nyelv, akkor frissítünk
    const customShortcutsChanged = prevCustomShortcutsRef.current !== customShortcutsString;
    const languageChanged = prevLanguageRef.current !== settings.language;
    
    // Az első betöltéskor mindig futtatjuk
    const isFirstLoad = prevCustomShortcutsRef.current === null;
    
    if (!isFirstLoad && !customShortcutsChanged && !languageChanged) {
      return;
    }
    
    const customShortcuts = settings.customShortcuts || {};
    const registeredShortcuts = keyboardShortcuts.getShortcuts();
    
    // Duplikációk eltávolítása - egyedi kulcs alapján
    const uniqueShortcuts = new Map<string, KeyboardShortcut>();
    registeredShortcuts.forEach(shortcut => {
      const key = getUniqueKey(shortcut);
      if (!uniqueShortcuts.has(key)) {
        uniqueShortcuts.set(key, shortcut);
      }
    });
    
    // Statikus lista minden lehetséges shortcutról (akkor is megjelenik, ha nincs regisztrálva)
    const isMac = navigator.platform.includes("Mac");
    const allPossibleShortcuts: KeyboardShortcut[] = isMac ? [
      {
        key: "?",
        meta: true,
        callback: () => {},
        description: t("shortcuts.description.help"),
      },
      {
        key: "k",
        meta: true,
        callback: () => {},
        description: t("shortcuts.description.globalSearch"),
      },
      {
        key: "z",
        meta: true,
        callback: () => {},
        description: t("shortcuts.description.undo"),
      },
      {
        key: "z",
        meta: true,
        shift: true,
        callback: () => {},
        description: t("shortcuts.description.redo"),
      },
      {
        key: "n",
        meta: true,
        callback: () => {},
        description: t("shortcuts.description.new"),
      },
      {
        key: "s",
        meta: true,
        callback: () => {},
        description: t("shortcuts.description.save"),
      },
      {
        key: "Escape",
        callback: () => {},
        description: t("shortcuts.description.cancel"),
      },
    ] : [
      {
        key: "?",
        ctrl: true,
        callback: () => {},
        description: t("shortcuts.description.help"),
      },
      {
        key: "k",
        ctrl: true,
        callback: () => {},
        description: t("shortcuts.description.globalSearch"),
      },
      {
        key: "z",
        ctrl: true,
        callback: () => {},
        description: t("shortcuts.description.undo"),
      },
      {
        key: "z",
        ctrl: true,
        shift: true,
        callback: () => {},
        description: t("shortcuts.description.redo"),
      },
      {
        key: "n",
        ctrl: true,
        callback: () => {},
        description: t("shortcuts.description.new"),
      },
      {
        key: "s",
        ctrl: true,
        callback: () => {},
        description: t("shortcuts.description.save"),
      },
      {
        key: "Escape",
        callback: () => {},
        description: t("shortcuts.description.cancel"),
      },
    ];
    
    // Összefésülés: először a statikus lista, majd a regisztráltak (ha nincs duplikáció)
    const finalShortcuts: KeyboardShortcut[] = [];
    const addedKeys = new Set<string>();
    
    allPossibleShortcuts.forEach(shortcut => {
      const key = getUniqueKey(shortcut);
      if (!addedKeys.has(key)) {
        // Először ellenőrizzük, van-e custom shortcut a Settings-ben
        const shortcutId = getShortcutId(shortcut);
        const customShortcut = customShortcuts[shortcutId];
        
        // Ha van custom shortcut, azt használjuk
        if (customShortcut) {
          finalShortcuts.push({
            ...shortcut,
            key: customShortcut.key,
            ctrl: customShortcut.ctrl,
            shift: customShortcut.shift,
            alt: customShortcut.alt,
            meta: customShortcut.meta,
            description: customShortcut.description || shortcut.description,
          });
        } else {
          // Ha van regisztrált verzió, azt használjuk, különben a statikusat
          const registered = Array.from(uniqueShortcuts.values()).find(s => 
            getUniqueKey(s) === key
          );
          finalShortcuts.push(registered || shortcut);
        }
        addedKeys.add(key);
      }
    });
    
    // Hozzáadjuk a többi regisztrált shortcutot is (amelyek nincsenek a statikus listában)
    uniqueShortcuts.forEach(shortcut => {
      const key = getUniqueKey(shortcut);
      if (!addedKeys.has(key)) {
        finalShortcuts.push(shortcut);
        addedKeys.add(key);
      }
    });
    
    setShortcuts(finalShortcuts);
    
    // Frissítjük a ref-eket csak a végén, hogy biztosan lefusson a logika
    prevCustomShortcutsRef.current = customShortcutsString;
    prevLanguageRef.current = settings.language;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.language, customShortcutsString]);

  // Leírások mapping-je
  const getShortcutDescription = (shortcut: KeyboardShortcut): string => {
    const key = shortcut.key.toLowerCase();
    const hasCtrl = shortcut.ctrl || shortcut.meta;
    const hasShift = shortcut.shift;
    
    // Ha van description, azt használjuk
    if (shortcut.description) {
      return shortcut.description;
    }

    // Alapértelmezett leírások
    if (key === "?" && hasCtrl) {
      return t("shortcuts.description.help");
    }
    if (key === "k" && hasCtrl) {
      return t("shortcuts.description.globalSearch");
    }
    if (key === "z" && hasCtrl && !hasShift) {
      return t("shortcuts.description.undo");
    }
    if (key === "z" && hasCtrl && hasShift) {
      return t("shortcuts.description.redo");
    }
    if (key === "n" && hasCtrl) {
      return t("shortcuts.description.new");
    }
    if (key === "s" && hasCtrl) {
      return t("shortcuts.description.save");
    }
    if (key === "escape") {
      return t("shortcuts.description.cancel");
    }
    
    // Alapértelmezett
    return t("shortcuts.description.unknown");
  };

  // Billentyű rögzítése szerkesztési módban
  useEffect(() => {
    if (editingIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape bezárja a szerkesztést
      if (e.key === "Escape") {
        setEditingIndex(null);
        setCapturedShortcut(null);
        return;
      }

      // Ne rögzítsük a modifier billentyűket önmagukban
      if (e.key === "Control" || e.key === "Meta" || e.key === "Shift" || e.key === "Alt") {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      // Rögzítjük a billentyű kombinációt
      const captured = {
        key: e.key,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        meta: e.metaKey,
      };
      
      if (import.meta.env.DEV) {
        console.log("⌨️ Billentyű rögzítve:", captured);
      }
      
      setCapturedShortcut(captured);
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [editingIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Csak akkor kezeljük, ha nincs szerkesztési mód
      if (editingIndex !== null) return;

      // Ctrl/Cmd + ? vagy Escape bezárja a help menüt
      if ((e.ctrlKey || e.metaKey) && e.key === "?") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, editingIndex]);

  const formatShortcut = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    const isMac = navigator.platform.includes("Mac");
    
    // macOS-en meta = Cmd, Windows/Linux-en ctrl = Ctrl
    // Ne jelenítsük meg mindkettőt, csak az egyiket
    if (isMac) {
      if (shortcut.meta) {
        parts.push("Cmd");
      } else if (shortcut.ctrl) {
        parts.push("Ctrl");
      }
    } else {
      if (shortcut.ctrl) {
        parts.push("Ctrl");
      } else if (shortcut.meta) {
        parts.push("Cmd");
      }
    }
    
    if (shortcut.shift) parts.push("Shift");
    if (shortcut.alt) parts.push("Alt");
    
    const key = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
    parts.push(key);
    
    return parts.join(" + ");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{
          backgroundColor: theme.colors.background,
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "600px",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          color: theme.colors.text,
          width: "min(600px, 92vw)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "600", color: theme.colors.text }}>
            ⌨️ {t("shortcuts.title")}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: theme.colors.textMuted,
              padding: "4px 8px",
              borderRadius: "4px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.border;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            ✕
          </button>
        </div>

        {shortcuts.length === 0 ? (
          <p style={{ color: theme.colors.textMuted, textAlign: "center", padding: "20px" }}>
            {t("shortcuts.noShortcuts")}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  padding: "12px",
                  backgroundColor: theme.colors.cardBackground,
                  borderRadius: "8px",
                  transition: "background-color 0.2s",
                  border: editingIndex === index ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                    <span style={{ color: theme.colors.text, fontSize: "14px", fontWeight: "600" }}>
                      {getShortcutDescription(shortcut)}
                    </span>
                    {shortcut.description && (
                      <span style={{ color: theme.colors.textMuted, fontSize: "12px" }}>
                        {formatShortcut(shortcut)}
                      </span>
                    )}
                  </div>
                  {editingIndex === index ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                      <div style={{ 
                        padding: "8px 12px", 
                        backgroundColor: theme.colors.surfaceHover, 
                        borderRadius: "6px",
                        border: `2px dashed ${theme.colors.primary}`,
                        minWidth: "150px",
                        textAlign: "center",
                      }}>
                        {capturedShortcut ? (
                          <kbd style={{
                            backgroundColor: theme.colors.border,
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontFamily: "monospace",
                            color: theme.colors.text,
                            fontWeight: "600",
                          }}>
                            {formatShortcut({
                              key: capturedShortcut.key,
                              ctrl: capturedShortcut.ctrl,
                              shift: capturedShortcut.shift,
                              alt: capturedShortcut.alt,
                              meta: capturedShortcut.meta,
                              callback: () => {},
                            })}
                          </kbd>
                        ) : (
                          <span style={{ 
                            color: theme.colors.textMuted, 
                            fontSize: "12px",
                            fontStyle: "italic",
                          }}>
                            {t("shortcuts.edit.pressKeys")}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            if (!capturedShortcut) {
                              if (import.meta.env.DEV) {
                                console.warn("⚠️ Nincs rögzített shortcut");
                              }
                              return;
                            }
                            
                            try {
                                // Frissítjük a shortcutot
                                const updatedShortcuts = [...shortcuts];
                                const oldShortcut = updatedShortcuts[index];
                                
                                if (!oldShortcut) {
                                  console.error("❌ Old shortcut nem található index:", index);
                                  alert("Hiba: A shortcut nem található. Kérlek, próbáld újra.");
                                  return;
                                }
                                
                                // Megkeressük az eredeti shortcutot
                                // Az index alapján keressük meg, mert a finalShortcuts ugyanabban a sorrendben van
                                const isMac = navigator.platform.includes("Mac");
                                const allPossibleShortcuts: KeyboardShortcut[] = isMac ? [
                                  { key: "?", meta: true, callback: () => {}, description: t("shortcuts.description.help") },
                                  { key: "k", meta: true, callback: () => {}, description: t("shortcuts.description.globalSearch") },
                                  { key: "z", meta: true, callback: () => {}, description: t("shortcuts.description.undo") },
                                  { key: "z", meta: true, shift: true, callback: () => {}, description: t("shortcuts.description.redo") },
                                  { key: "n", meta: true, callback: () => {}, description: t("shortcuts.description.new") },
                                  { key: "s", meta: true, callback: () => {}, description: t("shortcuts.description.save") },
                                  { key: "Escape", callback: () => {}, description: t("shortcuts.description.cancel") },
                                ] : [
                                  { key: "?", ctrl: true, callback: () => {}, description: t("shortcuts.description.help") },
                                  { key: "k", ctrl: true, callback: () => {}, description: t("shortcuts.description.globalSearch") },
                                  { key: "z", ctrl: true, callback: () => {}, description: t("shortcuts.description.undo") },
                                  { key: "z", ctrl: true, shift: true, callback: () => {}, description: t("shortcuts.description.redo") },
                                  { key: "n", ctrl: true, callback: () => {}, description: t("shortcuts.description.new") },
                                  { key: "s", ctrl: true, callback: () => {}, description: t("shortcuts.description.save") },
                                  { key: "Escape", callback: () => {}, description: t("shortcuts.description.cancel") },
                                ];
                                
                                // Az eredeti shortcutot az index alapján keressük meg
                                // Mivel a finalShortcuts ugyanabban a sorrendben van, mint az allPossibleShortcuts
                                let originalShortcut: KeyboardShortcut | undefined;
                                
                                if (index < allPossibleShortcuts.length) {
                                  // Ha az index az allPossibleShortcuts határain belül van, akkor onnan vesszük
                                  originalShortcut = allPossibleShortcuts[index];
                                } else {
                                  // Ha az index túl nagy, akkor a leírás alapján keressük (regisztrált shortcutok esetén)
                                  originalShortcut = allPossibleShortcuts.find(s => 
                                    s.description === oldShortcut.description
                                  );
                                }
                                
                                // Ha még mindig nem található, próbáljuk meg a getUniqueKey alapján
                                if (!originalShortcut) {
                                  const oldKey = getUniqueKey(oldShortcut);
                                  originalShortcut = allPossibleShortcuts.find(s => 
                                    getUniqueKey(s) === oldKey
                                  );
                                }
                                
                                if (!originalShortcut) {
                                  console.error("❌ Original shortcut nem található:", {
                                    index,
                                    oldShortcut,
                                    description: oldShortcut.description,
                                    allPossibleShortcuts: allPossibleShortcuts.map(s => ({ key: s.key, description: s.description })),
                                  });
                                  // Használjuk az oldShortcut-ot, de az eredeti értékekkel
                                  // Visszaállítjuk az eredeti értékeket a customShortcuts-ból
                                  const oldShortcutId = getShortcutId({
                                    key: oldShortcut.key,
                                    ctrl: oldShortcut.ctrl || false,
                                    shift: oldShortcut.shift || false,
                                    alt: oldShortcut.alt || false,
                                    meta: oldShortcut.meta || false,
                                    callback: () => {},
                                  });
                                  
                                  // Próbáljuk meg megtalálni a customShortcuts-ban
                                  const existingCustom = settings.customShortcuts?.[oldShortcutId];
                                  if (existingCustom) {
                                    // Ha van custom shortcut, akkor az alapértelmezett shortcutot keressük meg
                                    // a leírás alapján
                                    originalShortcut = allPossibleShortcuts.find(s => 
                                      s.description === existingCustom.description || 
                                      s.description === oldShortcut.description
                                    );
                                  }
                                }
                                
                                if (!originalShortcut) {
                                  console.error("❌ Original shortcut véglegesen nem található:", {
                                    index,
                                    oldShortcut,
                                    shortcutsLength: shortcuts.length,
                                    allPossibleShortcutsLength: allPossibleShortcuts.length,
                                  });
                                  // Ha nem található, használjuk az oldShortcut-ot, de próbáljuk meg megtalálni az ID-t
                                  // Ez egy fallback megoldás
                                  const fallbackShortcutId = getShortcutId({
                                    key: oldShortcut.key,
                                    ctrl: oldShortcut.ctrl || false,
                                    shift: oldShortcut.shift || false,
                                    alt: oldShortcut.alt || false,
                                    meta: oldShortcut.meta || false,
                                    callback: () => {},
                                  });
                                  
                                  // Próbáljuk meg megtalálni a customShortcuts-ban
                                  const existingCustom = settings.customShortcuts?.[fallbackShortcutId];
                                  if (existingCustom && existingCustom.description) {
                                    // Ha van description, próbáljuk meg megtalálni az allPossibleShortcuts-ban
                                    originalShortcut = allPossibleShortcuts.find(s => 
                                      s.description === existingCustom.description
                                    );
                                  }
                                  
                                  if (!originalShortcut) {
                                    console.error("❌ Original shortcut nem található, fallback használata");
                                    // Fallback: használjuk az első lehetséges shortcutot, ami hasonló
                                    originalShortcut = allPossibleShortcuts[0] || oldShortcut;
                                  }
                                }
                                
                                const shortcutId = getShortcutId(originalShortcut);
                                
                                if (import.meta.env.DEV) {
                                  console.log("💾 Shortcut mentése:", {
                                    shortcutId,
                                    originalShortcut,
                                    capturedShortcut,
                                    oldShortcut,
                                  });
                                }
                                
                                const newShortcut = {
                                  ...oldShortcut,
                                  key: capturedShortcut.key,
                                  ctrl: capturedShortcut.ctrl,
                                  shift: capturedShortcut.shift,
                                  alt: capturedShortcut.alt,
                                  meta: capturedShortcut.meta,
                                };
                                updatedShortcuts[index] = newShortcut;
                                setShortcuts(updatedShortcuts);
                                
                                // Mentjük a Settings-be
                                const customShortcuts = { ...(settings.customShortcuts || {}) };
                                customShortcuts[shortcutId] = {
                                  key: capturedShortcut.key,
                                  ctrl: capturedShortcut.ctrl,
                                  shift: capturedShortcut.shift,
                                  alt: capturedShortcut.alt,
                                  meta: capturedShortcut.meta,
                                  description: oldShortcut.description,
                                };
                                
                                const newSettings: Settings = {
                                  ...settings,
                                  customShortcuts,
                                };
                                
                                if (import.meta.env.DEV) {
                                  console.log("💾 Settings mentése:", {
                                    customShortcuts,
                                    shortcutId,
                                    newSettings,
                                  });
                                }
                                
                                await saveSettings(newSettings);
                                
                                if (import.meta.env.DEV) {
                                  console.log("✅ Settings sikeresen mentve a store-ba");
                                }
                                
                                // Frissítjük a lokális state-et is, hogy azonnal látszódjon
                                setShortcuts(updatedShortcuts);
                                
                                if (onSettingsChange) {
                                  if (import.meta.env.DEV) {
                                    console.log("🔄 onSettingsChange hívása új settings-szel");
                                  }
                                  onSettingsChange(newSettings);
                                } else {
                                  if (import.meta.env.DEV) {
                                    console.warn("⚠️ onSettingsChange nincs definiálva!");
                                  }
                                }
                            } catch (error) {
                              console.error("❌ Hiba a shortcut mentésekor:", error);
                              // Ne használjunk alert-et, mert Tauri engedélyt igényel
                              // Ehelyett logoljuk a hibát, és a felhasználó láthatja a konzolban
                              if (import.meta.env.DEV) {
                                console.error("Hiba részletei:", error);
                              }
                            }
                            
                            setEditingIndex(null);
                            setCapturedShortcut(null);
                          }}
                          disabled={!capturedShortcut}
                          style={{
                            ...themeStyles.buttonPrimary,
                            padding: "4px 12px",
                            fontSize: "12px",
                            opacity: capturedShortcut ? 1 : 0.5,
                            cursor: capturedShortcut ? "pointer" : "not-allowed",
                            pointerEvents: capturedShortcut ? "auto" : "none",
                          }}
                          title={capturedShortcut ? t("common.save") : t("shortcuts.edit.pressKeys")}
                        >
                          {t("common.save")}
                        </button>
                        <button
                          onClick={() => {
                            setEditingIndex(null);
                            setCapturedShortcut(null);
                          }}
                          style={{
                            ...themeStyles.buttonSecondary,
                            padding: "4px 12px",
                            fontSize: "12px",
                          }}
                        >
                          {t("common.cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <kbd
                        style={{
                          backgroundColor: theme.colors.border,
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontFamily: "monospace",
                          color: theme.colors.text,
                          fontWeight: "600",
                        }}
                      >
                        {formatShortcut(shortcut)}
                      </kbd>
                      <button
                        onClick={() => {
                          setEditingIndex(index);
                          setCapturedShortcut(null);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: theme.colors.primary,
                          cursor: "pointer",
                          padding: "4px 8px",
                          fontSize: "12px",
                          borderRadius: "4px",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                        title={t("shortcuts.edit.title")}
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: `1px solid ${theme.colors.border}`, fontSize: "12px", color: theme.colors.textMuted, textAlign: "center" }}>
          {t("shortcuts.closeHint")}
        </div>
      </motion.div>
    </motion.div>
  );
};

