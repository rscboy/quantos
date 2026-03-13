import React from 'react';
import { SponsorBanner } from './SponsorBanner';

const CALCULATORS = [
  {
    category: "Primary Pension Systems",
    items: [
      { id: 'fers', name: "FERS Annuity Calculator", desc: "Includes MRA+10, early retirement, FERS transfer, deposits, redeposits, part-time service, and special rules for law enforcement, firefighters, and air traffic controllers.", tag: "Advanced" },
      { id: 'csrs', name: "CSRS Annuity Calculator", desc: "Includes early retirement, deposits, redeposits, life insurance, sick-leave adjustments, and special rules for law enforcement, firefighters, and air traffic controllers.", tag: "Advanced" },
      { id: 'eligibility', name: "How Soon Can I Retire?", desc: "Find out the soonest possible date you can retire from Federal service and still receive a retirement annuity.", tag: "Standard" },
    ]
  },
  {
    category: "Savings & Investment",
    items: [
      { id: 'tsp', name: "Thrift Savings Plan Calculator", desc: "Calculate how much your TSP deposits and future savings will be worth in 5, 10, or 20 years. Includes allocation formulas for Lifecycle (L) Funds.", tag: "Advanced" },
      { id: 'gap', name: "Retirement Savings Gap Calculator", desc: "Are you saving enough for retirement? Run this calculator and find out if you're on track to meet your goals.", tag: "Standard" },
      { id: 'full', name: "Full Retirement Analysis", desc: "The complete suite — all calculators with future time projections. Save your data locally or upload a saved scenario to pick up where you left off.", tag: "Comprehensive" },
    ]
  },
  {
    category: "Specialized Credits & Estimates",
    items: [
      { id: 'military', name: "Military Deposit Calculator", desc: "Your military service can increase your retirement annuity. Calculate how much you need to repay to receive that service credit.", tag: "Standard" },
      { id: 'ss', name: "Social Security Estimator", desc: "Find out how much your monthly Social Security benefit will be at retirement. Works best when run inside the Full Retirement Analysis.", tag: "Advanced" },
    ]
  }
];

