import { useState, useCallback } from 'react';

interface UndoRedoState<T> {
    past: T[];
    present: T;
    future: T[];
}

export function useUndoRedo<T>(initialState: T) {
    // Initialize the undo/redo state with the initial state
    const [state, setState] = useState<UndoRedoState<T>>({
        past: [],
        present: initialState,
        future: []
    });

    // Push a new state
    const pushState = useCallback((newState: T) => {
        setState(currentState => ({
            past: [...currentState.past, currentState.present],
            present: newState,
            future: []
        }));
    }, []);

    // Undo the last action
    const undo = useCallback(() => {
        setState(currentState => {
            if (currentState.past.length === 0) return currentState;

            const previous = currentState.past[currentState.past.length - 1];
            const newPast = currentState.past.slice(0, -1);

            return {
                past: newPast,
                present: previous,
                future: [currentState.present, ...currentState.future]
            };
        });
    }, []);

    // Redo the last undone action
    const redo = useCallback(() => {
        setState(currentState => {
            if (currentState.future.length === 0) return currentState;

            const next = currentState.future[0];
            const newFuture = currentState.future.slice(1);

            return {
                past: [...currentState.past, currentState.present],
                present: next,
                future: newFuture
            };
        });
    }, []);

    // Check if undo/redo are available
    const canUndo = state.past.length > 0;
    const canRedo = state.future.length > 0;

    // Return the current state and all functions
    return {
        state: state.present,
        pushState,
        undo,
        redo,
        canUndo,
        canRedo
    };
}