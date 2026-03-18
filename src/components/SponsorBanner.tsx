import React, { useEffect, useId, useRef } from 'react';

declare global {
  interface Window {
    google_ad_client?: string;
    google_ad_slot?: string;
    google_ad_width?: number;
    google_ad_height?: number;
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

const LEGACY_AD_CLIENT = 'pub-1611174753858237';
const LEGACY_AD_SLOT = '9205751896';
const AD_WIDTH = 300;
const AD_HEIGHT = 250;
const LEGACY_AD_SCRIPT_SRC = 'https://pagead2.googlesyndication.com/pagead/show_ads.js';

export function SponsorBanner({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceId = useId();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    window.google_ad_client = LEGACY_AD_CLIENT;
    window.google_ad_slot = LEGACY_AD_SLOT;
    window.google_ad_width = AD_WIDTH;
    window.google_ad_height = AD_HEIGHT;

    const script = document.createElement('script');
    script.src = LEGACY_AD_SCRIPT_SRC;
    script.async = true;
    script.dataset.adInstance = instanceId;
    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [instanceId]);

  return (
    <div
      className={`bg-white border border-border rounded-lg flex items-center justify-center p-4 overflow-hidden ${className}`}
    >
      <div
        ref={containerRef}
        aria-label="Advertisement"
        className="flex min-h-[250px] w-full items-center justify-center"
      />
    </div>
  );
}
