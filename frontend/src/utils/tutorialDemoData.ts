import type { Printer, Filament, Offer, Customer, Settings } from "../types";
import { savePrinters, saveFilaments, saveOffers, saveCustomers } from "./store";
import { calculateOfferCosts } from "./offerCalc";
import { Store } from "@tauri-apps/plugin-store";

/**
 * Demo adatok generálása a tutorial számára
 * Ez a funkció létrehoz demo nyomtatókat, filamenteket, árajánlatokat és ügyfeleket
 */
export async function generateTutorialDemoData(settings: Settings): Promise<void> {
  try {
    console.log("🎓 Tutorial demo adatok generálása...");

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

    // Mentjük a demo adatokat
    await savePrinters(demoPrinters);
    await saveFilaments(demoFilaments);
    await saveCustomers(demoCustomers);
    await saveOffers(demoOffers);
    // Settings-et nem írjuk felül, csak a demo adatokat mentjük

    console.log("✅ Tutorial demo adatok sikeresen generálva", {
      printers: demoPrinters.length,
      filaments: demoFilaments.length,
      customers: demoCustomers.length,
      offers: demoOffers.length,
    });
  } catch (error) {
    console.error("❌ Hiba a tutorial demo adatok generálásakor:", error);
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
    
    // Lazy-initialized store (ugyanaz, mint a store.ts-ben)
    const store = await Store.load("data.json");
    
    // Csak a demo adatokat töröljük, a settings-et megtartjuk
    await store.delete("printers");
    await store.delete("filaments");
    await store.delete("offers");
    await store.delete("customers");
    await store.delete("templates");
    await store.delete("priceHistory");
    
    // Mentjük az üres store-t (de a settings megmarad)
    await store.save();
    
    console.log("✅ Tutorial demo adatok sikeresen törölve (settings megmaradt)");
    
    // Ellenőrizzük, hogy valóban törlődtek-e az adatok
    const printers = await store.get("printers");
    const filaments = await store.get("filaments");
    const offers = await store.get("offers");
    const customers = await store.get("customers");
    console.log("🔍 Ellenőrzés törlés után:", {
      printers: printers ? "van" : "nincs",
      filaments: filaments ? "van" : "nincs",
      offers: offers ? "van" : "nincs",
      customers: customers ? "van" : "nincs",
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
    const printers = await loadPrinters();
    const filaments = await loadFilaments();
    const offers = await loadOffers();
    const customers = await loadCustomers();
    
    return printers.length > 0 || filaments.length > 0 || offers.length > 0 || customers.length > 0;
  } catch (error) {
    console.error("❌ Hiba az adatok ellenőrzésekor:", error);
    return false;
  }
}

