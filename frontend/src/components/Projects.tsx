import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project, Settings, Offer, ProjectStatus } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import type { TranslationKey } from "../utils/languages";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";
import { EmptyState } from "./EmptyState";
import { loadProjects } from "../utils/store";
import { useUndoRedo } from "../hooks/useUndoRedo";
import { useKeyboardShortcut } from "../utils/keyboardShortcuts";
import { auditCreate, auditUpdate, auditDelete } from "../utils/auditLog";
import {
  createProject,
  updateProject,
  deleteProject,
} from "../utils/projects";
import { convertCurrencyFromTo, getCurrencyLabel } from "../utils/currency";

interface Props {
  projects: Project[];
  setProjects: (p: Project[]) => void;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
  offers: Offer[]; // Árajánlatok a projektekhez
  triggerAddForm?: boolean; // Gyors művelet gomb esetén automatikusan megnyitja a formot
}

const STATUS_COLORS: Record<ProjectStatus, string> = {
  active: "#22c55e",
  "on-hold": "#f59e0b",
  completed: "#6366f1",
  cancelled: "#ef4444",
};

const STATUS_LABELS: Record<ProjectStatus, TranslationKey> = {
  active: "projects.status.active",
  "on-hold": "projects.status.onHold",
  completed: "projects.status.completed",
  cancelled: "projects.status.cancelled",
};

