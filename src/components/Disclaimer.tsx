import React from 'react';
import { SEO } from './SEO';

export function Disclaimer() {
  return (
    <main className="max-w-[900px] mx-auto px-6 py-16">
      <SEO
        title="Disclaimer | MyFedPlan"
        description="Important legal disclaimer for MyFedPlan tools and educational content."
        canonicalPath="/disclaimer"
      />
      <h1 className="font-serif text-4xl text-navy mb-6">Disclaimer</h1>
      <p className="text-text-2 leading-7 mb-4">
        MyFedPlan provides educational tools and estimates only. Content on this website is not legal, tax, investment,
        or individualized financial advice.
      </p>
      <p className="text-text-2 leading-7 mb-4">
        Calculator outputs depend on user-provided assumptions and may not reflect all agency-specific details, policy updates,
        or personal circumstances. Always verify retirement decisions using official OPM resources and, when appropriate,
        qualified professionals.
      </p>
      <p className="text-text-2 leading-7 mb-4">
        MyFedPlan is an independent educational publisher and is not affiliated with, endorsed by, or sponsored by OPM, TSP,
        SSA, IRS, or any U.S. government agency.
      </p>
      <p className="text-text-2 leading-7">
        Use of this website indicates acceptance of our Terms of Service and Privacy Policy.
      </p>
    </main>
  );
}
