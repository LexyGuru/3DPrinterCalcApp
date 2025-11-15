// Keyboard Shortcuts rendszer

export type KeyboardShortcutCallback = (e: KeyboardEvent) => void;

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // Cmd on Mac
  callback: KeyboardShortcutCallback;
  description?: string;
}

class KeyboardShortcutsManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private isEnabled = true;

  constructor() {
    if (typeof window !== 'undefined') {
      // Capture phase-ban kezeljük, hogy biztosan elérjük az eseményeket
      window.addEventListener('keydown', this.handleKeyDown.bind(this), true);
      
      // Debug logolás inicializáláskor
      if (import.meta.env.DEV) {
        console.log("⌨️ Keyboard shortcuts rendszer inicializálva");
      }
    }
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (!this.isEnabled) return;
    
    // Ne kezeljük, ha input mezőben vagyunk (kivéve Enter, Escape)
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.isContentEditable
    ) {
      // Csak Escape és Ctrl/Cmd kombinációkat kezeljük input mezőkben
      if (e.key !== 'Escape' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        return;
      }
    }

    const key = e.key.toLowerCase();
    
    // Debug logolás (csak fejlesztéskor, és csak ha van regisztrált shortcut)
    // Ne logoljuk a meta+meta vagy egyéb érvénytelen kombinációkat
    if (import.meta.env.DEV && (e.metaKey || e.ctrlKey) && key !== 'meta') {
      const exactKey = this.buildShortcutKey(key, e.ctrlKey, e.shiftKey, e.altKey, e.metaKey);
      const hasShortcut = this.shortcuts.has(exactKey);
      if (hasShortcut) {
        console.log("⌨️ Gyorsbillentyű észlelve:", {
          key: e.key,
          keyLower: key,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          shiftKey: e.shiftKey,
          altKey: e.altKey,
          target: target.tagName,
          shortcut: exactKey
        });
      }
    }
    
    // macOS-en a metaKey = Command, Windows/Linux-en a ctrlKey = Ctrl
    // Ellenőrizzük mindkét kombinációt (meta VAGY ctrl)
    
    // Először a pontos egyezést
    const exactKey = this.buildShortcutKey(key, e.ctrlKey, e.shiftKey, e.altKey, e.metaKey);
    let shortcut = this.shortcuts.get(exactKey);
    
    // Ha nincs pontos egyezés, próbáljuk meg a cross-platform kombinációkat
    // macOS-en metaKey = Command, de lehet, hogy ctrlKey-kel regisztráltuk
    if (!shortcut && e.metaKey) {
      const ctrlKey = this.buildShortcutKey(key, true, e.shiftKey, e.altKey, false);
      shortcut = this.shortcuts.get(ctrlKey);
      if (import.meta.env.DEV && shortcut) {
        console.log("✅ Cross-platform egyezés találva (meta -> ctrl):", ctrlKey);
      }
    }
    
    // Windows/Linux-en ctrlKey = Ctrl, de lehet, hogy metaKey-kel regisztráltuk
    if (!shortcut && e.ctrlKey) {
      const metaKey = this.buildShortcutKey(key, false, e.shiftKey, e.altKey, true);
      shortcut = this.shortcuts.get(metaKey);
      if (import.meta.env.DEV && shortcut) {
        console.log("✅ Cross-platform egyezés találva (ctrl -> meta):", metaKey);
      }
    }
    
    if (shortcut) {
      if (import.meta.env.DEV) {
        console.log("✅ Gyorsbillentyű aktiválva:", exactKey);
      }
      e.preventDefault();
      e.stopPropagation();
      shortcut.callback(e);
    }
    // Ne logoljuk az érvénytelen kombinációkat (pl. meta+meta)
  }

  private buildShortcutKey(
    key: string,
    ctrl: boolean,
    shift: boolean,
    alt: boolean,
    meta: boolean
  ): string {
    const parts: string[] = [];
    if (ctrl) parts.push('ctrl');
    if (shift) parts.push('shift');
    if (alt) parts.push('alt');
    if (meta) parts.push('meta');
    parts.push(key);
    return parts.join('+');
  }

  register(shortcut: KeyboardShortcut): () => void {
    const key = this.buildShortcutKey(
      shortcut.key.toLowerCase(),
      shortcut.ctrl || false,
      shortcut.shift || false,
      shortcut.alt || false,
      shortcut.meta || false
    );
    
    this.shortcuts.set(key, shortcut);
    
    // Visszaadunk egy unsubscribe függvényt
    return () => {
      this.shortcuts.delete(key);
    };
  }

  unregister(key: string) {
    this.shortcuts.delete(key.toLowerCase());
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }
}

// Singleton instance
export const keyboardShortcuts = new KeyboardShortcutsManager();

// Hook a React komponensekben való használathoz
import { useEffect, useRef } from 'react';

export function useKeyboardShortcut(
  key: string,
  callback: KeyboardShortcutCallback,
  options?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
    enabled?: boolean;
  }
) {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (options?.enabled === false) return;

    const unsubscribe = keyboardShortcuts.register({
      key,
      ctrl: options?.ctrl,
      shift: options?.shift,
      alt: options?.alt,
      meta: options?.meta,
      callback: (e) => callbackRef.current(e),
    });

    return unsubscribe;
  }, [key, options?.ctrl, options?.shift, options?.alt, options?.meta, options?.enabled]);
}

