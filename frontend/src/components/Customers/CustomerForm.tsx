import React from "react";
import type { Settings } from "../../types";
import type { Theme } from "../../utils/themes";
import { useTranslation } from "../../utils/translations";

interface Props {
  name: string;
  setName: (name: string) => void;
  contact: string;
  setContact: (contact: string) => void;
  company: string;
  setCompany: (company: string) => void;
  address: string;
  setAddress: (address: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../../utils/themes").getThemeStyles>;
}

export const CustomerForm: React.FC<Props> = ({
  name,
  setName,
  contact,
  setContact,
  company,
  setCompany,
  address,
  setAddress,
  notes,
  setNotes,
  onSubmit,
  onCancel,
  settings,
  theme,
  themeStyles,
}) => {
  const t = useTranslation(settings.language);

  return (
    <div style={{
      ...themeStyles.card,
      marginBottom: "24px",
      padding: "20px",
    }}>
      <h3 style={{ ...themeStyles.heading, marginBottom: "16px", fontSize: "18px" }}>
        {t("customers.addNew")}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
            {t("customers.name")} *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={themeStyles.input}
            placeholder={t("customers.namePlaceholder")}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
            {t("customers.contact")}
          </label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            style={themeStyles.input}
            placeholder={t("customers.contactPlaceholder")}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
            {t("customers.company")}
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={themeStyles.input}
            placeholder={t("customers.companyPlaceholder")}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
            {t("customers.address")}
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={themeStyles.input}
            placeholder={t("customers.addressPlaceholder")}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
            {t("customers.notes")}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{
              ...themeStyles.input,
              minHeight: "80px",
              resize: "vertical",
            }}
            placeholder={t("customers.notesPlaceholder")}
          />
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={onSubmit} style={themeStyles.buttonPrimary}>
            {t("common.save")}
          </button>
          <button onClick={onCancel} style={themeStyles.buttonSecondary}>
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};
