import React, { useState } from "react";
import type { Filament, Settings } from "../types";
import { filamentPrice } from "../utils/filamentCalc";
import { useTranslation } from "../utils/translations";
import { commonStyles } from "../utils/styles";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";

interface Props {
  filaments: Filament[];
  setFilaments: (f: Filament[]) => void;
  settings: Settings;
}

export const Filaments: React.FC<Props> = ({ filaments, setFilaments, settings }) => {
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
      const updated = [...filaments];
      updated[editingIndex] = { brand, type, weight, pricePerKg, color: color || undefined };
      setFilaments(updated);
      showToast(t("common.filamentUpdated"), "success");
      resetForm();
    } else {
      // Új filament hozzáadása
      setFilaments([...filaments, { brand, type, weight, pricePerKg, color: color || undefined }]);
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
    setFilaments(filaments.filter((_, i) => i !== index));
    if (editingIndex === index) {
      resetForm();
    }
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

  return (
    <div>
      <h2 style={commonStyles.pageTitle}>{t("filaments.title")}</h2>
      <p style={commonStyles.pageSubtitle}>Filamentek kezelése és szerkesztése</p>
      
      {/* Kereső mező */}
      {filaments.length > 0 && (
        <div style={{ ...commonStyles.card, marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#212529" }}>
            🔍 {settings.language === "hu" ? "Keresés" : settings.language === "de" ? "Suchen" : "Search"}
          </label>
          <input
            type="text"
            placeholder={settings.language === "hu" ? "Keresés márka, típus vagy szín alapján..." : settings.language === "de" ? "Suche nach Marke, Typ oder Farbe..." : "Search by brand, type or color..."}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={(e) => Object.assign(e.target.style, commonStyles.inputFocus)}
            onBlur={(e) => { e.target.style.borderColor = "#e9ecef"; e.target.style.boxShadow = "none"; }}
            style={{ ...commonStyles.input, width: "100%", maxWidth: "400px" }}
          />
        </div>
      )}
      
      {/* Új filament hozzáadása gomb */}
      {!showAddForm && editingIndex === null && (
        <div style={{ marginBottom: "24px" }}>
          <button
            onClick={() => setShowAddForm(true)}
            onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, commonStyles.buttonHover)}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = commonStyles.buttonPrimary.boxShadow; }}
            style={{ 
              ...commonStyles.button,
              ...commonStyles.buttonPrimary,
              fontSize: "16px",
              padding: "14px 28px"
            }}
          >
            ➕ {t("filaments.addTitle")}
          </button>
        </div>
      )}
      
      {/* Új filament hozzáadása form */}
      {(showAddForm || editingIndex !== null) && (
      <div style={{ ...commonStyles.card, marginBottom: "24px", backgroundColor: editingIndex !== null ? "#fff3cd" : "#f8f9fa", border: editingIndex !== null ? "2px solid #ffc107" : "1px solid #e9ecef" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#495057" }}>
            {editingIndex !== null ? "✏️ " + t("filaments.edit") : "➕ " + t("filaments.addTitle")}
          </h3>
          {editingIndex !== null && (
            <button 
              onClick={cancelEdit}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
              style={{ 
                ...commonStyles.button,
                ...commonStyles.buttonSecondary,
                padding: "8px 16px",
                fontSize: "12px"
              }}
            >
              ✖️ {t("filaments.cancel")}
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: "40px", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ width: "180px", flexShrink: 0 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#212529", whiteSpace: "nowrap" }}>
              {t("filaments.brand")}
            </label>
            <input 
              placeholder={t("filaments.brand")} 
              value={brand} 
              onChange={e => setBrand(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, commonStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = "#e9ecef"; e.target.style.boxShadow = "none"; }}
              style={{ ...commonStyles.input, width: "100%" }}
            />
          </div>
          <div style={{ width: "180px", flexShrink: 0 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#212529", whiteSpace: "nowrap" }}>
              {t("filaments.type")}
            </label>
            <input 
              placeholder={t("filaments.type")} 
              value={type} 
              onChange={e => setType(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, commonStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = "#e9ecef"; e.target.style.boxShadow = "none"; }}
              style={{ ...commonStyles.input, width: "100%" }}
            />
          </div>
          <div style={{ width: "180px", flexShrink: 0 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#212529", whiteSpace: "nowrap" }}>
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
                if (val >= 0 && val <= 10000) {
                  setWeight(val);
                }
              }}
              onFocus={(e) => Object.assign(e.target.style, commonStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = "#e9ecef"; e.target.style.boxShadow = "none"; }}
              style={{ ...commonStyles.input, width: "100%" }}
            />
          </div>
          <div style={{ width: "180px", flexShrink: 0 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#212529", whiteSpace: "nowrap" }}>
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
                if (val >= 0) {
                  setPricePerKg(val);
                }
              }}
              onFocus={(e) => Object.assign(e.target.style, commonStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = "#e9ecef"; e.target.style.boxShadow = "none"; }}
              style={{ ...commonStyles.input, width: "100%" }}
            />
          </div>
          <div style={{ width: "180px", flexShrink: 0 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#212529", whiteSpace: "nowrap" }}>
              {t("filaments.color")}
            </label>
            <input 
              placeholder={t("filaments.color")} 
              value={color} 
              onChange={e => setColor(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, commonStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = "#e9ecef"; e.target.style.boxShadow = "none"; }}
              style={{ ...commonStyles.input, width: "100%" }}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "24px", paddingTop: "20px", borderTop: "2px solid #e9ecef" }}>
          <button 
            onClick={addFilament}
            onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, commonStyles.buttonHover)}
            onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = editingIndex !== null ? commonStyles.buttonSuccess.boxShadow : commonStyles.buttonPrimary.boxShadow; }}
            style={{ 
              ...commonStyles.button, 
              ...(editingIndex !== null ? commonStyles.buttonSuccess : commonStyles.buttonPrimary),
              fontSize: "16px",
              padding: "14px 28px"
            }}
          >
            {editingIndex !== null ? "💾 " + t("filaments.save") : "➕ " + t("filaments.add")}
          </button>
        </div>
      </div>

      {filteredFilaments.length > 0 ? (
        <div style={{ ...commonStyles.card, overflow: "hidden", padding: 0 }}>
          <table style={commonStyles.table}>
            <thead>
              <tr>
                <th style={commonStyles.tableHeader}>{t("filaments.brand")}</th>
                <th style={commonStyles.tableHeader}>{t("filaments.type")}</th>
                <th style={commonStyles.tableHeader}>{t("filaments.color")}</th>
                <th style={commonStyles.tableHeader}>{t("filaments.weight")}</th>
                <th style={commonStyles.tableHeader}>{t("filaments.pricePerKg").replace("€", settings.currency)}</th>
                <th style={commonStyles.tableHeader}>{t("filaments.action")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredFilaments.map((f, i) => {
                const originalIndex = filaments.findIndex(orig => orig === f);
                return (
                <tr key={i} style={{ transition: "background-color 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff"}
                >
                  <td style={commonStyles.tableCell}>{f.brand}</td>
                  <td style={commonStyles.tableCell}>{f.type}</td>
                  <td style={commonStyles.tableCell}>{f.color || "-"}</td>
                  <td style={commonStyles.tableCell}>{f.weight}g</td>
                  <td style={commonStyles.tableCell}>
                    <strong style={{ color: "#28a745" }}>
                      {filamentPrice(f, settings.currency).toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}/kg
                    </strong>
                  </td>
                  <td style={commonStyles.tableCell}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        onClick={() => startEdit(originalIndex)}
                        disabled={editingIndex !== null && editingIndex !== originalIndex}
                        onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                        style={{ 
                          ...commonStyles.button,
                          ...commonStyles.buttonPrimary,
                          padding: "8px 16px",
                          fontSize: "12px",
                          opacity: editingIndex !== null && editingIndex !== originalIndex ? 0.5 : 1,
                          cursor: editingIndex !== null && editingIndex !== originalIndex ? "not-allowed" : "pointer"
                        }}
                      >
                        {t("filaments.edit")}
                      </button>
                      <button 
                        onClick={() => deleteFilament(originalIndex)}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
                        style={{ 
                          ...commonStyles.button,
                          ...commonStyles.buttonDanger,
                          padding: "8px 16px",
                          fontSize: "12px"
                        }}
                      >
                        {t("filaments.delete")}
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : filaments.length > 0 && searchTerm ? (
        <div style={{ ...commonStyles.card, textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <p style={{ margin: 0, color: "#6c757d", fontSize: "16px" }}>
            {settings.language === "hu" ? "Nincs találat a keresési kifejezésre." : settings.language === "de" ? "Keine Ergebnisse für den Suchbegriff." : "No results found for the search term."}
          </p>
        </div>
      ) : (
        <div style={{ ...commonStyles.card, textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🧵</div>
          <p style={{ margin: 0, color: "#6c757d", fontSize: "16px" }}>{t("filaments.empty")}</p>
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
