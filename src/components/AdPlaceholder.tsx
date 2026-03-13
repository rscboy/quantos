import React from 'react';

export function AdPlaceholder({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-4 text-gray-400 text-sm font-medium ${className}`}>
      <span>Google Ad Placeholder</span>
      <span className="text-xs font-normal mt-1">Ads help keep our calculators free</span>
    </div>
  );
}
