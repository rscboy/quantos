import React from 'react';

export function CsrsCalculator({ onBack }: { onBack: () => void }) {
  return (
    <div className="animate-in fade-in duration-300">
      <main className="max-w-[900px] mx-auto px-6 pb-20 pt-12">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-2 mb-8 bg-none border-none p-0 hover:text-blue"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
            <path d="M10 3L5 8l5 5" />
          </svg>
          All Calculators
        </button>

        <div className="bg-white border border-border rounded-xl p-8 shadow-sm">
          <div className="text-[11px] uppercase tracking-[0.1em] text-blue font-semibold mb-2">CSRS Calculator</div>
          <h1 className="font-serif text-4xl font-normal text-text mb-4">CSRS Annuity Calculator</h1>
          <p className="text-text-2 max-w-2xl leading-7 mb-6">
            This route is now wired into the application so the main-branch calculator navigation can merge cleanly with the
            Full Retirement Analysis workflow. A dedicated CSRS experience can be added here without further routing changes.
          </p>
          <div className="rounded-lg border border-border bg-bg p-5 text-sm text-text-2">
            Use the Full Retirement Analysis workflow for the new multi-step experience, or return home to choose another calculator.
          </div>
        </div>
      </main>
    </div>
  );
}
