import React, { useState } from "react";
import type { Printer, Settings, AMS } from "../types";
import { useTranslation } from "../utils/translations";
import { convertCurrency } from "../utils/currency";
import { commonStyles } from "../utils/styles";

interface Props {
  printers: Printer[];
  setPrinters: (p: Printer[]) => void;
  settings: Settings;
}

export const Printers: React.FC<Props> = ({ printers, setPrinters, settings }) => {
  const t = useTranslation(settings.language);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [power, setPower] = useState<number>(0);
  const [usageCost, setUsageCost] = useState<number>(0);
  const [amsCount, setAmsCount] = useState<number>(0);
  const [editingPrinterId, setEditingPrinterId] = useState<number | null>(null);
  const [amsForms, setAmsForms] = useState<Record<number, { brand: string; name: string; power: number }[]>>({});

  const addPrinter = () => {
    if (!name || !type || !power) return;
    const newId = Date.now();
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
    setName(""); setType(""); setPower(0); setUsageCost(0); setAmsCount(0);
  };

  const deletePrinter = (id: number) => {
    setPrinters(printers.filter(p => p.id !== id));
    const newAmsForms = { ...amsForms };
    delete newAmsForms[id];
    setAmsForms(newAmsForms);
    if (editingPrinterId === id) setEditingPrinterId(null);
  };

  const saveAMS = (printerId: number) => {
    const printer = printers.find(p => p.id === printerId);
    if (!printer) return;
    const amsList = amsForms[printerId] || [];
    const validAMS: AMS[] = amsList
      .map((ams, idx) => ({ id: idx, brand: ams.brand, name: ams.name, power: ams.power }))
      .filter(ams => ams.brand && ams.name && ams.power > 0);
    
    setPrinters(printers.map(p => 
      p.id === printerId 
        ? { ...p, ams: validAMS, amsCount: validAMS.length }
        : p
    ));
    setEditingPrinterId(null);
  };

  const updateAMSForm = (printerId: number, index: number, field: "brand" | "name" | "power", value: string | number) => {
    const currentForms = amsForms[printerId] || [];
    const updated = [...currentForms];
    updated[index] = { ...updated[index], [field]: value };
    setAmsForms({ ...amsForms, [printerId]: updated });
  };

  return (
    <div>
      <h2 style={commonStyles.pageTitle}>{t("printers.title")}</h2>
      <p style={commonStyles.pageSubtitle}>Nyomtatók és AMS rendszerek kezelése</p>
      
      <div style={{ ...commonStyles.card, marginBottom: "24px", backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}>
        <h3 style={{ marginTop: 0, marginBottom: "24px", fontSize: "20px", fontWeight: "600", color: "#495057" }}>
          ➕ {t("printers.addTitle")}
        </h3>
        <div style={{ display: "flex", gap: "40px", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ width: "180px", flexShrink: 0 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#212529", whiteSpace: "nowrap" }}>
              {t("printers.name")}
            </label>
            <input 
              placeholder={t("printers.name")} 
              value={name} 
              onChange={e => setName(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, commonStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = "#e9ecef"; e.target.style.boxShadow = "none"; }}
              style={{ ...commonStyles.input, width: "100%" }}
            />
          </div>
          <div style={{ width: "180px", flexShrink: 0 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#212529", whiteSpace: "nowrap" }}>
              {t("printers.type")}
            </label>
            <input 
              placeholder={t("printers.type")} 
              value={type} 
              onChange={e => setType(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, commonStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = "#e9ecef"; e.target.style.boxShadow = "none"; }}
              style={{ ...commonStyles.input, width: "100%" }}
            />
          </div>
          <div style={{ width: "180px", flexShrink: 0 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#212529", whiteSpace: "nowrap" }}>
              {t("printers.power")}
            </label>
            <input 
              type="number" 
              placeholder={t("printers.power")} 
              value={power} 
              onChange={e => setPower(Number(e.target.value))}
              onFocus={(e) => Object.assign(e.target.style, commonStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = "#e9ecef"; e.target.style.boxShadow = "none"; }}
              style={{ ...commonStyles.input, width: "100%" }}
            />
          </div>
          <div style={{ width: "180px", flexShrink: 0 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#212529", whiteSpace: "nowrap" }}>
              {t("printers.usageCost")}
            </label>
            <input 
              type="number" 
              step="0.01"
              placeholder={t("printers.usageCost")} 
              value={usageCost} 
              onChange={e => setUsageCost(Number(e.target.value))}
              onFocus={(e) => Object.assign(e.target.style, commonStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = "#e9ecef"; e.target.style.boxShadow = "none"; }}
              style={{ ...commonStyles.input, width: "100%" }}
            />
          </div>
          <div style={{ width: "180px", flexShrink: 0 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#212529", whiteSpace: "nowrap" }}>
              {t("printers.amsCount")}
            </label>
            <input 
              type="number" 
              min="0"
              max="4"
              placeholder="0" 
              value={amsCount} 
              onChange={e => setAmsCount(Math.min(4, Math.max(0, Number(e.target.value))))}
              onFocus={(e) => Object.assign(e.target.style, commonStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = "#e9ecef"; e.target.style.boxShadow = "none"; }}
              style={{ ...commonStyles.input, width: "100%" }}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "24px", paddingTop: "20px", borderTop: "2px solid #e9ecef" }}>
          <button 
            onClick={addPrinter}
            onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, commonStyles.buttonHover)}
            onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = commonStyles.buttonPrimary.boxShadow; }}
            style={{ 
              ...commonStyles.button,
              ...commonStyles.buttonPrimary,
              fontSize: "16px",
              padding: "14px 28px"
            }}
          >
            ➕ {t("printers.add")}
          </button>
        </div>
      </div>

      {printers.length > 0 ? (
        <div style={{ ...commonStyles.card, overflow: "hidden", padding: 0 }}>
          <table style={commonStyles.table}>
            <thead>
              <tr>
                <th style={commonStyles.tableHeader}>{t("printers.name")}</th>
                <th style={commonStyles.tableHeader}>{t("printers.type")}</th>
                <th style={commonStyles.tableHeader}>{t("printers.power")}</th>
                <th style={commonStyles.tableHeader}>{t("printers.usageCost")}</th>
                <th style={commonStyles.tableHeader}>{t("printers.ams")}</th>
                <th style={commonStyles.tableHeader}>{t("printers.action")}</th>
              </tr>
            </thead>
            <tbody>
              {printers.map(p => (
                <React.Fragment key={p.id}>
                  <tr style={{ transition: "background-color 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff"}
                  >
                    <td style={commonStyles.tableCell}><strong>{p.name}</strong></td>
                    <td style={commonStyles.tableCell}>{p.type}</td>
                    <td style={commonStyles.tableCell}>{p.power}W</td>
                    <td style={commonStyles.tableCell}>
                      <strong style={{ color: "#28a745" }}>
                        {(() => {
                          const convertedCost = convertCurrency(p.usageCost, settings.currency);
                          const currencySymbol = settings.currency === "HUF" ? "Ft" : settings.currency;
                          return `${convertedCost.toFixed(2)} ${currencySymbol}/h`;
                        })()}
                      </strong>
                    </td>
                    <td style={commonStyles.tableCell}>
                      {p.amsCount || 0} {t("printers.ams")}
                    </td>
                    <td style={commonStyles.tableCell}>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {p.amsCount && p.amsCount > 0 && (
                          <button 
                            onClick={() => {
                              if (editingPrinterId === p.id) {
                                setEditingPrinterId(null);
                              } else {
                                const currentAMS = p.ams || [];
                                setAmsForms({ 
                                  ...amsForms, 
                                  [p.id]: currentAMS.length > 0 
                                    ? currentAMS.map(a => ({ brand: a.brand, name: a.name, power: a.power }))
                                    : Array(p.amsCount || 0).fill(null).map(() => ({ brand: "", name: "", power: 0 }))
                                });
                                setEditingPrinterId(p.id);
                              }
                            }}
                            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.transform = "translateY(-1px)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                            style={{ 
                              ...commonStyles.button,
                              ...(editingPrinterId === p.id ? commonStyles.buttonSuccess : commonStyles.buttonPrimary),
                              padding: "8px 16px",
                              fontSize: "12px"
                            }}
                          >
                            {editingPrinterId === p.id ? t("printers.save") : t("printers.edit")}
                          </button>
                        )}
                        <button 
                          onClick={() => deletePrinter(p.id)}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
                          style={{ 
                            ...commonStyles.button,
                            ...commonStyles.buttonDanger,
                            padding: "8px 16px",
                            fontSize: "12px"
                          }}
                        >
                          {t("printers.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
              {editingPrinterId === p.id && p.amsCount && p.amsCount > 0 && (
                <tr>
                  <td colSpan={6} style={{ ...commonStyles.tableCell, padding: "24px", backgroundColor: "#f8f9fa" }}>
                    <div>
                      <h4 style={{ marginTop: 0, marginBottom: "16px", fontSize: "18px", fontWeight: "600", color: "#495057" }}>
                        🔧 {t("printers.amsSystems")} ({p.amsCount})
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "16px" }}>
                        {(amsForms[p.id] || []).map((ams, idx) => (
                          <div key={idx} style={{ ...commonStyles.card, padding: "16px" }}>
                            <strong style={{ display: "block", marginBottom: "12px", fontSize: "14px", color: "#495057" }}>
                              {t("printers.ams")} {idx + 1}:
                            </strong>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
                              <input
                                placeholder={t("printers.amsBrand")}
                                value={ams.brand}
                                onChange={e => updateAMSForm(p.id, idx, "brand", e.target.value)}
                                onFocus={(e) => Object.assign(e.target.style, commonStyles.inputFocus)}
                                onBlur={(e) => { e.target.style.borderColor = "#e9ecef"; e.target.style.boxShadow = "none"; }}
                                style={{ ...commonStyles.input, width: "100%" }}
                              />
                              <input
                                placeholder={t("printers.amsName")}
                                value={ams.name}
                                onChange={e => updateAMSForm(p.id, idx, "name", e.target.value)}
                                onFocus={(e) => Object.assign(e.target.style, commonStyles.inputFocus)}
                                onBlur={(e) => { e.target.style.borderColor = "#e9ecef"; e.target.style.boxShadow = "none"; }}
                                style={{ ...commonStyles.input, width: "100%" }}
                              />
                              <input
                                type="number"
                                placeholder={t("printers.amsPower")}
                                value={ams.power || ""}
                                onChange={e => updateAMSForm(p.id, idx, "power", Number(e.target.value))}
                                onFocus={(e) => Object.assign(e.target.style, commonStyles.inputFocus)}
                                onBlur={(e) => { e.target.style.borderColor = "#e9ecef"; e.target.style.boxShadow = "none"; }}
                                style={{ ...commonStyles.input, width: "100%" }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => saveAMS(p.id)}
                        onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, commonStyles.buttonHover)}
                        onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = commonStyles.buttonSuccess.boxShadow; }}
                        style={{ 
                          ...commonStyles.button,
                          ...commonStyles.buttonSuccess
                        }}
                      >
                        {t("printers.save")}
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
          </table>
        </div>
      ) : (
        <div style={{ ...commonStyles.card, textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🖨️</div>
          <p style={{ margin: 0, color: "#6c757d", fontSize: "16px" }}>{t("printers.empty")}</p>
        </div>
      )}
    </div>
  );
};
