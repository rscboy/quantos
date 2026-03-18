import React from 'react';

type AdPlacementProps = {
  label: string;
  title: string;
  description: string;
  className?: string;
  accent?: 'blue' | 'green' | 'amber';
  sticky?: boolean;
  compact?: boolean;
  refreshToken?: number;
};

const ACCENT_STYLES: Record<NonNullable<AdPlacementProps['accent']>, string> = {
  blue: 'border-blue/20 bg-blue-50/70 text-blue',
  green: 'border-green-200 bg-green-50 text-green-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
};

export function AdPlacement({
  label,
  title,
  description,
  className = '',
  accent = 'blue',
  sticky = false,
  compact = false,
  refreshToken,
}: AdPlacementProps) {
  return (
    <div
      className={[
        'overflow-hidden rounded-xl border border-dashed border-border bg-white shadow-sm',
        sticky ? 'lg:sticky lg:top-24' : '',
        className,
      ].join(' ')}
      aria-label={`${label} advertisement placeholder`}
      data-refresh-token={refreshToken ?? 0}
    >
      <div className={`flex items-center justify-between gap-3 border-b border-border px-4 py-3 ${ACCENT_STYLES[accent]}`}>
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">{label}</span>
        <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-text-3">
          Ad Holder {refreshToken !== undefined ? `• ${refreshToken}` : ''}
        </span>
      </div>
      <div className={`space-y-2 px-4 py-4 ${compact ? 'min-h-[88px]' : 'min-h-[132px]'}`}>
        <h3 className={`font-semibold text-text ${compact ? 'text-sm' : 'text-base'}`}>{title}</h3>
        <p className={`leading-6 text-text-2 ${compact ? 'text-xs' : 'text-sm'}`}>{description}</p>
      </div>
    </div>
  );
}
