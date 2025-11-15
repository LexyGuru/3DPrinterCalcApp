import type { Offer } from "../types";

/**
 * Format date to ICS format (YYYYMMDDTHHmmssZ)
 */
function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escape text for ICS format
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}

/**
 * Generate ICS file content from offers with due dates
 */
export function generateICS(offers: Offer[]): string {
  const now = new Date();
  const timestamp = formatICSDate(now);
  
  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//3DPrinterCalcApp//Calendar Export//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ].join("\r\n") + "\r\n";

  offers.forEach((offer) => {
    if (!offer.printDueDate) return;

    const dueDate = new Date(offer.printDueDate);
    // Set time to 9:00 AM local time
    dueDate.setHours(9, 0, 0, 0);
    
    // Reminder 1 day before (at 8:00 AM)
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - 1);
    reminderDate.setHours(8, 0, 0, 0);

    const dtstart = formatICSDate(dueDate);
    const dtend = new Date(dueDate);
    dtend.setHours(10, 0, 0, 0); // 1 hour duration
    const dtendFormatted = formatICSDate(dtend);

    const summary = escapeICSText(
      `📅 ${offer.customerName || "Ügyfél"} - ${offer.description || "Nyomtatás"}`
    );
    
    const description = escapeICSText(
      [
        `Ügyfél: ${offer.customerName || "N/A"}`,
        `Leírás: ${offer.description || "N/A"}`,
        `Nyomtató: ${offer.printerName || "N/A"}`,
        `Nyomtatási idő: ${offer.printTimeHours}h ${offer.printTimeMinutes}m`,
        `Költség: ${offer.costs.totalCost.toFixed(2)} ${offer.currency}`,
        `Státusz: ${
          offer.status === "accepted" ? "Elfogadva" :
          offer.status === "rejected" ? "Elutasítva" :
          offer.status === "completed" ? "Befejezve" : "Ismeretlen"
        }`,
      ].join("\\n")
    );

    const uid = `offer-${offer.id}-${timestamp}@3dprintercalcapp.local`;

    ics += [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${timestamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtendFormatted}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `STATUS:CONFIRMED`,
      `SEQUENCE:0`,
      `BEGIN:VALARM`,
      `TRIGGER:-P1D`,
      `ACTION:DISPLAY`,
      `DESCRIPTION:${escapeICSText("Emlékeztető: Nyomtatás esedékes holnap!")}`,
      `END:VALARM`,
      `END:VEVENT`,
    ].join("\r\n") + "\r\n";
  });

  ics += "END:VCALENDAR\r\n";
  return ics;
}

/**
 * Get calendar URL based on provider
 */
export function getCalendarURL(icsContent: string, provider: "google" | "ios" | "outlook"): string {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const dataUri = URL.createObjectURL(blob);
  
  switch (provider) {
    case "google":
      // Google Calendar web interface
      return "https://calendar.google.com/calendar/render?action=TEMPLATE";
    case "outlook":
      // Outlook web interface
      return "https://outlook.live.com/calendar/0/deeplink/compose";
    case "ios":
      // iOS Calendar - will be handled by file opening
      return dataUri;
    default:
      return dataUri;
  }
}

