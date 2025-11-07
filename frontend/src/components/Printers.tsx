import React, { useState } from "react";
import type { Printer, Settings, AMS } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { convertCurrency } from "../utils/currency";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";
import { useKeyboardShortcut } from "../utils/keyboardShortcuts";
import { Tooltip } from "./Tooltip";
import { validatePrinterPower, validateUsageCost, validateAMSCount } from "../utils/validation";

interface Props {
  printers: Printer[];
  setPrinters: (p: Printer[]) => void;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
}

export const Printers: React.FC<Props> = ({ printers, setPrinters, settings, theme, themeStyles }) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();
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

  const addPrinter = () => {
    if (!name || !type || !power) {
      showToast(t("common.error") + ": " + (settings.language === "hu" ? "Kérlek töltsd ki az összes kötelező mezőt!" : settings.language === "de" ? "Bitte füllen Sie alle Pflichtfelder aus!" : "Please fill in all required fields!"), "error");
      return;
    }
    
    if (power <= 0 || usageCost < 0) {
      showToast(t("common.error") + ": " + (settings.language === "hu" ? "A teljesítmény pozitív szám kell legyen!" : settings.language === "de" ? "Die Leistung muss eine positive Zahl sein!" : "Power must be a positive number!"), "error");
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
    setPrinters([...printers, newPrinter]);
    if (amsCount > 0) {
      setAmsForms({ ...amsForms, [newId]: Array(amsCount).fill(null).map(() => ({ brand: "", name: "", power: 0 })) });
      setEditingPrinterId(newId);
    }
    console.log("✅ Nyomtató sikeresen hozzáadva", { printerId: newId, name });
    showToast(t("common.printerAdded"), "success");
    setName(""); setType(""); setPower(0); setUsageCost(0); setAmsCount(0);
    setShowAddForm(false);
  };

  const deletePrinter = (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId === null) return;
    const id = deleteConfirmId;
    const printerToDelete = printers.find(p => p.id === id);
    console.log("🗑️ Nyomtató törlése...", { printerId: id, name: printerToDelete?.name, type: printerToDelete?.type });
    setPrinters(printers.filter(p => p.id !== id));
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
      showToast(t("common.error") + ": " + (settings.language === "hu" ? "Kérlek töltsd ki az összes kötelező mezőt!" : settings.language === "de" ? "Bitte füllen Sie alle Pflichtfelder aus!" : "Please fill in all required fields!"), "error");
      return;
    }
    
    if (editingPrinter.power <= 0 || editingPrinter.usageCost < 0) {
      showToast(t("common.error") + ": " + (settings.language === "hu" ? "A teljesítmény pozitív szám kell legyen!" : settings.language === "de" ? "Die Leistung muss eine positive Zahl sein!" : "Power must be a positive number!"), "error");
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

    const draggedIndex = printers.findIndex(p => p.id === draggedPrinterId);
    const targetIndex = printers.findIndex(p => p.id === targetPrinterId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedPrinterId(null);
      return;
    }

    // Átrendezés
    const newPrinters = [...printers];
    const [removed] = newPrinters.splice(draggedIndex, 1);
    newPrinters.splice(targetIndex, 0, removed);

    setPrinters(newPrinters);
    setDraggedPrinterId(null);
    console.log("🔄 Nyomtatók átrendezve", { draggedId: draggedPrinterId, targetId: targetPrinterId });
    showToast(
      settings.language === "hu" ? "Nyomtatók átrendezve" :
      settings.language === "de" ? "Drucker neu angeordnet" :
      "Printers reordered",
      "success"
    );
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
    const printer = printers.find(p => p.id === contextMenu.printerId);
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
      <p style={themeStyles.pageSubtitle}>
        {settings.language === "hu" ? "Nyomtatók és AMS rendszerek kezelése" : settings.language === "de" ? "Drucker und AMS-Systeme verwalten" : "Manage printers and AMS systems"}
      </p>
      
      {/* Kereső mező */}
      {printers.length > 0 && (
        <div style={{ ...themeStyles.card, marginBottom: "24px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "600", 
            fontSize: "14px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>
            🔍 {settings.language === "hu" ? "Keresés" : settings.language === "de" ? "Suchen" : "Search"}
          </label>
          <input
            type="text"
            placeholder={settings.language === "hu" ? "Keresés név vagy típus alapján..." : settings.language === "de" ? "Suche nach Name oder Typ..." : "Search by name or type..."}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
            onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
            style={{ ...themeStyles.input, width: "100%", maxWidth: "400px" }}
            aria-label={settings.language === "hu" ? "Keresés nyomtatók között" : settings.language === "de" ? "Drucker durchsuchen" : "Search printers"}
            aria-describedby="printer-search-description"
          />
          <span id="printer-search-description" style={{ display: "none" }}>
            {settings.language === "hu" ? "Keresés nyomtatók között név vagy típus alapján" : settings.language === "de" ? "Drucker nach Name oder Typ durchsuchen" : "Search printers by name or type"}
          </span>
        </div>
      )}
      
      {/* Új nyomtató hozzáadása gomb */}
      {!showAddForm && (
        <div style={{ marginBottom: "24px" }}>
          <Tooltip content={settings.language === "hu" ? "Új nyomtató hozzáadása (Ctrl/Cmd+N)" : settings.language === "de" ? "Neuen Drucker hinzufügen (Strg/Cmd+N)" : "Add new printer (Ctrl/Cmd+N)"}>
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
              aria-label={settings.language === "hu" ? "Új nyomtató hozzáadása" : settings.language === "de" ? "Neuen Drucker hinzufügen" : "Add new printer"}
            >
              ➕ {t("printers.addTitle")}
            </button>
          </Tooltip>
        </div>
      )}
      
      {/* Új nyomtató hozzáadása form */}
      {showAddForm && (
      <div style={{ ...themeStyles.card, marginBottom: "24px", backgroundColor: theme.colors.surfaceHover, border: `1px solid ${theme.colors.border}` }}>
        <h3 style={{ 
          marginTop: 0, 
          marginBottom: "24px", 
          fontSize: "20px", 
          fontWeight: "600", 
          color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
        }}>
          ➕ {t("printers.addTitle")}
        </h3>
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
              value={name} 
              onChange={e => setName(e.target.value)}
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
              value={type} 
              onChange={e => setType(e.target.value)}
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
              {settings.language === "hu" ? "Nyomtató teljesítménye wattban (1-100000)" : settings.language === "de" ? "Druckerleistung in Watt (1-100000)" : "Printer power in watts (1-100000)"}
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
          <Tooltip content={settings.language === "hu" ? "Nyomtató hozzáadása (Ctrl/Cmd+S)" : settings.language === "de" ? "Drucker hinzufügen (Strg/Cmd+S)" : "Add printer (Ctrl/Cmd+S)"}>
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
              aria-label={settings.language === "hu" ? "Nyomtató hozzáadása" : settings.language === "de" ? "Drucker hinzufügen" : "Add printer"}
            >
              ➕ {t("printers.add")}
            </button>
          </Tooltip>
          <Tooltip content={settings.language === "hu" ? "Mégse (Escape)" : settings.language === "de" ? "Abbrechen (Escape)" : "Cancel (Escape)"}>
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
              aria-label={settings.language === "hu" ? "Mégse" : settings.language === "de" ? "Abbrechen" : "Cancel"}
            >
              {t("filaments.cancel")}
            </button>
          </Tooltip>
        </div>
      </div>
      )}

      {filteredPrinters.length > 0 ? (
        <div style={{ ...themeStyles.card, overflow: "hidden", padding: 0 }}>
          <table style={themeStyles.table}>
            <thead>
              <tr>
                <th style={themeStyles.tableHeader}>{t("printers.name")}</th>
                <th style={themeStyles.tableHeader}>{t("printers.type")}</th>
                <th style={themeStyles.tableHeader}>{t("printers.power")}</th>
                <th style={themeStyles.tableHeader}>{t("printers.usageCost")}</th>
                <th style={themeStyles.tableHeader}>{t("printers.ams")}</th>
                <th style={themeStyles.tableHeader}>{t("printers.action")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrinters.map(p => (
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
                    <td style={themeStyles.tableCell}><strong>{p.name}</strong></td>
                    <td style={themeStyles.tableCell}>{p.type}</td>
                    <td style={themeStyles.tableCell}>{p.power}W</td>
                    <td style={themeStyles.tableCell}>
                      <strong style={{ color: theme.colors.success }}>
                        {(() => {
                          const convertedCost = convertCurrency(p.usageCost, settings.currency);
                          const currencySymbol = settings.currency === "HUF" ? "Ft" : settings.currency;
                          return `${convertedCost.toFixed(2)} ${currencySymbol}/h`;
                        })()}
                      </strong>
                    </td>
                    <td style={themeStyles.tableCell}>
                      {p.amsCount || 0} {t("printers.ams")}
                    </td>
                    <td style={themeStyles.tableCell}>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <Tooltip content={settings.language === "hu" ? (editingPrinterId === p.id ? "Mentés (Ctrl/Cmd+S)" : "Szerkesztés") : settings.language === "de" ? (editingPrinterId === p.id ? "Speichern (Strg/Cmd+S)" : "Bearbeiten") : (editingPrinterId === p.id ? "Save (Ctrl/Cmd+S)" : "Edit")}>
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
                        <Tooltip content={settings.language === "hu" ? "Törlés" : settings.language === "de" ? "Löschen" : "Delete"}>
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
                            aria-label={settings.language === "hu" ? `Nyomtató törlése: ${p.name}` : settings.language === "de" ? `Drucker löschen: ${p.name}` : `Delete printer: ${p.name}`}
                          >
                            {t("printers.delete")}
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
              {editingPrinterId === p.id && editingPrinter && (
                <tr>
                  <td colSpan={6} style={{ ...themeStyles.tableCell, padding: "24px", backgroundColor: theme.colors.surfaceHover }}>
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
                          📋 {settings.language === "hu" ? "Nyomtató adatai" : settings.language === "de" ? "Drucker-Daten" : "Printer Details"}
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
          <p style={{ 
            margin: 0, 
            color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted, 
            fontSize: "16px" 
          }}>
            {settings.language === "hu" ? "Nincs találat a keresési kifejezésre." : settings.language === "de" ? "Keine Ergebnisse für den Suchbegriff." : "No results found for the search term."}
          </p>
        </div>
      ) : (
        <div style={{ ...themeStyles.card, textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🖨️</div>
          <p style={{ 
            margin: 0, 
            color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted, 
            fontSize: "16px" 
          }}>{t("printers.empty")}</p>
        </div>
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
              ✏️ {settings.language === "hu" ? "Szerkesztés" : settings.language === "de" ? "Bearbeiten" : "Edit"}
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
              🗑️ {settings.language === "hu" ? "Törlés" : settings.language === "de" ? "Löschen" : "Delete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
