import React from 'react';

type CalculatorGuideView = 'fers' | 'csrs' | 'eligibility' | 'tsp' | 'gap' | 'military' | 'full' | 'ss';

const GUIDE_COPY: Record<CalculatorGuideView, { title: string; intro: string; bullets: string[]; faq: Array<{ q: string; a: string }> }> = {
  fers: {
    title: 'How to use the FERS calculator accurately',
    intro: 'To get a realistic FERS estimate, use your actual Service Computation Date, projected retirement date, and as much salary history as possible. The annuity formula is very sensitive to High-3 pay and years of creditable service. If you have military time, part-time service, or a prior refund, include those details before you compare retirement dates. Even a one-year shift in retirement timing can materially change your monthly benefit.',
    bullets: [
      'Enter salary history covering at least 36 consecutive months to improve High-3 precision.',
      'Model multiple scenarios (e.g., age 60 vs. 62) and compare net monthly annuity, not just gross.',
      'Include life insurance and survivor election assumptions so deductions are not understated.',
    ],
    faq: [
      { q: 'Why does my estimate change when I adjust sick leave?', a: 'Unused sick leave can increase creditable service in annuity calculations, which can increase annual pension results. It does not always affect eligibility dates in the same way.' },
      { q: 'Should I trust one scenario only?', a: 'No. Build at least three scenarios: your earliest feasible date, your target date, and a delayed date. This gives you a practical range for planning.' },
    ],
  },
  csrs: {
    title: 'CSRS planning checklist before submission',
    intro: 'CSRS cases often involve redeposit and deposit decisions that significantly alter retirement income. Before you finalize a result, verify your creditable service timeline and ensure any refunded service is represented correctly. For many employees, the biggest planning mistake is relying on a rough estimate that omits prior service adjustments.',
    bullets: [
      'Review redeposit assumptions and compare pension outcomes with and without repayment.',
      'Confirm your highest paid consecutive 3-year window rather than assuming the final years are highest.',
      'Document survivor election assumptions because they can change take-home annuity estimates.',
    ],
    faq: [
      { q: 'Is CSRS affected by Social Security the same way as FERS?', a: 'No. CSRS is structurally different. Many users should validate potential Social Security interactions separately when planning total retirement income.' },
      { q: 'How often should I update my estimate?', a: 'At least yearly and after any major pay change, service correction, or retirement-date shift.' },
    ],
  },
  eligibility: {
    title: 'Choosing the right retirement date',
    intro: 'Eligibility is not only about reaching a minimum age. Federal retirement timing requires alignment between age, service credit, and special provisions that may apply to your position. Use this tool to identify your earliest date, then test nearby dates to understand the tradeoff between leaving sooner and locking in a larger annuity.',
    bullets: [
      'Check special category service flags if you are LEO, firefighter, or air traffic controller.',
      'Compare dates around birthdays and service anniversaries because thresholds can change outcomes.',
      'Use the result as a planning anchor, then validate in your full annuity projection workflow.',
    ],
    faq: [
      { q: 'Can I retire as soon as I become eligible?', a: 'In many cases yes, but the financially optimal date may be later depending on service milestones and pension multipliers.' },
      { q: 'What if my agency records differ?', a: 'Always reconcile discrepancies with your HR office and official service history before making final decisions.' },
    ],
  },
  tsp: {
    title: 'Building a practical TSP projection',
    intro: 'A useful TSP forecast blends contribution discipline with realistic return assumptions. Start with your current balance, annual contribution rate, and agency match assumptions. Then run conservative and moderate return cases so you can see how sensitive your future balance is to market conditions. This helps avoid overconfidence in a single optimistic projection.',
    bullets: [
      'Contribute at least enough to capture the full agency match where possible.',
      'Stress-test with lower return assumptions to reduce planning risk.',
      'Coordinate withdrawal timing with projected pension and Social Security cash flow.',
    ],
    faq: [
      { q: 'Should I use one average return number?', a: 'Use a range. A single number can hide downside risk and produce unrealistic income expectations.' },
      { q: 'How does this connect to retirement gap planning?', a: 'Your TSP is often the primary source for covering any income gap after pension and Social Security are accounted for.' },
    ],
  },
  gap: {
    title: 'How to close your retirement income gap',
    intro: 'Gap analysis works best when your expense assumptions are specific and your income streams are conservative. Start by estimating essential monthly costs, then compare them to dependable income sources such as pension and Social Security. The remaining shortfall becomes your actionable savings target. Re-run the model after life events, pay changes, or benefit updates.',
    bullets: [
      'Separate essential expenses from discretionary spending to prioritize funding needs.',
      'Use inflation-aware assumptions rather than flat spending estimates.',
      'Track your gap yearly and update contributions when shortfalls widen.',
    ],
    faq: [
      { q: 'What is a healthy process for gap planning?', a: 'Estimate, test alternatives, then implement contribution changes and monitor results at least annually.' },
      { q: 'Can retiring later help close the gap?', a: 'Often yes. Additional earning years can increase pension service, increase savings, and shorten drawdown duration.' },
    ],
  },
  military: {
    title: 'Evaluating military deposit decisions',
    intro: 'Military service credit can materially improve civilian retirement outcomes, but only when the deposit strategy is evaluated carefully. This calculator helps you estimate the repayment amount and compare it with projected annuity increases. The key is to evaluate the break-even period and your planned retirement horizon before deciding.',
    bullets: [
      'Gather DD-214 and military earnings data before calculating deposit scenarios.',
      'Compare total deposit cost versus expected lifetime annuity benefit increase.',
      'Re-check assumptions if retirement date or service records are revised.',
    ],
    faq: [
      { q: 'Is buying back military time always beneficial?', a: 'Not always. It depends on deposit cost, expected retirement duration, and your broader income plan.' },
      { q: 'When should I run this calculation?', a: 'As early as possible so you can plan repayment timing and avoid last-minute surprises.' },
    ],
  },
  full: {
    title: 'Using full retirement analysis for decision-grade planning',
    intro: 'The complete analysis combines eligibility, annuity, TSP growth, Social Security, and retirement gap data in one workflow. Use it when you are deciding between multiple retirement dates or benefit elections. Comprehensive modeling is especially useful when small assumption changes can compound across multiple income sources.',
    bullets: [
      'Create named scenarios and preserve assumptions so comparisons stay consistent.',
      'Review both monthly cash flow and lifetime value to avoid short-term bias.',
      'Validate key assumptions with official records before implementing your final plan.',
    ],
    faq: [
      { q: 'Why use full analysis instead of separate tools?', a: 'Integrated modeling exposes interactions that individual calculators can miss, especially around date and deduction changes.' },
      { q: 'How many scenarios are enough?', a: 'Three to five scenarios is a practical baseline for most retirement decisions.' },
    ],
  },
  ss: {
    title: 'Interpreting Social Security estimates responsibly',
    intro: 'Social Security estimates should be treated as planning inputs, not fixed guarantees. Claiming age, work history updates, and policy changes can affect outcomes. Use this estimator alongside your pension and TSP projections so total retirement cash flow is evaluated as a system rather than as disconnected numbers.',
    bullets: [
      'Compare claiming ages to understand the monthly benefit tradeoff.',
      'Revisit estimates after substantial earnings changes.',
      'Use conservative assumptions when building long-term retirement budgets.',
    ],
    faq: [
      { q: 'Can Social Security alone close my retirement gap?', a: 'For most federal retirees, it should be analyzed as one component of a broader multi-income plan.' },
      { q: 'How often should this estimate be refreshed?', a: 'At least annually and any time you materially change retirement timing assumptions.' },
    ],
  },
};

export function CalculatorContentGuide({ view }: { view: CalculatorGuideView }) {
  const guide = GUIDE_COPY[view];

  return (
    <section className="max-w-[980px] mx-auto px-6 pb-20" aria-labelledby="calculator-guide">
      <div className="rounded-2xl border border-border bg-white p-8 md:p-10">
        <h2 id="calculator-guide" className="font-serif text-3xl text-navy mb-4">{guide.title}</h2>
        <p className="text-text-2 leading-7 mb-6">{guide.intro}</p>
        <ul className="list-disc pl-6 space-y-2 text-text-2 mb-8">
          {guide.bullets.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <h3 className="font-serif text-2xl text-navy mb-4">Frequently asked questions</h3>
        <div className="space-y-4">
          {guide.faq.map((item) => (
            <div key={item.q}>
              <h4 className="font-semibold text-text mb-1">{item.q}</h4>
              <p className="text-text-2 leading-7">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
