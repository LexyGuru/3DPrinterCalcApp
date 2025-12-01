import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task, Settings, Offer, Project, TaskStatus, TaskPriority } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import type { TranslationKey } from "../utils/languages";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";
import { EmptyState } from "./EmptyState";
import { loadTasks } from "../utils/store";
import { useUndoRedo } from "../hooks/useUndoRedo";
import { useKeyboardShortcut } from "../utils/keyboardShortcuts";
import { auditCreate, auditUpdate, auditDelete } from "../utils/auditLog";
import {
  createTask,
  updateTask,
  deleteTask,
  changeTaskStatus,
} from "../utils/tasks";

interface Props {
  tasks: Task[];
  setTasks: (t: Task[]) => void;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
  offers: Offer[]; // Árajánlatok a feladatokhoz
  projects: Project[]; // Projektek a feladatokhoz
  triggerAddForm?: boolean; // Gyors művelet gomb esetén automatikusan megnyitja a formot
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: "#dc3545",
  medium: "#ffc107",
  low: "#28a745",
};

const PRIORITY_LABELS: Record<TaskPriority, TranslationKey> = {
  high: "tasks.priority.high",
  medium: "tasks.priority.medium",
  low: "tasks.priority.low",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: "#6c757d",
  "in-progress": "#0d6efd",
  completed: "#198754",
  cancelled: "#dc3545",
};

const STATUS_LABELS: Record<TaskStatus, TranslationKey> = {
  pending: "tasks.status.pending",
  "in-progress": "tasks.status.inProgress",
  completed: "tasks.status.completed",
  cancelled: "tasks.status.cancelled",
};

