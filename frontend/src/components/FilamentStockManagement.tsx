import React, { useState, useMemo } from "react";
import type { Filament, Settings } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { useToast } from "./Toast";
import { Tooltip } from "./Tooltip";
import { EmptyState } from "./EmptyState";
import { saveFilaments } from "../utils/store";
import { getCurrencyLabel } from "../utils/currency";
import { convertCurrency } from "../utils/currency";

interface Props {
  filaments: Filament[];
  setFilaments: (f: Filament[]) => void;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
}

export const FilamentStockManagement: React.FC<Props> = ({
  filaments,
  setFilaments,
  settings,
  theme,
  themeStyles,
}) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "critical" | "low" | "ok">("all");
  const [editingStock, setEditingStock] = useState<{ index: number; value: number } | null>(null);
  const [criticalThreshold, setCriticalThreshold] = useState(200); // gramm
  const [lowThreshold, setLowThreshold] = useState(400); // gramm

  const currencyLabel = getCurrencyLabel(settings.currency);

  // Szűrés és keresés
  const filteredFilaments = useMemo(() => {
    let filtered = filaments.filter((filament) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        filament.brand?.toLowerCase().includes(searchLower) ||
        filament.type?.toLowerCase().includes(searchLower) ||
        filament.color?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      if (filterStatus === "all") return true;

      const stock = filament.weight || 0;
      if (filterStatus === "critical") return stock <= criticalThreshold;
      if (filterStatus === "low") return stock > criticalThreshold && stock <= lowThreshold;
      if (filterStatus === "ok") return stock > lowThreshold;

      return true;
    });

    return filtered.sort((a, b) => {
      const stockA = a.weight || 0;
      const stockB = b.weight || 0;
      return stockA - stockB; // Legkisebb készlet először
    });
  }, [filaments, searchTerm, filterStatus, criticalThreshold, lowThreshold]);

  // Készlet státusz meghatározása
  const getStockStatus = (stock: number): "critical" | "low" | "ok" => {
    if (stock <= criticalThreshold) return "critical";
    if (stock <= lowThreshold) return "low";
    return "ok";
  };

  const getStatusColor = (status: "critical" | "low" | "ok") => {
    switch (status) {
      case "critical":
        return theme.colors.danger;
      case "low":
    return theme.colors.secondary;
      case "ok":
        return theme.colors.success;
    }
  };

  const getStatusIcon = (status: "critical" | "low" | "ok") => {
    switch (status) {
      case "critical":
        return "🔴";
      case "low":
        return "🟡";
      case "ok":
        return "🟢";
    }
  };

  const getStatusLabel = (status: "critical" | "low" | "ok") => {
    switch (status) {
      case "critical":
        return t("filamentStock.status.critical") || "Kritikus";
      case "low":
        return t("filamentStock.status.low") || "Alacsony";
      case "ok":
        return t("filamentStock.status.ok") || "Rendben";
    }
  };

  // Készlet módosítása
  const handleStockChange = async (index: number, newStock: number) => {
    if (newStock < 0) {
      showToast(t("filamentStock.error.negativeStock") || "A készlet nem lehet negatív", "error");
      return;
    }

    const updatedFilaments = [...filaments];
    updatedFilaments[index] = {
      ...updatedFilaments[index],
      weight: newStock,
    };

    try {
      await saveFilaments(updatedFilaments);
      setFilaments(updatedFilaments);
      setEditingStock(null);
      showToast(t("filamentStock.success.updated") || "Készlet frissítve", "success");
    } catch (error) {
      console.error("Készlet mentési hiba:", error);
      showToast(t("common.error") || "Hiba", "error");
    }
  };

  // Készlet hozzáadása/kivonása
  const adjustStock = async (index: number, delta: number) => {
    const filament = filaments[index];
    const currentStock = filament.weight || 0;
    const newStock = Math.max(0, currentStock + delta);
    await handleStockChange(index, newStock);
  };

  const isGradientBackground = theme.colors.background?.includes("gradient");
  const cardBg = isGradientBackground
    ? "rgba(255, 255, 255, 0.98)"
    : theme.colors.surface;

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1400px",
        margin: "0 auto",
        minHeight: "calc(100vh - 70px)",
        backgroundColor: theme.colors.background,
      }}
    >
      {/* Fejléc */}
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: theme.colors.text,
              margin: 0,
              marginBottom: "8px",
            }}
          >
            {t("filamentStock.title") || "Filament Készletnyilvántartás"}
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: theme.colors.textMuted,
              margin: 0,
            }}
          >
            {t("filamentStock.subtitle") || "Készlet szintek kezelése és figyelése"}
          </p>
        </div>

        {/* Küszöbértékek beállítása */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Tooltip content={t("filamentStock.tooltip.criticalThreshold") || "Kritikus küszöbérték (gramm)"}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label
                style={{
                  fontSize: "12px",
                  color: theme.colors.textMuted,
                  whiteSpace: "nowrap",
                }}
              >
                {t("filamentStock.criticalThreshold") || "Kritikus:"}
              </label>
              <input
                type="number"
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(Math.max(0, parseInt(e.target.value) || 0))}
                style={{
                  width: "80px",
                  padding: "6px 8px",
                  borderRadius: "6px",
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  fontSize: "13px",
                }}
              />
              <span style={{ fontSize: "12px", color: theme.colors.textMuted }}>g</span>
            </div>
          </Tooltip>
          <Tooltip content={t("filamentStock.tooltip.lowThreshold") || "Alacsony küszöbérték (gramm)"}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label
                style={{
                  fontSize: "12px",
                  color: theme.colors.textMuted,
                  whiteSpace: "nowrap",
                }}
              >
                {t("filamentStock.lowThreshold") || "Alacsony:"}
              </label>
              <input
                type="number"
                value={lowThreshold}
                onChange={(e) => setLowThreshold(Math.max(0, parseInt(e.target.value) || 0))}
                style={{
                  width: "80px",
                  padding: "6px 8px",
                  borderRadius: "6px",
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  fontSize: "13px",
                }}
              />
              <span style={{ fontSize: "12px", color: theme.colors.textMuted }}>g</span>
            </div>
          </Tooltip>
        </div>
      </div>

      {/* Szűrők és keresés */}
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "200px" }}>
          <input
            type="text"
            placeholder={t("filamentStock.search.placeholder") || "Keresés (márka, típus, szín)..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "8px",
              border: `1px solid ${theme.colors.border}`,
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              fontSize: "14px",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {(["all", "critical", "low", "ok"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: filterStatus === status ? theme.colors.primary : theme.colors.surface,
                color: filterStatus === status ? "#fff" : theme.colors.text,
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {status === "all"
                ? t("filamentStock.filter.all") || "Összes"
                : status === "critical"
                ? t("filamentStock.filter.critical") || "Kritikus"
                : status === "low"
                ? t("filamentStock.filter.low") || "Alacsony"
                : t("filamentStock.filter.ok") || "Rendben"}
            </button>
          ))}
        </div>
      </div>

      {/* Filament lista */}
      {filteredFilaments.length === 0 ? (
        <div
          style={{
            marginTop: "16px",
          }}
        >
          <EmptyState
            icon="📦"
            title={t("filamentStock.empty.title") || "Nincs filament"}
            description={
              searchTerm || filterStatus !== "all"
                ? t("filamentStock.empty.filtered") || "Nincs találat a szűrési feltételek alapján"
                : t("filamentStock.empty.noFilaments") || "Még nincs hozzáadva filament"
            }
            theme={theme}
            themeStyles={themeStyles}
            settings={settings}
          />
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "16px",
          }}
        >
          {filteredFilaments.map((filament) => {
            const actualIndex = filaments.findIndex(
              (f) =>
                f.brand === filament.brand &&
                f.type === filament.type &&
                f.color === filament.color &&
                f.colorHex === filament.colorHex
            );
            const stock = filament.weight || 0;
            const status = getStockStatus(stock);
            const isEditing = editingStock?.index === actualIndex;

            return (
              <div
                key={`${filament.brand}-${filament.type}-${filament.color}-${actualIndex}`}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: "12px",
                  padding: "20px",
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: isGradientBackground
                    ? `0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)`
                    : `0 4px 16px ${theme.colors.shadow}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {/* Fejléc */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: theme.colors.text,
                        marginBottom: "4px",
                      }}
                    >
                      {filament.brand} {filament.type}
                    </div>
                    {filament.color && (
                      <div
                        style={{
                          fontSize: "13px",
                          color: theme.colors.textMuted,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {filament.colorHex && (
                          <div
                            style={{
                              width: "16px",
                              height: "16px",
                              borderRadius: "50%",
                              backgroundColor: filament.colorHex,
                              border: `1px solid ${theme.colors.border}`,
                            }}
                          />
                        )}
                        {filament.color}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      backgroundColor: `${getStatusColor(status)}20`,
                      color: getStatusColor(status),
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    <span>{getStatusIcon(status)}</span>
                    <span>{getStatusLabel(status)}</span>
                  </div>
                </div>

                {/* Készlet információ */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px",
                    backgroundColor: theme.colors.surfaceHover,
                    borderRadius: "8px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: theme.colors.textMuted,
                        marginBottom: "4px",
                      }}
                    >
                      {t("filamentStock.currentStock") || "Jelenlegi készlet"}
                    </div>
                    {isEditing ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          type="number"
                          value={editingStock?.value || stock}
                          onChange={(e) =>
                            setEditingStock({
                              index: actualIndex,
                              value: Math.max(0, parseInt(e.target.value) || 0),
                            })
                          }
                          style={{
                            width: "100px",
                            padding: "6px 8px",
                            borderRadius: "6px",
                            border: `1px solid ${theme.colors.border}`,
                            backgroundColor: theme.colors.surface,
                            color: theme.colors.text,
                            fontSize: "14px",
                            fontWeight: "600",
                          }}
                          autoFocus
                        />
                        <span style={{ fontSize: "14px", color: theme.colors.textMuted }}>g</span>
                        <button
                          onClick={() => handleStockChange(actualIndex, editingStock!.value)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            border: "none",
                            backgroundColor: theme.colors.success,
                            color: "#fff",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingStock(null)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            border: "none",
                            backgroundColor: theme.colors.danger,
                            color: "#fff",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: "700",
                          color: theme.colors.text,
                        }}
                      >
                        {stock.toLocaleString()} g
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        color: theme.colors.textMuted,
                        marginBottom: "4px",
                      }}
                    >
                      {t("filamentStock.pricePerKg") || "Ár/kg"}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: theme.colors.text,
                      }}
                    >
                      {convertCurrency(filament.pricePerKg, settings.currency).toFixed(2)} {currencyLabel}
                    </div>
                  </div>
                </div>

                {/* Gyors műveletek */}
                {!isEditing && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => setEditingStock({ index: actualIndex, value: stock })}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.surface;
                      }}
                    >
                      {t("filamentStock.edit") || "Szerkesztés"}
                    </button>
                    <Tooltip content={t("filamentStock.add") || "Hozzáadás"}>
                      <button
                        onClick={() => adjustStock(actualIndex, 100)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: `1px solid ${theme.colors.border}`,
                          backgroundColor: theme.colors.success,
                          color: "#fff",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        +100g
                      </button>
                    </Tooltip>
                    <Tooltip content={t("filamentStock.remove") || "Eltávolítás"}>
                      <button
                        onClick={() => adjustStock(actualIndex, -100)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: `1px solid ${theme.colors.border}`,
                          backgroundColor: theme.colors.danger,
                          color: "#fff",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        -100g
                      </button>
                    </Tooltip>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

