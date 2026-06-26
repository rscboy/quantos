import React from 'react';
import { SEO } from './SEO';
import { ARTICLES } from '../content';

const SITE = 'https://www.myfedplan.us';

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function Guides({ onNavigate }: { onNavigate: (view: string) => void }) {
  const categories = Array.from(new Set(ARTICLES.map((a) => a.meta.category)));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Federal Retirement Guides',
    description:
      'In-depth, regularly reviewed guides on FERS, CSRS, TSP, military deposits, and Social Security for federal employees.',
    url: `${SITE}/guides`,
    hasPart: ARTICLES.map((a) => ({
      '@type': 'Article',
      headline: a.meta.h1,
      url: `${SITE}/guides/${a.meta.slug}`,
      datePublished: a.meta.datePublished,
      dateModified: a.meta.dateModified,
    })),
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <SEO
        title="Federal Retirement Guides | MyFedPlan"
        description="In-depth federal retirement guides covering FERS, CSRS, High-3, MRA, TSP, military deposits, survivor benefits, and Social Security — reviewed against current OPM, TSP, and SSA guidance."
        canonicalPath="/guides"
        schema={schema}
      />

      <header className="max-w-3xl">
        <h1 className="font-serif text-4xl text-navy mb-4">Federal Retirement Guides</h1>
        <p className="text-text-2 leading-8 text-[18px]">
          Plain-English explanations of the rules that decide your federal retirement income — FERS and
          CSRS pensions, the TSP, military service credit, survivor benefits, and Social Security. Each
          guide is written for federal employees and reviewed against publicly available OPM, TSP, and
          SSA guidance. This is educational content, not individualized financial advice.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <span
            key={c}
            className="text-[12px] font-medium text-text-2 bg-blue-lt/60 border border-border rounded-full px-3 py-1"
          >
            {c}
          </span>
        ))}
      </div>

      <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
        {ARTICLES.map((a) => (
          <a
            key={a.meta.slug}
            href={`/guides/${a.meta.slug}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(`guides/${a.meta.slug}`);
            }}
            className="border border-border rounded-lg p-6 bg-white block no-underline hover:bg-[#FAFBFF] hover:border-blue/40 transition-colors"
          >
            <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-blue mb-2">
              {a.meta.category}
            </div>
            <h2 className="font-serif text-xl text-navy leading-snug">{a.meta.h1}</h2>
            <p className="mt-2 text-text-2 leading-7 text-[15px]">{a.meta.description}</p>
            <div className="mt-3 text-[13px] text-text-3">
              Updated {formatDate(a.meta.dateModified)} · {a.meta.readingMinutes} min read
            </div>
          </a>
        ))}
      </section>

      <section className="mt-14 border-t border-border pt-10">
        <h2 className="font-serif text-3xl text-navy mb-4">Put these concepts into practice</h2>
        <p className="text-text-2 leading-7 mb-6 max-w-3xl">
          Each calculator applies the rules explained in these guides to your own numbers. They are free
          to use and require no account.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { view: 'fers', title: 'FERS Annuity Calculator', desc: 'High-3 × years × multiplier, with special provisions.' },
            { view: 'csrs', title: 'CSRS Annuity Calculator', desc: 'Tiered CSRS schedule, deposits, and redeposits.' },
            { view: 'eligibility', title: 'Retirement Eligibility', desc: 'Find the earliest date you can retire with an annuity.' },
            { view: 'tsp', title: 'TSP Projections', desc: 'Project Thrift Savings Plan growth with agency matching.' },
            { view: 'military', title: 'Military Deposit', desc: 'Estimate the buy-back cost to credit active-duty time.' },
            { view: 'gap', title: 'Retirement Savings Gap', desc: 'Compare projected income against expected expenses.' },
          ].map((g) => (
            <a
              key={g.view}
              href={`/${g.view}`}
              onClick={(e) => { e.preventDefault(); onNavigate(g.view); }}
              className="border border-border rounded-lg p-5 bg-white block no-underline hover:bg-[#FAFBFF] transition-colors"
            >
              <h3 className="font-serif text-lg text-navy">{g.title}</h3>
              <p className="mt-2 text-text-2 leading-7 text-[14px]">{g.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
