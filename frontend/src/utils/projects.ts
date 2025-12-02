import type { Project, Offer } from "../types";
import { loadProjects, saveProjects } from "./store";

/**
 * Új projekt létrehozása
 */
export async function createProject(project: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
  const projects = await loadProjects();
  
  // Új ID generálása
  const maxId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) : 0;
  const newId = maxId + 1;
  
  const now = new Date().toISOString();
  const newProject: Project = {
    ...project,
    id: newId,
    createdAt: now,
    updatedAt: now,
    offerIds: project.offerIds || [],
    progress: project.progress || 0,
    status: project.status || "active",
  };
  
  projects.push(newProject);
  await saveProjects(projects);
  
  return newProject;
}

/**
 * Projekt frissítése
 */
export async function updateProject(projectId: number, updates: Partial<Omit<Project, "id" | "createdAt">>): Promise<Project | null> {
  const projects = await loadProjects();
  const index = projects.findIndex(p => p.id === projectId);
  
  if (index === -1) {
    return null;
  }
  
  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await saveProjects(projects);
  return projects[index];
}

/**
 * Projekt törlése
 */
export async function deleteProject(projectId: number): Promise<boolean> {
  const projects = await loadProjects();
  const index = projects.findIndex(p => p.id === projectId);
  
  if (index === -1) {
    return false;
  }
  
  projects.splice(index, 1);
  await saveProjects(projects);
  return true;
}

/**
 * Projekt lekérése ID alapján
 */
export async function getProjectById(projectId: number): Promise<Project | null> {
  const projects = await loadProjects();
  return projects.find(p => p.id === projectId) || null;
}

/**
 * Projekt progress automatikus számítása kapcsolt árajánlatok alapján
 */
export function calculateProjectProgress(offers: Offer[]): number {
  if (offers.length === 0) return 0;
  
  const statusWeights: Record<string, number> = {
    "draft": 0,
    "sent": 25,
    "accepted": 75,
    "completed": 100,
    "rejected": 0,
  };
  
  const totalWeight = offers.reduce((sum, offer) => {
    const status = offer.status || "draft";
    return sum + (statusWeights[status] || 0);
  }, 0);
  
  return Math.round(totalWeight / offers.length);
}

/**
 * Projekt progress frissítése kapcsolt árajánlatok alapján
 */
export async function updateProjectProgressFromOffers(projectId: number, offers: Offer[]): Promise<Project | null> {
  const project = await getProjectById(projectId);
  if (!project) return null;
  
  // Szűrjük a kapcsolt árajánlatokat
  const relatedOffers = offers.filter(offer => project.offerIds.includes(offer.id));
  const progress = calculateProjectProgress(relatedOffers);
  
  // Számoljuk a tényleges költséget is
  const actualCost = relatedOffers.reduce((sum, offer) => {
    return sum + (offer.costs?.totalCost || 0);
  }, 0);
  
  return updateProject(projectId, {
    progress,
    actualCost,
  });
}

/**
 * Projektek listázása státusz szerint
 */
export async function getProjectsByStatus(status: Project["status"]): Promise<Project[]> {
  const projects = await loadProjects();
  return projects.filter(p => p.status === status);
}

/**
 * Aktív projektek lekérése
 */
export async function getActiveProjects(): Promise<Project[]> {
  return getProjectsByStatus("active");
}

/**
 * Projekt árajánlat kapcsolat hozzáadása
 */
export async function addOfferToProject(projectId: number, offerId: number): Promise<Project | null> {
  const project = await getProjectById(projectId);
  if (!project) return null;
  
  if (project.offerIds.includes(offerId)) {
    return project; // Már benne van
  }
  
  return updateProject(projectId, {
    offerIds: [...project.offerIds, offerId],
  });
}

/**
 * Projekt árajánlat kapcsolat eltávolítása
 */
export async function removeOfferFromProject(projectId: number, offerId: number): Promise<Project | null> {
  const project = await getProjectById(projectId);
  if (!project) return null;
  
  return updateProject(projectId, {
    offerIds: project.offerIds.filter(id => id !== offerId),
  });
}

