import React, { useEffect, useState } from 'react';

const COOKIE_KEY = 'myfedplan_cookie_consent_v1';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleChoice = (choice: 'accepted' | 'declined') => {
    localStorage.setItem(COOKIE_KEY, choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] md:left-auto md:max-w-xl rounded-xl border border-white/20 bg-navy text-white shadow-2xl p-4">
      <p className="text-sm leading-6 text-white/80">
        We use cookies and local storage to remember calculator preferences and improve site performance. You can accept or decline non-essential cookies.
      </p>
      <div className="mt-3 flex gap-2 justify-end">
        <button className="px-3 py-2 text-sm rounded-md border border-white/30 text-white/80" onClick={() => handleChoice('declined')}>
          Decline
        </button>
        <button className="px-3 py-2 text-sm rounded-md bg-blue text-white" onClick={() => handleChoice('accepted')}>
          Accept cookies
        </button>
      </div>
    </div>
  );
}
