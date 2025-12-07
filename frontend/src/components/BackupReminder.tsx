import { useEffect, useRef } from "react";
import type { Settings } from "../types";
import { useBackupReminder } from "../utils/backupReminder";
import { useToast } from "./Toast";
import { useTranslation } from "../utils/translations";

interface Props {
  settings: Settings;
  showTutorial?: boolean; // Ha true, akkor ne mutassa meg az emlékeztetőt (tutorial alatt)
}

/**
 * Backup emlékeztető komponens
 * Automatikusan megjelenít egy toast értesítést, ha régen volt backup
 */
export const BackupReminder: React.FC<Props> = ({ settings, showTutorial = false }) => {
  const reminderState = useBackupReminder(settings);
  const { showToast } = useToast();
  const t = useTranslation(settings.language);
  const hasShownReminder = useRef<string | null>(null); // Utolsó megmutatott backup dátum vagy "never"
  const showToastRef = useRef(showToast);
  const tRef = useRef(t);

  // Frissítjük a ref-eket, hogy mindig aktuális legyenek
  useEffect(() => {
    showToastRef.current = showToast;
    tRef.current = t;
  }, [showToast, t]);

  useEffect(() => {
    // Debug log
    if (import.meta.env.DEV) {
      console.log("🔍 BackupReminder komponens ellenőrzés:", {
        autosave: settings.autosave,
        automaticBackupEnabled: settings.automaticBackupEnabled,
        reminderStateShouldShow: reminderState.shouldShow,
        lastBackupDate: reminderState.lastBackupDate,
        showTutorial,
      });
    }

    // Ha a tutorial aktív, ne mutassunk backup emlékeztetőt
    if (showTutorial) {
      if (import.meta.env.DEV) {
        console.log("ℹ️ Tutorial aktív, backup emlékeztető nem jelenik meg");
      }
      hasShownReminder.current = null;
      return;
    }

    // Ha az automatikus backup be van kapcsolva, ne mutassunk emlékeztetőt
    // (mert akkor automatikusan történik a backup)
    if (settings.automaticBackupEnabled === true) {
      if (import.meta.env.DEV) {
        console.log("ℹ️ Automatikus backup be van kapcsolva, toast nem jelenik meg");
      }
      hasShownReminder.current = null;
      return;
    }

    // Ha az autosave be van kapcsolva, ne mutassunk backup emlékeztetőt
    // (mert akkor az adatok automatikusan mentődnek és automatikus vészbackup is létrejön)
    // Az App.tsx-ben ugyanez a logika: autosaveEnabled = settings.autosave === true
    // Ezért itt is ugyanazt használjuk a konzisztenciaért
    const autosaveEnabled = settings.autosave === true;
    if (autosaveEnabled) {
      if (import.meta.env.DEV) {
        console.log("ℹ️ Autosave be van kapcsolva, toast nem jelenik meg");
      }
      hasShownReminder.current = null;
      return;
    }

    // Ha nincs szükség emlékeztetőre, ne csináljunk semmit
    if (!reminderState.shouldShow) {
      hasShownReminder.current = null;
      return;
    }

    // Egyedi azonosító az emlékeztetőhöz
    // Ha nincs backup, "never" + mai dátum (napos rész) - így naponta max 1x jelenik meg
    // Ha van backup, lastBackupDate + napok száma (napra kerekítve)
    let reminderKey: string;
    if (!reminderState.lastBackupDate) {
      // Napos rész csak, így naponta max 1x mutatjuk meg
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      reminderKey = `never-${today}`;
    } else {
      // Utolsó backup dátuma + napok száma (napra kerekítve)
      const days = reminderState.daysSinceLastBackup ?? 0;
      reminderKey = `${reminderState.lastBackupDate}-${days}`;
    }
    
    // Csak egyszer mutassunk emlékeztetőt ugyanazért az állapotért
    if (hasShownReminder.current === reminderKey) {
      return;
    }

    // Toast üzenet összeállítása
    let message: string;
    if (!reminderState.lastBackupDate) {
      // Még soha nem volt backup
      message = tRef.current("backup.reminder.never");
    } else if (reminderState.timeSinceBackup) {
      // Pontosabb időszámítás alapján üzenet
      const time = reminderState.timeSinceBackup;
      
      // Rendezzük a prioritást: évek > hónapok > hetek > napok > órák > percek
      if (time.years > 0) {
        const template = tRef.current("backup.reminder.years") || "💾 {{years}} éve nem készítettél backup-ot!";
        message = template.replace("{{years}}", time.years.toString());
      } else if (time.months > 0) {
        const template = tRef.current("backup.reminder.months") || "💾 {{months}} hónapja nem készítettél backup-ot!";
        message = template.replace("{{months}}", time.months.toString());
      } else if (time.weeks > 0) {
        const template = tRef.current("backup.reminder.weeks") || "💾 {{weeks}} hete nem készítettél backup-ot!";
        message = template.replace("{{weeks}}", time.weeks.toString());
      } else if (time.days > 0 || reminderState.daysSinceLastBackup !== null) {
        // Használjuk a daysSinceLastBackup értéket, ha van
        const days = reminderState.daysSinceLastBackup ?? time.days;
        if (days === 1) {
          message = tRef.current("backup.reminder.oneDay");
        } else {
          const template = tRef.current("backup.reminder.multipleDays");
          message = template.replace("{{days}}", days.toString());
        }
      } else if (time.hours > 0) {
        const template = tRef.current("backup.reminder.hours") || "💾 {{hours}} órája nem készítettél backup-ot!";
        message = template.replace("{{hours}}", time.hours.toString());
      } else if (time.totalMinutes > 0) {
        const template = tRef.current("backup.reminder.minutes") || "💾 {{minutes}} perce nem készítettél backup-ot!";
        message = template.replace("{{minutes}}", time.totalMinutes.toString());
      } else {
        // Még mindig a mai nap
        message = tRef.current("backup.reminder.today") || "💾 Ma még nem készítettél backup-ot!";
      }
    } else if (reminderState.daysSinceLastBackup !== null) {
      // Fallback a régi logikára, ha nincs timeSinceBackup
      const days = reminderState.daysSinceLastBackup;
      if (days === 1) {
        message = tRef.current("backup.reminder.oneDay");
      } else {
        const template = tRef.current("backup.reminder.multipleDays");
        message = template.replace("{{days}}", days.toString());
      }
    } else {
      return;
    }

    // Info típusú toast, duration 0 = csak manuálisan záródik be (fontos emlékeztetők)
    showToastRef.current(message, "info");
    hasShownReminder.current = reminderKey;

    // Logolás (dev módban)
    if (import.meta.env.DEV) {
      console.log("💾 Backup emlékeztető megjelenítve", {
        shouldShow: reminderState.shouldShow,
        daysSinceLastBackup: reminderState.daysSinceLastBackup,
        lastBackupDate: reminderState.lastBackupDate,
        reminderKey,
      });
    }
    // Csak akkor fut le újra, ha a reminderState.shouldShow vagy a lastBackupDate vagy az automaticBackupEnabled vagy az autosave vagy a showTutorial változik
  }, [reminderState.shouldShow, reminderState.lastBackupDate, settings.automaticBackupEnabled, settings.autosave, showTutorial]);

  // Ez a komponens nem renderel semmit, csak a toast-ot kezeli
  return null;
};

