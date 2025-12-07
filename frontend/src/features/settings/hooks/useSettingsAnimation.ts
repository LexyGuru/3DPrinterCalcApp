/**
 * useSettingsAnimation Hook
 * Animation settings kezelés
 */

import { useMemo, useCallback } from "react";
import type { Settings, AnimationSettings } from "../../../types";
import { defaultAnimationSettings } from "../../../types";

interface UseSettingsAnimationProps {
  settings: Settings;
  onChange: (newSettings: Settings) => void;
}

interface UseSettingsAnimationReturn {
  animationSettings: AnimationSettings;
  updateAnimationSetting: <K extends keyof AnimationSettings>(
    key: K,
    value: AnimationSettings[K]
  ) => void;
}

export function useSettingsAnimation({
  settings,
  onChange,
}: UseSettingsAnimationProps): UseSettingsAnimationReturn {
  const animationSettings = useMemo<AnimationSettings>(
    () => ({
      ...defaultAnimationSettings,
      ...(settings.animationSettings ?? {}),
    }),
    [settings.animationSettings]
  );

  const updateAnimationSetting = useCallback(
    <K extends keyof AnimationSettings>(key: K, value: AnimationSettings[K]) => {
      onChange({
        ...settings,
        animationSettings: {
          ...defaultAnimationSettings,
          ...(settings.animationSettings ?? {}),
          [key]: value,
        },
      });
    },
    [settings, onChange]
  );

  return {
    animationSettings,
    updateAnimationSetting,
  };
}

