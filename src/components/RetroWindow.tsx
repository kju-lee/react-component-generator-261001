import type { ReactNode } from 'react';

interface RetroWindowProps {
  title: string;
  children: ReactNode;
  className?: string;
  /** 지정하면 타이틀바 왼쪽에 닫기 상자를 표시한다. */
  onClose?: () => void;
  closeLabel?: string;
  /** 타이틀바 오른쪽에 붙는 보조 정보 */
  meta?: ReactNode;
  as?: 'section' | 'aside' | 'article' | 'div';
}

export function RetroWindow({
  title,
  children,
  className = '',
  onClose,
  closeLabel = '닫기',
  meta,
  as: Tag = 'section',
}: RetroWindowProps) {
  return (
    <Tag className={`window ${className}`} aria-label={title}>
      <div className="titlebar">
        {onClose && (
          <button
            type="button"
            className="close-box"
            onClick={onClose}
            aria-label={closeLabel}
            title={closeLabel}
          />
        )}
        <span className="titlebar-title" title={title}>
          {title}
        </span>
        {meta && <span className="titlebar-meta">{meta}</span>}
      </div>
      <div className="window-body">{children}</div>
    </Tag>
  );
}
