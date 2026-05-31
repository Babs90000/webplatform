/**
 * History management for undo/redo functionality
 */

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export class History<T> {
  private state: HistoryState<T>;

  constructor(initialState: T) {
    this.state = {
      past: [],
      present: initialState,
      future: [],
    };
  }

  push(newState: T) {
    this.state = {
      past: [...this.state.past, this.state.present],
      present: newState,
      future: [],
    };
  }

  undo(): T | null {
    if (this.state.past.length === 0) return null;

    const previous = this.state.past[this.state.past.length - 1];
    const newPast = this.state.past.slice(0, -1);

    this.state = {
      past: newPast,
      present: previous,
      future: [this.state.present, ...this.state.future],
    };

    return this.state.present;
  }

  redo(): T | null {
    if (this.state.future.length === 0) return null;

    const next = this.state.future[0];
    const newFuture = this.state.future.slice(1);

    this.state = {
      past: [...this.state.past, this.state.present],
      present: next,
      future: newFuture,
    };

    return this.state.present;
  }

  getState() {
    return this.state;
  }

  canUndo() {
    return this.state.past.length > 0;
  }

  canRedo() {
    return this.state.future.length > 0;
  }

  /** Save a diverged live state so redo can restore it after undo. */
  recordFuture(state: T): void {
    this.state = {
      ...this.state,
      future: [state, ...this.state.future],
    };
  }

  reset(initialState: T) {
    this.state = {
      past: [],
      present: initialState,
      future: [],
    };
  }
}
