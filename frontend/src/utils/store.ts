import { Store } from "@tauri-apps/plugin-store";
import type { Printer, Filament, Settings, Offer, CalculationTemplate, Customer, PriceHistory, Project, Task } from "../types";
// deleteAllAutomaticBackups import eltávolítva - a FactoryResetProgress modal kezeli a backup fájlok törlését
import { remove, exists } from "@tauri-apps/plugin-fs";
import { BaseDirectory } from "@tauri-apps/plugin-fs";

// Lazy-initialized store
let storeInstance: Store | null = null;

async function getStore(): Promise<Store> {
  if (!storeInstance) {
    // Ellenőrizzük, hogy létezik-e a data.json fájl, mielőtt betöltjük a Store-t
    // Ha nem létezik, akkor nem hozzuk létre automatikusan (Factory Reset után)
    const dataJsonExists = await exists("data.json", { baseDir: BaseDirectory.AppConfig });
    if (!dataJsonExists) {
      // Ha nincs data.json, akkor még nem hozzuk létre a Store-t
      // Ez biztosítja, hogy a Factory Reset után ne generálódjon automatikusan a fájl
      // A Store.load() automatikusan létrehozza a fájlt, ha nem létezik, ezért először
      // ellenőrizzük, és csak akkor hozzuk létre a Store-t, ha a fájl már létezik
      throw new Error("data.json fájl nem létezik. Kérjük, válasszon nyelvet először.");
    }
    storeInstance = await Store.load("data.json");
  }
  return storeInstance;
}

// Exportált függvény a Store instance resetelésére (Factory Reset után)
export function resetStoreInstance(): void {
  storeInstance = null;
}

// Printers
export async function savePrinters(printers: Printer[]): Promise<void> {
  try {
    if (import.meta.env.DEV) {
      console.log("💾 Nyomtatók mentése...", { count: printers.length });
    }
    const store = await getStore();
    await store.set("printers", printers);
    await store.save();
    if (import.meta.env.DEV) {
      console.log("✅ Nyomtatók sikeresen mentve", { count: printers.length });
    }
  } catch (error) {
    console.error("❌ Hiba a nyomtatók mentésekor:", error);
    throw error;
  }
}

export async function loadPrinters(): Promise<Printer[]> {
  const store = await getStore();
  try {
    if (import.meta.env.DEV) {
      console.log("📥 Nyomtatók betöltése...");
    }
    const data = await store.get("printers");
    const printers = Array.isArray(data) ? data : [];
    if (import.meta.env.DEV) {
      console.log("✅ Nyomtatók betöltve", { count: printers.length });
    }
    return printers;
  } catch (error) {
    console.error("❌ Hiba a nyomtatók betöltésekor:", error);
    return [];
  }
}

// Filaments
export async function saveFilaments(filaments: Filament[]): Promise<void> {
  try {
    if (import.meta.env.DEV) {
      console.log("💾 Filamentek mentése...", { count: filaments.length });
    }
    const store = await getStore();
    await store.set("filaments", filaments);
    await store.save();
    if (import.meta.env.DEV) {
      console.log("✅ Filamentek sikeresen mentve", { count: filaments.length });
    }
  } catch (error) {
    console.error("❌ Hiba a filamentek mentésekor:", error);
    throw error;
  }
}

export async function loadFilaments(): Promise<Filament[]> {
  const store = await getStore();
  try {
    if (import.meta.env.DEV) {
      console.log("📥 Filamentek betöltése...");
    }
    const data = await store.get("filaments");
    if (Array.isArray(data) && data.length > 0) {
      if (import.meta.env.DEV) {
        console.log("✅ Filamentek betöltve", { count: data.length });
      }
      return data;
    }
    if (import.meta.env.DEV) {
      console.log("ℹ️ Nincs mentett filament");
    }
  } catch (error) {
    console.error("❌ Hiba a filamentek betöltésekor:", error);
  }
  // Üres tömböt adunk vissza, ha nincs mentett adat (nem adjuk vissza az alapértelmezett filamenteket)
  return [];
}

