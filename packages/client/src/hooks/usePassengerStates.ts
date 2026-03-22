import { useState, useCallback } from 'react';

export interface PassengerState {
  id: string;
  state: 'relaxed' | 'comfortable' | 'anxious' | 'scared' | 'panicked';
  comfort: number;
  reaction: string;
  isReacting: boolean;
}

export function usePassengerStates(initialCount: number = 0) {
  const [states, setStates] = useState<Map<string, PassengerState>>(new Map());

  const updateStates = useCallback((updates: PassengerState[]) => {
    setStates((prev) => {
      const next = new Map(prev);
      updates.forEach((u) => {
        next.set(u.id, u);
      });
      return next;
    });
  }, []);

  const getState = useCallback(
    (passengerId: string): PassengerState | undefined => {
      return states.get(passengerId);
    },
    [states]
  );

  const reset = useCallback(() => {
    setStates(new Map());
  }, []);

  return {
    states,
    updateStates,
    getState,
    reset,
    stateCount: states.size,
  };
}
