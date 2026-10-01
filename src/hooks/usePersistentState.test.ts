import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePersistentState } from './usePersistentState';

const asString = (raw: unknown) => (typeof raw === 'string' ? raw : null);

describe('usePersistentState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('저장된 값으로 초기화한다', () => {
    localStorage.setItem('key', JSON.stringify('saved'));

    const { result } = renderHook(() => usePersistentState('key', asString, 'fallback'));

    expect(result.current[0]).toBe('saved');
  });

  it('값을 바꾸면 저장소에 기록한다', () => {
    const { result } = renderHook(() => usePersistentState('key', asString, 'fallback'));

    act(() => result.current[1]('changed'));

    expect(result.current[0]).toBe('changed');
    expect(localStorage.getItem('key')).toBe('"changed"');
  });
});
