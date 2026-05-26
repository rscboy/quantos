import React from 'react';

export function Footer({ setView }: { setView: (view: string) => void }) {
  return (
    <footer className="bg-navy text-white pt-14 px-6 pb-8 mt-0">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] gap-14 pb-10 border-b border-white/10 mb-7">
          <div>
            <div className="flex items-center gap-3 mb-3.5">
              <img 
                src="https://i.postimg.cc/1zXG4pSx/0B1F3A.png" 
                alt="MyFedPlan" 
                className="h-10 w-auto object-contain" 
                referrerPolicy="no-referrer" 
              />
              <div className="flex flex-col justify-center items-start">
                <div className="font-serif leading-none tracking-[-0.3px]">
                  <span className="text-white text-[26px]">M</span><span className="text-white text-[22px]">y</span>
                  <span className="text-white text-[26px]">F</span><span className="text-white text-[22px]">ed</span>
                  <span className="text-[#93B4F4] text-[26px]">P</span><span className="text-[#93B4F4] text-[22px]">lan</span>
                </div>
              </div>
            </div>
            <p className="text-[13px] text-white/40 leading-[1.7]">
              The leading independent resource for Federal Retirement planning since 2004. Proprietary analysis engines based on federal retirement logic.
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
              <li><a href="/csrs" onClick={(e) => { e.preventDefault(); setView('csrs'); }} className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">CSRS Annuity</a></li>
              <li><a href="/tsp" onClick={(e) => { e.preventDefault(); setView('tsp'); }} className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">TSP Modeler</a></li>
              <li><a href="/gap" onClick={(e) => { e.preventDefault(); setView('gap'); }} className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">Retirement Gap</a></li>
              <li><a href="/full" onClick={(e) => { e.preventDefault(); setView('full'); }} className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">Full Analysis</a></li>
            </ul>
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-white/30 mb-4">Contact</div>
            <address className="not-italic">
              <ul className="list-none flex flex-col gap-2.5 m-0 p-0">
                <li><a href="mailto:support@myfedplan.com" className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">support@myfedplan.com</a></li>
                <li><a href="mailto:api@myfedplan.com" className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">api@myfedplan.com</a></li>
                <li><a href="mailto:ideas@myfedplan.com" className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">ideas@myfedplan.com</a></li>
              </ul>
            </address>
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-white/30 mb-4">Company</div>
            <ul className="list-none flex flex-col gap-2.5 m-0 p-0">
              <li><a href="https://www.linkedin.com/company/quantos" target="_blank" rel="noreferrer" className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">LinkedIn</a></li>
              <li><a href="mailto:support@myfedplan.com" className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">Customer Support</a></li>
              <li><a href="mailto:api@myfedplan.com" className="text-[13px] text-white/55 no-underline transition-colors duration-120 font-normal hover:text-white">API Partnerships</a></li>
            </ul>
          </div>

        </div>
        <div className="flex items-center justify-between text-[12px] text-white/25 flex-wrap gap-4">
          <span>© 2026 MyFedPlan by Quantos.com. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="/about" onClick={(e) => { e.preventDefault(); setView('about'); }} className="cursor-pointer text-white/25 text-[12px] transition-colors duration-120 hover:text-white/60 no-underline">About Us</a>
            <a href="/contact" onClick={(e) => { e.preventDefault(); setView('contact'); }} className="cursor-pointer text-white/25 text-[12px] transition-colors duration-120 hover:text-white/60 no-underline">Contact</a>
            <a href="/terms" onClick={(e) => { e.preventDefault(); setView('terms'); }} className="cursor-pointer text-white/25 text-[12px] transition-colors duration-120 hover:text-white/60 no-underline">Terms & Conditions</a>
            <a href="/privacy" onClick={(e) => { e.preventDefault(); setView('privacy'); }} className="cursor-pointer text-white/25 text-[12px] transition-colors duration-120 hover:text-white/60 no-underline">Privacy Policy</a>
            <a href="/cookie-policy" onClick={(e) => { e.preventDefault(); setView('cookie-policy'); }} className="cursor-pointer text-white/25 text-[12px] transition-colors duration-120 hover:text-white/60 no-underline">Cookie Policy</a>
            <a href="/disclaimer" onClick={(e) => { e.preventDefault(); setView('disclaimer'); }} className="cursor-pointer text-white/25 text-[12px] transition-colors duration-120 hover:text-white/60 no-underline">Disclaimer</a>
            <a href="/methodology" onClick={(e) => { e.preventDefault(); setView('methodology'); }} className="cursor-pointer text-white/25 text-[12px] transition-colors duration-120 hover:text-white/60 no-underline">Methodology</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
