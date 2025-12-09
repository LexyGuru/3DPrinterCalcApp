import { Store } from "@tauri-apps/plugin-store";
import type { Printer, Filament, Settings, Offer, CalculationTemplate, Customer, PriceHistory, Project, Task } from "../types";
// deleteAllAutomaticBackups import eltávolítva - a FactoryResetProgress modal kezeli a backup fájlok törlését
import { remove, exists } from "@tauri-apps/plugin-fs";
import { BaseDirectory } from "@tauri-apps/plugin-fs";
import { encryptCustomers, decryptCustomers } from "./customerEncryption";
import { writeFrontendLog, writeFrontendLogAlways } from "./fileLogger";
import { getEncryptionPassword } from "./encryptionPasswordManager";

// Lazy-initialized store
let storeInstance: Store | null = null;

export async function getStore(): Promise<Store> {
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
  customerStoreInstance = null;
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
  try {
    const store = await getStore();
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
    // Ha nincs data.json, akkor nincs adat, üres tömböt adunk vissza
    if (error instanceof Error && error.message.includes("data.json fájl nem létezik")) {
      if (import.meta.env.DEV) {
        console.log("ℹ️ data.json nem létezik, nincs mentett nyomtató");
      }
      return [];
    }
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
  try {
    const store = await getStore();
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
    // Ha nincs data.json, akkor nincs adat, üres tömböt adunk vissza
    if (error instanceof Error && error.message.includes("data.json fájl nem létezik")) {
      if (import.meta.env.DEV) {
        console.log("ℹ️ data.json nem létezik, nincs mentett filament");
      }
      return [];
    }
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
    
    // Ha a titkosítás kikapcsolva van, ne tároljuk a titkosítással kapcsolatos mezőket
    const settingsToSave: any = { ...settings };
    if (!settingsToSave.encryptionEnabled) {
      // Ha kikapcsolva van a titkosítás, töröljük a kapcsolódó mezőket
      delete settingsToSave.encryptionPassword;
      delete settingsToSave.encryptedCustomerData;
      delete settingsToSave.useAppPasswordForEncryption;
    } else if (settingsToSave.useAppPasswordForEncryption) {
      // Ha az app password-ot használjuk, ne tároljuk az encryptionPassword mezőt (null helyett teljesen töröljük)
      delete settingsToSave.encryptionPassword;
    } else if (settingsToSave.encryptionPassword === null) {
      // Ha encryptionPassword null és nem useAppPasswordForEncryption, akkor töröljük
      delete settingsToSave.encryptionPassword;
    }
    
    await store.set("settings", settingsToSave);
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
export async function saveOffers(offers: Offer[], encryptedDataLabel?: string): Promise<void> {
  try {
    if (import.meta.env.DEV) {
      console.log("💾 Árajánlatok mentése...", { count: offers.length });
    }
    const store = await getStore();
    
    // 🔒 TITKOSÍTOTT ADATOK ELREJTÉSE: Ha van titkosított customer data, akkor ne mentsük a customerName és customerContact mezőket
    // Ellenőrizzük, hogy van-e titkosított customer data
    const hasEncryptedData = await hasEncryptedCustomerData();
    
    // 🔒 JELSZÓ ELLENŐRZÉS: Ha van jelszó memóriában, akkor az adatok dekódolva vannak, ne sanitizáljuk
    // Próbáljuk meg ellenőrizni, hogy van-e jelszó memóriában (app password vagy encryption password)
    let hasPasswordInMemory = false;
    try {
      // Próbáljuk meg app password-ot
      const { getAppPasswordInMemory } = await import("./encryptionPasswordManager");
      const appPassword = getAppPasswordInMemory();
      if (appPassword) {
        hasPasswordInMemory = true;
      } else {
        // Próbáljuk meg encryption password-ot (false paraméterrel, hogy ne használja az app password-ot)
        const encryptionPassword = getEncryptionPassword(false);
        if (encryptionPassword) {
          hasPasswordInMemory = true;
        }
      }
    } catch (error) {
      // Ha hiba van, akkor nincs jelszó memóriában
      if (import.meta.env.DEV) {
        console.log("🔒 [saveOffers] Jelszó ellenőrzés hiba:", error);
      }
    }
    
    if (import.meta.env.DEV) {
      console.log("🔒 [saveOffers] Titkosítás ellenőrzés:", { hasEncryptedData, hasPasswordInMemory });
    }
    
    // Használjuk a megadott fordítást, vagy az angol alapértelmezett értéket
    const encryptedDataText = encryptedDataLabel || "ENCRYPTED DATA";
    
    const sanitizedOffers = offers.map(offer => {
      // KRITIKUS JAVÍTÁS: Ha van titkosított customer data ÉS nincs jelszó memóriában, akkor sanitizáljuk
      // Ha van jelszó memóriában, akkor az adatok dekódolva vannak, ne sanitizáljuk
      if (hasEncryptedData && !hasPasswordInMemory) {
        // Ha van customerId, akkor biztosan sanitizáljuk
        if (offer.customerId) {
          if (import.meta.env.DEV && (offer.customerName || offer.customerContact)) {
            console.log("🔒 [saveOffers] Sanitizálás: customerId van, customerName/customerContact törlése", {
              offerId: offer.id,
              customerId: offer.customerId,
              customerName: offer.customerName,
              customerContact: offer.customerContact
            });
          }
          return {
            ...offer,
            customerName: encryptedDataText,
            customerContact: undefined, // Ne mentsük a contact-ot sem
          };
        }
        // Ha nincs customerId DE van customerName vagy customerContact, akkor is sanitizáljuk
        // (ez az új offer esetén történhet, amikor még nincs customerId, de van customerName)
        if (offer.customerName || offer.customerContact) {
          if (import.meta.env.DEV) {
            console.log("🔒 [saveOffers] Sanitizálás: customerId nincs, de customerName/customerContact van, törlés", {
              offerId: offer.id,
              customerName: offer.customerName,
              customerContact: offer.customerContact
            });
          }
          return {
            ...offer,
            customerName: encryptedDataText,
            customerContact: undefined,
          };
        }
      }
      // Ha van customerId de nincs customerName (régi formátum vagy már titkosított), akkor is az encryptedDataText-et használjuk
      if (offer.customerId && !offer.customerName) {
        return {
          ...offer,
          customerName: encryptedDataText,
          customerContact: undefined,
        };
      }
      return offer;
    });
    
    await store.set("offers", sanitizedOffers);
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
  try {
    const store = await getStore();
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
    // Ha nincs data.json, akkor nincs adat, üres tömböt adunk vissza
    if (error instanceof Error && error.message.includes("data.json fájl nem létezik")) {
      if (import.meta.env.DEV) {
        console.log("ℹ️ data.json nem létezik, nincs mentett árajánlat");
      }
      return [];
    }
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

// Customers - külön fájlban tárolva (customers.json)
// Lazy-initialized customer store
let customerStoreInstance: Store | null = null;

async function getCustomerStore(): Promise<Store> {
  if (!customerStoreInstance) {
    // Először ellenőrizzük, hogy létezik-e a customers.json fájl
    // Ha nem létezik, NE hozzuk létre automatikusan (Factory Reset után)
    const customersJsonExists = await exists("customers.json", { baseDir: BaseDirectory.AppConfig });
    if (!customersJsonExists) {
      // Ha nincs customers.json, akkor még nem hozzuk létre a Store-t
      // Ez biztosítja, hogy a Factory Reset után ne generálódjon automatikusan a fájl
      // A Store.load() automatikusan létrehozza a fájlt, ha nem létezik, ezért először
      // ellenőrizzük, és csak akkor hozzuk létre a Store-t, ha a fájl már létezik
      throw new Error("customers.json fájl nem létezik.");
    }
    customerStoreInstance = await Store.load("customers.json");
    if (import.meta.env.DEV) {
      console.log("✅ Customer Store betöltve (customers.json)");
    }
  }
  return customerStoreInstance;
}

// Helper függvény: ellenőrzi, hogy van-e titkosított adat a store-ban
export async function hasEncryptedCustomerData(): Promise<boolean> {
  try {
    const customerStore = await getCustomerStore();
    const encryptedData = await customerStore.get("customers_encrypted");
    return !!(encryptedData && typeof encryptedData === "string" && encryptedData.length > 0);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("❌ Hiba a titkosított adat ellenőrzésekor:", error);
    }
    return false;
  }
}

export async function saveCustomers(
  customers: Customer[],
  encryptionPassword?: string | null
): Promise<void> {
  try {
    if (import.meta.env.DEV) {
      console.log("💾 Ügyfelek mentése...", { count: customers.length, hasEncryption: !!encryptionPassword });
    }
    
    // Ha a getCustomerStore() hibát dob (mert nincs customers.json), akkor először létrehozzuk a Store-t
    let customerStore: Store;
    try {
      customerStore = await getCustomerStore();
    } catch (error) {
      // Ha nincs customers.json, akkor most létrehozzuk (pl. első mentéskor vagy factory reset után)
      if (import.meta.env.DEV) {
        console.log("ℹ️ customers.json nem létezik, létrehozás...");
      }
      customerStore = await Store.load("customers.json");
      customerStoreInstance = customerStore; // Frissítjük a customerStoreInstance-t
    }
    
    // KRITIKUS: Ha üres tömböt akarunk menteni, ellenőrizzük, hogy van-e már titkosított adat
    // Ha van titkosított adat és üres tömböt akarunk menteni (nincs jelszó), NE mentse!
    if (customers.length === 0) {
      const existingEncryptedData = await customerStore.get("customers_encrypted");
      if (existingEncryptedData && typeof existingEncryptedData === "string" && existingEncryptedData.length > 0) {
        // Van már titkosított adat, és üres tömböt akarunk menteni (valószínűleg nincs jelszó memóriában)
        // NE írjuk felül a titkosított adatot üres tömböt!
        if (import.meta.env.DEV) {
          console.log("⚠️ Üres tömb mentés blokkolva - van már titkosított adat, ne írjuk felül!");
        }
        return; // Kilépünk, nem mentünk semmit
      }
    }
    
    // KRITIKUS: Ellenőrizzük, hogy van-e már titkosított adat
    const existingEncryptedData = await customerStore.get("customers_encrypted");
    const hasExistingEncryptedData = existingEncryptedData && typeof existingEncryptedData === "string" && existingEncryptedData.length > 0;
    
    // Ha van titkosítási jelszó, akkor titkosítva mentjük (ID-k külön tárolva)
    if (encryptionPassword) {
      try {
        // Kivesszük az ID-kat és külön tároljuk őket (nem titkosítva)
        const customerIds: Record<string, boolean> = {};
        customers.forEach(customer => {
          customerIds[customer.id.toString()] = true;
        });
        
        // Titkosítjuk az adatokat (ID-k nélkül)
        const encrypted = await encryptCustomers(customers, encryptionPassword);
        await customerStore.set("customers_encrypted", encrypted);
        await customerStore.set("customer_ids", customerIds); // ID-k külön tárolva (nem titkosítva)
        await customerStore.set("customers", null); // Régi plain text adatok törlése
        if (import.meta.env.DEV) {
          console.log("🔒 Ügyfelek titkosítva mentve customers.json-ban (ID-k külön tárolva)", { 
            count: customers.length,
            idsCount: Object.keys(customerIds).length 
          });
        }
      } catch (error) {
        console.error("❌ Hiba az ügyfelek titkosításakor:", error);
        throw error;
      }
    } else {
      // Nincs jelszó - de ha van már titkosított adat, NE írjuk felül plain text formátumban!
      if (hasExistingEncryptedData) {
        if (import.meta.env.DEV) {
          console.log("⚠️ Van már titkosított adat, de nincs jelszó - NE írjuk felül plain text formátumban!");
        }
        // NE mentjük plain text formátumban, ha van már titkosított adat!
        // Csak az ID-kat frissítjük, ha szükséges
        const existingCustomerIds = await customerStore.get("customer_ids") as Record<string, boolean> | null | undefined;
        if (existingCustomerIds) {
          // Frissítjük az ID-kat az új ügyfelekkel (ha vannak)
          const updatedCustomerIds: Record<string, boolean> = { ...existingCustomerIds };
          customers.forEach(customer => {
            updatedCustomerIds[customer.id.toString()] = true;
          });
          await customerStore.set("customer_ids", updatedCustomerIds);
          if (import.meta.env.DEV) {
            console.log("🔒 Customer IDs frissítve (titkosított adatok megőrizve)", { 
              idsCount: Object.keys(updatedCustomerIds).length 
            });
          }
        }
        // NE írjuk felül a customers_encrypted-et és NE írjuk a customers mezőt!
        return; // Kilépünk, nem mentünk plain text formátumban
      }
      
      // Nincs titkosítás ÉS nincs már titkosított adat - plain text mentés
      await customerStore.set("customers", customers);
      await customerStore.set("customers_encrypted", null); // Régi titkosított adatok törlése
      await customerStore.set("customer_ids", null); // ID-k törlése (plain text esetén nem kell)
      if (import.meta.env.DEV) {
        console.log("✅ Ügyfelek sikeresen mentve customers.json-ban (nem titkosított)", { count: customers.length });
      }
    }
    
    await customerStore.save();
  } catch (error) {
    console.error("❌ Hiba az ügyfelek mentésekor:", error);
    throw error;
  }
}

export async function loadCustomers(
  encryptionPassword?: string | null
): Promise<Customer[]> {
  try {
    // Először próbáljuk a customers.json fájlt betölteni
    let customerStore: Store;
    try {
      customerStore = await getCustomerStore();
    } catch (error) {
      // Ha nincs customers.json, próbáljuk a régi data.json-ból betölteni (migráció)
      if (import.meta.env.DEV) {
        console.log("ℹ️ customers.json nem létezik, próbáljuk a régi data.json-ból betölteni...");
      }
      
      // Próbáljuk betölteni a data.json-t (migrációhoz)
      let mainStore;
      try {
        mainStore = await getStore();
      } catch (getStoreError) {
        // Ha nincs data.json sem, akkor nincs régi adat, üres tömböt adunk vissza
        if (getStoreError instanceof Error && getStoreError.message.includes("data.json fájl nem létezik")) {
          if (import.meta.env.DEV) {
            console.log("ℹ️ data.json sem létezik, nincs régi adat");
          }
          return [];
        }
        // Egyéb hiba esetén továbbdobjuk
        throw getStoreError;
      }
      
      // Régi formátum ellenőrzése (data.json-ból)
      const oldEncryptedData = await mainStore.get("customers_encrypted");
      const oldPlainData = await mainStore.get("customers");
      
      if (oldEncryptedData && typeof oldEncryptedData === "string" && oldEncryptedData.length > 0) {
        // Van régi titkosított adat
        if (!encryptionPassword) {
          const error = new Error("ENCRYPTION_PASSWORD_REQUIRED");
          (error as any).code = "ENCRYPTION_PASSWORD_REQUIRED";
          throw error;
        }
        // Régi formátum: az ID-k benne vannak a visszafejtett adatokban
        const customersOldFormat = await decryptCustomers(oldEncryptedData, encryptionPassword) as Customer[];
        // Migráljuk a customers.json-ba (új formátum: ID-k külön tárolva)
        await saveCustomers(customersOldFormat, encryptionPassword);
        // Töröljük a régi adatokat
        await mainStore.set("customers_encrypted", null);
        await mainStore.set("customers", null);
        await mainStore.save();
        if (import.meta.env.DEV) {
          console.log("✅ Ügyfelek migrálva data.json-ból customers.json-ba");
        }
        return customersOldFormat;
      } else if (oldPlainData && Array.isArray(oldPlainData) && oldPlainData.length > 0) {
        // Van régi plain text adat
        await saveCustomers(oldPlainData, null);
        await mainStore.set("customers", null);
        await mainStore.save();
        if (import.meta.env.DEV) {
          console.log("✅ Ügyfelek migrálva data.json-ból customers.json-ba (plain text)");
        }
        return oldPlainData;
      }
      // Nincs régi adat sem
      return [];
    }
    
    if (import.meta.env.DEV) {
      console.log("📥 Ügyfelek betöltése customers.json-ból...", { hasPassword: !!encryptionPassword });
    }
    
    // Először ellenőrizzük, hogy van-e titkosított adat
    const encryptedData = await customerStore.get("customers_encrypted");
    
    if (import.meta.env.DEV) {
      console.log("🔍 Customer Store ellenőrzés:", { 
        hasEncryptedData: !!encryptedData, 
        encryptedDataType: typeof encryptedData,
        encryptedDataLength: typeof encryptedData === "string" ? encryptedData.length : 0
      });
    }
    
    if (encryptedData && typeof encryptedData === "string" && encryptedData.length > 0) {
      // Van titkosított adat
      if (import.meta.env.DEV) {
        console.log("🔒 Titkosított adat találva customers.json-ban, jelszó ellenőrzése...");
      }
      
      if (!encryptionPassword) {
        // Nincs jelszó - csak az ID-kat töltjük be (nem titkosítva)
        if (import.meta.env.DEV) {
          console.log("⚠️ Nincs jelszó memóriában, csak ID-k betöltése...");
        }
        const customerIds = await customerStore.get("customer_ids") as Record<string, boolean> | null | undefined;
        
        if (customerIds && Object.keys(customerIds).length > 0) {
          // Csak az ID-kat használjuk, üres ügyfeleket hozunk létre csak ID-vel
          const idArray = Object.keys(customerIds).map(Number).sort((a, b) => a - b);
          const customersWithIdsOnly: Customer[] = idArray.map(id => ({
            id: id,
            name: "", // Üres, mert nincs jelszó
            contact: undefined,
            company: undefined,
            address: undefined,
            notes: undefined,
            createdAt: new Date().toISOString(), // Alapértelmezett dátum
            updatedAt: new Date().toISOString(),
          }));
          
          if (import.meta.env.DEV) {
            console.log("🔒 Csak ID-k betöltve (nincs jelszó)", { 
              count: customersWithIdsOnly.length,
              idsCount: idArray.length
            });
          }
          return customersWithIdsOnly;
        }
        
        // Ha nincs customerIds, üres tömböt adunk vissza
        if (import.meta.env.DEV) {
          console.log("⚠️ Nincs customer_ids, üres tömb visszaadása");
        }
        return [];
      }
      
      // Visszafejtett adatok betöltése (ID-kkal kombinálva)
      try {
        // Betöltjük az ID-kat (nem titkosítva)
        const customerIds = await customerStore.get("customer_ids") as Record<string, boolean> | null | undefined;
        
        // Visszafejtjük az adatokat (ID-k nélkül)
        const customersWithoutIds = await decryptCustomers(encryptedData, encryptionPassword);
        
        // Kombináljuk az ID-kat a visszafejtett adatokkal
        let customers: Customer[];
        if (customerIds && Object.keys(customerIds).length > 0) {
          // Van customerIds objektum - az ID-kat onnan vesszük és kombináljuk
          const idArray = Object.keys(customerIds).map(Number).sort((a, b) => a - b);
          customers = customersWithoutIds.map((customer, index) => ({
            ...customer,
            id: idArray[index] || (Date.now() + index) // Ha nincs elég ID, generálunk újakat
          }));
        } else {
          // Nincs customerIds - visszafelé kompatibilitás: próbáljuk a régi formátumot (ID-k benne vannak)
          // Ha a visszafejtett adatokban vannak ID-k (régi formátum), akkor azokat használjuk
          const customersWithPossibleIds = customersWithoutIds as any[];
          if (customersWithPossibleIds.length > 0 && customersWithPossibleIds[0].id !== undefined) {
            // Régi formátum - ID-k benne vannak
            customers = customersWithPossibleIds as Customer[];
          } else {
            // Új formátum, de nincs customerIds - generálunk új ID-kat
            customers = customersWithoutIds.map((customer, index) => ({
              ...customer,
              id: Date.now() + index
            }));
          }
        }
        
        if (import.meta.env.DEV) {
          console.log("🔓 Ügyfelek visszafejtve betöltve customers.json-ból (ID-kkal kombinálva)", { 
            count: customers.length,
            hasCustomerIds: !!customerIds,
            idsCount: customerIds ? Object.keys(customerIds).length : 0
          });
        }
        return customers;
      } catch (error) {
        console.error("❌ Hiba az ügyfelek visszafejtésekor:", error);
        // Ha rossz a jelszó, hibaüzenetet dobunk
        throw new Error("Helytelen titkosítási jelszó, vagy a titkosított adatok sérültek");
      }
    } else {
      // Plain text adatok betöltése
      const data = await customerStore.get("customers");
      const customers = Array.isArray(data) ? data : [];
      if (import.meta.env.DEV) {
        console.log("✅ Ügyfelek betöltve customers.json-ból (nem titkosított)", { 
          count: customers.length,
          source: "customers.json",
          encrypted: false
        });
      }
      return customers;
    }
  } catch (error) {
    // Ha ENCRYPTION_PASSWORD_REQUIRED, akkor ez nem hiba, csak várt állapot - ne logoljuk ERROR-ként
    if (error instanceof Error && (error as any).code === "ENCRYPTION_PASSWORD_REQUIRED") {
      if (import.meta.env.DEV) {
        console.log("🔒 Jelszó szükséges az ügyfelek betöltéséhez (nem hiba)");
      }
      // Továbbdobjuk a hibát, hogy a hívó komponens kezelje
      throw error;
    }
    // Valós hiba esetén logoljuk ERROR-ként
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Hiba az ügyfelek betöltésekor:", errorMessage);
    
    // Ha speciális hiba (visszafejtési hiba, jelszó hiba), akkor továbbdobjuk
    if (error instanceof Error && (
      errorMessage.includes("titkosítási jelszó") ||
      errorMessage.includes("Helytelen") ||
      errorMessage.includes("Visszafejtési hiba") ||
      errorMessage.includes("aead::Error") ||
      errorMessage.includes("decrypt") ||
      errorMessage.includes("decryption")
    )) {
      // Visszafejtési hibák esetén továbbdobjuk, ne adjunk vissza üres tömböt
      throw error;
    }
    
    // Egyéb hibák esetén üres tömböt adunk vissza (pl. fájl nem létezik)
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
    // MINDIG logoljuk, még ha a fileLogger ki van kapcsolva is (console.log mindig működik)
    // writeFrontendLogAlways() használata, hogy biztosan logoljon, még ha a logolás ki van kapcsolva is
    console.log("🗑️ [Factory Reset] Összes adat törlése kezdete...");
    await writeFrontendLogAlways('INFO', '🗑️ [Factory Reset] Összes adat törlése kezdete...').catch(() => {});
    console.log("🗑️ [Factory Reset] getStore() hívása...");
    await writeFrontendLogAlways('INFO', '🗑️ [Factory Reset] getStore() hívása...').catch(() => {});
    
    const store = await getStore();
    console.log("✅ [Factory Reset] Store betöltve, adatok törlése...");
    await writeFrontendLogAlways('INFO', '✅ [Factory Reset] Store betöltve, adatok törlése...').catch(() => {});
    
    // Töröljük az összes kulcsot a Store-ból
    console.log("🗑️ [Factory Reset] Store kulcsok törlése...");
    await writeFrontendLogAlways('INFO', '🗑️ [Factory Reset] Store kulcsok törlése...').catch(() => {});
    
    await store.delete("printers");
    console.log("✅ [Factory Reset] printers törölve");
    await writeFrontendLogAlways('INFO', '✅ [Factory Reset] printers törölve').catch(() => {});
    
    await store.delete("filaments");
    console.log("✅ [Factory Reset] filaments törölve");
    await writeFrontendLogAlways('INFO', '✅ [Factory Reset] filaments törölve').catch(() => {});
    
    await store.delete("offers");
    console.log("✅ [Factory Reset] offers törölve");
    await writeFrontendLogAlways('INFO', '✅ [Factory Reset] offers törölve').catch(() => {});
    
    await store.delete("customers");
    console.log("✅ [Factory Reset] customers kulcs törölve (data.json-ból)");
    await writeFrontendLogAlways('INFO', '✅ [Factory Reset] customers kulcs törölve (data.json-ból)').catch(() => {});
    
    await store.delete("settings");
    console.log("✅ [Factory Reset] settings törölve");
    await writeFrontendLogAlways('INFO', '✅ [Factory Reset] settings törölve').catch(() => {});
    
    await store.delete("templates");
    console.log("✅ [Factory Reset] templates törölve");
    await writeFrontendLogAlways('INFO', '✅ [Factory Reset] templates törölve').catch(() => {});
    
    await store.delete("priceHistory");
    console.log("✅ [Factory Reset] priceHistory törölve");
    await writeFrontendLogAlways('INFO', '✅ [Factory Reset] priceHistory törölve').catch(() => {});
    
    await store.delete("projects");
    console.log("✅ [Factory Reset] projects törölve");
    await writeFrontendLogAlways('INFO', '✅ [Factory Reset] projects törölve').catch(() => {});
    
    await store.delete("tasks");
    console.log("✅ [Factory Reset] tasks törölve");
    await writeFrontendLogAlways('INFO', '✅ [Factory Reset] tasks törölve').catch(() => {});
    
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
        console.log("🔍 [Factory Reset] data.json létezés ellenőrzése:", dataJsonExists);
        await writeFrontendLogAlways('INFO', `🔍 [Factory Reset] data.json létezés ellenőrzése: ${dataJsonExists}`).catch(() => {});
        
        if (dataJsonExists) {
          await remove("data.json", { baseDir: BaseDirectory.AppConfig });
          console.log("🗑️ [Factory Reset] data.json törölve");
          await writeFrontendLogAlways('INFO', '🗑️ [Factory Reset] data.json törölve').catch(() => {});
        } else {
          console.log("ℹ️ [Factory Reset] data.json nem létezett");
          await writeFrontendLogAlways('INFO', 'ℹ️ [Factory Reset] data.json nem létezett').catch(() => {});
        }
      } catch (error) {
        const errorMsg = `❌ [Factory Reset] Hiba a data.json törlésekor: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMsg);
        await writeFrontendLogAlways('ERROR', errorMsg).catch(() => {});
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
        console.log("🔍 [Factory Reset] update_filamentLibrary.json létezés ellenőrzése:", updateFilamentLibraryExists);
        await writeFrontendLogAlways('INFO', `🔍 [Factory Reset] update_filamentLibrary.json létezés ellenőrzése: ${updateFilamentLibraryExists}`).catch(() => {});
        
        if (updateFilamentLibraryExists) {
          await remove("update_filamentLibrary.json", { baseDir: BaseDirectory.AppConfig });
          console.log("🗑️ [Factory Reset] update_filamentLibrary.json törölve");
          await writeFrontendLogAlways('INFO', '🗑️ [Factory Reset] update_filamentLibrary.json törölve').catch(() => {});
        } else {
          console.log("ℹ️ [Factory Reset] update_filamentLibrary.json nem létezett");
          await writeFrontendLogAlways('INFO', 'ℹ️ [Factory Reset] update_filamentLibrary.json nem létezett').catch(() => {});
        }
      } catch (error) {
        const errorMsg = `❌ [Factory Reset] Hiba az update_filamentLibrary.json törlésekor: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMsg);
        await writeFrontendLogAlways('ERROR', errorMsg).catch(() => {});
        // Folytatjuk
      }
      
      // Töröljük a customers.json fájlt is (titkosított ügyféladatok)
      // FONTOS: Először reseteljük a customerStoreInstance-t, hogy biztosan bezáruljon
      console.log("🔍 [Factory Reset] customers.json törlésének kezdete...");
      await writeFrontendLogAlways('INFO', '🔍 [Factory Reset] customers.json törlésének kezdete...').catch(() => {});
      
      customerStoreInstance = null;
      // Nagyobb késleltetés, hogy a Store biztosan bezáruljon
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const customersJsonExists = await exists("customers.json", { baseDir: BaseDirectory.AppConfig });
        console.log("🔍 [Factory Reset] customers.json létezés ellenőrzése:", customersJsonExists);
        await writeFrontendLogAlways('INFO', `🔍 [Factory Reset] customers.json létezés ellenőrzése: ${customersJsonExists}`).catch(() => {});
        
        if (customersJsonExists) {
          console.log("🗑️ [Factory Reset] customers.json törlése kezdete...");
          await writeFrontendLogAlways('INFO', '🗑️ [Factory Reset] customers.json törlése kezdete...').catch(() => {});
          
          await remove("customers.json", { baseDir: BaseDirectory.AppConfig });
          console.log("🗑️ [Factory Reset] customers.json törlés parancs végrehajtva");
          await writeFrontendLogAlways('INFO', '🗑️ [Factory Reset] customers.json törlés parancs végrehajtva').catch(() => {});
          
          // Nagyobb késleltetés, hogy a fájl törlés biztosan megtörténjen
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Ellenőrizzük, hogy valóban törlődött-e
          const stillExists = await exists("customers.json", { baseDir: BaseDirectory.AppConfig });
          if (stillExists) {
            const errorMsg = "❌ [Factory Reset] HIBA: customers.json még mindig létezik törlés után!";
            console.error(errorMsg);
            await writeFrontendLogAlways('ERROR', errorMsg).catch(() => {});
            
            // Próbáljuk újra törölni
            try {
              console.log("🔄 [Factory Reset] customers.json újratörlési kísérlet...");
              await writeFrontendLogAlways('INFO', '🔄 [Factory Reset] customers.json újratörlési kísérlet...').catch(() => {});
              
              await remove("customers.json", { baseDir: BaseDirectory.AppConfig });
              await new Promise(resolve => setTimeout(resolve, 500));
              
              const stillExistsAfterRetry = await exists("customers.json", { baseDir: BaseDirectory.AppConfig });
              if (stillExistsAfterRetry) {
                const errorMsg2 = "❌ [Factory Reset] HIBA: customers.json még mindig létezik második törlési kísérlet után is!";
                console.error(errorMsg2);
                await writeFrontendLogAlways('ERROR', errorMsg2).catch(() => {});
              } else {
                console.log("✅ [Factory Reset] customers.json sikeresen törölve (második kísérlet után)");
                await writeFrontendLogAlways('INFO', '✅ [Factory Reset] customers.json sikeresen törölve (második kísérlet után)').catch(() => {});
              }
            } catch (retryError) {
              const errorMsg3 = `❌ [Factory Reset] Hiba a customers.json újratörléskor: ${retryError instanceof Error ? retryError.message : String(retryError)}`;
              console.error(errorMsg3);
              await writeFrontendLogAlways('ERROR', errorMsg3).catch(() => {});
            }
          } else {
            console.log("✅ [Factory Reset] customers.json sikeresen törölve (ellenőrzés)");
            await writeFrontendLogAlways('INFO', '✅ [Factory Reset] customers.json sikeresen törölve (ellenőrzés)').catch(() => {});
          }
        } else {
          console.log("ℹ️ [Factory Reset] customers.json nem létezett");
          await writeFrontendLogAlways('INFO', 'ℹ️ [Factory Reset] customers.json nem létezett').catch(() => {});
        }
      } catch (error) {
        const errorMsg = `❌ [Factory Reset] Hiba a customers.json törlésekor: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMsg);
        await writeFrontendLogAlways('ERROR', errorMsg).catch(() => {});
        // Folytatjuk
      }
    } catch (error) {
      console.error("❌ [Factory Reset] Hiba a fizikai fájlok törlésekor:", error);
      // Ne dobjuk el a hibát, mert a Store már törölve lett
    }
    
    // VÉGLEGES ELLENŐRZÉS: Ellenőrizzük, hogy a customers.json valóban törlődött-e
    try {
      const finalCheck = await exists("customers.json", { baseDir: BaseDirectory.AppConfig });
      console.log("🔍 [Factory Reset] Végleges ellenőrzés: customers.json létezik:", finalCheck);
      await writeFrontendLogAlways('INFO', `🔍 [Factory Reset] Végleges ellenőrzés: customers.json létezik: ${finalCheck}`).catch(() => {});
      
      if (finalCheck) {
        const errorMsg = "❌ [Factory Reset] KRITIKUS HIBA: customers.json még mindig létezik a factory reset után!";
        console.error(errorMsg);
        await writeFrontendLogAlways('ERROR', errorMsg).catch(() => {});
        
        // Próbáljuk még egyszer törölni
        try {
          console.log("🔄 [Factory Reset] customers.json végső törlési kísérlet...");
          await writeFrontendLogAlways('INFO', '🔄 [Factory Reset] customers.json végső törlési kísérlet...').catch(() => {});
          
          customerStoreInstance = null;
          await new Promise(resolve => setTimeout(resolve, 500));
          await remove("customers.json", { baseDir: BaseDirectory.AppConfig });
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const finalCheckAfterRetry = await exists("customers.json", { baseDir: BaseDirectory.AppConfig });
          if (finalCheckAfterRetry) {
            const errorMsg2 = "❌ [Factory Reset] KRITIKUS HIBA: customers.json még mindig létezik a végső törlési kísérlet után is!";
            console.error(errorMsg2);
            await writeFrontendLogAlways('ERROR', errorMsg2).catch(() => {});
          } else {
            console.log("✅ [Factory Reset] customers.json végül sikeresen törölve (végső kísérlet után)");
            await writeFrontendLogAlways('INFO', '✅ [Factory Reset] customers.json végül sikeresen törölve (végső kísérlet után)').catch(() => {});
          }
        } catch (finalRetryError) {
          const errorMsg3 = `❌ [Factory Reset] Hiba a customers.json végső törlési kísérletkor: ${finalRetryError instanceof Error ? finalRetryError.message : String(finalRetryError)}`;
          console.error(errorMsg3);
          await writeFrontendLogAlways('ERROR', errorMsg3).catch(() => {});
        }
      } else {
        console.log("✅ [Factory Reset] customers.json végleges ellenőrzés: törölve");
        await writeFrontendLogAlways('INFO', '✅ [Factory Reset] customers.json végleges ellenőrzés: törölve').catch(() => {});
      }
    } catch (finalCheckError) {
      const errorMsg = `❌ [Factory Reset] Hiba a customers.json végleges ellenőrzésekor: ${finalCheckError instanceof Error ? finalCheckError.message : String(finalCheckError)}`;
      console.error(errorMsg);
      await writeFrontendLogAlways('ERROR', errorMsg).catch(() => {});
    }
    
    console.log("✅ [Factory Reset] Összes adat törlése befejezve (Factory reset kész)");
    await writeFrontendLog('INFO', '✅ [Factory Reset] Összes adat törlése befejezve (Factory reset kész)').catch(() => {});
  } catch (error) {
    const errorMsg = `❌ [Factory Reset] Hiba az adatok törlésekor: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMsg);
    await writeFrontendLog('ERROR', errorMsg).catch(() => {});
    throw error;
  }
}
