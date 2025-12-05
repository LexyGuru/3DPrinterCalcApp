/**
 * Home tasks utilities
 * Scheduled tasks utility függvények
 */

import type { Offer } from "../../../types";
import type { ScheduledTask } from "../types";
import type { TranslationKey } from "../../../utils/languages/types";

/**
 * Scheduled tasks építése offers-ből
 */
export function buildScheduledTasksFromOffers(
  offers: Offer[],
  t: (key: TranslationKey) => string
): ScheduledTask[] {
  const now = new Date();

  return offers
    .filter((offer) => {
      if (!offer.printDueDate) return false;
      const due = new Date(offer.printDueDate);
      return due > now;
    })
    .map<ScheduledTask>((offer) => {
      const customerName = offer.customerName || t("common.unknown") || "Unknown";
      const baseTitle = t("offers.title") || "Offer";
      const title =
        offer.description && offer.description.trim().length > 0
          ? `${customerName} - ${offer.description}`
          : `${customerName} - ${baseTitle}`;

      const due = new Date(offer.printDueDate!);
      const diffMs = due.getTime() - now.getTime();
      const daysUntilDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      let priority: ScheduledTask["priority"] = "low";
      if (daysUntilDue <= 3) {
        priority = "high";
      } else if (daysUntilDue <= 7) {
        priority = "medium";
      }

      const status: ScheduledTask["status"] =
        offer.status === "accepted" ? "in-progress" : "pending";

      return {
        id: offer.id,
        title,
        description: offer.description,
        dueDate: offer.printDueDate!,
        priority,
        status,
        relatedOfferId: offer.id,
      };
    })
    .sort((a, b) => {
      // Prioritás szerint rendezés
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Dátum szerint rendezés
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
}

