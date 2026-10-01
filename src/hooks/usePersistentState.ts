import { useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../utils/storage';

/** useState와 같지만 값을 localStorage에 JSON으로 보관하고, 처음 렌더링할 때 parse로 검증해 복원한다. */
export function usePersistentState<T>(
  key: string,
  parse: (raw: unknown) => T | null,
  fallback: T,
) {
  const [value, setValue] = useState<T>(() => readStorage(key, parse, fallback));

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
