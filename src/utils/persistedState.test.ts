import { describe, it, expect } from 'vitest';
import { parseProvider, parseApiKeys, parsePromptHistory, parseComponents } from './persistedState';

describe('parseProvider', () => {
  it('알려진 provider만 받아들이고 그 외에는 null을 반환한다', () => {
    expect(parseProvider('google')).toBe('google');
    expect(parseProvider('anthropic')).toBe('anthropic');
    expect(parseProvider('openai')).toBeNull();
    expect(parseProvider(42)).toBeNull();
  });
});

describe('parseApiKeys', () => {
  it('provider별 문자열 키만 꺼내고 빠지거나 잘못된 값은 빈 문자열로 채운다', () => {
    expect(parseApiKeys({ google: 'g-key', anthropic: 123, extra: 'x' })).toEqual({
      google: 'g-key',
      anthropic: '',
    });
  });

  it('객체가 아니면 null을 반환한다', () => {
    expect(parseApiKeys('key')).toBeNull();
    expect(parseApiKeys(null)).toBeNull();
  });
});

describe('parsePromptHistory', () => {
  it('문자열 항목만 남기고, 배열이 아니면 null을 반환한다', () => {
    expect(parsePromptHistory(['a', 1, 'b', null])).toEqual(['a', 'b']);
    expect(parsePromptHistory('a')).toBeNull();
  });
});

describe('parseComponents', () => {
  it('JSON으로 저장된 createdAt 문자열을 Date로 복원한다', () => {
    const saved = JSON.parse(
      JSON.stringify([{ id: '1', prompt: '버튼', code: 'render(<A />)', createdAt: new Date('2026-10-01T04:00:00Z') }]),
    );

    const [component] = parseComponents(saved) ?? [];

    expect(component.createdAt).toBeInstanceOf(Date);
    expect(component.createdAt.toISOString()).toBe('2026-10-01T04:00:00.000Z');
  });

  it('필드가 빠졌거나 날짜가 잘못된 항목은 버린다', () => {
    const valid = { id: '1', prompt: '버튼', code: 'x', createdAt: '2026-10-01T04:00:00Z' };

    const result = parseComponents([
      valid,
      { id: '2', prompt: '카드', createdAt: '2026-10-01T04:00:00Z' },
      { id: '3', prompt: '표', code: 'x', createdAt: 'not a date' },
      null,
    ]);

    expect(result?.map((c) => c.id)).toEqual(['1']);
  });
});