// Settings
export async function saveSettings(settings: Settings): Promise<void> {
  try {
    if (import.meta.env.DEV) {
      console.log("💾 Beállítások mentése...", { 
        currency: settings.currency, 
        language: settings.language,
        theme: settings.theme 
      });
    }
    
    // Ha a getStore() hibát dob (mert nincs data.json), akkor először létrehozzuk a Store-t
    let store: Store;
    try {
      store = await getStore();
    } catch (error) {
      // Ha nincs data.json, akkor most létrehozzuk (pl. nyelvválasztó után)
      if (import.meta.env.DEV) {
        console.log("ℹ️ data.json nem létezik, létrehozás...");
      }
      store = await Store.load("data.json");
      storeInstance = store; // Frissítjük a storeInstance-t
    }
    
    await store.set("settings", settings);
    await store.save();
    if (import.meta.env.DEV) {
      console.log("✅ Beállítások sikeresen mentve");
    }
  } catch (error) {
    console.error("❌ Hiba a beállítások mentésekor:", error);
    throw error;
  }
}

export async function loadSettings(): Promise<Settings | null> {
  try {
    // Ha nincs data.json, akkor null-t adunk vissza (nem hibaként kezeljük)
    let store: Store;
    try {
      store = await getStore();
    } catch (error) {
      // Ha nincs data.json (pl. Factory Reset után), akkor null-t adunk vissza
      if (import.meta.env.DEV) {
        console.log("ℹ️ data.json nem létezik, nincsenek mentett beállítások");
      }
      return null;
    }
    
    if (import.meta.env.DEV) {
      console.log("📥 Beállítások betöltése...");
    }
    const data = await store.get("settings");
    if (data) {
      if (import.meta.env.DEV) {
        console.log("✅ Beállítások betöltve", { currency: (data as Settings).currency });
      }
    } else {
      if (import.meta.env.DEV) {
        console.log("ℹ️ Nincs mentett beállítás");
      }
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
    if (import.meta.env.DEV) {
      console.log("💾 Árajánlatok mentése...", { count: offers.length });
    }
    const store = await getStore();
    await store.set("offers", offers);
    await store.save();
    if (import.meta.env.DEV) {
      console.log("✅ Árajánlatok sikeresen mentve", { count: offers.length });
    }
  } catch (error) {
    console.error("❌ Hiba az árajánlatok mentésekor:", error);
    throw error;
  }
}

export async function loadOffers(): Promise<Offer[]> {
  const store = await getStore();
  try {
    if (import.meta.env.DEV) {
      console.log("📥 Árajánlatok betöltése...");
    }
    const data = await store.get("offers");
    const offers = Array.isArray(data) ? data : [];
    // Javítjuk a régi árajánlatokat, amelyeknek nincs currency mezője vagy costs objektuma
    const fixedOffers = offers.map((offer: any) => {
      if (!offer.currency) {
        offer.currency = "EUR"; // Alapértelmezett pénznem a régi árajánlatokhoz
      }
      // Ha nincs costs objektum, hozzáadjuk egy üreset (ez nem ideális, de megelőzi a hibákat)
      if (!offer.costs) {
        console.warn(`[Store] Offer ${offer.id} has no costs object, adding default costs`);
        offer.costs = {
          filamentCost: 0,
          electricityCost: 0,
          dryingCost: 0,
          usageCost: 0,
          totalCost: 0,
        };
      }
      return offer;
    });
    if (import.meta.env.DEV) {
      console.log("✅ Árajánlatok betöltve", { count: fixedOffers.length });
      // Logoljuk, hogy mely árajánlatoknak nincs costs objektuma
      const offersWithoutCosts = fixedOffers.filter((o: any) => !o.costs);
      if (offersWithoutCosts.length > 0) {
        console.warn(`[Store] ${offersWithoutCosts.length} árajánlatnak nincs costs objektuma:`, offersWithoutCosts.map((o: any) => o.id));
      }
    }
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

// Customers
export async function saveCustomers(customers: Customer[]): Promise<void> {
  try {
    if (import.meta.env.DEV) {
      console.log("💾 Ügyfelek mentése...", { count: customers.length });
    }
    const store = await getStore();
    await store.set("customers", customers);
    await store.save();
    if (import.meta.env.DEV) {
      console.log("✅ Ügyfelek sikeresen mentve", { count: customers.length });
    }
  } catch (error) {
    console.error("❌ Hiba az ügyfelek mentésekor:", error);
    throw error;
  }
}

export async function loadCustomers(): Promise<Customer[]> {
  const store = await getStore();
  try {
    if (import.meta.env.DEV) {
      console.log("📥 Ügyfelek betöltése...");
    }
    const data = await store.get("customers");
    const customers = Array.isArray(data) ? data : [];
    if (import.meta.env.DEV) {
      console.log("✅ Ügyfelek betöltve", { count: customers.length });
    }
    return customers;
  } catch (error) {
    console.error("❌ Hiba az ügyfelek betöltésekor:", error);
    return [];
  }
}

// Price History
export async function savePriceHistory(priceHistory: PriceHistory[]): Promise<void> {
  try {
    console.log("💾 Ár előzmények mentése...", { count: priceHistory.length });
    const store = await getStore();
    await store.set("priceHistory", priceHistory);
    await store.save();
    console.log("✅ Ár előzmények sikeresen mentve", { count: priceHistory.length });
  } catch (error) {
    console.error("❌ Hiba az ár előzmények mentésekor:", error);
    throw error;
  }
}

export async function loadPriceHistory(): Promise<PriceHistory[]> {
  const store = await getStore();
  try {
    console.log("📥 Ár előzmények betöltése...");
    const data = await store.get("priceHistory");
    const priceHistory = Array.isArray(data) ? data : [];
    console.log("✅ Ár előzmények betöltve", { count: priceHistory.length });
    return priceHistory;
  } catch (error) {
    console.error("❌ Hiba az ár előzmények betöltésekor:", error);
    return [];
  }
}

// Projects
export async function saveProjects(projects: Project[]): Promise<void> {
  try {
    if (import.meta.env.DEV) {
      console.log("💾 Projektek mentése...", { count: projects.length });
    }
    const store = await getStore();
    await store.set("projects", projects);
    await store.save();
    if (import.meta.env.DEV) {
      console.log("✅ Projektek sikeresen mentve", { count: projects.length });
    }
  } catch (error) {
    console.error("❌ Hiba a projektek mentésekor:", error);
    throw error;
  }
}

export async function loadProjects(): Promise<Project[]> {
  const store = await getStore();
  try {
    if (import.meta.env.DEV) {
      console.log("📥 Projektek betöltése...");
    }
    const data = await store.get("projects");
    const projects = Array.isArray(data) ? data : [];
    if (import.meta.env.DEV) {
      console.log("✅ Projektek betöltve", { count: projects.length });
    }
    return projects;
  } catch (error) {
    console.error("❌ Hiba a projektek betöltésekor:", error);
    return [];
  }
}

// Tasks
export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    if (import.meta.env.DEV) {
      console.log("💾 Feladatok mentése...", { count: tasks.length });
    }
    const store = await getStore();
    await store.set("tasks", tasks);
    await store.save();
    if (import.meta.env.DEV) {
      console.log("✅ Feladatok sikeresen mentve", { count: tasks.length });
    }
  } catch (error) {
    console.error("❌ Hiba a feladatok mentésekor:", error);
    throw error;
  }
}

export async function loadTasks(): Promise<Task[]> {
  const store = await getStore();
  try {
    if (import.meta.env.DEV) {
      console.log("📥 Feladatok betöltése...");
    }
    const data = await store.get("tasks");
    const tasks = Array.isArray(data) ? data : [];
    if (import.meta.env.DEV) {
      console.log("✅ Feladatok betöltve", { count: tasks.length });
    }
    return tasks;
  } catch (error) {
    console.error("❌ Hiba a feladatok betöltésekor:", error);
    return [];
  }
}

// Clear all data - Factory reset
export async function clearAllData(): Promise<void> {
  try {
    if (import.meta.env.DEV) {
      console.log("🗑️ Összes adat törlése (Factory reset)...");
    }
    const store = await getStore();
    
    // Töröljük az összes kulcsot a Store-ból
    await store.delete("printers");
    await store.delete("filaments");
    await store.delete("offers");
    await store.delete("customers");
    await store.delete("settings");
    await store.delete("templates");
    await store.delete("priceHistory");
    await store.delete("projects");
    await store.delete("tasks");
    
    // MEGJEGYZÉS: A backup és log fájlok törlése a FactoryResetProgress komponensben történik
    // Itt nem töröljük őket, hogy a progress modal-ban külön kezelhessük őket
    
    
    // FONTOS: Nem hívjuk meg a store.save()-et, mert az újra létrehozná az üres fájlt!
    // Ehelyett bezárjuk a Store-t, és utána töröljük a fizikai fájlt
    
    // Reseteljük a storeInstance-t, hogy bezárjuk a Store-t
    // Ez lehetővé teszi a fizikai fájl törlését
    storeInstance = null;
    
    // Nagyobb késleltetés, hogy a Store biztosan bezáruljon
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Töröljük a fizikai fájlokat is
    try {
      // Töröljük a data.json fájlt (Store fájl)
      try {
        const dataJsonExists = await exists("data.json", { baseDir: BaseDirectory.AppConfig });
        if (dataJsonExists) {
          await remove("data.json", { baseDir: BaseDirectory.AppConfig });
          if (import.meta.env.DEV) {
            console.log("🗑️ data.json törölve");
          }
        } else {
          if (import.meta.env.DEV) {
            console.log("ℹ️ data.json nem létezett");
          }
        }
      } catch (error) {
        console.error("❌ Hiba a data.json törlésekor:", error);
        // Folytatjuk a többi fájl törlésével
      }
      
      // Töröljük a filamentLibrary.json fájlt
      try {
        const filamentLibraryExists = await exists("filamentLibrary.json", { baseDir: BaseDirectory.AppConfig });
        if (filamentLibraryExists) {
          await remove("filamentLibrary.json", { baseDir: BaseDirectory.AppConfig });
          if (import.meta.env.DEV) {
            console.log("🗑️ filamentLibrary.json törölve");
          }
        } else {
          if (import.meta.env.DEV) {
            console.log("ℹ️ filamentLibrary.json nem létezett");
          }
        }
      } catch (error) {
        console.error("❌ Hiba a filamentLibrary.json törlésekor:", error);
        // Folytatjuk a többi fájl törlésével
      }
      
      // Töröljük az update_filamentLibrary.json fájlt
      try {
        const updateFilamentLibraryExists = await exists("update_filamentLibrary.json", { baseDir: BaseDirectory.AppConfig });
        if (updateFilamentLibraryExists) {
          await remove("update_filamentLibrary.json", { baseDir: BaseDirectory.AppConfig });
          if (import.meta.env.DEV) {
            console.log("🗑️ update_filamentLibrary.json törölve");
          }
        } else {
          if (import.meta.env.DEV) {
            console.log("ℹ️ update_filamentLibrary.json nem létezett");
          }
        }
      } catch (error) {
        console.error("❌ Hiba az update_filamentLibrary.json törlésekor:", error);
        // Folytatjuk
      }
    } catch (error) {
      console.error("❌ Hiba a fizikai fájlok törlésekor:", error);
      // Ne dobjuk el a hibát, mert a Store már törölve lett
    }
    
    if (import.meta.env.DEV) {
      console.log("✅ Összes adat törölve (Factory reset kész)");
    }
  } catch (error) {
    console.error("❌ Hiba az adatok törlésekor:", error);
    throw error;
  }
}
