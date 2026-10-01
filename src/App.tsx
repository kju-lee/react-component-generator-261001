import { useState, useEffect } from 'react';
import { PromptInput } from './components/PromptInput';
import { ComponentCard } from './components/ComponentCard';
import { RetroWindow } from './components/RetroWindow';
import { useComponentGenerator } from './hooks/useComponentGenerator';
import { usePersistentState } from './hooks/usePersistentState';
import { STORAGE_KEYS, parseApiKeys, parsePromptHistory, parseProvider } from './utils/persistedState';
import { addPromptHistory } from './utils/promptHistory';
import type { Provider } from './types';
import './App.css';

const PROVIDER_CONFIG = {
  anthropic: { label: 'Anthropic', placeholder: 'sk-ant-...' },
  google: { label: 'Google', placeholder: 'AIza...' },
} as const;

function App() {
  const [provider, setProvider] = usePersistentState<Provider>(STORAGE_KEYS.provider, parseProvider, 'google');
  const [apiKeys, setApiKeys] = usePersistentState(STORAGE_KEYS.apiKeys, parseApiKeys, {
    anthropic: '',
    google: '',
  });
  const [showKey, setShowKey] = useState(false);
  const apiKey = apiKeys[provider];
  const setApiKey = (value: string) => setApiKeys((prev) => ({ ...prev, [provider]: value }));
  const [promptHistory, setPromptHistory] = usePersistentState<string[]>(
    STORAGE_KEYS.promptHistory,
    parsePromptHistory,
    [],
  );
  const [envKeys, setEnvKeys] = useState<Record<Provider, boolean>>({
    anthropic: false,
    google: false,
  });
  const { components, isLoading, error, generate, removeComponent, clearAll } =
    useComponentGenerator();

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setEnvKeys(data.envKeys))
      .catch(() => {});
  }, []);

  const hasEnvKey = envKeys[provider];

  const handleGenerate = (prompt: string) => {
    if (!apiKey.trim() && !hasEnvKey) {
      alert(`${PROVIDER_CONFIG[provider].label} API 키를 입력하거나 .env에 설정해주세요.`);
      return;
    }
    setPromptHistory((prev) => addPromptHistory(prev, prompt));
    generate(prompt, apiKey || undefined, provider);
  };

  const handleProviderChange = (newProvider: Provider) => {
    setProvider(newProvider);
  };

  const activeProvider = PROVIDER_CONFIG[provider].label;
  const isKeyReady = hasEnvKey || apiKey.trim() !== '';

  return (
    <div className="app">
      <header className="menubar">
        <span className="menubar-brand">
          <span className="menubar-glyph" aria-hidden="true" />
          컴포넌트 생성기
        </span>
        <span className="menubar-status" aria-label="현재 작업 상태">
          <span title={isKeyReady ? 'API 키 준비됨' : 'API 키 필요'}>
            <span className={`led ${isKeyReady ? 'led--on' : ''}`} aria-hidden="true" />
            {activeProvider}
          </span>
          <span>부품 {components.length}개</span>
        </span>
      </header>

      <main className="desktop">
        <div className="workspace">
          <RetroWindow title="새 컴포넌트" className="composer-window">
            <PromptInput
              onGenerate={handleGenerate}
              isLoading={isLoading}
              history={promptHistory}
              onClearHistory={() => setPromptHistory([])}
            />
          </RetroWindow>

          <RetroWindow title="실행 설정" className="settings-window" as="aside">
            <fieldset className="provider-select">
              <legend>AI 제공자</legend>
              {Object.entries(PROVIDER_CONFIG).map(([key, { label }]) => (
                <label key={key} className="radio">
                  <input
                    type="radio"
                    name="provider"
                    value={key}
                    checked={provider === key}
                    onChange={() => handleProviderChange(key as Provider)}
                  />
                  <span className="radio-mark" aria-hidden="true" />
                  {label}
                </label>
              ))}
            </fieldset>
            <div className="api-key-input">
              <label htmlFor="api-key">API 키</label>
              <div className="api-key-field">
                <input
                  id="api-key"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={hasEnvKey ? '서버 키 사용 중' : PROVIDER_CONFIG[provider].placeholder}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button className="btn" onClick={() => setShowKey(!showKey)} type="button">
                  {showKey ? '숨기기' : '보기'}
                </button>
              </div>
              <p className={`key-status ${hasEnvKey ? 'key-status--ready' : ''}`}>
                {hasEnvKey
                  ? '.env 키가 연결되어 있습니다. 직접 입력하면 입력한 키를 대신 사용합니다.'
                  : 'API 키를 입력하거나 서버 .env에 설정하세요.'}
              </p>
            </div>
          </RetroWindow>
        </div>

        {error && (
          <div className="alert" role="alert">
            <span className="alert-icon" aria-hidden="true">!</span>
            <div>
              <strong>컴포넌트를 만들지 못했습니다.</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        <section className="results-section" aria-label="생성된 컴포넌트">
          {components.length > 0 && (
            <div className="results-header">
              <h2>
                생성된 컴포넌트 <span className="count">{components.length}</span>
              </h2>
              <button className="btn" onClick={clearAll}>
                전체 삭제
              </button>
            </div>
          )}

          {isLoading && (
            <RetroWindow title="생성 중" className="loading-window" as="div">
              <p>컴포넌트를 생성하고 있습니다...</p>
              <div className="progress" aria-hidden="true" />
            </RetroWindow>
          )}

          {components.length === 0 && !isLoading && (
            <div className="empty-state">
              <div className="folder-icon" aria-hidden="true" />
              <h2>아직 만든 컴포넌트가 없습니다</h2>
              <p>위 창에 만들고 싶은 UI를 적거나 예시를 골라 생성해 보세요.</p>
            </div>
          )}

          <div className="results-grid">
            {components.map((component) => (
              <ComponentCard
                key={component.id}
                component={component}
                onRemove={removeComponent}
                onRegenerate={handleGenerate}
                isLoading={isLoading}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
