export const MAX_PROMPT_HISTORY = 10;

/** 프롬프트를 맨 앞에 두고, 중복을 제거한 뒤 최근 MAX_PROMPT_HISTORY개만 남긴다. */
export function addPromptHistory(history: string[], prompt: string): string[] {
  return [prompt, ...history.filter((item) => item !== prompt)].slice(0, MAX_PROMPT_HISTORY);
}
