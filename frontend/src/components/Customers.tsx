import React, { useState, useMemo } from "react";
import type { Customer, Settings, Offer } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";
import { Tooltip } from "./Tooltip";
import { saveCustomers } from "../utils/store";
import { CustomerSearch } from "./Customers/CustomerSearch";
import { CustomerForm } from "./Customers/CustomerForm";
import { CustomerList } from "./Customers/CustomerList";

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
}

export const Customers: React.FC<Props> = ({ 
  customers, 
  setCustomers, 
  settings, 
  theme, 
  themeStyles,
  offers 
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
      <CustomerSearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        settings={settings}
        theme={theme}
        themeStyles={themeStyles}
      />

      {/* Hozzáadás gomb */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            ...themeStyles.buttonPrimary,
            marginBottom: showAddForm ? "20px" : "0",
          }}
        >
          {showAddForm ? "✖️" : "➕"} {t("customers.addNew")}
        </button>
      </div>

      {/* Hozzáadás form */}
      {showAddForm && (
        <CustomerForm
          name={name}
          setName={setName}
          contact={contact}
          setContact={setContact}
          company={company}
          setCompany={setCompany}
          address={address}
          setAddress={setAddress}
          notes={notes}
          setNotes={setNotes}
          onSubmit={addCustomer}
          onCancel={() => {
            setShowAddForm(false);
            setName(""); setContact(""); setCompany(""); setAddress(""); setNotes("");
          }}
          settings={settings}
          theme={theme}
          themeStyles={themeStyles}
        />
      )}

      {/* Ügyfelek listája */}
      <CustomerList
        customers={filteredCustomers}
        editingCustomerId={editingCustomerId}
        editingCustomer={editingCustomer}
        setEditingCustomer={setEditingCustomer}
        settings={settings}
        theme={theme}
        themeStyles={themeStyles}
        onStartEdit={startEdit}
        onSaveCustomer={saveCustomer}
        onCancelEdit={cancelEdit}
        onDeleteCustomer={deleteCustomer}
        searchTerm={searchTerm}
      />

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