export const Tasks: React.FC<Props> = ({
  tasks,
  setTasks,
  settings,
  theme,
  themeStyles,
  offers,
  projects,
  triggerAddForm,
}) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();

  // Undo/Redo hook
  const {
    state: tasksWithHistory,
    setState: setTasksWithHistory,
    undo,
    canUndo,
    reset: resetHistory,
  } = useUndoRedo<Task[]>(tasks, 50);

  // Sync tasks with history when external changes occur
  const prevTasksRef = useRef<string>(JSON.stringify(tasks));
  useEffect(() => {
    const currentTasks = JSON.stringify(tasks);
    const currentHistory = JSON.stringify(tasksWithHistory);

    if (prevTasksRef.current !== currentTasks && currentTasks !== currentHistory) {
      resetHistory(tasks);
      prevTasksRef.current = currentTasks;
    }
  }, [tasks, tasksWithHistory, resetHistory]);

  // Update parent when history changes
  const prevHistoryRef = useRef<string>(JSON.stringify(tasksWithHistory));
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    const currentHistory = JSON.stringify(tasksWithHistory);
    const currentTasks = JSON.stringify(tasks);

    if (prevHistoryRef.current !== currentHistory && !isUpdatingRef.current && currentHistory !== currentTasks) {
      isUpdatingRef.current = true;
      prevHistoryRef.current = currentHistory;

      setTimeout(() => {
        setTasks(tasksWithHistory);
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [tasksWithHistory, tasks, setTasks]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [dueDate, setDueDate] = useState<string>("");
  const [relatedOfferId, setRelatedOfferId] = useState<number | "">("");
  const [relatedProjectId, setRelatedProjectId] = useState<number | "">("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Gyors művelet gomb esetén automatikusan megnyitja a formot
  useEffect(() => {
    if (triggerAddForm && !showAddForm && editingTaskId === null) {
      setShowAddForm(true);
    }
  }, [triggerAddForm, showAddForm, editingTaskId]);

  // Escape billentyű kezelése a modal bezárásához
  useEffect(() => {
    if (!showAddForm && !selectedTask) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedTask) {
          setSelectedTask(null);
        } else {
          handleCancel();
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showAddForm, selectedTask]);

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

  // Határidő formázása
  const formatDueDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return t("common.overdue") || "Késésben";
    if (diffDays === 0) return t("common.today") || "Ma";
    if (diffDays === 1) return t("common.tomorrow") || "Holnap";
    if (diffDays < 7) return `${diffDays} ${t("common.days") || "nap"}`;
    
    return date.toLocaleDateString(settings.language === "hu" ? "hu-HU" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Szűrt feladatok
  const filteredTasks = useMemo(() => {
    let filtered = tasksWithHistory;

    // Státusz szűrés
    if (statusFilter !== "all") {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Prioritás szűrés
    if (priorityFilter !== "all") {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }

    // Keresés
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.title.toLowerCase().includes(term) ||
          (t.description && t.description.toLowerCase().includes(term))
      );
    }

    // Határidő szerint rendezés (közelgő feladatok előre)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return dateA - dateB;
    });
  }, [tasksWithHistory, statusFilter, priorityFilter, searchTerm]);

  // Későn lévő feladatok száma
  const overdueCount = useMemo(() => {
    const now = new Date();
    return tasksWithHistory.filter(t => {
      if (t.status === "completed" || t.status === "cancelled") return false;
      return new Date(t.dueDate).getTime() < now.getTime();
    }).length;
  }, [tasksWithHistory]);

  // Üres form alaphelyzetbe állítása
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setStatus("pending");
    setDueDate("");
    setRelatedOfferId("");
    setRelatedProjectId("");
  };

  // Form megnyitása szerkesztéshez
  const handleEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.dueDate ? task.dueDate.split('T')[0] : ""); // ISO date to date input format
    setRelatedOfferId(task.relatedOfferId || "");
    setRelatedProjectId(task.relatedProjectId || "");
    setShowAddForm(true);
  };

  // Form mentése
  const handleSave = async () => {
    if (!title.trim()) {
      showToast(t("tasks.validation.titleRequired") || "Feladat cím kötelező", "error");
      return;
    }

    if (!dueDate) {
      showToast(t("tasks.validation.dueDateRequired") || "Határidő kötelező", "error");
      return;
    }

    try {
      if (editingTaskId) {
        // Szerkesztés
        const updated = await updateTask(editingTaskId, {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          status,
          dueDate: new Date(dueDate).toISOString(),
          relatedOfferId: relatedOfferId ? Number(relatedOfferId) : undefined,
          relatedProjectId: relatedProjectId ? Number(relatedProjectId) : undefined,
        });

        if (updated) {
          const newTasks = tasksWithHistory.map(t =>
            t.id === editingTaskId ? updated : t
          );
          setTasksWithHistory(newTasks);
          auditUpdate("task", updated.id.toString(), "task", updated);
          showToast(t("tasks.updated") || "Feladat frissítve", "success");
        }
      } else {
        // Új feladat
        const newTask = await createTask({
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          status,
          dueDate: new Date(dueDate).toISOString(),
          relatedOfferId: relatedOfferId ? Number(relatedOfferId) : undefined,
          relatedProjectId: relatedProjectId ? Number(relatedProjectId) : undefined,
        });

        const newTasks = [...tasksWithHistory, newTask];
        setTasksWithHistory(newTasks);
        auditCreate("task", newTask.id.toString(), "task", newTask);
        showToast(t("tasks.created") || "Feladat létrehozva", "success");
      }

      // Adatok mentése
      const allTasks = await loadTasks();
      setTasks(allTasks);

      resetForm();
      setShowAddForm(false);
      setEditingTaskId(null);
    } catch (error) {
      console.error("Hiba a feladat mentésekor:", error);
      showToast(t("common.error") || "Hiba történt", "error");
    }
  };

  // Form megszakítása
  const handleCancel = () => {
    resetForm();
    setShowAddForm(false);
    setEditingTaskId(null);
  };

  // Feladat törlése
  const handleDelete = async (taskId: number) => {
    try {
      const success = await deleteTask(taskId);
      if (success) {
        const newTasks = tasksWithHistory.filter(t => t.id !== taskId);
        setTasksWithHistory(newTasks);
        auditDelete("task", taskId.toString(), "task", { id: taskId });
        showToast(t("tasks.deleted") || "Feladat törölve", "success");
        
        // Adatok mentése
        const allTasks = await loadTasks();
        setTasks(allTasks);
      }
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Hiba a feladat törlésekor:", error);
      showToast(t("common.error") || "Hiba történt", "error");
    }
  };

  // Feladat részletes nézet
  const handleViewDetails = (task: Task) => {
    setSelectedTask(task);
  };

  // Feladat státusz változtatása
  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      const updated = await changeTaskStatus(taskId, newStatus);
      if (updated) {
        const newTasks = tasksWithHistory.map(t =>
          t.id === taskId ? updated : t
        );
        setTasksWithHistory(newTasks);
        auditUpdate("task", updated.id.toString(), "task", updated);
        
        // Adatok mentése
        const allTasks = await loadTasks();
        setTasks(allTasks);
        
        showToast(t("tasks.statusChanged") || "Feladat státusza változott", "success");
      }
    } catch (error) {
      console.error("Hiba a feladat státusz változtatásakor:", error);
      showToast(t("common.error") || "Hiba történt", "error");
    }
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
          placeholder={t("tasks.searchPlaceholder") || "Keresés feladatok között..."}
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
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "all")}
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
          <option value="all">{t("tasks.filter.all") || "Összes"}</option>
          <option value="pending">{t(STATUS_LABELS.pending) || "Függőben"}</option>
          <option value="in-progress">{t(STATUS_LABELS["in-progress"]) || "Folyamatban"}</option>
          <option value="completed">{t(STATUS_LABELS.completed) || "Befejezve"}</option>
          <option value="cancelled">{t(STATUS_LABELS.cancelled) || "Törölve"}</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "all")}
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
          <option value="all">{t("tasks.filter.allPriorities") || "Összes prioritás"}</option>
          <option value="high">{t(PRIORITY_LABELS.high) || "Magas"}</option>
          <option value="medium">{t(PRIORITY_LABELS.medium) || "Közepes"}</option>
          <option value="low">{t(PRIORITY_LABELS.low) || "Alacsony"}</option>
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
          + {t("tasks.addNew") || "Új feladat"}
        </button>
      </div>

      {/* Statisztikák */}
      {overdueCount > 0 && (
        <div style={{
          marginBottom: "20px",
          padding: "12px 16px",
          borderRadius: "8px",
          backgroundColor: `${PRIORITY_COLORS.high}20`,
          border: `1px solid ${PRIORITY_COLORS.high}`,
          color: PRIORITY_COLORS.high,
          fontSize: "14px",
          fontWeight: "600",
        }}>
          ⚠️ {t("tasks.overdueCount", { count: overdueCount }) || `${overdueCount} későn lévő feladat`}
        </div>
      )}

      {/* Feladatok listája */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          title={searchTerm || statusFilter !== "all" || priorityFilter !== "all"
            ? (t("tasks.emptyFiltered") || "Nincs találat")
            : (t("tasks.empty") || "Nincsenek feladatok")}
          actionLabel={t("tasks.addFirst") || "Első feladat hozzáadása"}
          onAction={() => setShowAddForm(true)}
          theme={theme}
          themeStyles={themeStyles}
          settings={settings}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
          {filteredTasks.map((task) => {
            const isOverdue = new Date(task.dueDate).getTime() < new Date().getTime() && 
                             task.status !== "completed" && task.status !== "cancelled";
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: "12px",
                  padding: "20px",
                  border: `2px solid ${isOverdue ? PRIORITY_COLORS.high : theme.colors.border}`,
                  boxShadow: isGradientBackground
                    ? `0 8px 24px rgba(0,0,0,0.15)`
                    : `0 4px 16px ${theme.colors.shadow}`,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                whileHover={{ scale: 1.02, boxShadow: `0 8px 32px ${theme.colors.shadow}` }}
                onClick={() => handleViewDetails(task)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: theme.colors.text, flex: 1 }}>
                    {task.title}
                  </h3>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor: `${PRIORITY_COLORS[task.priority]}20`,
                        color: PRIORITY_COLORS[task.priority],
                      }}
                    >
                      {t(PRIORITY_LABELS[task.priority]) || task.priority}
                    </span>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor: `${STATUS_COLORS[task.status]}20`,
                        color: STATUS_COLORS[task.status],
                      }}
                    >
                      {t(STATUS_LABELS[task.status]) || task.status}
                    </span>
                  </div>
                </div>

                {task.description && (
                  <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: theme.colors.textMuted }}>
                    {task.description}
                  </p>
                )}

                {/* Határidő */}
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "12px", color: theme.colors.textMuted, marginBottom: "4px" }}>
                    {t("common.dueDate") || "Határidő"}
                  </div>
                  <div style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: isOverdue ? PRIORITY_COLORS.high : theme.colors.text,
                  }}>
                    {formatDueDate(task.dueDate)} ({new Date(task.dueDate).toLocaleDateString()})
                  </div>
                </div>

                {/* Kapcsolatok */}
                {(task.relatedOfferId || task.relatedProjectId) && (
                  <div style={{ fontSize: "12px", color: theme.colors.textMuted, marginBottom: "12px" }}>
                    {task.relatedOfferId && (
                      <div>
                        {t("tasks.relatedOffer") || "Árajánlat"}: #{task.relatedOfferId}
                      </div>
                    )}
                    {task.relatedProjectId && (
                      <div>
                        {t("tasks.relatedProject") || "Projekt"}: {projects.find(p => p.id === task.relatedProjectId)?.name || `#${task.relatedProjectId}`}
                      </div>
                    )}
                  </div>
                )}

                {/* Művelet gombok */}
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(task);
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
                  {task.status !== "completed" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(task.id, "completed");
                      }}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "6px",
                        border: `1px solid ${STATUS_COLORS.completed}`,
                        backgroundColor: "transparent",
                        color: STATUS_COLORS.completed,
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      {t("tasks.complete") || "Befejezés"}
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(task.id);
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
                {editingTaskId
                  ? (t("tasks.edit") || "Feladat szerkesztése")
                  : (t("tasks.addNew") || "Új feladat")}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
                    {t("tasks.title") || "Cím"} *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
                    {t("tasks.description") || "Leírás"}
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
                      {t("tasks.priority") || "Prioritás"}
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
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
                      <option value="high">{t(PRIORITY_LABELS.high) || "Magas"}</option>
                      <option value="medium">{t(PRIORITY_LABELS.medium) || "Közepes"}</option>
                      <option value="low">{t(PRIORITY_LABELS.low) || "Alacsony"}</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
                      {t("tasks.status") || "Státusz"}
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as TaskStatus)}
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
                      <option value="pending">{t(STATUS_LABELS.pending) || "Függőben"}</option>
                      <option value="in-progress">{t(STATUS_LABELS["in-progress"]) || "Folyamatban"}</option>
                      <option value="completed">{t(STATUS_LABELS.completed) || "Befejezve"}</option>
                      <option value="cancelled">{t(STATUS_LABELS.cancelled) || "Törölve"}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
                    {t("common.dueDate") || "Határidő"} *
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
                      {t("tasks.relatedOffer") || "Kapcsolt árajánlat"}
                    </label>
                    <select
                      value={relatedOfferId}
                      onChange={(e) => setRelatedOfferId(e.target.value === "" ? "" : Number(e.target.value))}
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
                      <option value="">{t("tasks.none") || "Nincs"}</option>
                      {offers.map(offer => (
                        <option key={offer.id} value={offer.id}>
                          #{offer.id} - {offer.customerName || t("common.unnamedCustomer") || "Névtelen ügyfél"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
                      {t("tasks.relatedProject") || "Kapcsolt projekt"}
                    </label>
                    <select
                      value={relatedProjectId}
                      onChange={(e) => setRelatedProjectId(e.target.value === "" ? "" : Number(e.target.value))}
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
                      <option value="">{t("tasks.none") || "Nincs"}</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
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

      {/* Feladat részletes nézet modal */}
      <AnimatePresence>
        {selectedTask && (
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
            onClick={() => setSelectedTask(null)}
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
                  {selectedTask.title}
                </h2>
                <button
                  onClick={() => setSelectedTask(null)}
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

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: "600",
                      backgroundColor: `${PRIORITY_COLORS[selectedTask.priority]}20`,
                      color: PRIORITY_COLORS[selectedTask.priority],
                    }}
                  >
                    {t(PRIORITY_LABELS[selectedTask.priority]) || selectedTask.priority}
                  </span>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: "600",
                      backgroundColor: `${STATUS_COLORS[selectedTask.status]}20`,
                      color: STATUS_COLORS[selectedTask.status],
                    }}
                  >
                    {t(STATUS_LABELS[selectedTask.status]) || selectedTask.status}
                  </span>
                </div>

                {selectedTask.description && (
                  <p style={{ fontSize: "14px", color: theme.colors.text }}>
                    {selectedTask.description}
                  </p>
                )}

                <div>
                  <div style={{ fontSize: "12px", color: theme.colors.textMuted, marginBottom: "4px" }}>
                    {t("common.dueDate") || "Határidő"}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
                    {new Date(selectedTask.dueDate).toLocaleDateString()}
                  </div>
                </div>

                {(selectedTask.relatedOfferId || selectedTask.relatedProjectId) && (
                  <div>
                    {selectedTask.relatedOfferId && (
                      <div>
                        <div style={{ fontSize: "12px", color: theme.colors.textMuted, marginBottom: "4px" }}>
                          {t("tasks.relatedOffer") || "Kapcsolt árajánlat"}
                        </div>
                        <div style={{ fontSize: "14px", color: theme.colors.text }}>
                          #{selectedTask.relatedOfferId}
                        </div>
                      </div>
                    )}
                    {selectedTask.relatedProjectId && (
                      <div style={{ marginTop: "8px" }}>
                        <div style={{ fontSize: "12px", color: theme.colors.textMuted, marginBottom: "4px" }}>
                          {t("tasks.relatedProject") || "Kapcsolt projekt"}
                        </div>
                        <div style={{ fontSize: "14px", color: theme.colors.text }}>
                          {projects.find(p => p.id === selectedTask.relatedProjectId)?.name || `#${selectedTask.relatedProjectId}`}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedTask.status !== "completed" && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedTask.id, "completed");
                      setSelectedTask(null);
                    }}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: STATUS_COLORS.completed,
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    {t("tasks.complete") || "Befejezés"}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Törlés megerősítés */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        title={t("tasks.deleteConfirm") || "Feladat törlése"}
        message={t("tasks.deleteConfirmMessage") || "Biztosan törölni szeretnéd ezt a feladatot?"}
        confirmText={t("common.delete") || "Törlés"}
        cancelText={t("common.cancel") || "Mégse"}
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        onCancel={() => setDeleteConfirmId(null)}
        theme={theme}
      />
    </div>
  );
};

