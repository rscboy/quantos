import React from 'react';

export function Footer({ setView }: { setView: (view: string) => void }) {
  return (
    <footer className="bg-navy text-white pt-14 px-6 pb-8 mt-0">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-14 pb-10 border-b border-white/10 mb-7">
          <div>
            <div className="flex items-center gap-3 mb-3.5">
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
            </div>
            <p className="text-[13px] text-white/40 leading-[1.7]">
              The leading independent resource for Federal Retirement planning since 2004. Proprietary analysis engines optimized for OPM data integrity. A product of Quantos Software LLC.
            </p>
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-white/30 mb-4">Calculators</div>
            <ul className="list-none flex flex-col gap-2.5 m-0 p-0">
              <li>
                <a
                  href="#"
                  className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white"
                  onClick={(e) => { e.preventDefault(); setView('fers'); }}
                >
                  FERS Annuity
                </a>
              </li>
              <li><a href="#" className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">CSRS Annuity</a></li>
              <li><a href="#" className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">TSP Modeler</a></li>
              <li><a href="#" className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">Retirement Gap</a></li>
              <li><a href="#" className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">Full Analysis</a></li>
            </ul>
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-white/30 mb-4">Resources</div>
            <ul className="list-none flex flex-col gap-2.5 m-0 p-0">
              <li><a href="#" className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">Pay Scales</a></li>
              <li><a href="#" className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">Sick Leave Chart</a></li>
              <li><a href="#" className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">FEGLI Rates</a></li>
              <li><a href="#" className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">Methodology</a></li>
              <li><a href={`${import.meta.env.BASE_URL}openapi.yaml`} className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">API Spec</a></li>
            </ul>
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-white/30 mb-4">Contact</div>
            <ul className="list-none flex flex-col gap-2.5 m-0 p-0">
              <li><a href="mailto:support@quantos.com" className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">support@quantos.com</a></li>
              <li><a href="mailto:api@fedcalc.com" className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">api@fedcalc.com</a></li>
              <li><a href="mailto:ideas@quantos.com" className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">Submit an idea</a></li>
            </ul>
          </div>
        </div>
        <div className="flex items-center justify-between text-[12px] text-white/25 flex-wrap gap-4">
          <span>© 2026 Quantos Software LLC. All rights reserved.</span>
          <div className="flex gap-6">
            <a href={`${import.meta.env.BASE_URL}termsandconditions.htm`} className="text-white/25 text-[12px] transition-colors duration-120 hover:text-white/60">Terms of Use</a>
            <a href={`${import.meta.env.BASE_URL}privacystatement.htm`} className="text-white/25 text-[12px] transition-colors duration-120 hover:text-white/60">Privacy Statement</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
