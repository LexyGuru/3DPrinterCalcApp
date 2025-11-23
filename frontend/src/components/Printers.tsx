import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Printer, Settings, AMS } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { convertCurrency } from "../utils/currency";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";
import { useKeyboardShortcut } from "../utils/keyboardShortcuts";
import { Tooltip } from "./Tooltip";
import { EmptyState } from "./EmptyState";
import { validatePrinterPower, validateUsageCost, validateAMSCount } from "../utils/validation";
import { useUndoRedo } from "../hooks/useUndoRedo";

interface Props {
  printers: Printer[];
  setPrinters: (p: Printer[]) => void;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
  triggerAddForm?: boolean; // Gyors művelet gomb esetén automatikusan megnyitja a formot
  onSettingsChange?: (newSettings: Settings) => void; // Beállítások változtatása callback
}

export const Printers: React.FC<Props> = ({ printers, setPrinters, settings, theme, themeStyles, triggerAddForm, onSettingsChange }) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();
  
  // Undo/Redo hook
  const {
    state: printersWithHistory,
    setState: setPrintersWithHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
  } = useUndoRedo<Printer[]>(printers, 50);

  // Sync printers with history when external changes occur
  // Csak akkor frissítjük, ha valóban változás történt (nem csak referencia változás)
  const prevPrintersRef = useRef<string>(JSON.stringify(printers));
  useEffect(() => {
    const currentPrinters = JSON.stringify(printers);
    const currentHistory = JSON.stringify(printersWithHistory);
    
    // Ha a printers változott külsőleg (nem a history miatt), akkor reset history
    if (prevPrintersRef.current !== currentPrinters && currentPrinters !== currentHistory) {
      resetHistory(printers);
      prevPrintersRef.current = currentPrinters;
    }
  }, [printers, printersWithHistory, resetHistory]);

  // Update parent when history changes
  // Csak akkor frissítjük, ha valóban változás történt (nem csak referencia változás)
  const prevHistoryRef = useRef<string>(JSON.stringify(printersWithHistory));
  const isUpdatingRef = useRef(false);
  
  useEffect(() => {
    const currentHistory = JSON.stringify(printersWithHistory);
    const currentPrinters = JSON.stringify(printers);
    
    // Ha a history változott ÉS nem vagyunk éppen update közben ÉS különbözik a printers-től
    if (prevHistoryRef.current !== currentHistory && !isUpdatingRef.current && currentHistory !== currentPrinters) {
      isUpdatingRef.current = true;
      prevHistoryRef.current = currentHistory;
      
      // setTimeout használata, hogy ne blokkolja a renderelést
      setTimeout(() => {
        setPrinters(printersWithHistory);
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [printersWithHistory, printers, setPrinters]);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [power, setPower] = useState<number>(0);
  const [usageCost, setUsageCost] = useState<number>(0);
  const [amsCount, setAmsCount] = useState<number>(0);
  const [editingPrinterId, setEditingPrinterId] = useState<number | null>(null);
  const [editingPrinter, setEditingPrinter] = useState<{ name: string; type: string; power: number; usageCost: number; amsCount: number } | null>(null);
  const [amsForms, setAmsForms] = useState<Record<number, { brand: string; name: string; power: number }[]>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [draggedPrinterId, setDraggedPrinterId] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ printerId: number; x: number; y: number } | null>(null);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [sortColumn, setSortColumn] = useState<keyof Printer | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedPrinterIds, setSelectedPrinterIds] = useState<Set<number>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // Oszlop láthatóság beállítások
  const defaultColumnVisibility = {
    name: true,
    type: true,
    power: true,
    usageCost: true,
    ams: true,
    action: true,
  };
  const columnVisibility = settings.printerColumnsVisibility || defaultColumnVisibility;

  // Oszlop láthatóság váltása
  const toggleColumnVisibility = (column: keyof typeof columnVisibility) => {
    const newVisibility = {
      ...columnVisibility,
      [column]: !columnVisibility[column],
    };
    const newSettings = {
      ...settings,
      printerColumnsVisibility: newVisibility,
    };
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  const addPrinter = () => {
    if (!name || !type || !power) {
      showToast(`${t("common.error")}: ${t("printers.error.missingFields")}`, "error");
      return;
    }

    const powerValidation = validatePrinterPower(power, settings.language);
    if (!powerValidation.isValid) {
      showToast(`${t("common.error")}: ${powerValidation.errorMessage ?? t("printers.error.invalidPower")}`, "error");
      return;
    }

    const usageValidation = validateUsageCost(usageCost, settings.language);
    if (!usageValidation.isValid) {
      showToast(`${t("common.error")}: ${usageValidation.errorMessage ?? t("printers.error.invalidUsageCost")}`, "error");
      return;
    }
    
    const newId = Date.now();
    console.log("➕ Új nyomtató hozzáadása...", { name, type, power, usageCost, amsCount });
    const newPrinter: Printer = { 
      id: newId, 
      name, 
      type, 
      power, 
      usageCost,
      amsCount: amsCount || undefined,
      ams: amsCount > 0 ? [] : undefined
    };
    setPrintersWithHistory([...printers, newPrinter]);
    if (amsCount > 0) {
      setAmsForms({ ...amsForms, [newId]: Array(amsCount).fill(null).map(() => ({ brand: "", name: "", power: 0 })) });
      setEditingPrinterId(newId);
    }
    console.log("✅ Nyomtató sikeresen hozzáadva", { printerId: newId, name });
    showToast(t("common.printerAdded"), "success");
    setName(""); setType(""); setPower(0); setUsageCost(0); setAmsCount(0);
    setShowAddForm(false);
  };

  // Gyors művelet gomb esetén automatikusan megnyitja a formot
  useEffect(() => {
    if (triggerAddForm && !showAddForm && editingPrinterId === null) {
      setShowAddForm(true);
    }
  }, [triggerAddForm, showAddForm, editingPrinterId]);

  // Escape billentyű kezelése a modal bezárásához
  useEffect(() => {
    if (!showAddForm) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddForm(false);
        setName(""); setType(""); setPower(0); setUsageCost(0); setAmsCount(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddForm]);

  // Oszlop menü bezárása kattintásra kívülre
  useEffect(() => {
    if (!showColumnMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-column-menu]')) {
        setShowColumnMenu(false);
      }
    };

    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [showColumnMenu]);

  const deletePrinter = (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId === null) return;
    const id = deleteConfirmId;
    const printerToDelete = printersWithHistory.find(p => p.id === id);
    console.log("🗑️ Nyomtató törlése...", { printerId: id, name: printerToDelete?.name, type: printerToDelete?.type });
    setPrintersWithHistory(printersWithHistory.filter(p => p.id !== id));
    const newAmsForms = { ...amsForms };
    delete newAmsForms[id];
    setAmsForms(newAmsForms);
    if (editingPrinterId === id) setEditingPrinterId(null);
    console.log("✅ Nyomtató sikeresen törölve", { printerId: id });
    showToast(t("common.printerDeleted"), "success");
    setDeleteConfirmId(null);
  };

  const startEdit = (printer: Printer) => {
    console.log("✏️ Nyomtató szerkesztése indítása...", { printerId: printer.id, name: printer.name });
    setEditingPrinter({
      name: printer.name,
      type: printer.type,
      power: printer.power,
      usageCost: printer.usageCost,
      amsCount: printer.amsCount || 0
    });
    const currentAMS = printer.ams || [];
    const currentAMSCount = printer.amsCount || 0;
    setAmsForms({ 
      ...amsForms, 
      [printer.id]: currentAMS.length > 0 
        ? currentAMS.map(a => ({ brand: a.brand, name: a.name, power: a.power }))
        : Array(currentAMSCount).fill(null).map(() => ({ brand: "", name: "", power: 0 }))
    });
    setEditingPrinterId(printer.id);
  };

  const cancelEdit = () => {
    setEditingPrinterId(null);
    setEditingPrinter(null);
    setAmsForms({});
  };

  const savePrinter = (printerId: number) => {
    if (!editingPrinter) return;
    
    if (!editingPrinter.name || !editingPrinter.type || !editingPrinter.power) {
      showToast(`${t("common.error")}: ${t("printers.error.missingFields")}`, "error");
      return;
    }

    const powerValidation = validatePrinterPower(editingPrinter.power, settings.language);
    if (!powerValidation.isValid) {
      showToast(`${t("common.error")}: ${powerValidation.errorMessage ?? t("printers.error.invalidPower")}`, "error");
      return;
    }

    const usageValidation = validateUsageCost(editingPrinter.usageCost, settings.language);
    if (!usageValidation.isValid) {
      showToast(`${t("common.error")}: ${usageValidation.errorMessage ?? t("printers.error.invalidUsageCost")}`, "error");
      return;
    }

    console.log("💾 Nyomtató mentése...", { printerId, editingPrinter });
    const amsList = amsForms[printerId] || [];
    const validAMS: AMS[] = amsList
      .map((ams, idx) => ({ id: idx, brand: ams.brand, name: ams.name, power: ams.power }))
      .filter(ams => ams.brand && ams.name && ams.power > 0);
    
    const finalAMSCount = editingPrinter.amsCount;
    
    setPrinters(printers.map(p => 
      p.id === printerId 
        ? { 
            ...p, 
            name: editingPrinter.name,
            type: editingPrinter.type,
            power: editingPrinter.power,
            usageCost: editingPrinter.usageCost,
            ams: finalAMSCount > 0 ? validAMS : undefined,
            amsCount: finalAMSCount > 0 ? finalAMSCount : undefined
          }
        : p
    ));
    console.log("✅ Nyomtató sikeresen mentve", { printerId, amsCount: validAMS.length });
    showToast(t("common.printerUpdated"), "success");
    cancelEdit();
  };

  const updateEditingPrinter = (field: "name" | "type" | "power" | "usageCost" | "amsCount", value: string | number) => {
    if (!editingPrinter) return;
    const updated = { ...editingPrinter, [field]: value };
    setEditingPrinter(updated);
    
    // Ha az AMS mennyiség változik, frissítjük az AMS formokat
    if (field === "amsCount" && editingPrinterId !== null) {
      const newCount = Math.min(4, Math.max(0, Number(value)));
      const currentForms = amsForms[editingPrinterId] || [];
      
      if (newCount > currentForms.length) {
        // Több AMS-t adunk hozzá
        const newForms = Array(newCount - currentForms.length).fill(null).map(() => ({ brand: "", name: "", power: 0 }));
        setAmsForms({ 
          ...amsForms, 
          [editingPrinterId]: [...currentForms, ...newForms]
        });
      } else if (newCount < currentForms.length) {
        // Kevesebb AMS-t használunk
        setAmsForms({ 
          ...amsForms, 
          [editingPrinterId]: currentForms.slice(0, newCount)
        });
      }
    }
  };

  const updateAMSForm = (printerId: number, index: number, field: "brand" | "name" | "power", value: string | number) => {
    const currentForms = amsForms[printerId] || [];
    const updated = [...currentForms];
    updated[index] = { ...updated[index], [field]: value };
    setAmsForms({ ...amsForms, [printerId]: updated });
  };

  // Szűrés a keresési kifejezés alapján
  const filteredPrinters = printers.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.type.toLowerCase().includes(term)
    );
  });

  // Rendezés logika
  const sortedPrinters = useMemo(() => {
    if (!sortColumn) return filteredPrinters;
    
    const sorted = [...filteredPrinters].sort((a: Printer, b: Printer) => {
      let aValue: any = a[sortColumn];
      let bValue: any = b[sortColumn];
      
      // Szöveges értékek esetén
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      // Számértékek esetén
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      // Szöveges értékek esetén
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [filteredPrinters, sortColumn, sortDirection]);

  // Rendezés váltása
  const handleSort = (column: keyof Printer) => {
    if (sortColumn === column) {
      // Ha ugyanaz az oszlop, váltjuk az irányt
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Ha más oszlop, új rendezés növekvő irányban
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Undo/Redo keyboard shortcuts
  useKeyboardShortcut("z", () => {
    if (canUndo) {
      undo();
      showToast(t("common.undo") || "Visszavonás", "info");
    }
  }, { ctrl: true });

  useKeyboardShortcut("z", () => {
    if (canUndo) {
      undo();
      showToast(t("common.undo") || "Visszavonás", "info");
    }
  }, { meta: true });

  useKeyboardShortcut("z", () => {
    if (canRedo) {
      redo();
      showToast(t("common.redo") || "Újra", "info");
    }
  }, { ctrl: true, shift: true });

  useKeyboardShortcut("z", () => {
    if (canRedo) {
      redo();
      showToast(t("common.redo") || "Újra", "info");
    }
  }, { meta: true, shift: true });

  // Bulk műveletek
  const toggleSelection = (printerId: number) => {
    setSelectedPrinterIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(printerId)) {
        newSet.delete(printerId);
      } else {
        newSet.add(printerId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    const allIds = new Set(sortedPrinters.map(p => p.id));
    setSelectedPrinterIds(allIds);
  };

  const deselectAll = () => {
    setSelectedPrinterIds(new Set());
  };

  const handleBulkDelete = () => {
    setBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedPrinterIds.size === 0) return;
    
    const idsToDelete = Array.from(selectedPrinterIds);
    const updatedPrinters = printersWithHistory.filter(p => !idsToDelete.includes(p.id));
    
    setPrintersWithHistory(updatedPrinters);
    setPrinters(updatedPrinters);
    setSelectedPrinterIds(new Set());
    setBulkDeleteConfirm(false);
    
    const successMessage = t("printers.bulk.delete.success").replace("{{count}}", idsToDelete.length.toString());
    showToast(successMessage, "success");
  };

  const isAllSelected = sortedPrinters.length > 0 && 
    sortedPrinters.every(p => selectedPrinterIds.has(p.id));
  const isSomeSelected = selectedPrinterIds.size > 0 && !isAllSelected;

  // Drag & Drop funkciók
  const handleDragStart = (e: React.DragEvent, printerId: number) => {
    setDraggedPrinterId(printerId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", printerId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetPrinterId: number) => {
    e.preventDefault();
    if (draggedPrinterId === null || draggedPrinterId === targetPrinterId) {
      setDraggedPrinterId(null);
      return;
    }

    const draggedIndex = printersWithHistory.findIndex(p => p.id === draggedPrinterId);
    const targetIndex = printersWithHistory.findIndex(p => p.id === targetPrinterId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedPrinterId(null);
      return;
    }

    // Átrendezés
    const newPrinters = [...printersWithHistory];
    const [removed] = newPrinters.splice(draggedIndex, 1);
    newPrinters.splice(targetIndex, 0, removed);

    setPrintersWithHistory(newPrinters);
    setDraggedPrinterId(null);
    console.log("🔄 Nyomtatók átrendezve", { draggedId: draggedPrinterId, targetId: targetPrinterId });
    showToast(t("printers.toast.reordered"), "success");
  };

  const handleDragEnd = () => {
    setDraggedPrinterId(null);
  };

  // Kontextus menü funkciók
  const handleContextMenu = (e: React.MouseEvent, printerId: number) => {
    e.preventDefault();
    setContextMenu({ printerId, x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleContextMenuAction = (action: "edit" | "delete") => {
    if (!contextMenu) return;
    const printer = printersWithHistory.find(p => p.id === contextMenu.printerId);
    if (!printer) {
      closeContextMenu();
      return;
    }

    switch (action) {
      case "edit":
        startEdit(printer);
        break;
      case "delete":
        deletePrinter(contextMenu.printerId);
        break;
    }
    closeContextMenu();
  };

  // Gyorsbillentyűk
  // macOS-en metaKey (Cmd), Windows/Linux-en ctrlKey (Ctrl)
  // Mindkettőt regisztráljuk platform-független működéshez
  useKeyboardShortcut('n', () => {
    if (!showAddForm && !editingPrinterId) {
      setShowAddForm(true);
    }
  }, { ctrl: true }); // Windows/Linux

  useKeyboardShortcut('n', () => {
    if (!showAddForm && !editingPrinterId) {
      setShowAddForm(true);
    }
  }, { meta: true }); // macOS

  useKeyboardShortcut('s', () => {
    if (editingPrinterId && editingPrinter) {
      savePrinter(editingPrinterId);
    } else if (showAddForm && name && type && power) {
      addPrinter();
    }
  }, { ctrl: true }); // Windows/Linux

  useKeyboardShortcut('s', () => {
    if (editingPrinterId && editingPrinter) {
      savePrinter(editingPrinterId);
    } else if (showAddForm && name && type && power) {
      addPrinter();
    }
  }, { meta: true }); // macOS

  useKeyboardShortcut('Escape', () => {
    if (editingPrinterId) {
      cancelEdit();
    } else if (showAddForm) {
      setShowAddForm(false);
      setName(""); setType(""); setPower(0); setUsageCost(0); setAmsCount(0);
    }
  });

  return (
    <div>
      <h2 style={themeStyles.pageTitle}>{t("printers.title")}</h2>
      <p style={themeStyles.pageSubtitle}>{t("printers.subtitle")}</p>
      
      {/* Kereső mező és műveletek */}
      {printersWithHistory.length > 0 && (
        <div style={{ ...themeStyles.card, marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: "1", minWidth: "200px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600", 
                fontSize: "14px", 
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
              }}>
                🔍 {t("printers.searchLabel")}
              </label>
              <input
                type="text"
                placeholder={t("printers.searchPlaceholder")}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                style={{ ...themeStyles.input, width: "100%", maxWidth: "400px" }}
                aria-label={t("printers.searchAria")}
                aria-describedby="printer-search-description"
              />
              <span id="printer-search-description" style={{ display: "none" }}>
                {t("printers.searchDescription")}
              </span>
            </div>
            
            {/* Undo/Redo gombok */}
            <div style={{ display: "flex", gap: "8px" }}>
              <Tooltip content={`${t("common.undo")} (Ctrl/Cmd+Z)`}>
                <button
                  onClick={() => {
                    if (canUndo) {
                      undo();
                      showToast(t("common.undo") || "Visszavonás", "info");
                    }
                  }}
                  disabled={!canUndo}
                  style={{
                    ...themeStyles.button,
                    ...themeStyles.buttonSecondary,
                    opacity: canUndo ? 1 : 0.5,
                    cursor: canUndo ? "pointer" : "not-allowed",
                    padding: "8px 16px",
                  }}
                >
                  ↶ {t("common.undo")}
                </button>
              </Tooltip>
              <Tooltip content={`${t("common.redo")} (Ctrl/Cmd+Shift+Z)`}>
                <button
                  onClick={() => {
                    if (canRedo) {
                      redo();
                      showToast(t("common.redo") || "Újra", "info");
                    }
                  }}
                  disabled={!canRedo}
                  style={{
                    ...themeStyles.button,
                    ...themeStyles.buttonSecondary,
                    opacity: canRedo ? 1 : 0.5,
                    cursor: canRedo ? "pointer" : "not-allowed",
                    padding: "8px 16px",
                  }}
                >
                  ↷ {t("common.redo")}
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      )}
      
      {/* Új nyomtató hozzáadása gomb és oszlop kezelő */}
      {!showAddForm && (
        <div style={{ marginBottom: "24px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <Tooltip content={t("printers.tooltip.addShortcut")}>
            <button
              onClick={() => setShowAddForm(true)}
              onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = themeStyles.buttonPrimary.boxShadow; }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowAddForm(true);
                }
              }}
              style={{ 
                ...themeStyles.button,
                ...themeStyles.buttonPrimary,
                fontSize: "16px",
                padding: "14px 28px"
              }}
              aria-label={t("printers.aria.openAddForm")}
            >
              ➕ {t("printers.addTitle")}
            </button>
          </Tooltip>
          
          {/* Oszlop kezelő gomb */}
          {filteredPrinters.length > 0 && (
            <div style={{ position: "relative" }} data-column-menu>
              <Tooltip content={t("printers.columns.manage")}>
                <button
                  onClick={() => setShowColumnMenu(!showColumnMenu)}
                  onMouseEnter={(e) => {
                    Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover);
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget as HTMLButtonElement;
                    btn.style.transform = "translateY(0)";
                    btn.style.boxShadow = themeStyles.buttonPrimary.boxShadow;
                  }}
                  style={{ 
                    ...themeStyles.button,
                    ...themeStyles.buttonPrimary,
                    fontSize: "16px",
                    padding: "14px 28px"
                  }}
                  aria-label={t("printers.columns.manage")}
                >
                  📋 {t("printers.columns.title")}
                </button>
              </Tooltip>
              
              {/* Oszlop kezelő menü */}
              {showColumnMenu && (
                <div
                  data-column-menu
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: "8px",
                    backgroundColor: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: "8px",
                    padding: "12px",
                    minWidth: "200px",
                    boxShadow: theme.name === 'neon' || theme.name === 'cyberpunk'
                      ? `0 0 20px ${theme.colors.shadow}, 0 4px 16px rgba(0,0,0,0.3)`
                      : `0 4px 16px rgba(0,0,0,0.2)`,
                    zIndex: 1000,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text }}>
                    {t("printers.columns.title")}
                  </div>
                  {Object.entries(columnVisibility).map(([column, visible]) => (
                    <label
                      key={column}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px",
                        cursor: "pointer",
                        borderRadius: "4px",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={() => toggleColumnVisibility(column as keyof typeof columnVisibility)}
                        style={{
                          cursor: "pointer",
                          width: "18px",
                          height: "18px",
                        }}
                      />
                      <span style={{ fontSize: "14px", color: theme.colors.text }}>
                        {t(`printers.columns.${column}` as any)}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Új nyomtató hozzáadása form modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => {
              setShowAddForm(false);
              setName(""); setType(""); setPower(0); setUsageCost(0); setAmsCount(0);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                backgroundColor: typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
                  ? 'rgba(255, 255, 255, 0.95)'
                  : theme.colors.surface,
                borderRadius: '16px',
                padding: '24px',
                width: 'min(700px, 90vw)',
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: theme.name === 'neon' || theme.name === 'cyberpunk'
                  ? `0 0 30px ${theme.colors.shadow}, 0 8px 32px rgba(0,0,0,0.4)`
                  : `0 8px 32px rgba(0,0,0,0.3)`,
                color: typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
                  ? '#1a202c'
                  : theme.colors.text,
                backdropFilter: typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
                  ? 'blur(12px)'
                  : 'none',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: "20px", 
                  fontWeight: "600", 
                  color: typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
                    ? '#1a202c'
                    : theme.colors.text 
                }}>
                  ➕ {t("printers.addTitle")}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setName(""); setType(""); setPower(0); setUsageCost(0); setAmsCount(0);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
                      ? '#1a202c'
                      : theme.colors.text,
                    padding: '0',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
                      ? 'rgba(0, 0, 0, 0.05)'
                      : theme.colors.surfaceHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ display: "flex", gap: "40px", alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ width: "180px", flexShrink: 0, minWidth: "150px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              whiteSpace: "nowrap" 
            }}>
              {t("printers.name")}
            </label>
            <input 
              placeholder={t("printers.name")} 
              value={name} 
              onChange={e => setName(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
              style={{ 
                ...themeStyles.input, 
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            />
                </div>
                <div style={{ width: "180px", flexShrink: 0, minWidth: "150px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              whiteSpace: "nowrap" 
            }}>
              {t("printers.type")}
            </label>
            <input 
              placeholder={t("printers.type")} 
              value={type} 
              onChange={e => setType(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
              style={{ 
                ...themeStyles.input, 
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            />
                </div>
                <div style={{ width: "180px", flexShrink: 0, minWidth: "150px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              whiteSpace: "nowrap" 
            }}>
              {t("printers.power")}
            </label>
            <input 
              type="number" 
              min="1"
              max="100000"
              placeholder={t("printers.power")} 
              value={power} 
              onChange={e => {
                const val = Number(e.target.value);
                const validation = validatePrinterPower(val, settings.language);
                if (validation.isValid) {
                  setPower(val);
                } else if (validation.errorMessage) {
                  showToast(validation.errorMessage, "error");
                }
              }}
              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
              style={{ ...themeStyles.input, width: "100%" }}
              aria-label={t("printers.power")}
              aria-required="true"
              aria-describedby="printer-power-description"
            />
            <span id="printer-power-description" style={{ display: "none" }}>
              {t("printers.powerDescription")}
            </span>
          </div>
          <div style={{ width: "180px", flexShrink: 0 }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              whiteSpace: "nowrap" 
            }}>
              {t("printers.usageCost")}
            </label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              max="1000000"
              placeholder={t("printers.usageCost")} 
              value={usageCost} 
              onChange={e => {
                const val = Number(e.target.value);
                const validation = validateUsageCost(val, settings.language);
                if (validation.isValid) {
                  setUsageCost(val);
                } else if (validation.errorMessage) {
                  showToast(validation.errorMessage, "error");
                }
              }}
              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
              style={{ 
                ...themeStyles.input, 
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            />
                </div>
                <div style={{ width: "180px", flexShrink: 0, minWidth: "150px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              whiteSpace: "nowrap" 
            }}>
              {t("printers.amsCount")}
            </label>
            <input 
              type="number" 
              min="0"
              max="4"
              placeholder="0" 
              value={amsCount} 
              onChange={e => {
                const val = Number(e.target.value);
                const validation = validateAMSCount(val, settings.language);
                if (validation.isValid) {
                  setAmsCount(val);
                } else if (validation.errorMessage) {
                  showToast(validation.errorMessage, "error");
                }
              }}
              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
              style={{ ...themeStyles.input, width: "100%" }}
            />
          </div>
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "24px", paddingTop: "20px", borderTop: `2px solid ${theme.colors.border}` }}>
          <Tooltip content={t("printers.tooltip.submitShortcut")}>
            <button 
              onClick={addPrinter}
              onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
              onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonPrimary.boxShadow; }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  addPrinter();
                }
              }}
              style={{ 
                ...themeStyles.button,
                ...themeStyles.buttonPrimary,
                fontSize: "16px",
                padding: "14px 28px"
              }}
              aria-label={t("printers.aria.openAddForm")}
            >
              ➕ {t("printers.add")}
            </button>
          </Tooltip>
          <Tooltip content={t("printers.tooltip.cancelShortcut")}>
            <button
              onClick={() => setShowAddForm(false)}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowAddForm(false);
                }
              }}
              style={{ 
                ...themeStyles.button,
                ...themeStyles.buttonSecondary,
                padding: "8px 16px",
                fontSize: "12px",
                marginLeft: "10px"
              }}
              aria-label={t("common.cancel")}
            >
              {t("filaments.cancel")}
            </button>
          </Tooltip>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredPrinters.length > 0 ? (
        <div style={{ ...themeStyles.card, overflow: "hidden", padding: 0 }}>
          {/* Bulk műveletek toolbar */}
          {selectedPrinterIds.size > 0 && (
            <div style={{
              padding: "12px 16px",
              backgroundColor: theme.colors.surfaceHover,
              borderBottom: `1px solid ${theme.colors.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}>
              <span style={{ color: theme.colors.text, fontSize: "14px", fontWeight: "600" }}>
                {t("printers.bulk.selected").replace("{{count}}", selectedPrinterIds.size.toString())}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={deselectAll}
                  style={{
                    ...themeStyles.button,
                    ...themeStyles.buttonSecondary,
                    padding: "6px 12px",
                    fontSize: "12px",
                  }}
                >
                  {t("printers.bulk.deselectAll")}
                </button>
                <button
                  onClick={handleBulkDelete}
                  style={{
                    ...themeStyles.button,
                    ...themeStyles.buttonDanger,
                    padding: "6px 12px",
                    fontSize: "12px",
                  }}
                >
                  {t("printers.bulk.delete").replace("{{count}}", selectedPrinterIds.size.toString())}
                </button>
              </div>
            </div>
          )}
          <table style={themeStyles.table}>
            <thead>
              <tr>
                <th style={{ ...themeStyles.tableHeader, width: "50px", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isSomeSelected;
                    }}
                    onChange={(e) => {
                      if (e.target.checked) {
                        selectAll();
                      } else {
                        deselectAll();
                      }
                    }}
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                    }}
                    aria-label={t("printers.bulk.selectAll")}
                  />
                </th>
                {columnVisibility.name && (
                  <th 
                    style={{ 
                      ...themeStyles.tableHeader, 
                      cursor: "pointer",
                      userSelect: "none",
                      position: "relative",
                      paddingRight: "24px"
                    }}
                    onClick={() => handleSort("name")}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.surface;
                    }}
                  >
                    {t("printers.name")}
                    {sortColumn === "name" && (
                      <span style={{ marginLeft: "8px", fontSize: "12px" }}>
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                )}
                {columnVisibility.type && (
                  <th 
                    style={{ 
                      ...themeStyles.tableHeader, 
                      cursor: "pointer",
                      userSelect: "none",
                      position: "relative",
                      paddingRight: "24px"
                    }}
                    onClick={() => handleSort("type")}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.surface;
                    }}
                  >
                    {t("printers.type")}
                    {sortColumn === "type" && (
                      <span style={{ marginLeft: "8px", fontSize: "12px" }}>
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                )}
                {columnVisibility.power && (
                  <th 
                    style={{ 
                      ...themeStyles.tableHeader, 
                      cursor: "pointer",
                      userSelect: "none",
                      position: "relative",
                      paddingRight: "24px"
                    }}
                    onClick={() => handleSort("power")}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.surface;
                    }}
                  >
                    {t("printers.power")}
                    {sortColumn === "power" && (
                      <span style={{ marginLeft: "8px", fontSize: "12px" }}>
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                )}
                {columnVisibility.usageCost && (
                  <th 
                    style={{ 
                      ...themeStyles.tableHeader, 
                      cursor: "pointer",
                      userSelect: "none",
                      position: "relative",
                      paddingRight: "24px"
                    }}
                    onClick={() => handleSort("usageCost")}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.surface;
                    }}
                  >
                    {t("printers.usageCost")}
                    {sortColumn === "usageCost" && (
                      <span style={{ marginLeft: "8px", fontSize: "12px" }}>
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                )}
                {columnVisibility.ams && (
                  <th style={themeStyles.tableHeader}>{t("printers.ams")}</th>
                )}
                {columnVisibility.action && (
                  <th style={themeStyles.tableHeader}>{t("printers.action")}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedPrinters.map((p: Printer) => (
                <React.Fragment key={p.id}>
                  <tr 
                    draggable
                    onDragStart={(e) => handleDragStart(e, p.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, p.id)}
                    onDragEnd={handleDragEnd}
                    onContextMenu={(e) => handleContextMenu(e, p.id)}
                    style={{ 
                      transition: "background-color 0.2s",
                      cursor: draggedPrinterId === p.id ? "grabbing" : "grab",
                      opacity: draggedPrinterId === p.id ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (draggedPrinterId !== p.id) {
                        e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (draggedPrinterId !== p.id) {
                        e.currentTarget.style.backgroundColor = theme.colors.surface;
                      }
                    }}
                  >
                    <td style={{ ...themeStyles.tableCell, textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={selectedPrinterIds.has(p.id)}
                        onChange={() => toggleSelection(p.id)}
                        style={{
                          width: "18px",
                          height: "18px",
                          cursor: "pointer",
                        }}
                        aria-label={t("printers.bulk.select")}
                      />
                    </td>
                    {columnVisibility.name && <td style={themeStyles.tableCell}><strong>{p.name}</strong></td>}
                    {columnVisibility.type && <td style={themeStyles.tableCell}>{p.type}</td>}
                    {columnVisibility.power && <td style={themeStyles.tableCell}>{p.power}W</td>}
                    {columnVisibility.usageCost && (
                      <td style={themeStyles.tableCell}>
                        <strong style={{ color: theme.colors.success }}>
                          {(() => {
                            const convertedCost = convertCurrency(p.usageCost, settings.currency);
                            const currencySymbol = settings.currency === "HUF" ? "Ft" : settings.currency;
                            return `${convertedCost.toFixed(2)} ${currencySymbol}/h`;
                          })()}
                        </strong>
                      </td>
                    )}
                    {columnVisibility.ams && (
                      <td style={themeStyles.tableCell}>
                        {p.amsCount || 0} {t("printers.ams")}
                      </td>
                    )}
                    {columnVisibility.action && (
                      <td style={themeStyles.tableCell}>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <Tooltip content={editingPrinterId === p.id ? t("printers.tooltip.saveShortcut") : t("printers.tooltip.edit")}>
                          <button 
                            onClick={() => {
                              if (editingPrinterId === p.id) {
                                cancelEdit();
                              } else {
                                startEdit(p);
                              }
                            }}
                            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.transform = "translateY(-1px)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                            style={{ 
                              ...themeStyles.button,
                              ...(editingPrinterId === p.id ? themeStyles.buttonSuccess : themeStyles.buttonPrimary),
                              padding: "8px 16px",
                              fontSize: "12px"
                            }}
                          >
                            {editingPrinterId === p.id ? t("printers.save") : t("printers.edit")}
                          </button>
                        </Tooltip>
                        <Tooltip content={t("printers.tooltip.delete")}>
                          <button 
                            onClick={() => deletePrinter(p.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                deletePrinter(p.id);
                              }
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
                            style={{ 
                              ...themeStyles.button,
                              ...themeStyles.buttonDanger,
                              padding: "8px 16px",
                              fontSize: "12px"
                            }}
                            aria-label={`${t("printers.aria.deletePrinter")} ${p.name}`}
                          >
                            {t("printers.delete")}
                          </button>
                        </Tooltip>
                      </div>
                      </td>
                    )}
                  </tr>
              {editingPrinterId === p.id && editingPrinter && (
                <tr>
                  <td colSpan={Object.values(columnVisibility).filter(v => v).length} style={{ ...themeStyles.tableCell, padding: "24px", backgroundColor: theme.colors.surfaceHover }}>
                    <div>
                      <h4 style={{ 
                        marginTop: 0, 
                        marginBottom: "20px", 
                        fontSize: "18px", 
                        fontWeight: "600", 
                        color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
                      }}>
                        ✏️ {t("printers.edit")} - {p.name}
                      </h4>
                      
                      {/* Nyomtató alapadatok szerkesztése */}
                      <div style={{ ...themeStyles.card, marginBottom: "24px", padding: "20px" }}>
                      <h5 style={{ 
                          marginTop: 0, 
                          marginBottom: "16px", 
                          fontSize: "16px", 
                          fontWeight: "600", 
                          color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
                        }}>
                          📋 {t("printers.details")}
                        </h5>
                        <div style={{ display: "flex", gap: "40px", alignItems: "flex-end", flexWrap: "wrap" }}>
                          <div style={{ width: "180px", flexShrink: 0 }}>
                            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              whiteSpace: "nowrap" 
            }}>
                              {t("printers.name")}
                            </label>
                            <input 
                              placeholder={t("printers.name")} 
                              value={editingPrinter.name} 
                              onChange={e => updateEditingPrinter("name", e.target.value)}
                              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                              style={{ ...themeStyles.input, width: "100%" }}
                            />
                          </div>
                          <div style={{ width: "180px", flexShrink: 0 }}>
                            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              whiteSpace: "nowrap" 
            }}>
                              {t("printers.type")}
                            </label>
                            <input 
                              placeholder={t("printers.type")} 
                              value={editingPrinter.type} 
                              onChange={e => updateEditingPrinter("type", e.target.value)}
                              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                              style={{ ...themeStyles.input, width: "100%" }}
                            />
                          </div>
                          <div style={{ width: "180px", flexShrink: 0 }}>
                            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              whiteSpace: "nowrap" 
            }}>
                              {t("printers.power")}
                            </label>
                            <input 
                              type="number" 
                              placeholder={t("printers.power")} 
                              value={editingPrinter.power} 
                              onChange={e => {
                                const val = Number(e.target.value);
                                const validation = validatePrinterPower(val, settings.language);
                                if (validation.isValid) {
                                  updateEditingPrinter("power", val);
                                } else if (validation.errorMessage) {
                                  showToast(validation.errorMessage, "error");
                                }
                              }}
                              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                              style={{ ...themeStyles.input, width: "100%" }}
                            />
                          </div>
                          <div style={{ width: "180px", flexShrink: 0 }}>
                            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              whiteSpace: "nowrap" 
            }}>
                              {t("printers.usageCost")}
                            </label>
                            <input 
                              type="number" 
                              step="0.01"
                              placeholder={t("printers.usageCost")} 
                              value={editingPrinter.usageCost} 
                              onChange={e => {
                                const val = Number(e.target.value);
                                const validation = validateUsageCost(val, settings.language);
                                if (validation.isValid) {
                                  updateEditingPrinter("usageCost", val);
                                } else if (validation.errorMessage) {
                                  showToast(validation.errorMessage, "error");
                                }
                              }}
                              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                              style={{ ...themeStyles.input, width: "100%" }}
                            />
                          </div>
                          <div style={{ width: "180px", flexShrink: 0 }}>
                            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              whiteSpace: "nowrap" 
            }}>
                              {t("printers.amsCount")}
                            </label>
                            <input 
                              type="number" 
                              min="0"
                              max="4"
                              placeholder="0" 
                              value={editingPrinter.amsCount} 
                              onChange={e => {
                                const val = Number(e.target.value);
                                const validation = validateAMSCount(val, settings.language);
                                if (validation.isValid) {
                                  updateEditingPrinter("amsCount", val);
                                } else if (validation.errorMessage) {
                                  showToast(validation.errorMessage, "error");
                                }
                              }}
                              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                              style={{ ...themeStyles.input, width: "100%" }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* AMS szerkesztés */}
                      {editingPrinter.amsCount > 0 && (
                        <div style={{ ...themeStyles.card, marginBottom: "24px", padding: "20px" }}>
                          <h5 style={{ 
                            marginTop: 0, 
                            marginBottom: "16px", 
                            fontSize: "16px", 
                            fontWeight: "600", 
                            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
                          }}>
                            🔧 {t("printers.amsSystems")} ({editingPrinter.amsCount})
                          </h5>
                          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "16px" }}>
                            {(amsForms[p.id] || []).map((ams, idx) => (
                              <div key={idx} style={{ padding: "16px", backgroundColor: theme.colors.surface, borderRadius: "8px", border: `1px solid ${theme.colors.border}` }}>
                                <strong style={{ 
                                  display: "block", 
                                  marginBottom: "12px", 
                                  fontSize: "14px", 
                                  color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
                                }}>
                                  {t("printers.ams")} {idx + 1}:
                                </strong>
                                <div style={{ display: "flex", gap: "40px", alignItems: "flex-end", flexWrap: "wrap" }}>
                                  <div style={{ width: "180px", flexShrink: 0 }}>
                                    <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              whiteSpace: "nowrap" 
            }}>
                                      {t("printers.amsBrand")}
                                    </label>
                                    <input
                                      placeholder={t("printers.amsBrand")}
                                      value={ams.brand}
                                      onChange={e => updateAMSForm(p.id, idx, "brand", e.target.value)}
                                      onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                                      onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                                      style={{ ...themeStyles.input, width: "100%" }}
                                    />
                                  </div>
                                  <div style={{ width: "180px", flexShrink: 0 }}>
                                    <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              whiteSpace: "nowrap" 
            }}>
                                      {t("printers.amsName")}
                                    </label>
                                    <input
                                      placeholder={t("printers.amsName")}
                                      value={ams.name}
                                      onChange={e => updateAMSForm(p.id, idx, "name", e.target.value)}
                                      onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                                      onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                                      style={{ ...themeStyles.input, width: "100%" }}
                                    />
                                  </div>
                                  <div style={{ width: "180px", flexShrink: 0 }}>
                                    <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              whiteSpace: "nowrap" 
            }}>
                                      {t("printers.amsPower")}
                                    </label>
                                    <input
                                      type="number"
                                      placeholder={t("printers.amsPower")}
                                      value={ams.power || ""}
                                      onChange={e => {
                                        const val = Number(e.target.value);
                                        if (!isNaN(val) && val >= 0 && val <= 10000) {
                                          updateAMSForm(p.id, idx, "power", val);
                                        }
                                      }}
                                      onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                                      onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                                      style={{ ...themeStyles.input, width: "100%" }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Művelet gombok */}
                      <div style={{ display: "flex", gap: "12px" }}>
                        <button 
                          onClick={() => savePrinter(p.id)}
                          onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
                          onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonSuccess.boxShadow; }}
                          style={{ 
                            ...themeStyles.button,
                            ...themeStyles.buttonSuccess
                          }}
                        >
                          {t("printers.save")}
                        </button>
                        <button
                          onClick={cancelEdit}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
                          style={{ 
                            ...themeStyles.button,
                            ...themeStyles.buttonSecondary,
                            padding: "8px 16px"
                          }}
                        >
                          {t("filaments.cancel")}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
          </table>
        </div>
      ) : printers.length > 0 && searchTerm ? (
        <div style={{ ...themeStyles.card, textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <p
            style={{
              margin: 0,
              color: theme.colors.background?.includes("gradient") ? "#4a5568" : theme.colors.textMuted,
              fontSize: "16px",
            }}
          >
            {t("printers.noSearchResults")}
          </p>
        </div>
      ) : (
        <EmptyState
          icon="🖨️"
          title={t("printers.empty")}
          actionLabel={t("printers.add")}
          onAction={() => setShowAddForm(true)}
          theme={theme}
          themeStyles={themeStyles}
          settings={settings}
        />
      )}
      
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        title={t("common.confirm")}
        message={t("common.confirmDeletePrinter")}
        theme={theme}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
        confirmText={t("common.yes")}
        cancelText={t("common.cancel")}
        type="danger"
      />
      
      <ConfirmDialog
        isOpen={bulkDeleteConfirm}
        onCancel={() => setBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title={t("printers.bulk.deleteConfirm.title")}
        message={t("printers.bulk.deleteConfirm.message").replace("{{count}}", selectedPrinterIds.size.toString())}
        theme={theme}
      />

      {/* Kontextus menü */}
      {contextMenu && (
        <div
          onClick={closeContextMenu}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1500,
            backgroundColor: "transparent"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: contextMenu.y,
              left: contextMenu.x,
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: "8px",
              boxShadow: `0 4px 12px ${theme.colors.shadow}`,
              padding: "8px 0",
              minWidth: "180px",
              zIndex: 1501
            }}
          >
            <button
              onClick={() => handleContextMenuAction("edit")}
              style={{
                width: "100%",
                padding: "10px 16px",
                textAlign: "left",
                backgroundColor: "transparent",
                border: "none",
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
                cursor: "pointer",
                fontSize: "14px",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              ✏️ {t("printers.edit")}
            </button>
            <div style={{ height: "1px", backgroundColor: theme.colors.border, margin: "4px 0" }} />
            <button
              onClick={() => handleContextMenuAction("delete")}
              style={{
                width: "100%",
                padding: "10px 16px",
                textAlign: "left",
                backgroundColor: "transparent",
                border: "none",
                color: theme.colors.danger,
                cursor: "pointer",
                fontSize: "14px",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              🗑️ {t("printers.delete")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
