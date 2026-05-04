import React, { useEffect, useState } from 'react';

const COOKIE_KEY = 'myfedplan_cookie_consent_v2';

type Choice = 'accepted' | 'declined' | 'preferences';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const handleChoice = (choice: Choice) => {
    localStorage.setItem(COOKIE_KEY, choice);
    localStorage.setItem('myfedplan_non_essential_cookies', choice === 'accepted' ? 'enabled' : 'disabled');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] md:left-auto md:max-w-xl rounded-xl border border-white/20 bg-navy text-white shadow-2xl p-4">
      <p className="text-sm leading-6 text-white/80">We use essential cookies for core functionality and optional cookies for analytics and Google AdSense advertising. Non-essential cookies are blocked until you opt in.</p>
      <div className="mt-3 flex gap-2 justify-end flex-wrap">
        <button className="px-3 py-2 text-sm rounded-md border border-white/30 text-white/80" onClick={() => handleChoice('declined')}>Decline</button>
        <button className="px-3 py-2 text-sm rounded-md border border-white/30 text-white/80" onClick={() => handleChoice('preferences')}>Preferences</button>
        <button className="px-3 py-2 text-sm rounded-md bg-blue text-white" onClick={() => handleChoice('accepted')}>Accept</button>
      </div>
    </div>
  );
}
