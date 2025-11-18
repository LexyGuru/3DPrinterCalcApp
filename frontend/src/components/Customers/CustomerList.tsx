import React from "react";
import type { Customer, Settings, Offer } from "../../types";
import type { Theme } from "../../utils/themes";
import { useTranslation } from "../../utils/translations";
import { Tooltip } from "../Tooltip";

const LANGUAGE_LOCALES: Record<string, string> = {
  hu: "hu-HU",
  de: "de-DE",
  fr: "fr-FR",
  it: "it-IT",
  es: "es-ES",
  pl: "pl-PL",
  cs: "cs-CZ",
  sk: "sk-SK",
  zh: "zh-CN",
  "pt-BR": "pt-BR",
  uk: "uk-UA",
  ru: "ru-RU",
  en: "en-US",
};

interface CustomerWithStats extends Customer {
  totalOffers?: number;
  lastOfferDate?: string;
}

interface Props {
  customers: CustomerWithStats[];
  editingCustomerId: number | null;
  editingCustomer: Partial<Customer> | null;
  setEditingCustomer: (customer: Partial<Customer> | null) => void;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../../utils/themes").getThemeStyles>;
  onStartEdit: (customer: Customer) => void;
  onSaveCustomer: (customerId: number) => void;
  onCancelEdit: () => void;
  onDeleteCustomer: (id: number) => void;
  searchTerm: string;
}

export const CustomerList: React.FC<Props> = ({
  customers,
  editingCustomerId,
  editingCustomer,
  setEditingCustomer,
  settings,
  theme,
  themeStyles,
  onStartEdit,
  onSaveCustomer,
  onCancelEdit,
  onDeleteCustomer,
  searchTerm,
}) => {
  const t = useTranslation(settings.language);

  if (customers.length === 0) {
    return (
      <div style={{
        ...themeStyles.card,
        padding: "40px",
        textAlign: "center",
        color: theme.colors.textSecondary,
      }}>
        {searchTerm ? t("customers.noResults") : t("customers.empty")}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      {customers.map((customer) => (
        <div
          key={customer.id}
          style={{
            ...themeStyles.card,
            padding: "20px",
          }}
        >
          {editingCustomerId === customer.id ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  {t("customers.name")} *
                </label>
                <input
                  type="text"
                  value={editingCustomer?.name || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  style={themeStyles.input}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  {t("customers.contact")}
                </label>
                <input
                  type="text"
                  value={editingCustomer?.contact || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, contact: e.target.value })}
                  style={themeStyles.input}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  {t("customers.company")}
                </label>
                <input
                  type="text"
                  value={editingCustomer?.company || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, company: e.target.value })}
                  style={themeStyles.input}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  {t("customers.address")}
                </label>
                <input
                  type="text"
                  value={editingCustomer?.address || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  style={themeStyles.input}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  {t("customers.notes")}
                </label>
                <textarea
                  value={editingCustomer?.notes || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                  style={{
                    ...themeStyles.input,
                    minHeight: "80px",
                    resize: "vertical",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button 
                  onClick={() => onSaveCustomer(customer.id)} 
                  style={themeStyles.buttonPrimary}
                >
                  {t("common.save")}
                </button>
                <button onClick={onCancelEdit} style={themeStyles.buttonSecondary}>
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ 
                    margin: 0, 
                    marginBottom: "8px", 
                    fontSize: "20px", 
                    fontWeight: "600",
                    color: theme.colors.text 
                  }}>
                    {customer.name}
                  </h3>
                  {customer.company && (
                    <p style={{ margin: 0, marginBottom: "4px", color: theme.colors.textSecondary }}>
                      🏢 {customer.company}
                    </p>
                  )}
                  {customer.contact && (
                    <p style={{ margin: 0, marginBottom: "4px", color: theme.colors.textSecondary }}>
                      📧 {customer.contact}
                    </p>
                  )}
                  {customer.address && (
                    <p style={{ margin: 0, marginBottom: "4px", color: theme.colors.textSecondary }}>
                      📍 {customer.address}
                    </p>
                  )}
                  {customer.notes && (
                    <p style={{ margin: 0, marginTop: "8px", color: theme.colors.textSecondary, fontStyle: "italic" }}>
                      {customer.notes}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Tooltip content={t("common.edit")}>
                    <button
                      onClick={() => onStartEdit(customer)}
                      style={{
                        ...themeStyles.buttonSecondary,
                        padding: "8px 12px",
                        fontSize: "14px",
                      }}
                    >
                      ✏️
                    </button>
                  </Tooltip>
                  <Tooltip content={t("common.delete")}>
                    <button
                      onClick={() => onDeleteCustomer(customer.id)}
                      style={{
                        ...themeStyles.buttonDanger,
                        padding: "8px 12px",
                        fontSize: "14px",
                      }}
                    >
                      🗑️
                    </button>
                  </Tooltip>
                </div>
              </div>
              <div style={{ 
                marginTop: "12px", 
                paddingTop: "12px", 
                borderTop: `1px solid ${theme.colors.border}`,
                fontSize: "14px",
                color: theme.colors.textSecondary,
              }}>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <span>
                    📋 {t("customers.totalOffers")}: <strong>{customer.totalOffers || 0}</strong>
                  </span>
                  {customer.lastOfferDate && (
                    <span>
                      📅 {t("customers.lastOffer")}: <strong>
                        {new Date(customer.lastOfferDate).toLocaleDateString(LANGUAGE_LOCALES[settings.language] ?? "en-US")}
                      </strong>
                    </span>
                  )}
                  <span>
                    🕒 {t("customers.created")}: {new Date(customer.createdAt).toLocaleDateString(LANGUAGE_LOCALES[settings.language] ?? "en-US")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
