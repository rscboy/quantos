import React from 'react';

type AdPlaceholderProps = {
  className?: string;
  label?: string;
  slot?: string;
  detail?: string;
  stickyDesktop?: boolean;
  refreshKey?: number;
  compact?: boolean;
};

export function AdPlaceholder({
  className = '',
  label = 'Advertisement',
  slot,
  detail,
  stickyDesktop = false,
  refreshKey = 1,
  compact = false,
}: AdPlaceholderProps) {
  return (
    <aside
      className={[
        'overflow-hidden rounded-xl border border-dashed border-border bg-gradient-to-br from-bg to-white',
        stickyDesktop ? 'md:sticky md:top-24' : '',
        className,
      ].filter(Boolean).join(' ')}
      aria-label={slot ? `${label} placeholder for ${slot}` : `${label} placeholder`}
    >
      <div className={`flex h-full w-full flex-col justify-between ${compact ? 'min-h-[72px] px-4 py-3' : 'min-h-[140px] px-5 py-4'}`}>
        <div className="flex items-center justify-between gap-3 border-b border-border/80 pb-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-3">
            {label}
          </span>
          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-text-3 shadow-sm">
            Refresh {refreshKey}
          </span>
        </div>
        <div className="space-y-2 pt-3">
          <div className="text-sm font-semibold text-text">{slot || 'Open ad inventory slot'}</div>
          {detail && <p className="text-xs leading-5 text-text-2">{detail}</p>}
        </div>
      </div>
    </aside>
  );
}
