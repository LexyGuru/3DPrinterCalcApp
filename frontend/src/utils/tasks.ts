import type { Task, Offer } from "../types";
import { loadTasks, saveTasks } from "./store";

/**
 * Új feladat létrehozása
 */
export async function createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
  const tasks = await loadTasks();
  
  // Új ID generálása
  const maxId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) : 0;
  const newId = maxId + 1;
  
  const now = new Date().toISOString();
  const newTask: Task = {
    ...task,
    id: newId,
    createdAt: now,
    updatedAt: now,
    status: task.status || "pending",
    priority: task.priority || "medium",
  };
  
  tasks.push(newTask);
  await saveTasks(tasks);
  
  return newTask;
}

/**
 * Feladat frissítése
 */
export async function updateTask(taskId: number, updates: Partial<Omit<Task, "id" | "createdAt">>): Promise<Task | null> {
  const tasks = await loadTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  
  if (index === -1) {
    return null;
  }
  
  // Ha a státusz "completed"-re változik, beállítjuk a completedAt dátumot
  const completedAt = updates.status === "completed" && tasks[index].status !== "completed"
    ? new Date().toISOString()
    : tasks[index].completedAt;
  
  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
    completedAt,
  };
  
  await saveTasks(tasks);
  return tasks[index];
}

/**
 * Feladat törlése
 */
export async function deleteTask(taskId: number): Promise<boolean> {
  const tasks = await loadTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  
  if (index === -1) {
    return false;
  }
  
  tasks.splice(index, 1);
  await saveTasks(tasks);
  return true;
}

/**
 * Feladat lekérése ID alapján
 */
export async function getTaskById(taskId: number): Promise<Task | null> {
  const tasks = await loadTasks();
  return tasks.find(t => t.id === taskId) || null;
}

/**
 * Feladatok lekérése státusz szerint
 */
export async function getTasksByStatus(status: Task["status"]): Promise<Task[]> {
  const tasks = await loadTasks();
  return tasks.filter(t => t.status === status);
}

/**
 * Feladatok lekérése prioritás szerint
 */
export async function getTasksByPriority(priority: Task["priority"]): Promise<Task[]> {
  const tasks = await loadTasks();
  return tasks.filter(t => t.priority === priority);
}

/**
 * Feladatok lekérése határidő szerint (készülő)
 */
export async function getUpcomingTasks(limit?: number): Promise<Task[]> {
  const tasks = await loadTasks();
  
  // Szűrjük a nem befejezett feladatokat, dátum szerint rendezve
  const upcomingTasks = tasks
    .filter(t => t.status !== "completed" && t.status !== "cancelled")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  return limit ? upcomingTasks.slice(0, limit) : upcomingTasks;
}

/**
 * Későn lévő feladatok lekérése
 */
export async function getOverdueTasks(): Promise<Task[]> {
  const tasks = await loadTasks();
  const now = new Date();
  
  return tasks.filter(t => {
    if (t.status === "completed" || t.status === "cancelled") return false;
    return new Date(t.dueDate).getTime() < now.getTime();
  });
}

/**
 * Feladatok lekérése árajánlat alapján
 */
export async function getTasksByOfferId(offerId: number): Promise<Task[]> {
  const tasks = await loadTasks();
  return tasks.filter(t => t.relatedOfferId === offerId);
}

/**
 * Feladatok lekérése projekt alapján
 */
export async function getTasksByProjectId(projectId: number): Promise<Task[]> {
  const tasks = await loadTasks();
  return tasks.filter(t => t.relatedProjectId === projectId);
}

/**
 * Automatikus feladat generálás árajánlatok határidejéből
 */
export async function createTaskFromOfferDueDate(offer: Offer): Promise<Task | null> {
  if (!offer.printDueDate) return null;
  
  // Ellenőrizzük, hogy már létezik-e feladat ehhez az árajánlathoz
  const existingTasks = await getTasksByOfferId(offer.id);
  const existingTask = existingTasks.find(t => 
    t.title.includes(offer.customerName || `Offer #${offer.id}`) &&
    t.dueDate === offer.printDueDate
  );
  
  if (existingTask) return existingTask;
  
  // Új feladat létrehozása
  return createTask({
    title: `Print order for ${offer.customerName || `Offer #${offer.id}`}`,
    description: `Print due date for offer: ${offer.customerName || `Offer #${offer.id}`}`,
    dueDate: offer.printDueDate,
    priority: "high",
    status: "pending",
    relatedOfferId: offer.id,
  });
}

/**
 * Feladat státusz változtatása
 */
export async function changeTaskStatus(taskId: number, status: Task["status"]): Promise<Task | null> {
  return updateTask(taskId, { status });
}

