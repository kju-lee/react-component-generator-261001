import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';
import { STORAGE_KEYS } from '../utils/persistedState';

const saved = { id: '1', prompt: '버튼', code: 'render(<A />)', createdAt: '2026-10-01T04:00:00.000Z' };

describe('useComponentGenerator', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('저장된 컴포넌트 목록으로 시작한다', () => {
    localStorage.setItem(STORAGE_KEYS.components, JSON.stringify([saved]));

    const { result } = renderHook(() => useComponentGenerator());

    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0].createdAt).toBeInstanceOf(Date);
  });
});
