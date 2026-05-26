import React from 'react';
import { motion } from 'motion/react';
import { SEO } from './SEO';

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

// Reusable transition configuration for sweeps
const sweepTransition = { duration: 0.9, ease: [0.16, 1, 0.3, 1] };

export function Home({ onSelectCalc }: { onSelectCalc: (id: string) => void }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "MyFedPlan",
    "url": "https://www.myfedplan.us",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.myfedplan.us/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MyFedPlan",
    "url": "https://www.myfedplan.us",
    "logo": "https://i.postimg.cc/kXVHSmXz/Screenshot-2026-03-13-at-4-57-08-PM.png"
  };

  return (
    <div className="animate-in fade-in duration-300">
      <SEO 
        title="CSRS & FERS Retirement Calculators | Free Federal Pension & TSP Estimates | MyFedPlan"
        description="MyFedPlan provides powerful retirement calculators for federal employees, financial advisors, and HR professionals. Estimate your CSRS, FERS, and TSP benefits, run High-3 salary calculations, and perform detailed retirement gap analysis in seconds."
        schema={[schema, orgSchema]}
      />
      <div className="hero-section bg-navy text-white pt-[72px] px-6 pb-20 border-b border-white/5 overflow-hidden isolate">
        <div className="hero-section__backdrop" aria-hidden="true">
          <div className="hero-section__aurora hero-section__aurora--one"></div>
          <div className="hero-section__aurora hero-section__aurora--two"></div>
          <div className="hero-section__grid"></div>
          <div className="hero-section__glow hero-section__glow--left"></div>
          <div className="hero-section__glow hero-section__glow--right"></div>
        </div>

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_380px] gap-16 items-start relative z-10">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...sweepTransition, delay: 0.1 }}
              className="hidden sm:inline-flex items-center gap-2 bg-blue/20 border border-blue/40 text-[#93B4F4] text-[11px] font-semibold tracking-[0.08em] uppercase py-1.5 px-3 rounded-[3px] mb-5 backdrop-blur-sm"
            >
              New — Phased Retirement Estimates
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...sweepTransition, delay: 0.2 }}
              className="font-serif text-[clamp(30px,4vw,46px)] leading-[1.15] text-white mb-5 font-normal"
            >
              Federal Retirement<br /><em className="italic text-[#93B4F4]">Simplified.</em>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...sweepTransition, delay: 0.3 }}
              className="text-base text-white/60 max-w-[520px] leading-[1.7] mb-8"
            >
              MyFedPlan provides powerful retirement calculators for federal employees, financial advisors, and HR professionals. Estimate your CSRS, FERS, and TSP benefits, run High-3 salary calculations, and perform detailed retirement gap analysis in seconds.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...sweepTransition, delay: 0.4 }}
              className="flex gap-10 pt-8 border-t border-white/10"
            >
              <div>
                <span className="font-mono text-[28px] font-medium text-white block">2026</span>
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
            </motion.div>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...sweepTransition, delay: 0.35 }}
            className="hidden md:block bg-white/5 border border-white/10 rounded-lg p-7 backdrop-blur-md shadow-[0_20px_70px_rgba(5,12,24,0.24)]"
          >
            <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-white/30 mb-3.5 flex items-center gap-1.5 before:content-[''] before:inline-block before:w-5 before:h-0.5 before:bg-blue">
              Developer
            </div>
            <h3 className="font-serif text-xl text-white mb-2.5 font-normal">API Access Now Available</h3>
            <p className="text-[13px] text-white/50 leading-[1.6] mb-5">
              Fast retirement estimates for large groups of employees. Integrate MyFedPlan directly into your HR or benefits platform.
            </p>
            <a href="mailto:api@myfedplan.com" className="text-[#93B4F4] text-[13px] font-medium no-underline hover:underline">api@myfedplan.com →</a>
            <div className="mt-5 pt-4 border-t border-white/10 text-xs text-white/35">
              Technical spec: <a href="#" onClick={(e) => { e.preventDefault(); onSelectCalc('openapi'); }} className="text-white/50 no-underline hover:underline">OpenAPI specification ↗</a>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="hidden md:block bg-white border-y border-border p-6 m-0">
        <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-3 text-[13px] text-text-2">
            <div className="w-8 h-8 bg-bg border border-border rounded-md flex items-center justify-center text-sm shrink-0">📋</div>
            <span>Based on OPM Chapter 50 rules</span>
          </div>
          <div className="hidden md:block w-px h-7 bg-border"></div>
          <div className="flex items-center gap-3 text-[13px] text-text-2">
            <div className="w-8 h-8 bg-bg border border-border rounded-md flex items-center justify-center text-sm shrink-0">✓</div>
            <span>Independent resource since 2004</span>
          </div>
          <div className="hidden md:block w-px h-7 bg-border"></div>
          <div className="text-[13px] text-[#4A4A4A]">
            Questions? <a href="mailto:support@myfedplan.com" className="ml-1 text-blue no-underline hover:underline">support@myfedplan.com</a>
          </div>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto pt-14 px-6 pb-20">
        <div className="grid grid-cols-1 gap-8 items-start">
          <div>
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
                      {section.items.map((item, itemIdx) => {
                        const tagClass = item.tag === 'Advanced' ? 'text-blue' : item.tag === 'Comprehensive' ? 'text-green' : 'text-text-3';
                        const target = ['fers', 'csrs', 'eligibility', 'tsp', 'military', 'gap', 'full', 'ss'].includes(item.id) ? item.id : 'home';
                        return (
                          <motion.a
                            key={item.id}
                            href={`/${target}`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ ...sweepTransition, delay: itemIdx * 0.1 }}
                            className="bg-white p-7 pb-6 cursor-pointer transition-colors duration-150 flex flex-col relative group hover:bg-[#FAFBFF] no-underline"
                            onClick={(e) => { e.preventDefault(); onSelectCalc(target); }}
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
                          </motion.a>
                        );
                      })}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </main>

      <section className="max-w-[900px] mx-auto px-6 pt-4 pb-8" aria-labelledby="author-and-contact">
        <h2 id="author-and-contact" className="font-serif text-2xl text-navy mb-4">About this content</h2>
        <p className="text-text-2 leading-7 mb-3">
          This guide is maintained by the MyFedPlan editorial team and reviewed by federal retirement specialists.
          If you spot an issue or want help validating your assumptions, contact us at <a className="text-blue" href="mailto:support@myfedplan.com">support@myfedplan.com</a>.
        </p>
        <p className="text-text-2 leading-7">
          Last reviewed: May 1, 2026. We update this page whenever OPM guidance, contribution limits, or retirement rules change.
        </p>
        <p className="text-text-2 leading-7 mt-3">
          MyFedPlan is an independent educational resource and is not affiliated with, endorsed by, or sponsored by OPM, TSP, SSA, IRS, or any U.S. Government agency. Calculator outputs are estimates only and are not financial, legal, or tax advice.
        </p>
      </section>

      <article className="max-w-[900px] mx-auto px-6 pb-32">
        <div className="bg-blue/5 rounded-2xl p-8 md:p-12 border border-blue/10">
          <h2 className="font-serif text-3xl text-navy mb-8 leading-tight">The Ultimate Guide to Federal Retirement Planning</h2>
          
          <div className="prose prose-blue max-w-none text-text-2 space-y-6">
            <p className="text-lg leading-relaxed text-text">
              Navigating the complexities of federal retirement can be overwhelming. Whether you are covered under the <strong>Federal Employees Retirement System (FERS)</strong> or the legacy <strong>Civil Service Retirement System (CSRS)</strong>, understanding the nuances of your benefits is crucial to ensuring a secure and comfortable retirement. Our suite of proprietary calculators is designed to give you precise estimates, but a foundational understanding of the underlying principles is equally important.
            </p>

            <h3 className="font-serif text-2xl text-navy mt-10 mb-4">Understanding FERS vs. CSRS</h3>
            <p>
              The federal government operates two primary retirement systems. <strong>CSRS</strong> is the legacy system, generally applicable to employees hired before January 1, 1984. It is a standalone pension system that does not include Social Security as part of the core retirement package. Employees under CSRS contribute a larger percentage of their salary to the Civil Service Retirement and Disability Fund and, in return, receive a larger guaranteed annuity.
            </p>
            <p>
              <strong>FERS</strong>, on the other hand, is a three-tiered retirement plan covering the vast majority of current federal employees. It consists of:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>The Basic Benefit Plan:</strong> A guaranteed monthly annuity based on a specific formula (Years of Service × High-3 Average Salary × Pension Multiplier).</li>
              <li><strong>Social Security:</strong> Unlike CSRS employees, FERS employees pay into and receive full Social Security benefits upon retirement.</li>
              <li><strong>Thrift Savings Plan (TSP):</strong> The government's equivalent of a 401(k), offering agency automatic (1%) and matching contributions up to 5% of your base pay.</li>
            </ul>

            <h3 className="font-serif text-2xl text-navy mt-10 mb-4">Mastering the "High-3" Average Salary</h3>
            <p>
              Your "High-3" average salary is the cornerstone of your basic annuity calculation under both FERS and CSRS. It represents the highest average basic pay you earned during any three consecutive years of service. It is important to note that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>The three years do <em>not</em> need to be calendar years (e.g., January 1 to December 31).</li>
              <li>They do <em>not</em> have to be your final three years of service, though for most employees whose salaries increase over time, they usually are.</li>
              <li>Locality pay is included in your High-3 calculation, but overtime, bonuses, and allowances generally are not.</li>
            </ul>

            <h3 className="font-serif text-2xl text-navy mt-10 mb-4">Maximizing Your Thrift Savings Plan (TSP)</h3>
            <p>
              Under the FERS system, maximizing your TSP is perhaps the single most impactful action you can take to grow your retirement nest egg. Because the federal government matches the first 5% of your contributions, failing to contribute at least 5% means you are leaving free money on the table.
            </p>
            <p>
              The TSP offers several investment options, ranging from the ultra-secure G Fund (Government Securities) to more aggressive index funds like the C Fund (Common Stock), S Fund (Small Cap), and I Fund (International). For those who prefer a "set it and forget it" approach, the Lifecycle (L) Funds automatically adjust your investment mix to become more conservative as you approach your target retirement date.
            </p>

            <h3 className="font-serif text-2xl text-navy mt-10 mb-4">Special Rules, Deposits, and Redeposits</h3>
            <p>
              Federal retirement isn't always a straight line. Many employees have unique career paths that require special considerations:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Military Service Deposits:</strong> If you served in the military prior to entering federal civilian service, you may be able to "buy back" your military time. By making a deposit (typically 3% of your military base pay for FERS, or 7% for CSRS), that time is credited towards your civilian retirement, potentially increasing your annuity and allowing you to retire earlier.</li>
              <li><strong>Law Enforcement & Firefighters (LEO):</strong> Special provisions exist for federal law enforcement officers, firefighters, and air traffic controllers. These positions carry mandatory retirement ages and offer enhanced pension multipliers (1.7% instead of 1.0% or 1.1% for the first 20 years of service).</li>
              <li><strong>Unused Sick Leave:</strong> Under current rules, unused sick leave is added to your creditable service time for the purpose of calculating your annuity. For example, 2,087 hours of sick leave equates to approximately one additional year of service credit.</li>
            </ul>

            <h3 className="font-serif text-2xl text-navy mt-10 mb-4">Evaluating Your Retirement Gap</h3>
            <p>
              Knowing your pension amount is only half the battle. A comprehensive retirement plan requires a precise understanding of your <strong>Retirement Gap</strong>—the difference between your projected retirement expenses and your guaranteed income streams (Pension + Social Security). Our Retirement Savings Gap Calculator helps you determine exactly how much you need to draw down from your TSP and other investments to maintain your standard of living.
            </p>
            
            <p className="text-sm italic mt-8 p-4 bg-white/50 rounded-lg">
              Disclaimer: The tools and information provided on MyFedPlan are for educational and estimation purposes only. Always consult with your agency's HR department or a certified federal retirement counselor before making final retirement decisions based on OPM (Office of Personnel Management) guidelines.
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
