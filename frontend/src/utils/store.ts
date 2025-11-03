import { Store } from "@tauri-apps/plugin-store";
import type { Printer, Filament, Settings, Offer } from "../types";

// Lazy-initialized store
let storeInstance: Store | null = null;

async function getStore(): Promise<Store> {
  if (!storeInstance) {
    storeInstance = await Store.load("data.json");
  }
  return storeInstance;
}

// Printers
export async function savePrinters(printers: Printer[]): Promise<void> {
  const store = await getStore();
  await store.set("printers", printers);
  await store.save();
}

export async function loadPrinters(): Promise<Printer[]> {
  const store = await getStore();
  try {
    const data = await store.get("printers");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error loading printers:", error);
    return [];
  }
}

// Filaments
export async function saveFilaments(filaments: Filament[]): Promise<void> {
  const store = await getStore();
  await store.set("filaments", filaments);
  await store.save();
}

export async function loadFilaments(): Promise<Filament[]> {
  const store = await getStore();
  try {
    const data = await store.get("filaments");
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (error) {
    console.error("Error loading filaments:", error);
  }
  // Üres tömböt adunk vissza, ha nincs mentett adat (nem adjuk vissza az alapértelmezett filamenteket)
  return [];
}

// Settings
export async function saveSettings(settings: Settings): Promise<void> {
  const store = await getStore();
  await store.set("settings", settings);
  await store.save();
}

export async function loadSettings(): Promise<Settings | null> {
  const store = await getStore();
  try {
    const data = await store.get("settings");
    return data as Settings | null;
  } catch (error) {
    console.error("Error loading settings:", error);
    return null;
  }
}

// Offers
export async function saveOffers(offers: Offer[]): Promise<void> {
  const store = await getStore();
  await store.set("offers", offers);
  await store.save();
}

export async function loadOffers(): Promise<Offer[]> {
  const store = await getStore();
  try {
    const data = await store.get("offers");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error loading offers:", error);
    return [];
  }
}
