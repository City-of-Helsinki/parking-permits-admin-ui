import { useState } from 'react';

export interface SetActions<T> {
  add: (value: T) => void;
  delete: (value: T) => void;
  clear: () => void;
  set: (newState: Set<T>) => void;
}

const useSet = <T>(initialState: Set<T>): [Set<T>, SetActions<T>] => {
  const [set, setSet] = useState(initialState);

  const mutate = (mutation: (state: Set<T>) => void) => {
    const newSet = new Set(set);
    mutation(newSet);
    setSet(newSet);
  };

  return [
    set,
    {
      add: (value: T) => mutate(state => state.add(value)),
      delete: (value: T) => mutate(state => state.delete(value)),
      clear: () => mutate(state => state.clear()),
      set: (newState: Set<T>) => setSet(() => newState),
    },
  ];
};

export default useSet;
