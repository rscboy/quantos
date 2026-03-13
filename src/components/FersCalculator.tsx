import React, { useState, useEffect } from 'react';
import { AdPlaceholder } from './AdPlaceholder';

export function FersCalculator({ onBack }: { onBack: () => void }) {
  const [salary, setSalary] = useState<number>(115000);
  const [years, setYears] = useState<number>(20);
  const [age, setAge] = useState<number>(62);
  const [survivor, setSurvivor] = useState<string>('0');

  const [results, setResults] = useState({
    monthly: 0,
    annual: 0,
    factor: 0,
    replacement: 0,
  });

  useEffect(() => {
    const factor = (age >= 62 && years >= 20) ? 0.011 : 0.01;
    const annual = salary * years * factor;
    const monthly = annual / 12;
    const cut = survivor === '50' ? monthly * 0.1 : survivor === '25' ? monthly * 0.05 : 0;
    const net = monthly - cut;
    const pct = salary > 0 ? (annual / salary) * 100 : 0;

    setResults({
      monthly: net,
      annual: annual,
      factor: factor,
      replacement: pct,
    });
  }, [salary, years, age, survivor]);

  const fmt = (n: number, dec = 2) => '$' + n.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const fmtK = (n: number) => '$' + Math.round(n).toLocaleString();

  return (
    <div className="animate-in fade-in duration-300">
      <main className="max-w-[1200px] mx-auto px-6 pb-20">
        <div className="pt-12 pb-9 border-b border-border mb-12">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-2 mb-6 cursor-pointer bg-none border-none p-0 font-sans transition-colors duration-120 hover:text-blue"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
              <path d="M10 3L5 8l5 5" />
            </svg>
            All Calculators
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-blue-lt text-blue text-[11px] font-semibold tracking-[0.06em] uppercase py-1 px-2.5 rounded-[3px] mb-3.5">
                Advanced Module
              </div>
              <h1 className="font-serif text-4xl font-normal text-text mb-2.5">FERS Annuity Calculator</h1>
              <p className="text-sm text-text-2 max-w-[600px] leading-[1.65]">
                Includes MRA+10, early retirement, FERS transfer, deposits, redeposits, part-time service, and special rules for law enforcement, firefighters, and air traffic controllers.
              </p>
            </div>
            <AdPlaceholder className="w-full md:w-[300px] h-[60px] shrink-0" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 items-start">
          {/* INPUT PANEL */}
          <div>
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <div className="py-4 px-6 bg-navy text-white text-[11px] font-semibold tracking-[0.1em] uppercase flex items-center gap-2 before:content-[''] before:block before:w-[3px] before:h-3.5 before:bg-blue before:rounded-sm">
                Input Parameters
              </div>
              <div className="py-7 px-6 space-y-5.5">
                <div className="mb-5.5 last:mb-0">
                  <label className="block text-xs font-semibold text-text-2 mb-1.5 tracking-[0.01em]">High-3 Average Salary</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-text-3 pointer-events-none">$</span>
                    <input
                      type="number"
                      value={salary}
                      onChange={(e) => setSalary(Number(e.target.value))}
                      className="w-full py-2.5 pr-3 pl-7 border border-border rounded-[5px] font-mono text-[15px] font-medium text-text bg-bg outline-none transition-all duration-120 focus:border-blue focus:shadow-[0_0_0_3px_rgba(26,92,219,0.08)] focus:bg-white appearance-none"
                    />
                  </div>
                </div>

                <div className="mb-5.5 last:mb-0">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-text-2 mb-1.5 tracking-[0.01em]">Years of Service</label>
                      <input
                        type="number"
                        value={years}
                        onChange={(e) => setYears(Number(e.target.value))}
                        className="w-full py-2.5 px-3 border border-border rounded-[5px] font-mono text-[15px] font-medium text-text bg-bg outline-none transition-all duration-120 focus:border-blue focus:shadow-[0_0_0_3px_rgba(26,92,219,0.08)] focus:bg-white appearance-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-2 mb-1.5 tracking-[0.01em]">Retirement Age</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-full py-2.5 px-3 border border-border rounded-[5px] font-mono text-[15px] font-medium text-text bg-bg outline-none transition-all duration-120 focus:border-blue focus:shadow-[0_0_0_3px_rgba(26,92,219,0.08)] focus:bg-white appearance-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-5.5 last:mb-0">
                  <label className="block text-xs font-semibold text-text-2 mb-1.5 tracking-[0.01em]">
                    Survivor Benefit <span className="text-[11px] text-text-3 font-normal ml-1">affects monthly payout</span>
                  </label>
                  <div className="relative after:content-['↓'] after:absolute after:right-3 after:top-1/2 after:-translate-y-1/2 after:text-xs after:text-text-3 after:pointer-events-none">
                    <select
                      value={survivor}
                      onChange={(e) => setSurvivor(e.target.value)}
                      className="w-full py-2.5 px-3 border border-border rounded-[5px] font-mono text-[15px] font-medium text-text bg-bg outline-none transition-all duration-120 focus:border-blue focus:shadow-[0_0_0_3px_rgba(26,92,219,0.08)] focus:bg-white appearance-none"
                    >
                      <option value="50">Full — 50% of annuity</option>
                      <option value="25">Partial — 25% of annuity</option>
                      <option value="0">None</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8">
                  <AdPlaceholder className="w-full h-[60px]" />
                </div>
              </div>
            </div>

            <div className="bg-blue-lt border-l-4 border-blue rounded-r-[5px] py-3.5 px-4.5 mt-6 text-[13px] text-navy leading-[1.6]">
              <strong>Note:</strong> The 1.1% multiplier applies when retiring at age 62 or older with at least 20 years of service. Otherwise the standard 1.0% multiplier is used.
            </div>
            
            <div className="mt-6">
              <AdPlaceholder className="w-full h-[90px]" />
            </div>
          </div>

          {/* RESULTS PANEL */}
          <div className="flex flex-col gap-0.5">
            <div className="bg-navy text-white rounded-t-lg py-10 px-9 border border-navy">
              <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-white/40 mb-3 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-white/10">
                Gross Monthly Projection
              </div>
              <div className="font-mono text-[56px] font-medium text-white tracking-[-1px] leading-none mb-3">
                {fmt(results.monthly)}
              </div>
              <div className="text-[13px] text-white/40">
                Pre-tax estimate · Updates as you type
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 bg-border border border-t-0 border-border rounded-b-lg overflow-hidden">
              <div className="bg-white py-6 px-7">
                <div className="text-[11px] font-semibold tracking-[0.07em] uppercase text-text-3 mb-2">Annual Total</div>
                <div className="font-mono text-2xl font-medium text-text">{fmtK(results.annual)}</div>
                <div className="text-[11px] text-text-3 mt-1">Before survivor reduction</div>
              </div>
              <div className="bg-white py-6 px-7">
                <div className="text-[11px] font-semibold tracking-[0.07em] uppercase text-text-3 mb-2">Accrual Factor</div>
                <div className="font-mono text-2xl font-medium text-blue">{(results.factor * 100).toFixed(1)}%</div>
                <div className="text-[11px] text-text-3 mt-1">Per year of service</div>
              </div>
              <div className="bg-white py-6 px-7">
                <div className="text-[11px] font-semibold tracking-[0.07em] uppercase text-text-3 mb-2">Replacement Rate</div>
                <div className="font-mono text-2xl font-medium text-text">{results.replacement > 0 ? results.replacement.toFixed(1) + '%' : '—'}</div>
                <div className="text-[11px] text-text-3 mt-1">% of High-3 salary</div>
              </div>
            </div>
            
            <div className="mt-8">
              <AdPlaceholder className="w-full h-[60px]" />
            </div>
            <div className="mt-4">
              <AdPlaceholder className="w-full h-[250px]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
