import { useState, useCallback, useRef, useEffect } from 'react';
import { UndoRedoManager } from '../utils/undoRedo';

/**
 * Hook for undo/redo functionality
 */
export function useUndoRedo<T>(
  initialState: T,
  maxHistorySize: number = 50
): {
  state: T;
  setState: (newState: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (newState: T) => void;
  clear: () => void;
} {
  const managerRef = useRef<UndoRedoManager<T>>(
    new UndoRedoManager(initialState, maxHistorySize)
  );

  const [state, setStateInternal] = useState<T>(initialState);

  // Sync manager with external state changes (e.g., from props)
  // Only reset if the actual content changed, not just the reference
  const prevInitialStateRef = useRef<string>(JSON.stringify(initialState));
  useEffect(() => {
    const currentInitialState = JSON.stringify(initialState);
    const currentState = managerRef.current.getState();
    
    // Csak akkor reset, ha valóban változott az initialState tartalma
    if (prevInitialStateRef.current !== currentInitialState && 
        currentInitialState !== JSON.stringify(currentState)) {
      prevInitialStateRef.current = currentInitialState;
      managerRef.current.reset(initialState);
      setStateInternal(initialState);
    }
  }, [initialState]);

  const setState = useCallback((newState: T) => {
    managerRef.current.push(newState);
    setStateInternal(newState);
  }, []);

  const undo = useCallback(() => {
    const previousState = managerRef.current.undo();
    if (previousState !== null) {
      setStateInternal(previousState);
    }
  }, []);

  const redo = useCallback(() => {
    const nextState = managerRef.current.redo();
    if (nextState !== null) {
      setStateInternal(nextState);
    }
  }, []);

  const reset = useCallback((newState: T) => {
    managerRef.current.reset(newState);
    setStateInternal(newState);
  }, []);

  const clear = useCallback(() => {
    managerRef.current.clear();
  }, []);

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: managerRef.current.canUndo(),
    canRedo: managerRef.current.canRedo(),
    reset,
    clear,
  };
}

