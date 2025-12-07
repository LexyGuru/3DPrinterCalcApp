/**
 * Undo/Redo utility for managing state history
 */

export interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export class UndoRedoManager<T> {
  private state: UndoRedoState<T>;
  private maxHistorySize: number;

  constructor(initialState: T, maxHistorySize: number = 50) {
    this.state = {
      past: [],
      present: initialState,
      future: [],
    };
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Get current state
   */
  getState(): T {
    return this.state.present;
  }

  /**
   * Get full undo/redo state
   */
  getUndoRedoState(): UndoRedoState<T> {
    return { ...this.state };
  }

  /**
   * Check if undo is possible
   */
  canUndo(): boolean {
    return this.state.past.length > 0;
  }

  /**
   * Check if redo is possible
   */
  canRedo(): boolean {
    return this.state.future.length > 0;
  }

  /**
   * Add a new state to history
   */
  push(newState: T): void {
    // Don't push if state hasn't changed
    if (this.isEqual(this.state.present, newState)) {
      return;
    }

    // Add current state to past
    this.state.past.push(this.state.present);

    // Limit history size
    if (this.state.past.length > this.maxHistorySize) {
      this.state.past.shift();
    }

    // Clear future when new state is pushed
    this.state.future = [];

    // Set new present state
    this.state.present = newState;
  }

  /**
   * Undo: move to previous state
   */
  undo(): T | null {
    if (!this.canUndo()) {
      return null;
    }

    const previous = this.state.past.pop()!;
    this.state.future.unshift(this.state.present);
    this.state.present = previous;

    return this.state.present;
  }

  /**
   * Redo: move to next state
   */
  redo(): T | null {
    if (!this.canRedo()) {
      return null;
    }

    const next = this.state.future.shift()!;
    this.state.past.push(this.state.present);
    this.state.present = next;

    return this.state.present;
  }

  /**
   * Reset history
   */
  reset(newState: T): void {
    this.state = {
      past: [],
      present: newState,
      future: [],
    };
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.state = {
      past: [],
      present: this.state.present,
      future: [],
    };
  }

  /**
   * Deep equality check (simple implementation)
   * For complex objects, consider using a library like lodash.isEqual
   */
  private isEqual(a: T, b: T): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }
}

