// 사용자 프롬프트 검증 순수 함수. 제출 시 trim된 값이 전송되므로 trim 기준으로 센다.

export const MAX_PROMPT_LENGTH = 500;

export interface PromptValidation {
  isValid: boolean;
  error: string | null;
}

export function validatePromptLength(prompt: string): PromptValidation {
  if (prompt.trim().length > MAX_PROMPT_LENGTH) {
    return { isValid: false, error: `프롬프트는 ${MAX_PROMPT_LENGTH}자 이하로 입력해주세요.` };
  }
  return { isValid: true, error: null };
}
