import { Store } from "@tauri-apps/plugin-store";
import type { Printer, Filament, Settings, Offer, CalculationTemplate } from "../types";

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
  try {
    console.log("💾 Nyomtatók mentése...", { count: printers.length });
    const store = await getStore();
    await store.set("printers", printers);
    await store.save();
    console.log("✅ Nyomtatók sikeresen mentve", { count: printers.length });
  } catch (error) {
    console.error("❌ Hiba a nyomtatók mentésekor:", error);
    throw error;
  }
}

export async function loadPrinters(): Promise<Printer[]> {
  const store = await getStore();
  try {
    console.log("📥 Nyomtatók betöltése...");
    const data = await store.get("printers");
    const printers = Array.isArray(data) ? data : [];
    console.log("✅ Nyomtatók betöltve", { count: printers.length });
    return printers;
  } catch (error) {
    console.error("❌ Hiba a nyomtatók betöltésekor:", error);
    return [];
  }
}

// Filaments
export async function saveFilaments(filaments: Filament[]): Promise<void> {
  try {
    console.log("💾 Filamentek mentése...", { count: filaments.length });
    const store = await getStore();
    await store.set("filaments", filaments);
    await store.save();
    console.log("✅ Filamentek sikeresen mentve", { count: filaments.length });
  } catch (error) {
    console.error("❌ Hiba a filamentek mentésekor:", error);
    throw error;
  }
}

export async function loadFilaments(): Promise<Filament[]> {
  const store = await getStore();
  try {
    console.log("📥 Filamentek betöltése...");
    const data = await store.get("filaments");
    if (Array.isArray(data) && data.length > 0) {
      console.log("✅ Filamentek betöltve", { count: data.length });
      return data;
    }
    console.log("ℹ️ Nincs mentett filament");
  } catch (error) {
    console.error("❌ Hiba a filamentek betöltésekor:", error);
  }
  // Üres tömböt adunk vissza, ha nincs mentett adat (nem adjuk vissza az alapértelmezett filamenteket)
  return [];
}

// Settings
export async function saveSettings(settings: Settings): Promise<void> {
  try {
    console.log("💾 Beállítások mentése...", { 
      currency: settings.currency, 
      language: settings.language,
      theme: settings.theme 
    });
    const store = await getStore();
    await store.set("settings", settings);
    await store.save();
    console.log("✅ Beállítások sikeresen mentve");
  } catch (error) {
    console.error("❌ Hiba a beállítások mentésekor:", error);
    throw error;
  }
}

export async function loadSettings(): Promise<Settings | null> {
  const store = await getStore();
  try {
    console.log("📥 Beállítások betöltése...");
    const data = await store.get("settings");
    if (data) {
      console.log("✅ Beállítások betöltve", { currency: (data as Settings).currency });
    } else {
      console.log("ℹ️ Nincs mentett beállítás");
    }
    return data as Settings | null;
  } catch (error) {
    console.error("❌ Hiba a beállítások betöltésekor:", error);
    return null;
  }
}

// Offers
export async function saveOffers(offers: Offer[]): Promise<void> {
  try {
    console.log("💾 Árajánlatok mentése...", { count: offers.length });
    const store = await getStore();
    await store.set("offers", offers);
    await store.save();
    console.log("✅ Árajánlatok sikeresen mentve", { count: offers.length });
  } catch (error) {
    console.error("❌ Hiba az árajánlatok mentésekor:", error);
    throw error;
  }
}

export async function loadOffers(): Promise<Offer[]> {
  const store = await getStore();
  try {
    console.log("📥 Árajánlatok betöltése...");
    const data = await store.get("offers");
    const offers = Array.isArray(data) ? data : [];
    // Javítjuk a régi árajánlatokat, amelyeknek nincs currency mezője
    const fixedOffers = offers.map((offer: any) => {
      if (!offer.currency) {
        offer.currency = "EUR"; // Alapértelmezett pénznem a régi árajánlatokhoz
      }
      return offer;
    });
    console.log("✅ Árajánlatok betöltve", { count: fixedOffers.length });
    return fixedOffers;
  } catch (error) {
    console.error("❌ Hiba az árajánlatok betöltésekor:", error);
    return [];
  }
}

// Templates
export async function saveTemplates(templates: CalculationTemplate[]): Promise<void> {
  try {
    console.log("💾 Template-ek mentése...", { count: templates.length });
    const store = await getStore();
    await store.set("templates", templates);
    await store.save();
    console.log("✅ Template-ek sikeresen mentve", { count: templates.length });
  } catch (error) {
    console.error("❌ Hiba a template-ek mentésekor:", error);
    throw error;
  }
}

export async function loadTemplates(): Promise<CalculationTemplate[]> {
  const store = await getStore();
  try {
    console.log("📥 Template-ek betöltése...");
    const data = await store.get("templates");
    const templates = Array.isArray(data) ? data : [];
    console.log("✅ Template-ek betöltve", { count: templates.length });
    return templates;
  } catch (error) {
    console.error("❌ Hiba a template-ek betöltésekor:", error);
    return [];
  }
}
