import React, { useEffect, useState } from 'react';

type AdPlaceholderProps = {
  className?: string;
  stickyDesktop?: boolean;
  hideBelow?: 'md' | 'lg' | 'xl';
  hideAbove?: 'md' | 'lg' | 'xl';
  // Keep these for compatibility if they are still passed anywhere
  label?: string;
  slot?: string;
  detail?: string;
  refreshKey?: number;
  compact?: boolean;
};

export function AdPlaceholder({
  className = '',
  stickyDesktop = false,
  hideBelow,
  hideAbove,
}: AdPlaceholderProps) {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    // Initial check in case it changed between initial render and mount
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktop = windowWidth >= 1280; // xl breakpoint

  let shouldHide = false;
  if (hideBelow === 'md' && windowWidth < 768) shouldHide = true;
  if (hideBelow === 'lg' && windowWidth < 1024) shouldHide = true;
  if (hideBelow === 'xl' && windowWidth < 1280) shouldHide = true;

  if (hideAbove === 'md' && windowWidth >= 768) shouldHide = true;
  if (hideAbove === 'lg' && windowWidth >= 1024) shouldHide = true;
  if (hideAbove === 'xl' && windowWidth >= 1280) shouldHide = true;

  useEffect(() => {
    if (shouldHide) return;
    
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e: any) {
      if (e.message && e.message.includes('already have ads in them')) {
        // This is expected in React StrictMode or when navigating back and forth quickly
        return;
      }
      console.error('AdSense error:', e);
    }
  }, [isDesktop, shouldHide]);

  if (shouldHide) {
    return null;
  }

  return (
    <aside
      className={[
        'overflow-hidden',
        stickyDesktop ? 'md:sticky md:top-24' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {isDesktop ? (
        <div key="desktop-ad" className="flex justify-center w-full min-h-[250px]">
          <ins className="adsbygoogle"
               style={{ display: 'inline-block', width: '300px', height: '250px' }}
               data-ad-client="ca-pub-1611174753858237"
               data-ad-slot="9205751896"></ins>
        </div>
      ) : (
        <div key="mobile-ad" className="w-full">
          <ins className="adsbygoogle"
               style={{ display: 'block' }}
               data-ad-client="ca-pub-1611174753858237"
               data-ad-slot="9049674196"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
        </div>
      )}
    </aside>
  );
}