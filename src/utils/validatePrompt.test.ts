import { describe, it, expect } from 'vitest';
import { validatePromptLength } from './validatePrompt';

describe('validatePromptLength', () => {
  it('500자 이하면 유효하다', () => {
    const result = validatePromptLength('가'.repeat(500));

    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('500자를 넘으면 무효이고 에러 메시지를 반환한다', () => {
    const result = validatePromptLength('가'.repeat(501));

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('프롬프트는 500자 이하로 입력해주세요.');
  });

  it('앞뒤 공백은 길이에 포함하지 않는다', () => {
    const result = validatePromptLength(`  ${'가'.repeat(500)}\n`);

    expect(result.isValid).toBe(true);
  });
});
