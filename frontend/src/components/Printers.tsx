import React, { useState } from "react";
import type { Printer, Settings, AMS } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { convertCurrency } from "../utils/currency";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";

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
  const [amsForms, setAmsForms] = useState<Record<number, { brand: string; name: string; power: number }[]>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

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
    setPrinters(printers.filter(p => p.id !== id));
    const newAmsForms = { ...amsForms };
    delete newAmsForms[id];
    setAmsForms(newAmsForms);
    if (editingPrinterId === id) setEditingPrinterId(null);
    showToast(t("common.printerDeleted"), "success");
    setDeleteConfirmId(null);
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

  // Szűrés a keresési kifejezés alapján
  const filteredPrinters = printers.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.type.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <h2 style={themeStyles.pageTitle}>{t("printers.title")}</h2>
      <p style={themeStyles.pageSubtitle}>Nyomtatók és AMS rendszerek kezelése</p>
      
      {/* Kereső mező */}
      {printers.length > 0 && (
        <div style={{ ...themeStyles.card, marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text }}>
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
          />
        </div>
      )}
      
      {/* Új nyomtató hozzáadása gomb */}
      {!showAddForm && (
        <div style={{ marginBottom: "24px" }}>
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
            ➕ {t("printers.addTitle")}
          </button>
        </div>
      )}
      
      {/* Új nyomtató hozzáadása form */}
      {showAddForm && (
      <div style={{ ...themeStyles.card, marginBottom: "24px", backgroundColor: theme.colors.surfaceHover, border: `1px solid ${theme.colors.border}` }}>
        <h3 style={{ marginTop: 0, marginBottom: "24px", fontSize: "20px", fontWeight: "600", color: theme.colors.text }}>
          ➕ {t("printers.addTitle")}
        </h3>
        <div style={{ display: "flex", gap: "40px", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ width: "180px", flexShrink: 0 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text, whiteSpace: "nowrap" }}>
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
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text, whiteSpace: "nowrap" }}>
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
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text, whiteSpace: "nowrap" }}>
              {t("printers.power")}
            </label>
            <input 
              type="number" 
              placeholder={t("printers.power")} 
              value={power} 
              onChange={e => setPower(Number(e.target.value))}
              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
              style={{ ...themeStyles.input, width: "100%" }}
            />
          </div>
          <div style={{ width: "180px", flexShrink: 0 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text, whiteSpace: "nowrap" }}>
              {t("printers.usageCost")}
            </label>
            <input 
              type="number" 
              step="0.01"
              placeholder={t("printers.usageCost")} 
              value={usageCost} 
              onChange={e => setUsageCost(Number(e.target.value))}
              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
              style={{ ...themeStyles.input, width: "100%" }}
            />
          </div>
          <div style={{ width: "180px", flexShrink: 0 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text, whiteSpace: "nowrap" }}>
              {t("printers.amsCount")}
            </label>
            <input 
              type="number" 
              min="0"
              max="4"
              placeholder="0" 
              value={amsCount} 
              onChange={e => setAmsCount(Math.min(4, Math.max(0, Number(e.target.value))))}
              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
              style={{ ...themeStyles.input, width: "100%" }}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "24px", paddingTop: "20px", borderTop: `2px solid ${theme.colors.border}` }}>
          <button 
            onClick={addPrinter}
            onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
            onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonPrimary.boxShadow; }}
            style={{ 
              ...themeStyles.button,
              ...themeStyles.buttonPrimary,
              fontSize: "16px",
              padding: "14px 28px"
            }}
          >
            ➕ {t("printers.add")}
          </button>
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
                  <tr style={{ transition: "background-color 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.surfaceHover}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.surface}
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
                              ...themeStyles.button,
                              ...(editingPrinterId === p.id ? themeStyles.buttonSuccess : themeStyles.buttonPrimary),
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
                            ...themeStyles.button,
                            ...themeStyles.buttonDanger,
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
                  <td colSpan={6} style={{ ...themeStyles.tableCell, padding: "24px", backgroundColor: theme.colors.surfaceHover }}>
                    <div>
                      <h4 style={{ marginTop: 0, marginBottom: "16px", fontSize: "18px", fontWeight: "600", color: theme.colors.text }}>
                        🔧 {t("printers.amsSystems")} ({p.amsCount})
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "16px" }}>
                        {(amsForms[p.id] || []).map((ams, idx) => (
                          <div key={idx} style={{ ...themeStyles.card, padding: "16px" }}>
                            <strong style={{ display: "block", marginBottom: "12px", fontSize: "14px", color: theme.colors.text }}>
                              {t("printers.ams")} {idx + 1}:
                            </strong>
                            <div style={{ display: "flex", gap: "40px", alignItems: "flex-end", flexWrap: "wrap" }}>
                              <div style={{ width: "180px", flexShrink: 0 }}>
                                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text, whiteSpace: "nowrap" }}>
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
                                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text, whiteSpace: "nowrap" }}>
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
                                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text, whiteSpace: "nowrap" }}>
                                  {t("printers.amsPower")}
                                </label>
                                <input
                                  type="number"
                                  placeholder={t("printers.amsPower")}
                                  value={ams.power || ""}
                                  onChange={e => updateAMSForm(p.id, idx, "power", Number(e.target.value))}
                                  onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                                  onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                                  style={{ ...themeStyles.input, width: "100%" }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => saveAMS(p.id)}
                        onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
                        onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonSuccess.boxShadow; }}
                        style={{ 
                          ...themeStyles.button,
                          ...themeStyles.buttonSuccess
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
      ) : printers.length > 0 && searchTerm ? (
        <div style={{ ...themeStyles.card, textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: "16px" }}>
            {settings.language === "hu" ? "Nincs találat a keresési kifejezésre." : settings.language === "de" ? "Keine Ergebnisse für den Suchbegriff." : "No results found for the search term."}
          </p>
        </div>
      ) : (
        <div style={{ ...themeStyles.card, textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🖨️</div>
          <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: "16px" }}>{t("printers.empty")}</p>
        </div>
      )}
      
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        title={t("common.confirm")}
        message={t("common.confirmDeletePrinter")}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
        confirmText={t("common.yes")}
        cancelText={t("common.cancel")}
        type="danger"
      />
    </div>
  );
};