export const Projects: React.FC<Props> = ({
  projects,
  setProjects,
  settings,
  theme,
  themeStyles,
  offers,
  triggerAddForm,
}) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();

  // Undo/Redo hook
  const {
    state: projectsWithHistory,
    setState: setProjectsWithHistory,
    undo,
    canUndo,
    reset: resetHistory,
  } = useUndoRedo<Project[]>(projects, 50);

  // Sync projects with history when external changes occur
  const prevProjectsRef = useRef<string>(JSON.stringify(projects));
  useEffect(() => {
    const currentProjects = JSON.stringify(projects);
    const currentHistory = JSON.stringify(projectsWithHistory);

    if (prevProjectsRef.current !== currentProjects && currentProjects !== currentHistory) {
      resetHistory(projects);
      prevProjectsRef.current = currentProjects;
    }
  }, [projects, projectsWithHistory, resetHistory]);

  // Update parent when history changes
  const prevHistoryRef = useRef<string>(JSON.stringify(projectsWithHistory));
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    const currentHistory = JSON.stringify(projectsWithHistory);
    const currentProjects = JSON.stringify(projects);

    if (prevHistoryRef.current !== currentHistory && !isUpdatingRef.current && currentHistory !== currentProjects) {
      isUpdatingRef.current = true;
      prevHistoryRef.current = currentHistory;

      setTimeout(() => {
        setProjects(projectsWithHistory);
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [projectsWithHistory, projects, setProjects]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("active");
  const [progress, setProgress] = useState<number>(0);
  const [deadline, setDeadline] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [selectedOfferIds, setSelectedOfferIds] = useState<Set<number>>(new Set());
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Gyors művelet gomb esetén automatikusan megnyitja a formot
  useEffect(() => {
    if (triggerAddForm && !showAddForm && editingProjectId === null) {
      setShowAddForm(true);
    }
  }, [triggerAddForm, showAddForm, editingProjectId]);

  // Escape billentyű kezelése a modal bezárásához
  useEffect(() => {
    if (!showAddForm && !selectedProject) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedProject) {
          setSelectedProject(null);
        } else {
          handleCancel();
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showAddForm, selectedProject]);

  // Undo/Redo keyboard shortcuts
  useKeyboardShortcut("z", () => {
    if (canUndo) {
      undo();
      showToast(t("common.undo") || "Visszavonás", "info");
    }
  }, { ctrl: true });

  useKeyboardShortcut("z", () => {
    if (canUndo) {
      undo();
      showToast(t("common.undo") || "Visszavonás", "info");
    }
  }, { meta: true });

  // Szűrt projektek
  const filteredProjects = useMemo(() => {
    let filtered = projectsWithHistory;

    // Státusz szűrés
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Keresés
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term))
      );
    }

    // Dátum szerint rendezés (legfrissebb elől)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [projectsWithHistory, statusFilter, searchTerm]);

  // Üres form alaphelyzetbe állítása
  const resetForm = () => {
    setName("");
    setDescription("");
    setStatus("active");
    setProgress(0);
    setDeadline("");
    setBudget("");
    setSelectedOfferIds(new Set());
  };

  // Form megnyitása szerkesztéshez
  const handleEdit = (project: Project) => {
    setEditingProjectId(project.id);
    setName(project.name);
    setDescription(project.description || "");
    setStatus(project.status);
    setProgress(project.progress);
    setDeadline(project.deadline || "");
    setBudget(project.budget?.toString() || "");
    setSelectedOfferIds(new Set(project.offerIds || []));
    setShowAddForm(true);
  };

  // Form mentése
  const handleSave = async () => {
    if (!name.trim()) {
      showToast(t("projects.validation.nameRequired") || "Projekt név kötelező", "error");
      return;
    }

    try {
      const budgetNum = budget ? parseFloat(budget) : undefined;
      
      if (editingProjectId) {
        // Szerkesztés
        const updated = await updateProject(editingProjectId, {
          name: name.trim(),
          description: description.trim() || undefined,
          status,
          progress: Math.max(0, Math.min(100, progress)),
          deadline: deadline || undefined,
          budget: budgetNum,
          offerIds: Array.from(selectedOfferIds),
        });

        if (updated) {
          const newProjects = projectsWithHistory.map(p =>
            p.id === editingProjectId ? updated : p
          );
          setProjectsWithHistory(newProjects);
          auditUpdate("project", updated.id.toString(), "project", updated);
          showToast(t("projects.updated") || "Projekt frissítve", "success");
        }
      } else {
        // Új projekt
        const newProject = await createProject({
          name: name.trim(),
          description: description.trim() || undefined,
          status,
          progress: Math.max(0, Math.min(100, progress)),
          deadline: deadline || undefined,
          budget: budgetNum,
          offerIds: Array.from(selectedOfferIds),
        });

        const newProjects = [...projectsWithHistory, newProject];
        setProjectsWithHistory(newProjects);
        auditCreate("project", newProject.id.toString(), "project", newProject);
        showToast(t("projects.created") || "Projekt létrehozva", "success");
      }

      // Adatok mentése
      const allProjects = await loadProjects();
      setProjects(allProjects);

      resetForm();
      setShowAddForm(false);
      setEditingProjectId(null);
    } catch (error) {
      console.error("Hiba a projekt mentésekor:", error);
      showToast(t("common.error") || "Hiba történt", "error");
    }
  };

  // Form megszakítása
  const handleCancel = () => {
    resetForm();
    setShowAddForm(false);
    setEditingProjectId(null);
  };

  // Projekt törlése
  const handleDelete = async (projectId: number) => {
    try {
      const success = await deleteProject(projectId);
      if (success) {
        const newProjects = projectsWithHistory.filter(p => p.id !== projectId);
        setProjectsWithHistory(newProjects);
        auditDelete("project", projectId.toString(), "project", { id: projectId });
        showToast(t("projects.deleted") || "Projekt törölve", "success");
        
        // Adatok mentése
        const allProjects = await loadProjects();
        setProjects(allProjects);
      }
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Hiba a projekt törlésekor:", error);
      showToast(t("common.error") || "Hiba történt", "error");
    }
  };

  // Projekt részletes nézet
  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
  };

  // Elérhető árajánlatok
  const availableOffers = useMemo(() => {
    return offers.filter(offer => {
      // Már hozzárendelt árajánlatok kizárása szerkesztésnél
      if (editingProjectId) {
        const project = projects.find(p => p.id === editingProjectId);
        return !project?.offerIds.includes(offer.id);
      }
      return true;
    });
  }, [offers, editingProjectId, projects]);

  // Projekt költség számítás
  const calculateProjectCost = (project: Project) => {
    const relatedOffers = offers.filter(offer => project.offerIds.includes(offer.id));
    const totalCost = relatedOffers.reduce((sum, offer) => {
      const cost = offer.costs?.totalCost || 0;
      // Konvertáljuk az árajánlat currency-jéből a jelenlegi currency-be
      const converted = convertCurrencyFromTo(
        cost,
        offer.currency || settings.currency,
        settings.currency
      );
      return sum + converted;
    }, 0);
    return totalCost;
  };

  const isGradientBackground = theme.colors.background?.includes('gradient');
  const cardBg = isGradientBackground
    ? "rgba(255, 255, 255, 0.85)"
    : theme.colors.surface;

  return (
    <div style={{ padding: "20px", minHeight: "100vh" }}>
      {/* Fejléc és keresés */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder={t("projects.searchPlaceholder") || "Keresés projektek között..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: "1",
            minWidth: "200px",
            padding: "10px 15px",
            borderRadius: "8px",
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: cardBg,
            color: theme.colors.text,
            fontSize: "14px",
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | "all")}
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: cardBg,
            color: theme.colors.text,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          <option value="all">{t("projects.filter.all") || "Összes"}</option>
          <option value="active">{t(STATUS_LABELS.active) || "Aktív"}</option>
          <option value="on-hold">{t(STATUS_LABELS["on-hold"]) || "Szüneteltetve"}</option>
          <option value="completed">{t(STATUS_LABELS.completed) || "Befejezve"}</option>
          <option value="cancelled">{t(STATUS_LABELS.cancelled) || "Törölve"}</option>
        </select>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: theme.colors.primary,
            color: "#fff",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            ...themeStyles.buttonHover,
          }}
        >
          + {t("projects.addNew") || "Új projekt"}
        </button>
      </div>

      {/* Projektek listája */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title={searchTerm || statusFilter !== "all" 
            ? (t("projects.emptyFiltered") || "Nincs találat")
            : (t("projects.empty") || "Nincsenek projektek")}
          actionLabel={t("projects.addFirst") || "Első projekt hozzáadása"}
          onAction={() => setShowAddForm(true)}
          theme={theme}
          themeStyles={themeStyles}
          settings={settings}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
          {filteredProjects.map((project) => {
            const actualCost = calculateProjectCost(project);
            
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: "12px",
                  padding: "20px",
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: isGradientBackground
                    ? `0 8px 24px rgba(0,0,0,0.15)`
                    : `0 4px 16px ${theme.colors.shadow}`,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                whileHover={{ scale: 1.02, boxShadow: `0 8px 32px ${theme.colors.shadow}` }}
                onClick={() => handleViewDetails(project)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: theme.colors.text }}>
                    {project.name}
                  </h3>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      backgroundColor: `${STATUS_COLORS[project.status]}20`,
                      color: STATUS_COLORS[project.status],
                    }}
                  >
                    {t(STATUS_LABELS[project.status]) || project.status}
                  </span>
                </div>

                {project.description && (
                  <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: theme.colors.textMuted }}>
                    {project.description}
                  </p>
                )}

                {/* Progress bar */}
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "12px", color: theme.colors.textMuted }}>
                      {t("projects.progress") || "Haladás"}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: theme.colors.text }}>
                      {project.progress}%
                    </span>
                  </div>
                  <div style={{
                    width: "100%",
                    height: "8px",
                    backgroundColor: theme.colors.border,
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${project.progress}%`,
                      height: "100%",
                      backgroundColor: theme.colors.primary,
                      transition: "width 0.3s",
                    }} />
                  </div>
                </div>

                {/* Költség és határidő */}
                <div style={{ fontSize: "12px", color: theme.colors.textMuted, marginBottom: "12px" }}>
                  {project.offerIds.length > 0 && (
                    <div>
                      {t("projects.offerCount") || "Árajánlatok"}: {project.offerIds.length}
                      {actualCost > 0 && (
                        <span style={{ marginLeft: "8px" }}>
                          • {getCurrencyLabel(settings.currency)} {actualCost.toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                  {project.deadline && (
                    <div style={{ marginTop: "4px" }}>
                      {t("common.deadline") || "Határidő"}: {new Date(project.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Művelet gombok */}
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(project);
                    }}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "6px",
                      border: `1px solid ${theme.colors.border}`,
                      backgroundColor: "transparent",
                      color: theme.colors.text,
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    {t("common.edit") || "Szerkesztés"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(project.id);
                    }}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "6px",
                      border: `1px solid ${theme.colors.danger}`,
                      backgroundColor: "transparent",
                      color: theme.colors.danger,
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    {t("common.delete") || "Törlés"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Hozzáadás/Szerkesztés modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={handleCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: cardBg,
                borderRadius: "12px",
                padding: "24px",
                width: "90%",
                maxWidth: "600px",
                maxHeight: "90vh",
                overflowY: "auto",
                border: `1px solid ${theme.colors.border}`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.3)`,
              }}
            >
              <h2 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: "600", color: theme.colors.text }}>
                {editingProjectId
                  ? (t("projects.edit") || "Projekt szerkesztése")
                  : (t("projects.addNew") || "Új projekt")}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
                    {t("projects.name") || "Projekt név"} *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      border: `1px solid ${theme.colors.border}`,
                      backgroundColor: cardBg,
                      color: theme.colors.text,
                      fontSize: "14px",
                    }}
                    autoFocus
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
                    {t("projects.description") || "Leírás"}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      border: `1px solid ${theme.colors.border}`,
                      backgroundColor: cardBg,
                      color: theme.colors.text,
                      fontSize: "14px",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
                      {t("projects.status") || "Státusz"}
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "6px",
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: cardBg,
                        color: theme.colors.text,
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      <option value="active">{t(STATUS_LABELS.active) || "Aktív"}</option>
                      <option value="on-hold">{t(STATUS_LABELS["on-hold"]) || "Szüneteltetve"}</option>
                      <option value="completed">{t(STATUS_LABELS.completed) || "Befejezve"}</option>
                      <option value="cancelled">{t(STATUS_LABELS.cancelled) || "Törölve"}</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
                      {t("projects.progress") || "Haladás"} (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "6px",
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: cardBg,
                        color: theme.colors.text,
                        fontSize: "14px",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
                      {t("common.deadline") || "Határidő"}
                    </label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "6px",
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: cardBg,
                        color: theme.colors.text,
                        fontSize: "14px",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
                      {t("projects.budget") || "Költségvetés"} ({getCurrencyLabel(settings.currency)})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "6px",
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: cardBg,
                        color: theme.colors.text,
                        fontSize: "14px",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
                    {t("projects.relatedOffers") || "Kapcsolt árajánlatok"}
                  </label>
                  <select
                    multiple
                    value={Array.from(selectedOfferIds).map(String)}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                      setSelectedOfferIds(new Set(selected));
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      border: `1px solid ${theme.colors.border}`,
                      backgroundColor: cardBg,
                      color: theme.colors.text,
                      fontSize: "14px",
                      minHeight: "100px",
                      cursor: "pointer",
                    }}
                  >
                    {availableOffers.map(offer => (
                      <option key={offer.id} value={offer.id}>
                        #{offer.id} - {offer.customerName || t("common.unnamedCustomer") || "Névtelen ügyfél"} - {new Date(offer.date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                  <div style={{ fontSize: "12px", color: theme.colors.textMuted, marginTop: "4px" }}>
                    {t("common.holdCtrlToSelectMultiple") || "Nyomd tartva a Ctrl-t több kiválasztásához"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "flex-end" }}>
                <button
                  onClick={handleCancel}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "6px",
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: "transparent",
                    color: theme.colors.text,
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {t("common.cancel") || "Mégse"}
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: theme.colors.primary,
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    ...themeStyles.buttonHover,
                  }}
                >
                  {t("common.save") || "Mentés"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projekt részletes nézet modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: cardBg,
                borderRadius: "12px",
                padding: "24px",
                width: "90%",
                maxWidth: "700px",
                maxHeight: "90vh",
                overflowY: "auto",
                border: `1px solid ${theme.colors.border}`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.3)`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "20px" }}>
                <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "600", color: theme.colors.text }}>
                  {selectedProject.name}
                </h2>
                <button
                  onClick={() => setSelectedProject(null)}
                  style={{
                    padding: "8px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: theme.colors.text,
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>

              {/* Részletek itt */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Státusz, haladás stb. */}
                <div>
                  <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "12px",
                        fontSize: "14px",
                        fontWeight: "600",
                        backgroundColor: `${STATUS_COLORS[selectedProject.status]}20`,
                        color: STATUS_COLORS[selectedProject.status],
                      }}
                    >
                      {t(STATUS_LABELS[selectedProject.status]) || selectedProject.status}
                    </span>
                    <span style={{ fontSize: "14px", color: theme.colors.textMuted }}>
                      {selectedProject.progress}% {t("projects.progress") || "kész"}
                    </span>
                  </div>

                  {selectedProject.description && (
                    <p style={{ fontSize: "14px", color: theme.colors.text }}>
                      {selectedProject.description}
                    </p>
                  )}
                </div>

                {/* Kapcsolt árajánlatok */}
                {selectedProject.offerIds.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", color: theme.colors.text, marginBottom: "12px" }}>
                      {t("projects.relatedOffers") || "Kapcsolt árajánlatok"} ({selectedProject.offerIds.length})
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {selectedProject.offerIds.map(offerId => {
                        const offer = offers.find(o => o.id === offerId);
                        if (!offer) return null;
                        return (
                          <div
                            key={offerId}
                            style={{
                              padding: "12px",
                              borderRadius: "6px",
                              border: `1px solid ${theme.colors.border}`,
                              backgroundColor: theme.colors.surfaceHover,
                            }}
                          >
                            <div style={{ fontWeight: "600", color: theme.colors.text }}>
                              #{offer.id} - {offer.customerName || t("common.unnamedCustomer") || "Névtelen ügyfél"}
                            </div>
                            <div style={{ fontSize: "12px", color: theme.colors.textMuted, marginTop: "4px" }}>
                              {new Date(offer.date).toLocaleDateString()} • {getCurrencyLabel(settings.currency)} {(offer.costs?.totalCost || 0).toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Törlés megerősítés */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        title={t("projects.deleteConfirm") || "Projekt törlése"}
        message={t("projects.deleteConfirmMessage") || "Biztosan törölni szeretnéd ezt a projektet?"}
        confirmText={t("common.delete") || "Törlés"}
        cancelText={t("common.cancel") || "Mégse"}
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        onCancel={() => setDeleteConfirmId(null)}
        theme={theme}
      />
    </div>
  );
};

