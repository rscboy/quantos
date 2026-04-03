import React from 'react';
import { SEO } from './SEO';

export function ApiPage({ onBack, onNavigate }: { onBack: () => void, onNavigate: (id: string) => void }) {
  return (
    <div className="animate-in fade-in duration-300">
      <SEO 
        title="Federal Retirement API | Developer Access | FedCalc"
        description="Integrate FedCalc's powerful retirement calculation engine directly into your HR or benefits platform. Fast, accurate FERS, CSRS, and TSP estimates via API."
        canonicalUrl="/api"
      />
      <main className="max-w-[1200px] mx-auto px-6 pb-20 pt-12">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-2 mb-8 cursor-pointer bg-none border-none p-0 font-sans transition-colors duration-120 hover:text-blue">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5"><path d="M10 3L5 8l5 5" /></svg>
          All Calculators
        </button>

        <h1 className="font-serif text-4xl font-normal text-text mb-3">FedCalc API Access</h1>
        <p className="text-text-2 text-sm mb-8 max-w-3xl">
          Fast retirement estimates for large groups of employees. Integrate FedCalc directly into your HR or benefits platform.
        </p>

        <div className="bg-white border border-border rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-serif mb-4">Enterprise Integration</h2>
          <p className="text-text-2 mb-6">
            Our REST API provides programmatic access to the same calculation engine that powers our consumer tools. Perfect for financial planners, federal agencies, and HR software providers.
          </p>
          <div className="flex gap-4">
            <a href="mailto:api@fedcalc.com" className="bg-blue text-white px-6 py-2.5 rounded-md font-semibold text-sm hover:bg-blue-600 transition-colors">
              Contact Sales
            </a>
            <a href="/openapi.yaml" target="_blank" rel="noopener noreferrer" className="bg-gray-100 text-text px-6 py-2.5 rounded-md font-semibold text-sm hover:bg-gray-200 transition-colors">
              View Documentation
            </a>
          </div>
        </div>

        <h2 className="text-2xl font-serif mb-6">Explore Our Calculators</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-border rounded-lg p-6 hover:border-blue/30 transition-colors cursor-pointer" onClick={() => onNavigate('fers')}>
            <h3 className="font-serif text-lg mb-2">FERS Calculator</h3>
            <span className="text-blue text-sm font-semibold">Try it now →</span>
          </div>
          <div className="bg-white border border-border rounded-lg p-6 hover:border-blue/30 transition-colors cursor-pointer" onClick={() => onNavigate('csrs')}>
            <h3 className="font-serif text-lg mb-2">CSRS Calculator</h3>
            <span className="text-blue text-sm font-semibold">Try it now →</span>
          </div>
          <div className="bg-white border border-border rounded-lg p-6 hover:border-blue/30 transition-colors cursor-pointer" onClick={() => onNavigate('tsp')}>
            <h3 className="font-serif text-lg mb-2">TSP Calculator</h3>
            <span className="text-blue text-sm font-semibold">Try it now →</span>
          </div>
        </div>
      </main>
    </div>
  );
}
