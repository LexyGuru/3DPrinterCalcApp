import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook for optimistic UI updates
 * Immediately updates the UI, then performs the actual save operation in the background
 * If the save fails, rolls back to the previous state
 */
export function useOptimisticUpdate<T>(
  currentState: T,
  saveFunction: (newState: T) => Promise<void>,
  onError?: (error: Error, previousState: T) => void
): {
  optimisticState: T;
  updateOptimistically: (newState: T) => Promise<void>;
  isSaving: boolean;
  error: Error | null;
} {
  const [optimisticState, setOptimisticState] = useState<T>(currentState);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const previousStateRef = useRef<T>(currentState);
  const saveFunctionRef = useRef(saveFunction);
  const onErrorRef = useRef(onError);

  // Update refs when props change
  useEffect(() => {
    saveFunctionRef.current = saveFunction;
    onErrorRef.current = onError;
  }, [saveFunction, onError]);

  // Sync optimistic state with current state when it changes externally
  // Csak akkor frissítjük, ha valóban változás történt (nem csak referencia változás)
  const prevCurrentStateRef = useRef<string>(JSON.stringify(currentState));
  useEffect(() => {
    const currentStateStr = JSON.stringify(currentState);
    const optimisticStateStr = JSON.stringify(optimisticState);
    
    // Ha a currentState változott külsőleg (nem az optimistic update miatt) ÉS nem vagyunk éppen saving közben
    if (prevCurrentStateRef.current !== currentStateStr && currentStateStr !== optimisticStateStr && !isSaving) {
      setOptimisticState(currentState);
      previousStateRef.current = currentState;
      prevCurrentStateRef.current = currentStateStr;
    }
  }, [currentState, optimisticState, isSaving]);

  const updateOptimistically = useCallback(async (newState: T) => {
    // Store previous state for rollback
    previousStateRef.current = optimisticState;
    
    // Immediately update UI (optimistic update)
    setOptimisticState(newState);
    setIsSaving(true);
    setError(null);

    try {
      // Perform actual save in background
      await saveFunctionRef.current(newState);
      
      // Save successful, keep the optimistic state
      setIsSaving(false);
    } catch (err) {
      // Save failed, rollback to previous state
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setOptimisticState(previousStateRef.current);
      setIsSaving(false);

      // Call error callback if provided
      if (onErrorRef.current) {
        onErrorRef.current(error, previousStateRef.current);
      }
      
      // Re-throw error so caller can handle it
      throw error;
    }
  }, [optimisticState]);

  return {
    optimisticState,
    updateOptimistically,
    isSaving,
    error,
  };
}

