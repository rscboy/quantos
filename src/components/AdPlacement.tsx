import React from 'react';
import { SponsorBanner } from './SponsorBanner';

type AdPlacementProps = {
  title: string;
  subtitle: string;
  className?: string;
  bannerClassName?: string;
  refreshToken?: string | number;
  compact?: boolean;
  sticky?: boolean;
};

export function AdPlacement({ title, subtitle, className = '', bannerClassName = '', refreshToken, compact = false, sticky = false }: AdPlacementProps) {
  return (
    <aside className={`${sticky ? 'lg:sticky lg:top-24' : ''} rounded-xl border border-border bg-white/95 shadow-sm ${compact ? 'p-3' : 'p-4 md:p-5'} ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-3">Sponsored</p>
          <h3 className={`font-semibold text-text ${compact ? 'text-sm' : 'text-base'}`}>{title}</h3>
        </div>
        <span className="rounded-full bg-blue-lt px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-blue">Ad</span>
      </div>
      <p className={`text-text-2 ${compact ? 'mb-3 text-xs' : 'mb-4 text-sm'}`}>{subtitle}</p>
      <SponsorBanner refreshToken={refreshToken} className={`min-h-[72px] ${bannerClassName}`} />
    </aside>
  );
}
