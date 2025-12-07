import { useEffect, useState } from "react";
import type { Settings } from "../types";
import { shouldShowBackupReminder, getLastBackupDate, getTimeSinceBackup } from "./backup";

export interface BackupReminderState {
  shouldShow: boolean;
  daysSinceLastBackup: number | null;
  lastBackupDate: string | null;
  timeSinceBackup: {
    minutes: number;
    hours: number;
    days: number;
    weeks: number;
    months: number;
    years: number;
    totalMinutes: number;
  } | null;
}

/**
 * Hook az automatikus backup emlékeztető kezelésére
 */
export function useBackupReminder(settings: Settings): BackupReminderState {
  const [reminderState, setReminderState] = useState<BackupReminderState>({
    shouldShow: false,
    daysSinceLastBackup: null,
    lastBackupDate: null,
    timeSinceBackup: null,
  });

  useEffect(() => {
    const checkBackupReminder = async () => {
      // Debug log
      if (import.meta.env.DEV) {
        console.log("🔍 Backup emlékeztető ellenőrzés:", {
          autosave: settings.autosave,
          automaticBackupEnabled: settings.automaticBackupEnabled,
          backupReminderEnabled: settings.backupReminderEnabled,
        });
      }

      // Ha az automatikus backup be van kapcsolva, ne mutassunk emlékeztetőt
      // (mert akkor automatikusan történik a backup)
      if (settings.automaticBackupEnabled === true) {
        if (import.meta.env.DEV) {
          console.log("ℹ️ Automatikus backup be van kapcsolva, backup emlékeztető kikapcsolva");
        }
        setReminderState(prev => {
          // Csak akkor frissítjük, ha tényleg változott
          if (prev.shouldShow === false && prev.daysSinceLastBackup === null && prev.lastBackupDate === null && prev.timeSinceBackup === null) {
            return prev;
          }
          return {
            shouldShow: false,
            daysSinceLastBackup: null,
            lastBackupDate: null,
            timeSinceBackup: null,
          };
        });
        return;
      }

      // Ha az autosave be van kapcsolva, ne mutassunk backup emlékeztetőt
      // (mert akkor az adatok automatikusan mentődnek és automatikus vészbackup is létrejön)
      // Az App.tsx-ben ugyanez a logika: autosaveEnabled = settings.autosave === true
      // Ezért itt is ugyanazt használjuk a konzisztenciaért
      const autosaveEnabled = settings.autosave === true;
      if (autosaveEnabled) {
        if (import.meta.env.DEV) {
          console.log("ℹ️ Autosave be van kapcsolva, backup emlékeztető kikapcsolva");
        }
        setReminderState(prev => {
          // Csak akkor frissítjük, ha tényleg változott
          if (prev.shouldShow === false && prev.daysSinceLastBackup === null && prev.lastBackupDate === null && prev.timeSinceBackup === null) {
            return prev;
          }
          return {
            shouldShow: false,
            daysSinceLastBackup: null,
            lastBackupDate: null,
            timeSinceBackup: null,
          };
        });
        return;
      }

      // Ha a backup emlékeztető ki van kapcsolva, ne mutassunk semmit
      if (settings.backupReminderEnabled === false) {
        setReminderState(prev => {
          // Csak akkor frissítjük, ha tényleg változott
          if (prev.shouldShow === false && prev.daysSinceLastBackup === null && prev.lastBackupDate === null && prev.timeSinceBackup === null) {
            return prev;
          }
          return {
            shouldShow: false,
            daysSinceLastBackup: null,
            lastBackupDate: null,
            timeSinceBackup: null,
          };
        });
        return;
      }

      // Alapértelmezett emlékeztető intervallum: 7 nap
      const reminderIntervalDays = settings.backupReminderIntervalDays || 7;

      // Kérdezzük le az utolsó backup dátumát
      const lastBackupDate = settings.lastBackupDate || (await getLastBackupDate());

      if (!lastBackupDate) {
        // Még soha nem volt backup
        setReminderState(prev => {
          // Csak akkor frissítjük, ha tényleg változott
          if (prev.shouldShow === true && prev.daysSinceLastBackup === null && prev.lastBackupDate === null) {
            return prev;
          }
          return {
            shouldShow: true,
            daysSinceLastBackup: null,
            lastBackupDate: null,
            timeSinceBackup: null,
          };
        });
        return;
      }

      // Számoljuk ki, hogy hány nap telt el az utolsó backup óta
      const lastBackup = new Date(lastBackupDate);
      const now = new Date();
      const daysSinceLastBackup = Math.floor(
        (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Pontosabb időszámítás (percek, órák, napok, hetek, hónapok, évek)
      const timeSinceBackup = getTimeSinceBackup(lastBackupDate);

      const shouldShow = shouldShowBackupReminder(lastBackupDate, reminderIntervalDays);

      setReminderState(prev => {
        // Csak akkor frissítjük, ha tényleg változott valamelyik érték
        if (
          prev.shouldShow === shouldShow &&
          prev.daysSinceLastBackup === daysSinceLastBackup &&
          prev.lastBackupDate === lastBackupDate &&
          JSON.stringify(prev.timeSinceBackup) === JSON.stringify(timeSinceBackup)
        ) {
          return prev;
        }
        return {
          shouldShow,
          daysSinceLastBackup,
          lastBackupDate,
          timeSinceBackup,
        };
      });
    };

    checkBackupReminder();
    
    // Ellenőrizzük újra 1 óránként (de csak akkor frissítünk, ha tényleg változott)
    const interval = setInterval(checkBackupReminder, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [settings.backupReminderEnabled, settings.backupReminderIntervalDays, settings.lastBackupDate, settings.automaticBackupEnabled, settings.autosave]);

  return reminderState;
}

