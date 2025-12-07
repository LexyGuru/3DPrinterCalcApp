import React, { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Settings } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import type { getThemeStyles } from "../utils/themes";

interface Props {
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof getThemeStyles>;
  isOpen: boolean;
  onClose: () => void;
}

type HelpCategory = 
  | "general" 
  | "calculations" 
  | "projects" 
  | "tasks" 
  | "offers" 
  | "filaments" 
  | "printers" 
  | "customers" 
  | "settings" 
  | "keyboard" 
  | "tips";

interface HelpItem {
  id: string;
  category: HelpCategory;
  title: string;
  description: string;
  details?: string;
}

export const HelpMenu: React.FC<Props> = ({
  settings,
  theme,
  isOpen,
  onClose,
}) => {
  const t = useTranslation(settings.language);
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Escape billentyű kezelése
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Help items kategóriák szerint
  const helpItems: HelpItem[] = useMemo(() => [
    // General
    {
      id: "general-intro",
      category: "general",
      title: t("help.general.intro.title"),
      description: t("help.general.intro.description"),
      details: t("help.general.intro.details"),
    },
    {
      id: "general-navigation",
      category: "general",
      title: t("help.general.navigation.title"),
      description: t("help.general.navigation.description"),
      details: t("help.general.navigation.details"),
    },
    
    // Calculations
    {
      id: "calculations-basics",
      category: "calculations",
      title: t("help.calculations.basics.title"),
      description: t("help.calculations.basics.description"),
      details: t("help.calculations.basics.details"),
    },
    {
      id: "calculations-costs",
      category: "calculations",
      title: t("help.calculations.costs.title"),
      description: t("help.calculations.costs.description"),
      details: t("help.calculations.costs.details"),
    },
    
    // Projects
    {
      id: "projects-create",
      category: "projects",
      title: t("help.projects.create.title"),
      description: t("help.projects.create.description"),
      details: t("help.projects.create.details"),
    },
    {
      id: "projects-status",
      category: "projects",
      title: t("help.projects.status.title"),
      description: t("help.projects.status.description"),
      details: t("help.projects.status.details"),
    },
    
    // Tasks
    {
      id: "tasks-create",
      category: "tasks",
      title: t("help.tasks.create.title"),
      description: t("help.tasks.create.description"),
      details: t("help.tasks.create.details"),
    },
    {
      id: "tasks-priority",
      category: "tasks",
      title: t("help.tasks.priority.title"),
      description: t("help.tasks.priority.description"),
      details: t("help.tasks.priority.details"),
    },
    
    // Offers
    {
      id: "offers-create",
      category: "offers",
      title: t("help.offers.create.title"),
      description: t("help.offers.create.description"),
      details: t("help.offers.create.details"),
    },
    {
      id: "offers-status",
      category: "offers",
      title: t("help.offers.status.title"),
      description: t("help.offers.status.description"),
      details: t("help.offers.status.details"),
    },
    
    // Filaments
    {
      id: "filaments-add",
      category: "filaments",
      title: t("help.filaments.add.title"),
      description: t("help.filaments.add.description"),
      details: t("help.filaments.add.details"),
    },
    {
      id: "filaments-library",
      category: "filaments",
      title: t("help.filaments.library.title"),
      description: t("help.filaments.library.description"),
      details: t("help.filaments.library.details"),
    },
    
    // Printers
    {
      id: "printers-add",
      category: "printers",
      title: t("help.printers.add.title"),
      description: t("help.printers.add.description"),
      details: t("help.printers.add.details"),
    },
    
    // Customers
    {
      id: "customers-add",
      category: "customers",
      title: t("help.customers.add.title"),
      description: t("help.customers.add.description"),
      details: t("help.customers.add.details"),
    },
    
    // Settings
    {
      id: "settings-general",
      category: "settings",
      title: t("help.settings.general.title"),
      description: t("help.settings.general.description"),
      details: t("help.settings.general.details"),
    },
    {
      id: "settings-backup",
      category: "settings",
      title: t("help.settings.backup.title"),
      description: t("help.settings.backup.description"),
      details: t("help.settings.backup.details"),
    },
    
    // Keyboard
    {
      id: "keyboard-shortcuts",
      category: "keyboard",
      title: t("help.keyboard.shortcuts.title"),
      description: t("help.keyboard.shortcuts.description"),
      details: t("help.keyboard.shortcuts.details"),
    },
    
    // Tips
    {
      id: "tips-efficiency",
      category: "tips",
      title: t("help.tips.efficiency.title"),
      description: t("help.tips.efficiency.description"),
      details: t("help.tips.efficiency.details"),
    },
  ], [t]);

  // Kategóriák szűrése
  const filteredItems = useMemo(() => {
    let filtered = helpItems;

    // Kategória szűrés
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Keresés szűrés
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.details?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [helpItems, selectedCategory, searchQuery]);

  const categories: { id: HelpCategory | "all"; label: string; icon: string }[] = [
    { id: "all", label: t("help.categories.all"), icon: "📚" },
    { id: "general", label: t("help.categories.general"), icon: "ℹ️" },
    { id: "calculations", label: t("help.categories.calculator"), icon: "🧮" },
    { id: "projects", label: t("help.categories.projects"), icon: "📁" },
    { id: "tasks", label: t("help.categories.tasks"), icon: "✅" },
    { id: "offers", label: t("help.categories.offers"), icon: "💰" },
    { id: "filaments", label: t("help.categories.filaments"), icon: "🧵" },
    { id: "printers", label: t("help.categories.printers"), icon: "🖨️" },
    { id: "customers", label: t("help.categories.customers"), icon: "👥" },
    { id: "settings", label: t("help.categories.settings"), icon: "⚙️" },
    { id: "keyboard", label: t("help.categories.shortcuts"), icon: "⌨️" },
    { id: "tips", label: t("help.categories.tips"), icon: "💡" },
  ];

  const isGradientBackground = theme.colors.background?.includes('gradient');
  const modalBg = isGradientBackground
    ? "rgba(255, 255, 255, 0.98)"
    : theme.colors.surface || theme.colors.background;
  const textColor = isGradientBackground ? "#1a202c" : theme.colors.text;
  const textMuted = isGradientBackground ? "#4a5568" : theme.colors.textMuted;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              zIndex: 9998,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              boxSizing: "border-box",
            }}
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              style={{
                width: "90%",
                maxWidth: "1200px",
                maxHeight: "calc(100vh - 40px)",
                overflow: "hidden",
                backgroundColor: modalBg,
                borderRadius: "16px",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                border: `2px solid ${theme.colors.border || "#e2e8f0"}`,
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                style={{
                  padding: "24px",
                  borderBottom: `1px solid ${theme.colors.border || "#e2e8f0"}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h1
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    margin: 0,
                    color: textColor,
                  }}
                >
                  ❓ {t("help.title")}
                </h1>
                <button
                  onClick={onClose}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: textMuted,
                    padding: "4px 8px",
                  }}
                  aria-label={t("common.close") || "Bezárás"}
                >
                  ✕
                </button>
              </div>

              {/* Search Bar */}
              <div
                style={{
                  padding: "16px 24px",
                  borderBottom: `1px solid ${theme.colors.border || "#e2e8f0"}`,
                }}
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("help.search.placeholder")}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "16px",
                    borderRadius: "8px",
                    border: `2px solid ${theme.colors.border || "#e2e8f0"}`,
                    backgroundColor: isGradientBackground ? "#fff" : theme.colors.background,
                    color: textColor,
                    boxSizing: "border-box",
                  }}
                  autoFocus
                />
              </div>

              {/* Content */}
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                {/* Sidebar - Categories */}
                <div
                  style={{
                    width: "250px",
                    borderRight: `1px solid ${theme.colors.border || "#e2e8f0"}`,
                    overflowY: "auto",
                    padding: "16px",
                  }}
                >
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        marginBottom: "8px",
                        textAlign: "left",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor:
                          selectedCategory === category.id
                            ? theme.colors.primary || "#007bff"
                            : "transparent",
                        color:
                          selectedCategory === category.id
                            ? "#fff"
                            : textColor,
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: selectedCategory === category.id ? "600" : "400",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedCategory !== category.id) {
                          e.currentTarget.style.backgroundColor = isGradientBackground
                            ? "rgba(0, 0, 0, 0.05)"
                            : theme.colors.primary + "20";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedCategory !== category.id) {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      {category.icon} {category.label}
                    </button>
                  ))}
                </div>

                {/* Main Content */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "24px",
                  }}
                >
                  {filteredItems.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        color: textMuted,
                      }}
                    >
                      <p style={{ fontSize: "18px", margin: 0 }}>
                        {t("help.noResults")}
                      </p>
                      <p style={{ fontSize: "14px", marginTop: "8px" }}>
                        {t("help.noResultsDescription")}
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                      {filteredItems.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            padding: "20px",
                            borderRadius: "12px",
                            backgroundColor: isGradientBackground
                              ? "rgba(0, 0, 0, 0.03)"
                              : theme.colors.background,
                            border: `1px solid ${theme.colors.border || "#e2e8f0"}`,
                          }}
                        >
                          <h3
                            style={{
                              fontSize: "20px",
                              fontWeight: "600",
                              margin: "0 0 8px 0",
                              color: textColor,
                            }}
                          >
                            {item.title}
                          </h3>
                          <p
                            style={{
                              fontSize: "15px",
                              color: textMuted,
                              margin: "0 0 12px 0",
                              lineHeight: "1.5",
                            }}
                          >
                            {item.description}
                          </p>
                          {item.details && (
                            <p
                              style={{
                                fontSize: "14px",
                                color: textColor,
                                margin: 0,
                                lineHeight: "1.6",
                              }}
                            >
                              {item.details}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
