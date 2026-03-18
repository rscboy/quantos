import React, { useEffect, useId, useRef, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

const ADSENSE_CLIENT = 'ca-pub-1611174753858237';
const ADSENSE_SLOT = '9205751896';
const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

let adsenseScriptPromise: Promise<void> | null = null;

function ensureAdsenseScript() {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (adsenseScriptPromise) {
    return adsenseScriptPromise;
  }

  const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${ADSENSE_SCRIPT_SRC}"]`);
  if (existingScript) {
    adsenseScriptPromise = Promise.resolve();
    return adsenseScriptPromise;
  }

  adsenseScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = ADSENSE_SCRIPT_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load the Google AdSense script.'));
    document.head.appendChild(script);
  });

  return adsenseScriptPromise;
}

export function SponsorBanner({ className = '' }: { className?: string }) {
  const adRef = useRef<HTMLElement | null>(null);
  const instanceId = useId();
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const initializeAd = async () => {
      const adElement = adRef.current;
      if (!adElement || adElement.dataset.adInitialized === 'true') {
        return;
      }

      try {
        await ensureAdsenseScript();
        if (isCancelled) {
          return;
        }

        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adElement.dataset.adInitialized = 'true';
        setLoadError(false);
      } catch (error) {
        if (!isCancelled) {
          console.error(`AdSense failed to initialize for banner ${instanceId}.`, error);
          setLoadError(true);
        }
      }
    };

    void initializeAd();

    return () => {
      isCancelled = true;
    };
  }, [instanceId]);

  return (
    <div
      className={`bg-white border border-border rounded-lg overflow-hidden ${className}`}
    >
      <div className="flex min-h-[56px] w-full items-center justify-center px-3 py-2">
        <ins
          ref={adRef}
          className="adsbygoogle block min-h-[40px] w-full"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-format="auto"
          data-ad-slot={ADSENSE_SLOT}
          data-full-width-responsive="true"
          aria-label="Advertisement"
        />
        {loadError && (
          <p className="text-center text-xs text-text-3">
            Ad space is temporarily unavailable.
          </p>
        )}
      </div>
    </div>
  );
}
