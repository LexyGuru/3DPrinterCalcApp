import React, { useState } from "react";
import type { Filament, Settings } from "../types";
import { filamentPrice } from "../utils/filamentCalc";
import { useTranslation } from "../utils/translations";
import { commonStyles } from "../utils/styles";

interface Props {
  filaments: Filament[];
  setFilaments: (f: Filament[]) => void;
  settings: Settings;
}

export const Filaments: React.FC<Props> = ({ filaments, setFilaments, settings }) => {
  const t = useTranslation(settings.language);
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [weight, setWeight] = useState<number>(1000);
  const [pricePerKg, setPricePerKg] = useState<number>(0);
  const [color, setColor] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const resetForm = () => {
    setBrand("");
    setType("");
    setWeight(1000);
    setPricePerKg(0);
    setColor("");
    setEditingIndex(null);
  };

  const addFilament = () => {
    if (!brand || !type || !pricePerKg) return;
    
    if (editingIndex !== null) {
      // Szerkesztési mód: frissítjük a filamentet
      const updated = [...filaments];
      updated[editingIndex] = { brand, type, weight, pricePerKg, color: color || undefined };
      setFilaments(updated);
      resetForm();
    } else {
      // Új filament hozzáadása
      setFilaments([...filaments, { brand, type, weight, pricePerKg, color: color || undefined }]);
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
    setFilaments(filaments.filter((_, i) => i !== index));
    if (editingIndex === index) {
      resetForm();
    }
  };

  return (
    <div>
      <h2 style={commonStyles.pageTitle}>{t("filaments.title")}</h2>
      <p style={commonStyles.pageSubtitle}>Filamentek kezelése és szerkesztése</p>
      
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
              placeholder={t("filaments.weight")} 
              value={weight} 
              onChange={e => setWeight(Number(e.target.value))}
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
              placeholder={t("filaments.pricePerKg")} 
              value={pricePerKg} 
              onChange={e => setPricePerKg(Number(e.target.value))}
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

      {filaments.length > 0 ? (
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
              {filaments.map((f, i) => (
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
                        onClick={() => startEdit(i)}
                        disabled={editingIndex !== null && editingIndex !== i}
                        onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                        style={{ 
                          ...commonStyles.button,
                          ...commonStyles.buttonPrimary,
                          padding: "8px 16px",
                          fontSize: "12px",
                          opacity: editingIndex !== null && editingIndex !== i ? 0.5 : 1,
                          cursor: editingIndex !== null && editingIndex !== i ? "not-allowed" : "pointer"
                        }}
                      >
                        {t("filaments.edit")}
                      </button>
                      <button 
                        onClick={() => deleteFilament(i)}
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
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ ...commonStyles.card, textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🧵</div>
          <p style={{ margin: 0, color: "#6c757d", fontSize: "16px" }}>{t("filaments.empty")}</p>
        </div>
      )}
    </div>
  );
};
