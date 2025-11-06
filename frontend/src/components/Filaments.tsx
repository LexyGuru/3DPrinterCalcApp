import React, { useState } from "react";
import type { Filament, Settings } from "../types";
import type { Theme } from "../utils/themes";
import { filamentPrice } from "../utils/filamentCalc";
import { useTranslation } from "../utils/translations";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";
import { useKeyboardShortcut } from "../utils/keyboardShortcuts";
import { Tooltip } from "./Tooltip";
import { validateFilamentWeight, validateFilamentPrice } from "../utils/validation";

interface Props {
  filaments: Filament[];
  setFilaments: (f: Filament[]) => void;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
}

export const Filaments: React.FC<Props> = ({ filaments, setFilaments, settings, theme, themeStyles }) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [weight, setWeight] = useState<number>(1000);
  const [pricePerKg, setPricePerKg] = useState<number>(0);
  const [color, setColor] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [draggedFilamentIndex, setDraggedFilamentIndex] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ index: number; x: number; y: number } | null>(null);

  const resetForm = () => {
    setBrand("");
    setType("");
    setWeight(1000);
    setPricePerKg(0);
    setColor("");
    setEditingIndex(null);
    setShowAddForm(false);
  };

  const addFilament = () => {
    if (!brand || !type || !pricePerKg) {
      showToast(t("common.error") + ": " + (settings.language === "hu" ? "Kérlek töltsd ki az összes kötelező mezőt!" : settings.language === "de" ? "Bitte füllen Sie alle Pflichtfelder aus!" : "Please fill in all required fields!"), "error");
      return;
    }
    
    if (weight <= 0 || pricePerKg <= 0) {
      showToast(t("common.error") + ": " + (settings.language === "hu" ? "A súly és az ár pozitív szám kell legyen!" : settings.language === "de" ? "Gewicht und Preis müssen positive Zahlen sein!" : "Weight and price must be positive numbers!"), "error");
      return;
    }
    
    if (editingIndex !== null) {
      // Szerkesztési mód: frissítjük a filamentet
      console.log("✏️ Filament szerkesztése...", { index: editingIndex, brand, type, pricePerKg });
      const updated = [...filaments];
      updated[editingIndex] = { brand, type, weight, pricePerKg, color: color || undefined };
      setFilaments(updated);
      console.log("✅ Filament sikeresen frissítve", { index: editingIndex });
      showToast(t("common.filamentUpdated"), "success");
      resetForm();
    } else {
      // Új filament hozzáadása
      console.log("➕ Új filament hozzáadása...", { brand, type, pricePerKg });
      setFilaments([...filaments, { brand, type, weight, pricePerKg, color: color || undefined }]);
      console.log("✅ Filament sikeresen hozzáadva", { brand, type });
      showToast(t("common.filamentAdded"), "success");
      resetForm();
    }
  };

  const startEdit = (index: number) => {
    const filament = filaments[index];
    setBrand(filament.brand);
    setType(filament.type);
    setWeight(filament.weight);
    setPricePerKg(filament.pricePerKg);
    setColor(filament.color || "");
    setEditingIndex(index);
  };

  const cancelEdit = () => {
    resetForm();
  };

  const deleteFilament = (index: number) => {
    setDeleteConfirmIndex(index);
  };

  const confirmDelete = () => {
    if (deleteConfirmIndex === null) return;
    const index = deleteConfirmIndex;
    const filamentToDelete = filaments[index];
    console.log("🗑️ Filament törlése...", { index, brand: filamentToDelete?.brand, type: filamentToDelete?.type });
    setFilaments(filaments.filter((_, i) => i !== index));
    if (editingIndex === index) {
      resetForm();
    }
    console.log("✅ Filament sikeresen törölve", { index });
    showToast(t("common.filamentDeleted"), "success");
    setDeleteConfirmIndex(null);
  };

  // Szűrés a keresési kifejezés alapján
  const filteredFilaments = filaments.filter(f => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      f.brand.toLowerCase().includes(term) ||
      f.type.toLowerCase().includes(term) ||
      (f.color && f.color.toLowerCase().includes(term))
    );
  });

  // Gyorsbillentyűk
  // macOS-en metaKey (Cmd), Windows/Linux-en ctrlKey (Ctrl)
  // Mindkettőt regisztráljuk platform-független működéshez
  useKeyboardShortcut('n', () => {
    if (!showAddForm && editingIndex === null) {
      setShowAddForm(true);
    }
  }, { ctrl: true }); // Windows/Linux

  useKeyboardShortcut('n', () => {
    if (!showAddForm && editingIndex === null) {
      setShowAddForm(true);
    }
  }, { meta: true }); // macOS

  useKeyboardShortcut('s', () => {
    if (showAddForm && brand && type && pricePerKg) {
      addFilament();
    }
  }, { ctrl: true }); // Windows/Linux

  useKeyboardShortcut('s', () => {
    if (showAddForm && brand && type && pricePerKg) {
      addFilament();
    }
  }, { meta: true }); // macOS

  useKeyboardShortcut('Escape', () => {
    if (editingIndex !== null || showAddForm) {
      resetForm();
    }
  });

  // Drag & Drop funkciók
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedFilamentIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedFilamentIndex === null || draggedFilamentIndex === targetIndex) {
      setDraggedFilamentIndex(null);
      return;
    }

    const newFilaments = [...filaments];
    const [removed] = newFilaments.splice(draggedFilamentIndex, 1);
    newFilaments.splice(targetIndex, 0, removed);

    setFilaments(newFilaments);
    setDraggedFilamentIndex(null);
    console.log("🔄 Filamentek átrendezve", { draggedIndex: draggedFilamentIndex, targetIndex });
    showToast(
      settings.language === "hu" ? "Filamentek átrendezve" :
      settings.language === "de" ? "Filamente neu angeordnet" :
      "Filaments reordered",
      "success"
    );
  };

  const handleDragEnd = () => {
    setDraggedFilamentIndex(null);
  };

  // Kontextus menü funkciók
  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setContextMenu({ index, x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleContextMenuAction = (action: "edit" | "delete") => {
    if (!contextMenu) return;
    const filament = filaments[contextMenu.index];
    if (!filament) {
      closeContextMenu();
      return;
    }

    switch (action) {
      case "edit":
        startEdit(contextMenu.index);
        break;
      case "delete":
        deleteFilament(contextMenu.index);
        break;
    }
    closeContextMenu();
  };

  return (
    <div>
      <h2 style={themeStyles.pageTitle}>{t("filaments.title")}</h2>
      <p style={themeStyles.pageSubtitle}>Filamentek kezelése és szerkesztése</p>
      
      {/* Kereső mező */}
      {filaments.length > 0 && (
        <div style={{ ...themeStyles.card, marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text }}>
            🔍 {settings.language === "hu" ? "Keresés" : settings.language === "de" ? "Suchen" : "Search"}
          </label>
          <input
            type="text"
            placeholder={settings.language === "hu" ? "Keresés márka, típus vagy szín alapján..." : settings.language === "de" ? "Suche nach Marke, Typ oder Farbe..." : "Search by brand, type or color..."}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
            onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
            style={{ ...themeStyles.input, width: "100%", maxWidth: "400px" }}
            aria-label={settings.language === "hu" ? "Keresés filamentek között" : settings.language === "de" ? "Filamente durchsuchen" : "Search filaments"}
            aria-describedby="filament-search-description"
          />
          <span id="filament-search-description" style={{ display: "none" }}>
            {settings.language === "hu" ? "Keresés filamentek között márka, típus vagy szín alapján" : settings.language === "de" ? "Filamente nach Marke, Typ oder Farbe durchsuchen" : "Search filaments by brand, type or color"}
          </span>
        </div>
      )}
      
      {/* Új filament hozzáadása gomb */}
      {!showAddForm && editingIndex === null && (
        <div style={{ marginBottom: "24px" }}>
          <Tooltip content={settings.language === "hu" ? "Új filament hozzáadása (Ctrl/Cmd+N)" : settings.language === "de" ? "Neues Filament hinzufügen (Strg/Cmd+N)" : "Add new filament (Ctrl/Cmd+N)"}>
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
              aria-label={settings.language === "hu" ? "Új filament hozzáadása" : settings.language === "de" ? "Neues Filament hinzufügen" : "Add new filament"}
            >
              ➕ {t("filaments.addTitle")}
            </button>
          </Tooltip>
        </div>
      )}
      
      {/* Új filament hozzáadása form */}
      {(showAddForm || editingIndex !== null) && (
      <div style={{ ...themeStyles.card, marginBottom: "24px", backgroundColor: editingIndex !== null ? theme.colors.primary + "20" : theme.colors.surfaceHover, border: editingIndex !== null ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: theme.colors.text }}>
            {editingIndex !== null ? t("filaments.edit") : "➕ " + t("filaments.addTitle")}
          </h3>
          {editingIndex !== null && (
            <button 
              onClick={cancelEdit}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
              style={{ 
                ...themeStyles.button,
                ...themeStyles.buttonSecondary,
                padding: "8px 16px",
                fontSize: "12px"
              }}
            >
              {t("filaments.cancel")}
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: "40px", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ width: "180px", flexShrink: 0 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text, whiteSpace: "nowrap" }}>
              {t("filaments.brand")}
            </label>
            <input 
              placeholder={t("filaments.brand")} 
              value={brand} 
              onChange={e => setBrand(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
              style={{ ...themeStyles.input, width: "100%" }}
              aria-label={t("filaments.brand")}
              aria-required="true"
            />
          </div>
          <div style={{ width: "180px", flexShrink: 0 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text, whiteSpace: "nowrap" }}>
              {t("filaments.type")}
            </label>
            <input 
              placeholder={t("filaments.type")} 
              value={type} 
              onChange={e => setType(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
              style={{ ...themeStyles.input, width: "100%" }}
              aria-label={t("filaments.type")}
              aria-required="true"
            />
          </div>
          <div style={{ width: "180px", flexShrink: 0 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text, whiteSpace: "nowrap" }}>
              {t("filaments.weight")}
            </label>
            <input 
              type="number" 
              min="1"
              max="10000"
              placeholder={t("filaments.weight")} 
              value={weight} 
              onChange={e => {
                const val = Number(e.target.value);
                const validation = validateFilamentWeight(val, settings.language);
                if (validation.isValid) {
                  setWeight(val);
                } else if (validation.errorMessage) {
                  showToast(validation.errorMessage, "error");
                }
              }}
              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
              style={{ ...themeStyles.input, width: "100%" }}
              aria-label={t("filaments.weight")}
              aria-required="true"
              aria-describedby="filament-weight-description"
            />
            <span id="filament-weight-description" style={{ display: "none" }}>
              {settings.language === "hu" ? "Filament súlya grammban (1-10000)" : settings.language === "de" ? "Filamentgewicht in Gramm (1-10000)" : "Filament weight in grams (1-10000)"}
            </span>
          </div>
          <div style={{ width: "180px", flexShrink: 0 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text, whiteSpace: "nowrap" }}>
              {t("filaments.pricePerKg")}
            </label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              placeholder={t("filaments.pricePerKg")} 
              value={pricePerKg} 
              onChange={e => {
                const val = Number(e.target.value);
                const validation = validateFilamentPrice(val, settings.language);
                if (validation.isValid) {
                  setPricePerKg(val);
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
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text, whiteSpace: "nowrap" }}>
              {t("filaments.color")}
            </label>
            <input 
              placeholder={t("filaments.color")} 
              value={color} 
              onChange={e => setColor(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
              style={{ ...themeStyles.input, width: "100%" }}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "24px", paddingTop: "20px", borderTop: `2px solid ${theme.colors.border}` }}>
          <Tooltip content={settings.language === "hu" ? (editingIndex !== null ? "Mentés (Ctrl/Cmd+S)" : "Hozzáadás (Ctrl/Cmd+S)") : settings.language === "de" ? (editingIndex !== null ? "Speichern (Strg/Cmd+S)" : "Hinzufügen (Strg/Cmd+S)") : (editingIndex !== null ? "Save (Ctrl/Cmd+S)" : "Add (Ctrl/Cmd+S)")}>
            <button 
              onClick={addFilament}
              onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
              onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = editingIndex !== null ? themeStyles.buttonSuccess.boxShadow : themeStyles.buttonPrimary.boxShadow; }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  addFilament();
                }
              }}
              style={{ 
                ...themeStyles.button, 
                ...(editingIndex !== null ? themeStyles.buttonSuccess : themeStyles.buttonPrimary),
                fontSize: "16px",
                padding: "14px 28px"
              }}
              aria-label={editingIndex !== null ? (settings.language === "hu" ? "Filament mentése" : settings.language === "de" ? "Filament speichern" : "Save filament") : (settings.language === "hu" ? "Filament hozzáadása" : settings.language === "de" ? "Filament hinzufügen" : "Add filament")}
            >
              {editingIndex !== null ? t("filaments.save") : "➕ " + t("filaments.add")}
            </button>
          </Tooltip>
          {showAddForm && editingIndex === null && (
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
          )}
        </div>
      </div>
      )}

      {filteredFilaments.length > 0 ? (
        <div style={{ ...themeStyles.card, overflow: "hidden", padding: 0 }}>
          <table style={themeStyles.table}>
            <thead>
              <tr>
                <th style={themeStyles.tableHeader}>{t("filaments.brand")}</th>
                <th style={themeStyles.tableHeader}>{t("filaments.type")}</th>
                <th style={themeStyles.tableHeader}>{t("filaments.color")}</th>
                <th style={themeStyles.tableHeader}>{t("filaments.weight")}</th>
                <th style={themeStyles.tableHeader}>{t("filaments.pricePerKg").replace("€", settings.currency)}</th>
                <th style={themeStyles.tableHeader}>{t("filaments.action")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredFilaments.map((f, i) => {
                const originalIndex = filaments.findIndex(orig => orig === f);
                return (
                <tr 
                  key={i} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, originalIndex)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, originalIndex)}
                  onDragEnd={handleDragEnd}
                  onContextMenu={(e) => handleContextMenu(e, originalIndex)}
                  style={{ 
                    transition: "background-color 0.2s",
                    cursor: draggedFilamentIndex === originalIndex ? "grabbing" : "grab",
                    opacity: draggedFilamentIndex === originalIndex ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (draggedFilamentIndex !== originalIndex) {
                      e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (draggedFilamentIndex !== originalIndex) {
                      e.currentTarget.style.backgroundColor = theme.colors.surface;
                    }
                  }}
                >
                  <td style={themeStyles.tableCell}>{f.brand}</td>
                  <td style={themeStyles.tableCell}>{f.type}</td>
                  <td style={themeStyles.tableCell}>{f.color || "-"}</td>
                  <td style={themeStyles.tableCell}>{f.weight}g</td>
                  <td style={themeStyles.tableCell}>
                    <strong style={{ color: theme.colors.success }}>
                      {filamentPrice(f, settings.currency).toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}/kg
                    </strong>
                  </td>
                  <td style={themeStyles.tableCell}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Tooltip content={settings.language === "hu" ? "Szerkesztés" : settings.language === "de" ? "Bearbeiten" : "Edit"}>
                        <button 
                          onClick={() => startEdit(originalIndex)}
                          disabled={editingIndex !== null && editingIndex !== originalIndex}
                          onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.transform = "translateY(-1px)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                          style={{ 
                            ...themeStyles.button,
                            ...themeStyles.buttonPrimary,
                            padding: "8px 16px",
                            fontSize: "12px",
                            opacity: editingIndex !== null && editingIndex !== originalIndex ? 0.5 : 1,
                            cursor: editingIndex !== null && editingIndex !== originalIndex ? "not-allowed" : "pointer"
                          }}
                        >
                          {t("filaments.edit")}
                        </button>
                      </Tooltip>
                      <Tooltip content={settings.language === "hu" ? "Filament törlése" : settings.language === "de" ? "Filament löschen" : "Delete filament"}>
                        <button 
                          onClick={() => deleteFilament(originalIndex)}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
                          style={{ 
                            ...themeStyles.button,
                            ...themeStyles.buttonDanger,
                            padding: "8px 16px",
                            fontSize: "12px"
                          }}
                        >
                          {t("filaments.delete")}
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : filaments.length > 0 && searchTerm ? (
        <div style={{ ...themeStyles.card, textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: "16px" }}>
            {settings.language === "hu" ? "Nincs találat a keresési kifejezésre." : settings.language === "de" ? "Keine Ergebnisse für den Suchbegriff." : "No results found for the search term."}
          </p>
        </div>
      ) : (
        <div style={{ ...themeStyles.card, textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🧵</div>
          <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: "16px" }}>{t("filaments.empty")}</p>
        </div>
      )}
      
      <ConfirmDialog
        isOpen={deleteConfirmIndex !== null}
        title={t("common.confirm")}
        message={t("common.confirmDeleteFilament")}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmIndex(null)}
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
                color: theme.colors.text,
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
