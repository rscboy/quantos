import React from 'react';
import { SEO } from './SEO';

export function High3Calculator({ onBack, onNavigate }: { onBack: () => void, onNavigate: (id: string) => void }) {
  return (
    <div className="animate-in fade-in duration-300">
      <SEO 
        title="High-3 Salary Calculator | Federal Retirement Estimates | FedCalc"
        description="Calculate your High-3 average salary for federal retirement. Essential for accurate CSRS and FERS pension estimates."
        canonicalUrl="/high-3-calculator"
      />
      <main className="max-w-[1200px] mx-auto px-6 pb-20 pt-12">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-2 mb-8 cursor-pointer bg-none border-none p-0 font-sans transition-colors duration-120 hover:text-blue">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5"><path d="M10 3L5 8l5 5" /></svg>
          All Calculators
        </button>

        <h1 className="font-serif text-4xl font-normal text-text mb-3">High-3 Salary Calculator</h1>
        <p className="text-text-2 text-sm mb-8 max-w-3xl">
          Your High-3 average salary is the foundation of your federal retirement annuity. Our High-3 calculator is integrated directly into our comprehensive retirement tools.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white border border-border rounded-lg p-6 hover:border-blue/30 transition-colors cursor-pointer" onClick={() => onNavigate('fers')}>
            <h3 className="font-serif text-xl mb-2">FERS Retirement Calculator</h3>
            <p className="text-sm text-text-2 mb-4">Calculate your FERS pension, including an exact High-3 salary calculation based on your earnings history.</p>
            <span className="text-blue text-sm font-semibold">Open FERS Calculator →</span>
          </div>
          <div className="bg-white border border-border rounded-lg p-6 hover:border-blue/30 transition-colors cursor-pointer" onClick={() => onNavigate('csrs')}>
            <h3 className="font-serif text-xl mb-2">CSRS Retirement Calculator</h3>
            <p className="text-sm text-text-2 mb-4">Calculate your CSRS pension, including an exact High-3 salary calculation based on your earnings history.</p>
            <span className="text-blue text-sm font-semibold">Open CSRS Calculator →</span>
          </div>
        </div>
      </main>
    </div>
  );
}
