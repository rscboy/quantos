import React from 'react';

export function SponsorBanner({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-4 text-gray-400 text-sm font-medium ${className}`}>
      <span>Sponsor Placeholder</span>
      <span className="text-xs font-normal mt-1">Sponsors help keep our calculators free</span>
    </div>
  );
}
