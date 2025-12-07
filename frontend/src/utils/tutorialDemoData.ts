import type { Printer, Filament, Offer, Customer, Settings } from "../types";
import { savePrinters, saveFilaments, saveOffers, saveCustomers, saveSettings, loadSettings, getStore, resetStoreInstance } from "./store";
import { calculateOfferCosts } from "./offerCalc";
import { Store } from "@tauri-apps/plugin-store";

/**
 * Demo adatok generálása a tutorial számára
 * Ez a funkció létrehoz demo nyomtatókat, filamenteket, árajánlatokat és ügyfeleket
 */
export async function generateTutorialDemoData(settings: Settings): Promise<void> {
  try {
    console.log("🎓 [Tutorial] Demo adatok generálása kezdete...");
    
    // ELŐSZÖR biztosítjuk, hogy a data.json fájl létezik
    // A saveSettings() automatikusan létrehozza a fájlt, ha nincs
    try {
      console.log("💾 [Tutorial] Settings mentése (data.json létrehozása)...");
      await saveSettings(settings);
      console.log("✅ [Tutorial] Settings mentve, data.json fájl biztosan létezik");
      // Kis késleltetés, hogy a fájl biztosan kiírásra kerüljön
      await new Promise(resolve => setTimeout(resolve, 100));
      // NE reseteljük a storeInstance-t itt, mert a következő save műveletek ugyanazt a store-t használják
      // A getStore() automatikusan használja a meglévő storeInstance-t, ha van
    } catch (error) {
      console.error("❌ [Tutorial] Hiba a settings mentésekor (demo adatok generálása előtt):", error);
      // Ha még mindig nincs fájl, próbáljuk közvetlenül létrehozni
      try {
        console.log("🔄 [Tutorial] data.json közvetlen létrehozása...");
        const store = await Store.load("data.json");
        await store.set("settings", settings);
        await store.save();
        // Kis késleltetés, hogy a fájl biztosan kiírásra kerüljön
        await new Promise(resolve => setTimeout(resolve, 100));
        // Reseteljük a storeInstance-t, hogy a getStore() újra létrehozza a storeInstance-t
        // Ez biztosítja, hogy a következő save műveletek ugyanazt a store-t használják
        resetStoreInstance();
        console.log("✅ [Tutorial] data.json fájl közvetlenül létrehozva");
      } catch (createError) {
        console.error("❌ [Tutorial] Hiba a data.json fájl létrehozásakor:", createError);
        throw createError;
      }
    }

    // Demo nyomtatók
    const demoPrinters: Printer[] = [
      {
        id: 1,
        name: "Bambu Lab X1 Carbon",
        type: "FDM",
        power: 350,
        usageCost: 0.15,
        amsCount: 1,
        ams: [
          {
            id: 1,
            brand: "Bambu Lab",
            name: "AMS",
            power: 10,
          },
        ],
      },
      {
        id: 2,
        name: "Prusa i3 MK3S+",
        type: "FDM",
        power: 220,
        usageCost: 0.12,
        amsCount: 0,
      },
      {
        id: 3,
        name: "Ender 3 V2",
        type: "FDM",
        power: 200,
        usageCost: 0.10,
        amsCount: 0,
      },
    ];

    // Demo filamentek
    const demoFilaments: Filament[] = [
      {
        brand: "Bambu Lab",
        type: "PLA",
        weight: 1000,
        density: 1.24,
        pricePerKg: 25.99,
        color: "Red",
        colorHex: "#FF0000",
        colorMode: "solid",
        favorite: true,
      },
      {
        brand: "Bambu Lab",
        type: "PLA",
        weight: 1000,
        density: 1.24,
        pricePerKg: 25.99,
        color: "Blue",
        colorHex: "#0000FF",
        colorMode: "solid",
        favorite: false,
      },
      {
        brand: "Prusament",
        type: "PETG",
        weight: 1000,
        density: 1.27,
        pricePerKg: 29.99,
        color: "Transparent",
        colorHex: "#FFFFFF",
        colorMode: "solid",
        favorite: true,
      },
      {
        brand: "Polymaker",
        type: "PLA",
        weight: 1000,
        density: 1.24,
        pricePerKg: 24.99,
        color: "Black",
        colorHex: "#000000",
        colorMode: "solid",
        favorite: false,
      },
      {
        brand: "eSUN",
        type: "PLA+",
        weight: 1000,
        density: 1.24,
        pricePerKg: 22.99,
        color: "White",
        colorHex: "#FFFFFF",
        colorMode: "solid",
        favorite: false,
      },
      {
        brand: "Polymaker",
        type: "PETG",
        weight: 1000,
        density: 1.27,
        pricePerKg: 28.99,
        color: "Green",
        colorHex: "#00FF00",
        colorMode: "solid",
        favorite: false,
      },
      {
        brand: "Overture",
        type: "PLA",
        weight: 1000,
        density: 1.24,
        pricePerKg: 23.99,
        color: "Yellow",
        colorHex: "#FFFF00",
        colorMode: "solid",
        favorite: false,
      },
      {
        brand: "Hatchbox",
        type: "PLA",
        weight: 1000,
        density: 1.24,
        pricePerKg: 24.99,
        color: "Orange",
        colorHex: "#FFA500",
        colorMode: "solid",
        favorite: true,
      },
      {
        brand: "Sunlu",
        type: "PETG",
        weight: 1000,
        density: 1.27,
        pricePerKg: 21.99,
        color: "Purple",
        colorHex: "#800080",
        colorMode: "solid",
        favorite: false,
      },
      {
        brand: "Geeetech",
        type: "PLA",
        weight: 1000,
        density: 1.24,
        pricePerKg: 19.99,
        color: "Grey",
        colorHex: "#808080",
        colorMode: "solid",
        favorite: false,
      },
    ];

    // Demo ügyfelek és árajánlatok dátumok
    const nowDate = new Date();
    const nowISO = nowDate.toISOString();
    const demoCustomers: Customer[] = [
      {
        id: 1,
        name: "John Doe",
        contact: "john.doe@example.com",
        company: "Example Corp",
        notes: "Rendszeres ügyfél",
        createdAt: nowISO,
        updatedAt: nowISO,
      },
      {
        id: 2,
        name: "Jane Smith",
        contact: "+36 20 123 4567",
        company: "Tech Solutions Ltd",
        notes: "Első rendelés",
        createdAt: nowISO,
        updatedAt: nowISO,
      },
      {
        id: 3,
        name: "Bob Johnson",
        contact: "bob@startup.com",
        company: "Startup Inc",
        notes: "",
        createdAt: nowISO,
        updatedAt: nowISO,
      },
    ];

    // Demo árajánlatok
    const yesterday = new Date(nowDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(nowDate);
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Először létrehozzuk az árajánlatokat költségek nélkül
    const demoOffersRaw: Omit<Offer, "costs">[] = [
      {
        id: 1,
        printerName: "Bambu Lab X1 Carbon",
        printerType: "FDM",
        printerId: 1,
        printerPower: 350,
        customerName: "John Doe",
        customerContact: "john.doe@example.com",
        description: "Prototype rész - 3D modell",
        date: yesterday.toISOString(),
        filaments: [
          {
            brand: "Bambu Lab",
            type: "PLA",
            color: "Red",
            colorHex: "#FF0000",
            usedGrams: 150,
            pricePerKg: 25.99,
          },
        ],
        printTimeHours: 2,
        printTimeMinutes: 30,
        printTimeSeconds: 0,
        totalPrintTimeHours: 2.5,
        profitPercentage: 30,
        status: "accepted",
        statusHistory: [
          {
            status: "draft",
            date: lastWeek.toISOString(),
            note: "Első verzió",
          },
          {
            status: "sent",
            date: yesterday.toISOString(),
            note: "Elküldve ügyfélnek",
          },
          {
            status: "accepted",
            date: nowDate.toISOString(),
            note: "Elfogadva",
          },
        ],
        statusUpdatedAt: nowDate.toISOString(),
        currency: settings.currency || "EUR",
      },
      {
        id: 2,
        printerName: "Prusa i3 MK3S+",
        printerType: "FDM",
        printerId: 2,
        printerPower: 220,
        customerName: "Jane Smith",
        customerContact: "+36 20 123 4567",
        description: "Dekoratív elemek - 5 db",
        date: lastWeek.toISOString(),
        filaments: [
          {
            brand: "Prusament",
            type: "PETG",
            color: "Transparent",
            colorHex: "#FFFFFF",
            usedGrams: 300,
            pricePerKg: 29.99,
          },
          {
            brand: "Polymaker",
            type: "PLA",
            color: "Black",
            colorHex: "#000000",
            usedGrams: 200,
            pricePerKg: 24.99,
          },
        ],
        printTimeHours: 5,
        printTimeMinutes: 0,
        printTimeSeconds: 0,
        totalPrintTimeHours: 5,
        profitPercentage: 25,
        status: "completed",
        statusHistory: [
          {
            status: "draft",
            date: lastWeek.toISOString(),
            note: "Első verzió",
          },
          {
            status: "sent",
            date: lastWeek.toISOString(),
            note: "Elküldve",
          },
          {
            status: "accepted",
            date: yesterday.toISOString(),
            note: "Elfogadva",
          },
          {
            status: "completed",
            date: nowDate.toISOString(),
            note: "Befejezve",
          },
        ],
        statusUpdatedAt: nowDate.toISOString(),
        currency: settings.currency || "EUR",
      },
      {
        id: 3,
        printerName: "Ender 3 V2",
        printerType: "FDM",
        printerId: 3,
        printerPower: 200,
        customerName: "Bob Johnson",
        customerContact: "bob@startup.com",
        description: "Test print - kis mennyiség",
        date: nowDate.toISOString(),
        filaments: [
          {
            brand: "eSUN",
            type: "PLA+",
            color: "White",
            colorHex: "#FFFFFF",
            usedGrams: 50,
            pricePerKg: 22.99,
          },
        ],
        printTimeHours: 1,
        printTimeMinutes: 15,
        printTimeSeconds: 0,
        totalPrintTimeHours: 1.25,
        profitPercentage: 20,
        status: "draft",
        statusHistory: [
          {
            status: "draft",
            date: nowDate.toISOString(),
            note: "Piszkozat",
          },
        ],
        statusUpdatedAt: nowDate.toISOString(),
        currency: settings.currency || "EUR",
      },
      {
        id: 4,
        printerName: "Bambu Lab X1 Carbon",
        printerType: "FDM",
        printerId: 1,
        printerPower: 350,
        customerName: "John Doe",
        customerContact: "john.doe@example.com",
        description: "Nagy mennyiségű prototípus - 10 db",
        date: lastWeek.toISOString(),
        filaments: [
          {
            brand: "Bambu Lab",
            type: "PLA",
            color: "Blue",
            colorHex: "#0000FF",
            usedGrams: 500,
            pricePerKg: 25.99,
          },
          {
            brand: "Polymaker",
            type: "PETG",
            color: "Green",
            colorHex: "#00FF00",
            usedGrams: 300,
            pricePerKg: 28.99,
          },
        ],
        printTimeHours: 8,
        printTimeMinutes: 0,
        printTimeSeconds: 0,
        totalPrintTimeHours: 8,
        profitPercentage: 35,
        status: "sent",
        statusHistory: [
          {
            status: "draft",
            date: lastWeek.toISOString(),
            note: "Első verzió",
          },
          {
            status: "sent",
            date: yesterday.toISOString(),
            note: "Elküldve",
          },
        ],
        statusUpdatedAt: yesterday.toISOString(),
        currency: settings.currency || "EUR",
      },
      {
        id: 5,
        printerName: "Prusa i3 MK3S+",
        printerType: "FDM",
        printerId: 2,
        printerPower: 220,
        customerName: "Jane Smith",
        customerContact: "+36 20 123 4567",
        description: "Prototype részletek - 3D nyomtatás",
        date: lastWeek.toISOString(),
        filaments: [
          {
            brand: "Hatchbox",
            type: "PLA",
            color: "Orange",
            colorHex: "#FFA500",
            usedGrams: 250,
            pricePerKg: 24.99,
          },
        ],
        printTimeHours: 3,
        printTimeMinutes: 30,
        printTimeSeconds: 0,
        totalPrintTimeHours: 3.5,
        profitPercentage: 30,
        status: "accepted",
        statusHistory: [
          {
            status: "draft",
            date: lastWeek.toISOString(),
            note: "Első verzió",
          },
          {
            status: "sent",
            date: yesterday.toISOString(),
            note: "Elküldve",
          },
          {
            status: "accepted",
            date: nowDate.toISOString(),
            note: "Elfogadva",
          },
        ],
        statusUpdatedAt: nowDate.toISOString(),
        currency: settings.currency || "EUR",
      },
    ];

    // Kiszámoljuk a költségeket minden árajánlathoz
    const demoOffers: Offer[] = demoOffersRaw.map((offerRaw) => {
      const printer = demoPrinters.find(p => p.id === offerRaw.printerId);
      if (!printer) {
        console.warn(`[TutorialDemoData] Printer not found for offer ${offerRaw.id}, using default costs`);
        // Ha nincs nyomtató, alapértelmezett költségeket használunk
        const defaultOffer: Offer = {
          ...offerRaw,
          costs: {
            filamentCost: 0,
            electricityCost: 0,
            dryingCost: 0,
            usageCost: 0,
            totalCost: 0,
          },
        };
        return defaultOffer;
      }
      
      // Létrehozunk egy teljes Offer objektumot a költségek számításához
      // A costs objektumot ideiglenesen üresen hagyjuk, mert a calculateOfferCosts újraszámolja
      const tempOffer: Offer = {
        ...offerRaw,
        costs: {
          filamentCost: 0,
          electricityCost: 0,
          dryingCost: 0,
          usageCost: 0,
          totalCost: 0,
        },
      };
      
      try {
        const costs = calculateOfferCosts(tempOffer, printer, settings);
        if (!costs) {
          console.warn(`[TutorialDemoData] Failed to calculate costs for offer ${offerRaw.id}, using default costs`);
          // Ha nem sikerült kiszámolni, alapértelmezett költségeket használunk
          const defaultOffer: Offer = {
            ...offerRaw,
            costs: {
              filamentCost: 0,
              electricityCost: 0,
              dryingCost: 0,
              usageCost: 0,
              totalCost: 0,
            },
          };
          return defaultOffer;
        }
        
        console.log(`[TutorialDemoData] Calculated costs for offer ${offerRaw.id}:`, costs);
        
        const finalOffer: Offer = {
          ...offerRaw,
          costs: {
            filamentCost: costs.filamentCost,
            electricityCost: costs.electricityCost,
            dryingCost: costs.dryingCost,
            usageCost: costs.usageCost,
            totalCost: costs.totalCost,
          },
        };
        
        // Ellenőrizzük, hogy a costs objektum valóban létezik
        if (!finalOffer.costs) {
          console.error(`[TutorialDemoData] Offer ${offerRaw.id} has no costs object after assignment!`);
          return {
            ...offerRaw,
            costs: {
              filamentCost: 0,
              electricityCost: 0,
              dryingCost: 0,
              usageCost: 0,
              totalCost: 0,
            },
          } as Offer;
        }
        
        return finalOffer;
      } catch (error) {
        console.error(`[TutorialDemoData] Error calculating costs for offer ${offerRaw.id}:`, error);
        // Hiba esetén alapértelmezett költségeket használunk
        return {
          ...offerRaw,
          costs: {
            filamentCost: 0,
            electricityCost: 0,
            dryingCost: 0,
            usageCost: 0,
            totalCost: 0,
          },
        } as Offer;
      }
    });
    
    // Ellenőrizzük, hogy minden árajánlatnak van-e costs objektuma
    demoOffers.forEach((offer, index) => {
      if (!offer.costs) {
        console.error(`[TutorialDemoData] Offer ${offer.id} (index ${index}) has no costs object after calculation!`);
      } else {
        console.log(`[TutorialDemoData] Offer ${offer.id} has costs:`, offer.costs);
      }
    });
    
    // Logoljuk az összes árajánlatot, hogy lássuk, mi van bennük
    console.log("[TutorialDemoData] All demo offers:", JSON.stringify(demoOffers, null, 2));

    // Mentjük a demo adatokat - sorban, hogy minden művelet befejeződjön
    // FONTOS: printers, filaments, offers -> data.json fájlba
    //         customers -> customers.json fájlba
    console.log("💾 [Tutorial] Demo nyomtatók mentése -> data.json...");
    await savePrinters(demoPrinters);
    console.log("✅ [Tutorial] Demo nyomtatók mentve -> data.json");
    
    console.log("💾 [Tutorial] Demo filamentek mentése -> data.json...");
    await saveFilaments(demoFilaments);
    console.log("✅ [Tutorial] Demo filamentek mentve -> data.json");
    
    console.log("💾 [Tutorial] Demo ügyfelek mentése -> customers.json...");
    await saveCustomers(demoCustomers, null); // Tutorial demo adatoknál nincs titkosítás
    console.log("✅ [Tutorial] Demo ügyfelek mentve -> customers.json");
    
    console.log("💾 [Tutorial] Demo árajánlatok mentése -> data.json...");
    await saveOffers(demoOffers);
    console.log("✅ [Tutorial] Demo árajánlatok mentve -> data.json");
    
    // Frissítjük a settings-et, hogy beállítsuk a lastBackupDate-et (így nem jelenik meg a backup emlékeztető tutorial alatt)
    const currentSettings = await loadSettings();
    if (currentSettings) {
      const updatedSettings: Settings = {
        ...currentSettings,
        lastBackupDate: new Date().toISOString(), // Beállítjuk a mai dátumot, hogy ne jelenjen meg az emlékeztető
      };
      await saveSettings(updatedSettings);
      if (import.meta.env.DEV) {
        console.log("✅ Settings frissítve - lastBackupDate beállítva tutorial demo adatokhoz");
      }
    }

    console.log("✅ [Tutorial] Demo adatok sikeresen generálva:", {
      printers: { count: demoPrinters.length, file: "data.json" },
      filaments: { count: demoFilaments.length, file: "data.json" },
      customers: { count: demoCustomers.length, file: "customers.json" },
      offers: { count: demoOffers.length, file: "data.json" },
    });
    console.log("🎉 [Tutorial] Demo adatok generálása befejezve!");
  } catch (error) {
    console.error("❌ [Tutorial] Hiba a demo adatok generálásakor:", error);
    console.error("❌ [Tutorial] Hiba részletei:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/**
 * Tutorial demo adatok törlése
 * Ez a funkció törli csak a demo adatokat (nyomtatók, filamentek, árajánlatok, ügyfelek),
 * de megtartja a settings-et, hogy ne jelenjen meg újra a nyelvválasztó és a tutorial
 */
export async function clearTutorialDemoData(): Promise<void> {
  try {
    console.log("🗑️ Tutorial demo adatok törlése...");
    
    // Ugyanazt a getStore() logikát használjuk, mint a store.ts-ben
    let store;
    try {
      store = await getStore();
    } catch (error) {
      // Ha nincs data.json, akkor nincs mit törölni
      if (error instanceof Error && error.message.includes("data.json fájl nem létezik")) {
        console.log("ℹ️ data.json nem létezik, nincs mit törölni");
        // De még ellenőrizzük a customers.json fájlt
        try {
          const { exists, remove } = await import("@tauri-apps/plugin-fs");
          const { BaseDirectory } = await import("@tauri-apps/plugin-fs");
          const customersJsonExists = await exists("customers.json", { baseDir: BaseDirectory.AppConfig });
          if (customersJsonExists) {
            await remove("customers.json", { baseDir: BaseDirectory.AppConfig });
            console.log("✅ customers.json törölve");
          }
        } catch (fsError) {
          console.error("❌ Hiba a customers.json törlésekor:", fsError);
        }
        return;
      }
      throw error;
    }
    
    // Csak a demo adatokat töröljük, a settings-et megtartjuk
    // FONTOS: printers, filaments, offers -> data.json fájlból töröljük
    //         customers -> customers.json fájlt töröljük teljesen
    console.log("🗑️ [Tutorial] Nyomtatók törlése -> data.json...");
    await store.delete("printers");
    console.log("✅ [Tutorial] Nyomtatók törölve -> data.json");
    
    console.log("🗑️ [Tutorial] Filamentek törlése -> data.json...");
    await store.delete("filaments");
    console.log("✅ [Tutorial] Filamentek törölve -> data.json");
    
    console.log("🗑️ [Tutorial] Árajánlatok törlése -> data.json...");
    await store.delete("offers");
    console.log("✅ [Tutorial] Árajánlatok törölve -> data.json");
    
    console.log("🗑️ [Tutorial] Template-ek törlése -> data.json...");
    await store.delete("templates");
    console.log("✅ [Tutorial] Template-ek törölve -> data.json");
    
    console.log("🗑️ [Tutorial] Ár előzmények törlése -> data.json...");
    await store.delete("priceHistory");
    console.log("✅ [Tutorial] Ár előzmények törölve -> data.json");
    
    // Töröljük a customers.json fájlt is (ha létezik)
    // FONTOS: customers.json teljes fájl törlése, mert külön fájlban van
    try {
      const { exists, remove } = await import("@tauri-apps/plugin-fs");
      const { BaseDirectory } = await import("@tauri-apps/plugin-fs");
      const customersJsonExists = await exists("customers.json", { baseDir: BaseDirectory.AppConfig });
      if (customersJsonExists) {
        console.log("🗑️ [Tutorial] customers.json fájl törlése...");
        await remove("customers.json", { baseDir: BaseDirectory.AppConfig });
        console.log("✅ [Tutorial] customers.json fájl törölve");
      } else {
        console.log("ℹ️ [Tutorial] customers.json nem létezett");
      }
    } catch (fsError) {
      console.error("❌ [Tutorial] Hiba a customers.json törlésekor:", fsError);
      // Folytatjuk, nem kritikus hiba
    }
    
    // Mentjük az üres store-t (de a settings megmarad)
    console.log("💾 Store mentése törlés után...");
    await store.save();
    console.log("✅ Store mentve");
    
    // Kis késleltetés, hogy a fájl biztosan kiírásra kerüljön
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log("✅ [Tutorial] Demo adatok sikeresen törölve (settings megmaradt)");
    
    // Ellenőrizzük, hogy valóban törlődtek-e az adatok
    const printers = await store.get("printers");
    const filaments = await store.get("filaments");
    const offers = await store.get("offers");
    console.log("🔍 [Tutorial] Ellenőrzés törlés után:", {
      printers: { status: printers ? "van" : "nincs", file: "data.json" },
      filaments: { status: filaments ? "van" : "nincs", file: "data.json" },
      offers: { status: offers ? "van" : "nincs", file: "data.json" },
      customers: { status: "törölve", file: "customers.json (teljes fájl törölve)" },
    });
  } catch (error) {
    console.error("❌ Hiba a tutorial demo adatok törlésekor:", error);
    throw error;
  }
}

/**
 * Ellenőrzi, hogy van-e már adat az alkalmazásban
 */
export async function hasExistingData(): Promise<boolean> {
  try {
    const { loadPrinters, loadFilaments, loadOffers, loadCustomers } = await import("./store");
    
    // Betöltjük az adatokat, és kezeljük a hibákat
    let printers: any[] = [];
    let filaments: any[] = [];
    let offers: any[] = [];
    let customers: any[] = [];
    
    try {
      printers = await loadPrinters();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log("ℹ️ [Tutorial] Nyomtatók betöltése sikertelen:", error);
      }
      printers = [];
    }
    
    try {
      filaments = await loadFilaments();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log("ℹ️ [Tutorial] Filamentek betöltése sikertelen:", error);
      }
      filaments = [];
    }
    
    try {
      offers = await loadOffers();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log("ℹ️ [Tutorial] Árajánlatok betöltése sikertelen:", error);
      }
      offers = [];
    }
    
    try {
      customers = await loadCustomers(null); // Tutorial demo adatoknál nincs titkosítás
    } catch (error) {
      // Ha nincs customers.json, akkor nincs adat, ez nem hiba
      if (error instanceof Error && (
        error.message.includes("customers.json fájl nem létezik") ||
        error.message.includes("data.json fájl nem létezik")
      )) {
        if (import.meta.env.DEV) {
          console.log("ℹ️ [Tutorial] customers.json nem létezik, nincs ügyfél adat");
        }
        customers = [];
      } else {
        if (import.meta.env.DEV) {
          console.log("ℹ️ [Tutorial] Ügyfelek betöltése sikertelen:", error);
        }
        customers = [];
      }
    }
    
    const hasData = printers.length > 0 || filaments.length > 0 || offers.length > 0 || customers.length > 0;
    if (import.meta.env.DEV) {
      console.log("🔍 [Tutorial] Adatok ellenőrzése (hasExistingData):", {
        printers: { count: printers.length, source: "data.json" },
        filaments: { count: filaments.length, source: "data.json" },
        offers: { count: offers.length, source: "data.json" },
        customers: { count: customers.length, source: "customers.json" },
        hasData,
        note: hasData ? "Van adat, demo adatok NEM generálódnak" : "Nincs adat, demo adatok generálódnak"
      });
    }
    return hasData;
  } catch (error) {
    // Ha bármilyen hiba történik, akkor nincs adat, demo adatok generálódnak
    if (import.meta.env.DEV) {
      console.log("ℹ️ [Tutorial] Hiba az adatok ellenőrzésekor, demo adatok generálódnak:", error);
    }
    return false;
  }
}

