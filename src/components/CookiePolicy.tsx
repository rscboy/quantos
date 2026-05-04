import React from 'react';
import { SEO } from './SEO';

export function CookiePolicy() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <SEO title="Cookie Policy | MyFedPlan" description="How MyFedPlan uses cookies, consent controls, analytics, and AdSense-related technologies." canonicalPath="/cookie-policy" />
      <h1 className="font-serif text-4xl text-navy mb-4">Cookie Policy</h1>
      <p className="text-sm text-text-3 mb-6">Last updated: May 4, 2026</p>
      <section className="space-y-4 text-text-2 leading-7">
        <p>We use essential cookies to operate core site functions and optional cookies for analytics and advertising. This includes Google AdSense and Google Analytics technologies where enabled by your consent choices.</p>
        <h2 className="font-serif text-2xl text-navy">Consent choices</h2>
        <p>You can choose Accept, Decline, or Preferences in our cookie banner. Non-essential cookies are blocked until you grant consent. You can change your preferences later.</p>
        <h2 className="font-serif text-2xl text-navy">Types of cookies</h2>
        <ul className="list-disc pl-6"><li>Essential: required for navigation and security.</li><li>Analytics: helps us understand page performance and usage trends.</li><li>Advertising: used by Google AdSense to serve and measure ads, including personalized ad controls where applicable.</li></ul>
        <h2 className="font-serif text-2xl text-navy">GDPR/EEA language</h2>
        <p>If you are in the EEA/UK, consent is requested before non-essential processing. You may withdraw consent any time. We honor applicable rights requests such as access, correction, deletion, and objection where required by law.</p>
      </section>
    </main>
  );
}
