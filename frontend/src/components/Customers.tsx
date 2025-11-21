import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Customer, Settings, Offer } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";
import { Tooltip } from "./Tooltip";
import { saveCustomers } from "../utils/store";

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

interface Props {
  customers: Customer[];
  setCustomers: (c: Customer[]) => void;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
  offers: Offer[]; // Árajánlatok az előzményekhez
  triggerAddForm?: boolean; // Gyors művelet gomb esetén automatikusan megnyitja a formot
}

export const Customers: React.FC<Props> = ({ 
  customers, 
  setCustomers, 
  settings, 
  theme, 
  themeStyles,
  offers,
  triggerAddForm
}) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Gyors művelet gomb esetén automatikusan megnyitja a formot
  useEffect(() => {
    if (triggerAddForm && !showAddForm && editingCustomerId === null) {
      setShowAddForm(true);
    }
  }, [triggerAddForm, showAddForm, editingCustomerId]);

  // Escape billentyű kezelése a modal bezárásához
  useEffect(() => {
    if (!showAddForm) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddForm(false);
        setName(""); setContact(""); setCompany(""); setAddress(""); setNotes("");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddForm]);

  // Számított mezők: összes árajánlat száma és utolsó árajánlat dátuma
  const customersWithStats = useMemo(() => {
    return customers.map(customer => {
      const customerOffers = offers.filter(o => 
        o.customerName?.toLowerCase() === customer.name.toLowerCase()
      );
      const totalOffers = customerOffers.length;
      const lastOffer = customerOffers
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      return {
        ...customer,
        totalOffers,
        lastOfferDate: lastOffer?.date,
      };
    });
  }, [customers, offers]);

  // Szűrt ügyfelek
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customersWithStats;
    const term = searchTerm.toLowerCase();
    return customersWithStats.filter(c => 
      c.name.toLowerCase().includes(term) ||
      c.contact?.toLowerCase().includes(term) ||
      c.company?.toLowerCase().includes(term)
    );
  }, [customersWithStats, searchTerm]);

  const addCustomer = async () => {
    if (!name.trim()) {
      showToast(`${t("common.error")}: ${t("customers.error.nameRequired")}`, "error");
      return;
    }

    const newId = Date.now();
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      id: newId,
      name: name.trim(),
      contact: contact.trim() || undefined,
      company: company.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    await saveCustomers(updatedCustomers);
    
    showToast(t("customers.toast.added"), "success");
    setName(""); 
    setContact(""); 
    setCompany(""); 
    setAddress(""); 
    setNotes("");
    setShowAddForm(false);
  };

  const deleteCustomer = (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId === null) return;
    const id = deleteConfirmId;
    const updatedCustomers = customers.filter(c => c.id !== id);
    setCustomers(updatedCustomers);
    await saveCustomers(updatedCustomers);
    showToast(t("customers.toast.deleted"), "success");
    setDeleteConfirmId(null);
  };

  const startEdit = (customer: Customer) => {
    setEditingCustomer({
      name: customer.name,
      contact: customer.contact || "",
      company: customer.company || "",
      address: customer.address || "",
      notes: customer.notes || "",
    });
    setEditingCustomerId(customer.id);
  };

  const cancelEdit = () => {
    setEditingCustomerId(null);
    setEditingCustomer(null);
  };

  const saveCustomer = async (customerId: number) => {
    if (!editingCustomer || !editingCustomer.name?.trim()) {
      showToast(`${t("common.error")}: ${t("customers.error.nameRequired")}`, "error");
      return;
    }

    const updatedCustomers = customers.map(c => 
      c.id === customerId
        ? {
            ...c,
            name: editingCustomer.name!.trim(),
            contact: editingCustomer.contact?.trim() || undefined,
            company: editingCustomer.company?.trim() || undefined,
            address: editingCustomer.address?.trim() || undefined,
            notes: editingCustomer.notes?.trim() || undefined,
            updatedAt: new Date().toISOString(),
          }
        : c
    );
    
    setCustomers(updatedCustomers);
    await saveCustomers(updatedCustomers);
    showToast(t("customers.toast.saved"), "success");
    cancelEdit();
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ 
        ...themeStyles.heading, 
        marginBottom: "24px",
        color: theme.colors.text 
      }}>
        👥 {t("customers.title")}
      </h2>

      {/* Keresés */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder={t("customers.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            ...themeStyles.input,
            width: "100%",
            maxWidth: "400px",
          }}
        />
      </div>

      {/* Hozzáadás gomb */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setShowAddForm(true)}
          style={themeStyles.buttonPrimary}
        >
          ➕ {t("customers.addNew")}
        </button>
      </div>

      {/* Hozzáadás form modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => {
              setShowAddForm(false);
              setName(""); setContact(""); setCompany(""); setAddress(""); setNotes("");
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                backgroundColor: typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
                  ? 'rgba(255, 255, 255, 0.95)'
                  : theme.colors.surface,
                borderRadius: '16px',
                padding: '24px',
                width: 'min(600px, 90vw)',
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: theme.name === 'neon' || theme.name === 'cyberpunk'
                  ? `0 0 30px ${theme.colors.shadow}, 0 8px 32px rgba(0,0,0,0.4)`
                  : `0 8px 32px rgba(0,0,0,0.3)`,
                color: typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
                  ? '#1a202c'
                  : theme.colors.text,
                backdropFilter: typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
                  ? 'blur(12px)'
                  : 'none',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ 
                  ...themeStyles.heading, 
                  margin: 0, 
                  fontSize: '20px',
                  color: typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
                    ? '#1a202c'
                    : theme.colors.text,
                }}>
                  {t("customers.addNew")}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setName(""); setContact(""); setCompany(""); setAddress(""); setNotes("");
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
                      ? '#1a202c'
                      : theme.colors.text,
                    padding: '0',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
                      ? 'rgba(0, 0, 0, 0.05)'
                      : theme.colors.surfaceHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "8px", 
                    fontWeight: "600",
                    color: typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
                      ? '#1a202c'
                      : theme.colors.text,
                  }}>
                    {t("customers.name")} *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      ...themeStyles.input,
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                    }}
                    placeholder={t("customers.namePlaceholder")}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "8px", 
                    fontWeight: "600",
                    color: typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
                      ? '#1a202c'
                      : theme.colors.text,
                  }}>
                    {t("customers.contact")}
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    style={{
                      ...themeStyles.input,
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                    }}
                    placeholder={t("customers.contactPlaceholder")}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "8px", 
                    fontWeight: "600",
                    color: typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
                      ? '#1a202c'
                      : theme.colors.text,
                  }}>
                    {t("customers.company")}
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    style={{
                      ...themeStyles.input,
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                    }}
                    placeholder={t("customers.companyPlaceholder")}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "8px", 
                    fontWeight: "600",
                    color: typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
                      ? '#1a202c'
                      : theme.colors.text,
                  }}>
                    {t("customers.address")}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{
                      ...themeStyles.input,
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                    }}
                    placeholder={t("customers.addressPlaceholder")}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "8px", 
                    fontWeight: "600",
                    color: typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
                      ? '#1a202c'
                      : theme.colors.text,
                  }}>
                    {t("customers.notes")}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{
                      ...themeStyles.input,
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      minHeight: "80px",
                      resize: "vertical",
                    }}
                    placeholder={t("customers.notesPlaceholder")}
                  />
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button onClick={addCustomer} style={themeStyles.buttonPrimary}>
                    {t("common.save")}
                  </button>
                  <button 
                    onClick={() => {
                      setShowAddForm(false);
                      setName(""); setContact(""); setCompany(""); setAddress(""); setNotes("");
                    }}
                    style={themeStyles.buttonSecondary}
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ügyfelek listája */}
      {filteredCustomers.length === 0 ? (
        <div style={{
          ...themeStyles.card,
          padding: "40px",
          textAlign: "center",
          color: theme.colors.textSecondary,
        }}>
          {searchTerm ? t("customers.noResults") : t("customers.empty")}
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {filteredCustomers.map((customer) => (
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
                      onClick={() => saveCustomer(customer.id)} 
                      style={themeStyles.buttonPrimary}
                    >
                      {t("common.save")}
                    </button>
                    <button onClick={cancelEdit} style={themeStyles.buttonSecondary}>
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
                          onClick={() => startEdit(customer)}
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
                          onClick={() => deleteCustomer(customer.id)}
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
      )}

      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        onCancel={() => setDeleteConfirmId(null)}
        onConfirm={confirmDelete}
        title={t("customers.confirmDelete.title")}
        message={t("customers.confirmDelete.message")}
        theme={theme}
      />
    </div>
  );
};

