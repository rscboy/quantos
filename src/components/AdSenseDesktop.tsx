import React, { useEffect } from 'react';

export function AdSenseDesktop() {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="hidden md:flex justify-center">
      <ins
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '300px', height: '250px' }}
        data-ad-client="ca-pub-1611174753858237"
        data-ad-slot="9205751896"
      ></ins>
    </div>
  );
}
