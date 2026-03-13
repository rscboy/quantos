import React from 'react';

export function Nav({ setView }: { setView: (view: string) => void }) {
  return (
    <>
      <nav className="bg-navy text-white sticky top-0 z-50 border-b-[3px] border-blue">
        <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <a
            className="flex items-center gap-3 cursor-pointer no-underline"
            onClick={() => setView('home')}
          >
            <img 
              src="https://raw.githubusercontent.com/rscboy/quantos/refs/heads/main/logo2.png" 
              alt="FedCalc by Quantos" 
              className="h-10 w-auto object-contain" 
              referrerPolicy="no-referrer" 
            />
            <div className="flex flex-col justify-center items-start">
              <div className="font-serif leading-none tracking-[-0.3px]">
                <span className="text-white text-[26px]">F</span><span className="text-white text-[22px]">ed</span>
                <span className="text-[#93B4F4] text-[26px]">C</span><span className="text-[#93B4F4] text-[22px]">alc</span>
              </div>
              <span className="text-[10px] font-sans font-medium text-white/50 tracking-[0.2em] uppercase mt-1">by Quantos</span>
            </div>
          </a>
          <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
            <li>
              <a
                href="#"
                className="text-white/65 text-[14px] font-medium no-underline transition-colors duration-150 hover:text-white hover:no-underline active:text-white"
                onClick={(e) => { e.preventDefault(); setView('home'); }}
              >
                Calculators
              </a>
            </li>
            <li>
              <a href="#" className="text-white/65 text-[14px] font-medium no-underline transition-colors duration-150 hover:text-white hover:no-underline">
                Retirement Guides
              </a>
            </li>
            <li>
              <a href="#" className="text-white/65 text-[14px] font-medium no-underline transition-colors duration-150 hover:text-white hover:no-underline">
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
            OPM Tables current · 2025 · Phased Retirement supported
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
