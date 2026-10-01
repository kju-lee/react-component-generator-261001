import { useState } from 'react';
import type { GeneratedComponent } from '../types';
import { LivePreview } from './LivePreview';
import { CodeView } from './CodeView';
import { RetroWindow } from './RetroWindow';

interface ComponentCardProps {
  component: GeneratedComponent;
  onRemove: (id: string) => void;
  onRegenerate: (prompt: string) => void;
  isLoading: boolean;
}

type Tab = 'preview' | 'code';

export function ComponentCard({ component, onRemove, onRegenerate, isLoading }: ComponentCardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const [previewKey, setPreviewKey] = useState(0);
  const createdAt = component.createdAt.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <RetroWindow
      title={component.prompt}
      className="component-window"
      as="article"
      onClose={() => onRemove(component.id)}
      closeLabel="삭제"
      meta={createdAt}
    >
      <div className="card-toolbar">
        <div className="card-tabs" role="tablist" aria-label="보기 전환">
          <button
            role="tab"
            aria-selected={activeTab === 'preview'}
            className={`tab ${activeTab === 'preview' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            미리보기
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'code'}
            className={`tab ${activeTab === 'code' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            코드
          </button>
        </div>
        <div className="card-actions">
          {activeTab === 'preview' && (
            <button
              className="btn"
              onClick={() => setPreviewKey((k) => k + 1)}
              title="애니메이션을 처음부터 다시 봅니다"
            >
              다시 보기
            </button>
          )}
          <button
            className="btn"
            onClick={() => onRegenerate(component.prompt)}
            disabled={isLoading}
          >
            {isLoading ? '생성 중...' : '재생성'}
          </button>
        </div>
      </div>
      <div className="card-content">
        {activeTab === 'preview' ? (
          <LivePreview key={previewKey} code={component.code} />
        ) : (
          <CodeView code={component.code} />
        )}
      </div>
    </RetroWindow>
  );
}
