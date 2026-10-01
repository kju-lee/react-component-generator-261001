// localStorage 접근 래퍼. 비공개 창·용량 초과·깨진 데이터에서도 앱이 멈추지 않도록 모든 실패를 삼킨다.

export function readStorage<T>(key: string, parse: (raw: unknown) => T | null, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return parse(JSON.parse(raw)) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패는 무시한다. 메모리 상태는 그대로 유지된다.
  }
}
