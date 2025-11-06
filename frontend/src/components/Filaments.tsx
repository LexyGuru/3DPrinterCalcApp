import React, { useState } from "react";
import { save, open } from "@tauri-apps/plugin-dialog";
import { writeTextFile, readTextFile } from "@tauri-apps/plugin-fs";
import type { Filament, Settings } from "../types";
import type { Theme } from "../utils/themes";
import { filamentPrice } from "../utils/filamentCalc";
import { useTranslation } from "../utils/translations";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";
import { useKeyboardShortcut } from "../utils/keyboardShortcuts";
import { Tooltip } from "./Tooltip";

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

  const handleExportCSV = async () => {
    try {
      console.log("📤 CSV export indítása...", { filamentsCount: filaments.length });
      
      const csvRows: string[] = [];
      csvRows.push("Márka,Típus,Súly (g),Ár (€/kg),Szín");
      filaments.forEach(f => {
        csvRows.push(`${f.brand},${f.type},${f.weight},${f.pricePerKg},${f.color || ""}`);
      });
      const csvContent = csvRows.join("\n");

      const filePath = await save({
        defaultPath: `filaments_${new Date().toISOString().split("T")[0]}.csv`,
        filters: [{
          name: "CSV",
          extensions: ["csv"]
        }]
      });

      if (filePath) {
        console.log("💾 CSV fájl mentése...", { filePath });
        await writeTextFile(filePath, csvContent);
        console.log("✅ CSV export sikeres", { filePath });
        showToast(
          settings.language === "hu" ? "Filamentek sikeresen exportálva CSV formátumban" :
          settings.language === "de" ? "Filamente erfolgreich als CSV exportiert" :
          "Filaments exported successfully as CSV",
          "success"
        );
      } else {
        console.log("ℹ️ CSV export megszakítva");
      }
    } catch (error) {
      console.error("❌ CSV export hiba:", error);
      showToast(
        settings.language === "hu" ? "Hiba történt a CSV export során" :
        settings.language === "de" ? "Fehler beim CSV-Export" :
        "Error exporting CSV",
        "error"
      );
    }
  };

  const handleImportCSV = async () => {
    try {
      console.log("📥 CSV import indítása...");
      
      const selected = await open({
        multiple: false,
        filters: [{
          name: "CSV",
          extensions: ["csv"]
        }]
      });

      if (!selected) {
        console.log("ℹ️ CSV import megszakítva");
        return;
      }

      const filePath = Array.isArray(selected) ? selected[0] : selected;
      if (!filePath || typeof filePath !== "string") {
        showToast(
          settings.language === "hu" ? "Érvénytelen fájl kiválasztás" :
          settings.language === "de" ? "Ungültige Dateiauswahl" :
          "Invalid file selection",
          "error"
        );
        return;
      }

      console.log("📂 CSV fájl betöltése...", { filePath });
      const fileContent = await readTextFile(filePath);
      const lines = fileContent.split("\n").filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error("CSV fájl üres vagy nem tartalmaz adatokat");
      }

      // Első sor a fejléc, azt kihagyjuk
      const importedFilaments: Filament[] = [];
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(",").map(col => col.trim());
        if (columns.length >= 4) {
          const brand = columns[0];
          const type = columns[1];
          const weight = Number(columns[2]);
          const pricePerKg = Number(columns[3]);
          const color = columns[4] || undefined;

          if (brand && type && !isNaN(weight) && weight > 0 && !isNaN(pricePerKg) && pricePerKg >= 0) {
            importedFilaments.push({ brand, type, weight, pricePerKg, color });
          }
        }
      }

      if (importedFilaments.length === 0) {
        throw new Error("Nem sikerült importálni egyetlen filamentet sem");
      }

      console.log("✅ CSV import sikeres", { importedCount: importedFilaments.length });
      setFilaments([...filaments, ...importedFilaments]);
      showToast(
        settings.language === "hu" ? `${importedFilaments.length} filament sikeresen importálva` :
        settings.language === "de" ? `${importedFilaments.length} Filamente erfolgreich importiert` :
        `${importedFilaments.length} filaments imported successfully`,
        "success"
      );
    } catch (error) {
      console.error("❌ CSV import hiba:", error);
      showToast(
        settings.language === "hu" ? "Hiba történt a CSV import során: " + (error as Error).message :
        settings.language === "de" ? "Fehler beim CSV-Import: " + (error as Error).message :
        "Error importing CSV: " + (error as Error).message,
        "error"
      );
    }
  };

  const handleExportJSON = async () => {
    try {
      console.log("📤 JSON export indítása...", { filamentsCount: filaments.length });
      
      const exportData = { filaments };
      const jsonContent = JSON.stringify(exportData, null, 2);

      const filePath = await save({
        defaultPath: `filaments_${new Date().toISOString().split("T")[0]}.json`,
        filters: [{
          name: "JSON",
          extensions: ["json"]
        }]
      });

      if (filePath) {
        console.log("💾 JSON fájl mentése...", { filePath });
        await writeTextFile(filePath, jsonContent);
        console.log("✅ JSON export sikeres", { filePath });
        showToast(
          settings.language === "hu" ? "Filamentek sikeresen exportálva JSON formátumban" :
          settings.language === "de" ? "Filamente erfolgreich als JSON exportiert" :
          "Filaments exported successfully as JSON",
          "success"
        );
      } else {
        console.log("ℹ️ JSON export megszakítva");
      }
    } catch (error) {
      console.error("❌ JSON export hiba:", error);
      showToast(
        settings.language === "hu" ? "Hiba történt a JSON export során" :
        settings.language === "de" ? "Fehler beim JSON-Export" :
        "Error exporting JSON",
        "error"
      );
    }
  };

  const handleImportJSON = async () => {
    try {
      console.log("📥 JSON import indítása...");
      
      const selected = await open({
        multiple: false,
        filters: [{
          name: "JSON",
          extensions: ["json"]
        }]
      });

      if (!selected) {
        console.log("ℹ️ JSON import megszakítva");
        return;
      }

      const filePath = Array.isArray(selected) ? selected[0] : selected;
      if (!filePath || typeof filePath !== "string") {
        showToast(
          settings.language === "hu" ? "Érvénytelen fájl kiválasztás" :
          settings.language === "de" ? "Ungültige Dateiauswahl" :
          "Invalid file selection",
          "error"
        );
        return;
      }

      console.log("📂 JSON fájl betöltése...", { filePath });
      const fileContent = await readTextFile(filePath);
      const importData = JSON.parse(fileContent);

      if (!importData.filaments || !Array.isArray(importData.filaments)) {
        throw new Error("Érvénytelen JSON formátum");
      }

      console.log("✅ JSON import sikeres", { importedCount: importData.filaments.length });
      setFilaments([...filaments, ...importData.filaments]);
      showToast(
        settings.language === "hu" ? `${importData.filaments.length} filament sikeresen importálva` :
        settings.language === "de" ? `${importData.filaments.length} Filamente erfolgreich importiert` :
        `${importData.filaments.length} filaments imported successfully`,
        "success"
      );
    } catch (error) {
      console.error("❌ JSON import hiba:", error);
      showToast(
        settings.language === "hu" ? "Hiba történt a JSON import során: " + (error as Error).message :
        settings.language === "de" ? "Fehler beim JSON-Import: " + (error as Error).message :
        "Error importing JSON: " + (error as Error).message,
        "error"
      );
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h2 style={themeStyles.pageTitle}>{t("filaments.title")}</h2>
          <p style={themeStyles.pageSubtitle}>Filamentek kezelése és szerkesztése</p>
        </div>
        {filaments.length > 0 && (
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <Tooltip content={settings.language === "hu" ? "CSV export" : settings.language === "de" ? "CSV exportieren" : "Export CSV"}>
              <button
                onClick={handleExportCSV}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.surface;
                }}
              >
                📊 CSV
              </button>
            </Tooltip>
            <Tooltip content={settings.language === "hu" ? "JSON export" : settings.language === "de" ? "JSON exportieren" : "Export JSON"}>
              <button
                onClick={handleExportJSON}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.surface;
                }}
              >
                📄 JSON
              </button>
            </Tooltip>
            <Tooltip content={settings.language === "hu" ? "CSV import" : settings.language === "de" ? "CSV importieren" : "Import CSV"}>
              <button
                onClick={handleImportCSV}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: theme.colors.primary,
                  color: "#fff",
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.primary + "dd";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.primary;
                }}
              >
                📥 CSV
              </button>
            </Tooltip>
            <Tooltip content={settings.language === "hu" ? "JSON import" : settings.language === "de" ? "JSON importieren" : "Import JSON"}>
              <button
                onClick={handleImportJSON}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: theme.colors.primary,
                  color: "#fff",
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.primary + "dd";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.primary;
                }}
              >
                📥 JSON
              </button>
            </Tooltip>
          </div>
        )}
      </div>
      
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
          />
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
              style={{ 
                ...themeStyles.button,
                ...themeStyles.buttonPrimary,
                fontSize: "16px",
                padding: "14px 28px"
              }}
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
                if (!isNaN(val) && val >= 1 && val <= 10000) {
                  setWeight(val);
                }
              }}
              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
              style={{ ...themeStyles.input, width: "100%" }}
            />
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
                if (!isNaN(val) && val >= 0 && val <= 1000000) {
                  setPricePerKg(val);
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
              style={{ 
                ...themeStyles.button, 
                ...(editingIndex !== null ? themeStyles.buttonSuccess : themeStyles.buttonPrimary),
                fontSize: "16px",
                padding: "14px 28px"
              }}
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
                style={{ 
                  ...themeStyles.button,
                  ...themeStyles.buttonSecondary,
                  padding: "8px 16px",
                  fontSize: "12px",
                  marginLeft: "10px"
                }}
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
                <tr key={i} style={{ transition: "background-color 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.surfaceHover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.surface}
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
    </div>
  );
};
