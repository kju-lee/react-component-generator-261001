import { describe, it, expect } from 'vitest';
import { addPromptHistory } from './promptHistory';

describe('addPromptHistory', () => {
  it('새 프롬프트를 맨 앞에 추가한다', () => {
    expect(addPromptHistory(['이전'], '새것')).toEqual(['새것', '이전']);
  });

  it('이미 있는 프롬프트는 중복 없이 맨 앞으로 옮긴다', () => {
    expect(addPromptHistory(['a', 'b', 'c'], 'b')).toEqual(['b', 'a', 'c']);
  });

  it('최근 10개까지만 유지한다', () => {
    const history = Array.from({ length: 10 }, (_, i) => `p${i}`);

    const result = addPromptHistory(history, '새것');

    expect(result).toHaveLength(10);
    expect(result[0]).toBe('새것');
    expect(result).not.toContain('p9');
  });
});
