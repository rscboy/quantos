import React from 'react';
import { SEO } from './SEO';

export function Methodology() {
  return (
    <main className="max-w-[900px] mx-auto px-6 py-16">
      <SEO
        title="Methodology | MyFedPlan"
        description="How MyFedPlan calculators are built, validated, and maintained for federal retirement planning education."
        canonicalPath="/methodology"
      />
      <h1 className="font-serif text-4xl text-navy mb-6">Methodology</h1>
      <p className="text-text-2 leading-7 mb-4">
        MyFedPlan calculators are educational estimation tools. We convert publicly available retirement guidance into
        reproducible calculation logic and expose key assumptions so users can review inputs before relying on estimates.
      </p>

      <h2 className="font-serif text-2xl text-navy mt-8 mb-3">Primary source references</h2>
      <ul className="list-disc pl-6 text-text-2 leading-7 space-y-2">
        <li>OPM CSRS/FERS Handbook references for annuity and service-credit rules.</li>
        <li>TSP contribution, match, and withdrawal framework guidance.</li>
        <li>Social Security Administration benefit timing and reduction framework documentation.</li>
        <li>IRS tax-year contribution limit announcements when relevant to savings estimates.</li>
      </ul>

      <h2 className="font-serif text-2xl text-navy mt-8 mb-3">Modeling approach</h2>
      <p className="text-text-2 leading-7 mb-4">
        We model retirement projections using formula-driven calculations that depend on user-provided assumptions such as
        service history, salary progression, retirement age, savings rate, and expected investment growth.
      </p>
      <p className="text-text-2 leading-7 mb-4">
        The calculators are intentionally deterministic: identical inputs produce identical outputs. This supports transparent
        scenario analysis and side-by-side comparison of retirement choices.
      </p>

      <h2 className="font-serif text-2xl text-navy mt-8 mb-3">Limitations</h2>
      <p className="text-text-2 leading-7 mb-4">
        Estimates may not reflect every agency-specific policy interpretation, personnel record nuance, or future statutory
        change. Final retirement eligibility and benefits are determined by the appropriate federal agencies, not by this site.
      </p>
      <p className="text-text-2 leading-7">
        Last reviewed: May 26, 2026.
      </p>
    </main>
  );
}
