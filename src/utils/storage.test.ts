import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readStorage, writeStorage } from './storage';

const asString = (raw: unknown) => (typeof raw === 'string' ? raw : null);

describe('readStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('저장된 값이 없으면 기본값을 반환한다', () => {
    expect(readStorage('missing', asString, 'fallback')).toBe('fallback');
  });

  it('저장된 JSON 값을 파싱해 반환한다', () => {
    localStorage.setItem('key', JSON.stringify('saved'));

    expect(readStorage('key', asString, 'fallback')).toBe('saved');
  });

  it('읽기에 실패하면 예외 없이 기본값을 반환한다', () => {
    localStorage.setItem('broken', '{not json');
    expect(readStorage('broken', asString, 'fallback')).toBe('fallback');

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(readStorage('key', asString, 'fallback')).toBe('fallback');
  });
});

describe('writeStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('값을 JSON으로 저장한다', () => {
    writeStorage('key', { a: 1 });

    expect(localStorage.getItem('key')).toBe('{"a":1}');
  });

  it('쓰기에 실패해도 예외를 던지지 않는다', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => writeStorage('key', 'value')).not.toThrow();
  });
});
