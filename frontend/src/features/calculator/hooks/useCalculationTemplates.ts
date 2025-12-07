/**
 * useCalculationTemplates hook
 * Template kezelés logika (mentés, betöltés, törlés)
 */

import { useState, useEffect, useCallback } from "react";
import type { CalculationTemplate, SelectedFilament, Printer } from "../types";
import { saveTemplates, loadTemplates } from "../../../utils/store";

interface UseCalculationTemplatesParams {
  printers: Printer[];
  filaments: import("../../../types").Filament[];
  onTemplateLoad?: (template: CalculationTemplate) => void;
}

/**
 * Hook template kezeléséhez
 */
export function useCalculationTemplates({
  printers,
  filaments,
  onTemplateLoad,
}: UseCalculationTemplatesParams) {
  const [templates, setTemplates] = useState<CalculationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Template-ek betöltése
  useEffect(() => {
    loadTemplates()
      .then((loadedTemplates) => {
        setTemplates(loadedTemplates);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Template betöltés hiba:", error);
        setIsLoading(false);
      });
  }, []);

  // Template mentése
  const saveTemplate = useCallback(async (
    templateData: {
      name: string;
      description?: string;
      printerId: number;
      selectedFilaments: SelectedFilament[];
      printTimeHours: number;
      printTimeMinutes: number;
      printTimeSeconds: number;
    }
  ): Promise<boolean> => {
    if (!templateData.name.trim()) {
      return false;
    }

    try {
      const newTemplate: CalculationTemplate = {
        id: Date.now(),
        name: templateData.name.trim(),
        description: templateData.description?.trim() || undefined,
        printerId: templateData.printerId,
        selectedFilaments: templateData.selectedFilaments.map(sf => ({
          filamentIndex: sf.filamentIndex,
          usedGrams: sf.usedGrams,
          needsDrying: sf.needsDrying,
          dryingTime: sf.dryingTime,
          dryingPower: sf.dryingPower,
        })),
        printTimeHours: templateData.printTimeHours,
        printTimeMinutes: templateData.printTimeMinutes,
        printTimeSeconds: templateData.printTimeSeconds,
        createdAt: new Date().toISOString(),
      };

      const updatedTemplates = [...templates, newTemplate];
      await saveTemplates(updatedTemplates);
      setTemplates(updatedTemplates);
      return true;
    } catch (error) {
      console.error("Template mentés hiba:", error);
      return false;
    }
  }, [templates]);

  // Template betöltése
  const loadTemplate = useCallback((template: CalculationTemplate): boolean => {
    // Ellenőrizzük, hogy a nyomtató még létezik
    const printer = printers.find(p => p.id === template.printerId);
    if (!printer) {
      return false;
    }

    // Ellenőrizzük, hogy a filamentek még léteznek
    const invalidFilaments = template.selectedFilaments.filter(
      sf => sf.filamentIndex < 0 || sf.filamentIndex >= filaments.length
    );
    if (invalidFilaments.length > 0) {
      return false;
    }

    if (onTemplateLoad) {
      onTemplateLoad(template);
    }

    return true;
  }, [printers, filaments, onTemplateLoad]);

  // Template törlése
  const deleteTemplate = useCallback(async (templateId: number): Promise<boolean> => {
    try {
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      await saveTemplates(updatedTemplates);
      setTemplates(updatedTemplates);
      return true;
    } catch (error) {
      console.error("Template törlés hiba:", error);
      return false;
    }
  }, [templates]);

  return {
    templates,
    isLoading,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
  };
}

