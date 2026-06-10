import React from 'react';
import { SEO } from './SEO';

const author = 'the MyFedPlan editorial team';
const updated = 'May 4, 2026';

function Byline() {
  return <p className="text-sm text-text-3">Reviewed by {author} · Last updated {updated}</p>;
}

export function Guides() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <SEO title="Federal Retirement Guides | MyFedPlan" description="In-depth federal retirement guides covering FERS, CSRS, High-3, MRA, and retirement timing." canonicalPath="/guides" />
      <h1 className="font-serif text-4xl text-navy mb-4">Federal Retirement Calculator: FERS & CSRS Benefits Explained</h1>
      <Byline />
      <section className="mt-6 space-y-4 text-text-2 leading-7">
        <p>This guide explains how to estimate federal retirement income with practical, conservative assumptions. It is educational content only and is not individualized financial advice.</p>
        <h2 className="text-2xl font-serif text-navy">What is FERS vs CSRS</h2><p>FERS combines a pension, TSP, and Social Security. CSRS generally provides a larger standalone pension but no Social Security from federal service. Many employees also have mixed-service histories where both systems matter.</p>
        <h2 className="text-2xl font-serif text-navy">How retirement is calculated</h2><p>FERS basic annuity is usually high-3 average salary × years of creditable service × multiplier (typically 1.0% or 1.1% when rules are met). CSRS uses a tiered percentage schedule applied to high-3 and years of service.</p>
        <h2 className="text-2xl font-serif text-navy">High-3 salary explanation</h2><p>High-3 is the highest average basic pay earned during any consecutive 36-month period. It is not necessarily your final 3 calendar years. Overtime, bonuses, and most one-time payments usually do not count as basic pay.</p>
        <h2 className="text-2xl font-serif text-navy">Years of service impact</h2><p>Every month of creditable service can change your annuity. Unused sick leave can increase the pension calculation (subject to current rules), while breaks in service and deposit decisions can reduce or restore credit.</p>
        <h2 className="text-2xl font-serif text-navy">Early vs full retirement</h2><p>Retiring before full eligibility can trigger permanent reductions. FERS MRA+10 can reduce annuity unless postponed. Early-outs (VERA) have separate rules. Always model at least three retirement dates before deciding.</p>
        <h2 className="text-2xl font-serif text-navy">Example calculations</h2><p>Example: FERS employee with high-3 of $120,000 and 30 years: 120,000 × 30 × 1.0% = $36,000 annual pension before survivor and insurance elections. If eligible for 1.1%, pension becomes $39,600.</p>
        <h2 className="text-2xl font-serif text-navy">Common mistakes</h2><ul className="list-disc pl-6"><li>Using gross pay instead of high-3 basic pay.</li><li>Ignoring survivor election cost.</li><li>Forgetting FEHB/FEGLI continuation criteria.</li><li>Not coordinating TSP withdrawals with pension start date.</li><li>Assuming Social Security starts automatically at retirement.</li></ul>
        <h2 className="text-2xl font-serif text-navy">FAQ</h2><ol className="list-decimal pl-6 space-y-2"><li>Can I retire at MRA with 10 years? Yes, with possible reduction.</li><li>Does locality pay count in high-3? Generally yes as part of basic pay.</li><li>Do overtime hours count? Usually no.</li><li>Can sick leave make me eligible sooner? Usually no for eligibility, yes for computation credit.</li><li>Is CSRS always better than FERS? Not always; depends on service length and TSP/Social Security outcomes.</li><li>Should I delay retirement for 1.1% multiplier? Often worth modeling.</li><li>Does military service count? It may with deposit rules.</li><li>Can I work after retiring? Yes, but reemployment rules can affect pay/benefits.</li><li>Is this site a government website? No.</li></ol>
        <p className="font-semibold">This site is not affiliated with the U.S. government.</p>
        <p>Authoritative references: <a className="text-blue" href="https://www.opm.gov/retirement-services/fers-information/" target="_blank" rel="noreferrer">OPM FERS info</a>, <a className="text-blue" href="https://www.opm.gov/retirement-services/csrs-information/" target="_blank" rel="noreferrer">OPM CSRS info</a>, <a className="text-blue" href="https://www.ssa.gov/" target="_blank" rel="noreferrer">SSA.gov</a>.</p>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-3xl text-navy mb-4">Put these concepts into practice</h2>
        <p className="text-text-2 leading-7 mb-6">Each calculator below applies the rules explained in this guide to your own numbers. They are free to use and require no account.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { href: '/fers', title: 'FERS Annuity Calculator', desc: 'Apply the High-3 × years × multiplier formula to your service history.' },
            { href: '/csrs', title: 'CSRS Annuity Calculator', desc: 'Model the tiered CSRS percentage schedule, deposits, and redeposits.' },
            { href: '/eligibility', title: 'Retirement Eligibility', desc: 'Find the earliest date you can retire with an immediate annuity.' },
            { href: '/tsp', title: 'TSP Projections', desc: 'Project Thrift Savings Plan growth with agency matching.' },
            { href: '/military', title: 'Military Deposit', desc: 'Estimate the buy-back cost to credit active-duty time.' },
            { href: '/gap', title: 'Retirement Savings Gap', desc: 'Compare projected income against expected retirement expenses.' },
          ].map((g) => (
            <a key={g.href} href={g.href} className="border border-border rounded-lg p-5 bg-white block no-underline hover:bg-[#FAFBFF] transition-colors">
              <h3 className="font-serif text-xl text-navy">{g.title}</h3>
              <p className="mt-2 text-text-2 leading-7 text-[14px]">{g.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