export function Home({ onSelectCalc }: { onSelectCalc: (id: string) => void }) {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="bg-navy text-white pt-[72px] px-6 pb-20 border-b border-white/5">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_380px] gap-16 items-start">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue/20 border border-blue/40 text-[#93B4F4] text-[11px] font-semibold tracking-[0.08em] uppercase py-1.5 px-3 rounded-[3px] mb-5">
              New — Phased Retirement Estimates
            </div>
            <h1 className="font-serif text-[clamp(30px,4vw,46px)] leading-[1.15] text-white mb-5 font-normal">
              Federal Retirement<br /><em className="italic text-[#93B4F4]">Simplified.</em>
            </h1>
            <p className="text-base text-white/60 max-w-[520px] leading-[1.7] mb-8">
              Calculate your FERS, CSRS, and TSP estimates. Run exact High-3 calculations, Military Deposit, Social Security, and more — all in one place.
            </p>
            <div className="flex gap-10 pt-8 border-t border-white/10">
              <div>
                <span className="font-mono text-[28px] font-medium text-white block">2025</span>
                <span className="text-[11px] text-white/40 uppercase tracking-[0.06em] font-medium block mt-0.5">Tables Ready</span>
              </div>
              <div>
                <span className="font-mono text-[28px] font-medium text-white block">99.9%</span>
                <span className="text-[11px] text-white/40 uppercase tracking-[0.06em] font-medium block mt-0.5">Model Fidelity</span>
              </div>
              <div>
                <span className="font-mono text-[28px] font-medium text-white block">20+</span>
                <span className="text-[11px] text-white/40 uppercase tracking-[0.06em] font-medium block mt-0.5">Years Active</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block bg-white/5 border border-white/10 rounded-lg p-7">
            <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-white/30 mb-3.5 flex items-center gap-1.5 before:content-[''] before:inline-block before:w-5 before:h-0.5 before:bg-blue">
              Developer
            </div>
            <h3 className="font-serif text-xl text-white mb-2.5 font-normal">API Access Now Available</h3>
            <p className="text-[13px] text-white/50 leading-[1.6] mb-5">
              Fast retirement estimates for large groups of employees. Integrate FedCalc directly into your HR or benefits platform.
            </p>
            <a href="mailto:api@fedcalc.com" className="text-[#93B4F4] text-[13px] font-medium no-underline hover:underline">api@fedcalc.com →</a>
            <div className="mt-5 pt-4 border-t border-white/10 text-xs text-white/35">
              Technical spec: <a href={`${import.meta.env.BASE_URL}openapi.yaml`} className="text-white/50 no-underline hover:underline">OpenAPI specification ↗</a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-y border-border p-6 m-0">
        <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-3 text-[13px] text-text-2">
            <div className="w-8 h-8 bg-bg border border-border rounded-md flex items-center justify-center text-sm shrink-0">🔒</div>
            <span>quantoSecure Protocol — no data stored</span>
          </div>
          <div className="hidden md:block w-px h-7 bg-border"></div>
          <div className="flex items-center gap-3 text-[13px] text-text-2">
            <div className="w-8 h-8 bg-bg border border-border rounded-md flex items-center justify-center text-sm shrink-0">📋</div>
            <span>Audited against OPM Chapter 50 regulations</span>
          </div>
          <div className="hidden md:block w-px h-7 bg-border"></div>
          <div className="flex items-center gap-3 text-[13px] text-text-2">
            <div className="w-8 h-8 bg-bg border border-border rounded-md flex items-center justify-center text-sm shrink-0">✓</div>
            <span>Independent resource since 2004</span>
          </div>
          <div className="hidden md:block w-px h-7 bg-border"></div>
          <div className="text-[13px] text-[#4A4A4A]">
            Questions? <a href="mailto:support@quantos.com" className="ml-1 text-blue no-underline hover:underline">support@quantos.com</a>
          </div>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto pt-14 px-6 pb-20">
        <div className="mb-12">
          <SponsorBanner className="h-[60px] w-full max-w-3xl mx-auto" />
        </div>

        {CALCULATORS.map((section, idx) => {
          const count = section.items.length;
          return (
            <React.Fragment key={idx}>
              <div className="mb-14">
                <div className="flex items-center gap-4 mb-7">
                <span className="font-serif text-[13px] font-normal text-text-2 tracking-[0.02em]">{section.category}</span>
                <div className="flex-1 h-px bg-border"></div>
                <span className="font-mono text-[11px] text-text-3">{count} tool{count !== 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5 bg-border border border-border rounded-lg overflow-hidden">
                {section.items.map((item) => {
                  const tagClass = item.tag === 'Advanced' ? 'text-blue' : item.tag === 'Comprehensive' ? 'text-green' : 'text-text-3';
                  const target = item.id === 'fers' ? 'fers' : 'home';
                  return (
                    <div
                      key={item.id}
                      className="bg-white p-7 pb-6 cursor-pointer transition-colors duration-150 flex flex-col relative group hover:bg-[#FAFBFF]"
                      onClick={() => onSelectCalc(target)}
                    >
                      <div className={`text-[10px] font-semibold tracking-[0.08em] uppercase mb-3.5 ${tagClass}`}>
                        {item.tag}
                      </div>
                      <h3 className="font-serif text-lg font-normal text-text leading-[1.25] mb-2.5">
                        {item.name}
                      </h3>
                      <p className="text-[13px] text-text-2 leading-[1.65] flex-1">
                        {item.desc}
                      </p>
                      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue tracking-[0.02em]">Open calculator</span>
                        <span className="opacity-0 -translate-x-1 transition-all duration-150 text-blue text-base leading-none group-hover:opacity-100 group-hover:translate-x-0">→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {idx === 0 && (
              <div className="mb-14">
                <SponsorBanner className="h-[60px] w-full max-w-4xl mx-auto" />
              </div>
            )}
            {idx === 2 && (
              <div className="mb-14">
                <SponsorBanner className="h-[60px] w-full max-w-4xl mx-auto" />
              </div>
            )}
            </React.Fragment>
          );
        })}
      </main>
    </div>
  );
}
