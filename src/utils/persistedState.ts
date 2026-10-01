// localStorage에서 읽은 값은 사용자가 수정했거나 이전 버전일 수 있으므로 형태를 검증해 복원한다.
import type { GeneratedComponent, Provider } from '../types';

export const STORAGE_KEYS = {
  apiKeys: 'rcg:apiKeys',
  provider: 'rcg:provider',
  promptHistory: 'rcg:promptHistory',
  components: 'rcg:components',
} as const;

export function parseProvider(raw: unknown): Provider | null {
  return raw === 'anthropic' || raw === 'google' ? raw : null;
}

export function parseApiKeys(raw: unknown): Record<Provider, string> | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const record = raw as Record<string, unknown>;
  const asKey = (value: unknown) => (typeof value === 'string' ? value : '');
  return { anthropic: asKey(record.anthropic), google: asKey(record.google) };
}

export function parsePromptHistory(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.filter((item): item is string => typeof item === 'string');
}

export function parseComponents(raw: unknown): GeneratedComponent[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.flatMap((item) => {
    if (typeof item !== 'object' || item === null) return [];
    const { id, prompt, code, createdAt } = item as Record<string, unknown>;
    if (typeof id !== 'string' || typeof prompt !== 'string' || typeof code !== 'string') return [];
    const date = new Date(typeof createdAt === 'string' ? createdAt : NaN);
    if (Number.isNaN(date.getTime())) return [];
    return [{ id, prompt, code, createdAt: date }];
  });
}
