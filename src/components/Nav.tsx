import React from 'react';

export function Nav({ setView }: { setView: (view: string) => void }) {
  return (
    <>
      <nav className="bg-navy text-white sticky top-0 z-50 border-b-[3px] border-blue">
        <div className="max-w-[1200px] mx-auto px-6 h-[60px] flex items-center justify-between">
          <a
            className="flex items-baseline gap-2.5 cursor-pointer no-underline"
            onClick={() => setView('home')}
          >
            <span className="font-serif text-[22px] text-white tracking-[-0.3px]">FedCalc</span>
            <span className="text-[11px] font-medium text-white/45 tracking-[0.08em] uppercase">by Quantos</span>
          </a>
          <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
            <li>
              <a
                href="#"
                className="text-white/65 text-[13px] font-medium no-underline transition-colors duration-150 hover:text-white hover:no-underline active:text-white"
                onClick={(e) => { e.preventDefault(); setView('home'); }}
              >
                Calculators
              </a>
            </li>
            <li>
              <a href="#" className="text-white/65 text-[13px] font-medium no-underline transition-colors duration-150 hover:text-white hover:no-underline">
                Retirement Guides
              </a>
            </li>
            <li>
              <a href="#" className="text-white/65 text-[13px] font-medium no-underline transition-colors duration-150 hover:text-white hover:no-underline">
                Pay Scales
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <div className="bg-navy-2 border-b border-white/5 py-2 px-6">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/50 tracking-[0.04em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shrink-0"></span>
            OPM Tables current · 2024 · Phased Retirement supported
          </div>
          <div className="flex items-center gap-5 text-[11px] text-white/40">
            <span>Audited monthly against OPM Chapter 50</span>
            <span>|</span>
            <a href="mailto:?subject=FedCalc&body=https://www.fedcalc.com" className="text-white/40 text-[11px] transition-colors duration-150 hover:text-white/80 hover:no-underline">
              Share site
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
