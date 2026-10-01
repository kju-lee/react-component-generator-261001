import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { STORAGE_KEYS } from './utils/persistedState';

function mockFetch() {
  return vi.fn(async (url: string) => {
    if (url === '/api/config') {
      return Response.json({ envKeys: { anthropic: false, google: false } });
    }
    return Response.json({ code: 'render(<div />)' });
  });
}

describe('App 상태 유지', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', mockFetch());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('저장된 provider와 그 provider의 API 키로 시작한다', () => {
    localStorage.setItem(STORAGE_KEYS.provider, JSON.stringify('anthropic'));
    localStorage.setItem(STORAGE_KEYS.apiKeys, JSON.stringify({ anthropic: 'sk-ant-saved', google: '' }));

    render(<App />);

    expect(screen.getByRole('radio', { name: 'Anthropic' })).toBeChecked();
    expect(screen.getByLabelText('API 키')).toHaveValue('sk-ant-saved');
  });

  it('생성을 요청한 프롬프트를 최근 목록에 보여주고 저장한다', async () => {
    localStorage.setItem(STORAGE_KEYS.apiKeys, JSON.stringify({ anthropic: '', google: 'g-key' }));
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('textbox', { name: '만들고 싶은 컴포넌트 설명' }), '프로필 카드');
    await user.click(screen.getByRole('button', { name: '컴포넌트 생성' }));

    expect(await screen.findByRole('button', { name: '기록 지우기' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.promptHistory) ?? '[]')).toEqual(['프로필 카드']);
  });
});
