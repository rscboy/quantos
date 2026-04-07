import React, { useMemo, useState, useEffect } from 'react';
import { LinkedCalculatorData, applyLinkedDataToGapForm } from '../utils/calculatorLinking';
import { openBrandedPrintReport } from '../utils/reportPrint';
import { useSharedProfile } from '../hooks/useSharedProfile';
import { SEO } from './SEO';

type GapForm = {
  plannedRetirementDate: string;
  currentAnnualSalary: number;
  percentIncomeNeeded: number;
  futureSalaryIncrease: number;
  currentSavings: number;
  savingsReturn: number;
  federalRetirement: number;
  socialSecurity: number;
  otherPensions: number;
  pensionCola: number;
  yearsInRetirement: number;
};

type ProjectionMetrics = {
  inflationRate: number;
  yearsToRetirement: number;
  targetIncomeNow: number;
  targetIncomeAtRetirement: number;
  federalNow: number;
  federalAtRetirement: number;
  socialSecurityNow: number;
  socialSecurityAtRetirement: number;
  otherPensionsNow: number;
  otherPensionsAtRetirement: number;
  guaranteedIncomeNow: number;
  guaranteedIncomeAtRetirement: number;
  shortfallNow: number;
  shortfallAtRetirement: number;
  totalProjectedShortfall: number;
  futureValueCurrentSavings: number;
  additionalSavingsNeeded: number;
  annualSavingsNeeded: number;
  annualSavingsRate: number;
  finalSalaryAtRetirement: number;
};

const STEP_TITLES = ['Savings and Rate Assumptions', 'Retirement Savings GAP Results', 'Email Report'];
const ASSUMED_INFLATION = 0.025;

const DEFAULT_FORM: GapForm = {
  plannedRetirementDate: '',
  currentAnnualSalary: 95000,
  percentIncomeNeeded: 80,
  futureSalaryIncrease: 2.5,
  currentSavings: 175000,
  savingsReturn: 6,
  federalRetirement: 28000,
  socialSecurity: 24000,
  otherPensions: 0,
  pensionCola: 2,
  yearsInRetirement: 25,
};

function currency(value: number) {
  return value.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function percent(value: number) {
  return `${value.toFixed(1)}%`;
}

function clampMoney(value: number) {
  return Math.max(0, Number.isFinite(value) ? value : 0);
}

function yearsUntil(dateText: string) {
  if (!dateText) return 0;
  const today = new Date();
  const target = new Date(dateText);
  const diff = target.getTime() - today.getTime();
  if (Number.isNaN(diff)) return 0;
  return Math.max(diff / (365.25 * 24 * 60 * 60 * 1000), 0);
}

function grow(value: number, ratePct: number, years: number) {
  return value * Math.pow(1 + ratePct / 100, years);
}

function presentValueOfGrowingAnnuity(payment: number, growthRate: number, discountRate: number, periods: number) {
  if (periods <= 0 || payment <= 0) return 0;
  if (Math.abs(discountRate - growthRate) < 1e-9) {
    return payment * periods / (1 + discountRate);
  }
  return payment * (1 - Math.pow((1 + growthRate) / (1 + discountRate), periods)) / (discountRate - growthRate);
}

function futureValueAnnuityFactor(rate: number, periods: number) {
  if (periods <= 0) return 0;
  if (Math.abs(rate) < 1e-9) return periods;
  return (Math.pow(1 + rate, periods) - 1) / rate;
}

function calculateProjection(form: GapForm): ProjectionMetrics {
  const yearsToRetirement = yearsUntil(form.plannedRetirementDate);
  const targetIncomeNow = form.currentAnnualSalary * (form.percentIncomeNeeded / 100);
  const finalSalaryAtRetirement = grow(form.currentAnnualSalary, form.futureSalaryIncrease, yearsToRetirement);
  const targetIncomeAtRetirement = finalSalaryAtRetirement * (form.percentIncomeNeeded / 100);

  const federalAtRetirement = grow(form.federalRetirement, form.pensionCola, yearsToRetirement);
  const socialSecurityAtRetirement = grow(form.socialSecurity, form.pensionCola, yearsToRetirement);
  const otherPensionsAtRetirement = grow(form.otherPensions, form.pensionCola, yearsToRetirement);

  const guaranteedIncomeNow = form.federalRetirement + form.socialSecurity + form.otherPensions;
  const guaranteedIncomeAtRetirement = federalAtRetirement + socialSecurityAtRetirement + otherPensionsAtRetirement;
  const shortfallNow = clampMoney(targetIncomeNow - guaranteedIncomeNow);
  const shortfallAtRetirement = clampMoney(targetIncomeAtRetirement - guaranteedIncomeAtRetirement);

  const totalProjectedShortfall = presentValueOfGrowingAnnuity(
    shortfallAtRetirement,
    form.pensionCola / 100,
    form.savingsReturn / 100,
    form.yearsInRetirement,
  );

  const futureValueCurrentSavings = grow(form.currentSavings, form.savingsReturn, yearsToRetirement);
  const additionalSavingsNeeded = clampMoney(totalProjectedShortfall - futureValueCurrentSavings);

  const savingsRate = form.savingsReturn / 100;
  const annualSavingsNeeded = yearsToRetirement > 0
    ? additionalSavingsNeeded / futureValueAnnuityFactor(savingsRate, yearsToRetirement)
    : additionalSavingsNeeded;

  const annualSavingsRate = form.currentAnnualSalary > 0 ? (annualSavingsNeeded / form.currentAnnualSalary) * 100 : 0;

  return {
    inflationRate: ASSUMED_INFLATION * 100,
    yearsToRetirement,
    targetIncomeNow,
    targetIncomeAtRetirement,
    federalNow: form.federalRetirement,
    federalAtRetirement,
    socialSecurityNow: form.socialSecurity,
    socialSecurityAtRetirement,
    otherPensionsNow: form.otherPensions,
    otherPensionsAtRetirement,
    guaranteedIncomeNow,
    guaranteedIncomeAtRetirement,
    shortfallNow,
    shortfallAtRetirement,
    totalProjectedShortfall,
    futureValueCurrentSavings,
    additionalSavingsNeeded,
    annualSavingsNeeded,
    annualSavingsRate,
    finalSalaryAtRetirement,
  };
}

function ResultCell({ label, now, retirement, emphasize = false }: { label: string; now: string; retirement: string; emphasize?: boolean }) {
  return (
    <div className={`grid grid-cols-[1.4fr_1fr_1fr] gap-3 py-3 border-b border-border text-sm ${emphasize ? 'font-semibold text-text' : 'text-text-2'}`}>
      <div>{label}</div>
      <div className="text-right font-mono">{now}</div>
      <div className="text-right font-mono">{retirement}</div>
    </div>
  );
}

export function RetirementGapCalculator({ onBack, linkedData }: { onBack: () => void; linkedData: LinkedCalculatorData }) {
  const { profile, updateProfile } = useSharedProfile();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<GapForm>(() => ({ 
    ...DEFAULT_FORM, 
    ...applyLinkedDataToGapForm(linkedData),
    plannedRetirementDate: profile.dateRetire || '',
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailData, setEmailData] = useState({ email: profile.email || '', confirmEmail: profile.email || '' });
  const metrics = useMemo(() => calculateProjection(form), [form]);

  // Sync profile updates if they happen externally
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      plannedRetirementDate: profile.dateRetire || prev.plannedRetirementDate,
    }));
    if (profile.email) {
      setEmailData(prev => ({ ...prev, email: profile.email || prev.email, confirmEmail: profile.email || prev.confirmEmail }));
    }
  }, [profile]);

  const setField = (field: keyof GapForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === 'plannedRetirementDate' ? value : Number(value),
    }));
    if (field === 'plannedRetirementDate') {
      updateProfile({ dateRetire: value });
    }
  };

  const validateStep = (stepToValidate: number) => {
    const nextErrors: Record<string, string> = {};

    if (stepToValidate === 1) {
      if (!form.plannedRetirementDate) nextErrors.plannedRetirementDate = 'Planned Retirement date is required.';
      if (yearsUntil(form.plannedRetirementDate) <= 0) nextErrors.plannedRetirementDate = 'Planned Retirement date must be in the future.';
      if (form.currentAnnualSalary <= 0) nextErrors.currentAnnualSalary = 'Current Annual Salary is required.';
      if (form.percentIncomeNeeded <= 0) nextErrors.percentIncomeNeeded = 'Percent of Current Income Needed in Retirement is required.';
      if (form.futureSalaryIncrease < 0) nextErrors.futureSalaryIncrease = 'Estimated Future Annual Salary Increases cannot be negative.';
      if (form.currentSavings < 0) nextErrors.currentSavings = 'Current Savings cannot be negative.';
      if (form.savingsReturn < 0) nextErrors.savingsReturn = 'Estimated Rate of Return on Savings cannot be negative.';
      if (form.federalRetirement < 0) nextErrors.federalRetirement = 'FERS or CSRS Annuity cannot be negative.';
      if (form.socialSecurity < 0) nextErrors.socialSecurity = 'Social Security cannot be negative.';
      if (form.otherPensions < 0) nextErrors.otherPensions = 'Other Pension(s) cannot be negative.';
      if (form.pensionCola < 0) nextErrors.pensionCola = 'Estimated Pension Cost of Living Increases cannot be negative.';
      if (form.yearsInRetirement <= 0) nextErrors.yearsInRetirement = 'Number of Years in Retirement is required.';
    }

    if (stepToValidate === 3) {
      if (!emailData.email) nextErrors.email = 'Email address is required.';
      if (!emailData.confirmEmail) nextErrors.confirmEmail = 'Please confirm your email address.';
      if (emailData.email && emailData.confirmEmail && emailData.email !== emailData.confirmEmail) {
        nextErrors.confirmEmail = 'Email addresses must match.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(3, current + 1));
  };

  const handlePrinterFriendly = () => {
    openBrandedPrintReport({
      title: 'Retirement Savings GAP Calculator',
      subtitle: 'Friendly printer version of your retirement income gap analysis.',
      sections: [
        {
          title: 'Assumptions',
          lines: [
            { label: 'Planned Retirement Date', value: form.plannedRetirementDate || 'N/A' },
            { label: 'Current Annual Salary', value: currency(form.currentAnnualSalary) },
            { label: 'Income Needed in Retirement', value: percent(form.percentIncomeNeeded) },
            { label: 'Future Salary Increase', value: percent(form.futureSalaryIncrease) },
            { label: 'Current Savings', value: currency(form.currentSavings) },
            { label: 'Savings Return', value: percent(form.savingsReturn) },
            { label: 'Years in Retirement', value: String(form.yearsInRetirement) },
          ],
        },
        {
          title: 'Projected Income Sources',
          lines: [
            { label: 'Federal Retirement at Retirement', value: currency(metrics.federalAtRetirement) },
            { label: 'Social Security at Retirement', value: currency(metrics.socialSecurityAtRetirement) },
            { label: 'Other Pensions at Retirement', value: currency(metrics.otherPensionsAtRetirement) },
            { label: 'Guaranteed Income at Retirement', value: currency(metrics.guaranteedIncomeAtRetirement) },
          ],
        },
        {
          title: 'Gap Summary',
          lines: [
            { label: 'Target Income at Retirement', value: currency(metrics.targetIncomeAtRetirement) },
            { label: 'Projected Shortfall at Retirement', value: currency(metrics.shortfallAtRetirement) },
            { label: 'Total Projected Shortfall', value: currency(metrics.totalProjectedShortfall) },
            { label: 'Future Value of Current Savings', value: currency(metrics.futureValueCurrentSavings) },
            { label: 'Additional Savings Needed', value: currency(metrics.additionalSavingsNeeded) },
            { label: 'Annual Savings Needed', value: currency(metrics.annualSavingsNeeded) },
            { label: 'Annual Savings Rate', value: percent(metrics.annualSavingsRate) },
          ],
        },
      ],
    });
  };

  const handleSend = async () => {
    if (!validateStep(3)) return;
    
    try {
      const { generateReportHtml } = await import('../utils/reportPrint');
      const { sendEmailReport } = await import('../utils/emailReport');
      
      const htmlBody = generateReportHtml({
        title: 'Retirement Savings GAP Calculator',
        subtitle: 'Your retirement income gap analysis.',
        sections: [
          {
            title: 'Assumptions',
            lines: [
              { label: 'Planned Retirement Date', value: form.plannedRetirementDate || 'N/A' },
              { label: 'Current Annual Salary', value: currency(form.currentAnnualSalary) },
              { label: 'Income Needed in Retirement', value: percent(form.percentIncomeNeeded) },
              { label: 'Future Salary Increase', value: percent(form.futureSalaryIncrease) },
              { label: 'Current Savings', value: currency(form.currentSavings) },
              { label: 'Savings Return', value: percent(form.savingsReturn) },
              { label: 'Years in Retirement', value: String(form.yearsInRetirement) },
            ],
          },
          {
            title: 'Projected Income Sources',
            lines: [
              { label: 'Federal Retirement at Retirement', value: currency(metrics.federalAtRetirement) },
              { label: 'Social Security at Retirement', value: currency(metrics.socialSecurityAtRetirement) },
              { label: 'Other Pensions at Retirement', value: currency(metrics.otherPensionsAtRetirement) },
              { label: 'Guaranteed Income at Retirement', value: currency(metrics.guaranteedIncomeAtRetirement) },
            ],
          },
          {
            title: 'Gap Summary',
            lines: [
              { label: 'Target Income at Retirement', value: currency(metrics.targetIncomeAtRetirement) },
              { label: 'Projected Shortfall at Retirement', value: currency(metrics.shortfallAtRetirement) },
              { label: 'Total Projected Shortfall', value: currency(metrics.totalProjectedShortfall) },
              { label: 'Future Value of Current Savings', value: currency(metrics.futureValueCurrentSavings) },
              { label: 'Additional Savings Needed', value: currency(metrics.additionalSavingsNeeded) },
              { label: 'Annual Savings Needed', value: currency(metrics.annualSavingsNeeded) },
              { label: 'Annual Savings Rate', value: percent(metrics.annualSavingsRate) },
            ],
          },
        ],
        isEmail: true
      });
      
      await sendEmailReport(emailData.email, 'Your Retirement Savings GAP Estimate', htmlBody);
      alert(`Report sent successfully to ${emailData.email}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  const fieldClass = (key: string) => `w-full rounded-md border px-3 py-2.5 text-sm ${errors[key] ? 'border-red-500' : 'border-border'}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Retirement GAP Calculator",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "provider": {
      "@type": "Organization",
      "name": "FedCalc"
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <SEO 
        title="Retirement GAP Analysis Calculator | Free Federal Estimates | FedCalc"
        description="FedCalc retirement calculators help federal employees, planners, and agencies estimate retirement readiness with precision. Run High-3, pension, and GAP analysis instantly."
        schema={schema}
      />
      <main className="w-full max-w-[1040px] mx-auto px-4 sm:px-6 pb-20 pt-8 sm:pt-12">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-2 mb-6 sm:mb-8 cursor-pointer bg-none border-none p-0 font-sans transition-colors duration-120 hover:text-blue min-h-[44px]">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5"><path d="M10 3L5 8l5 5" /></svg>
          All Calculators
        </button>

        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-text mb-3">Retirement Savings GAP Calculator</h1>
        <p className="text-text-2 max-w-3xl mb-8">Estimate whether your retirement income sources will cover your target retirement lifestyle, then quantify the additional savings needed to close any projected shortfall.</p>

        {(linkedData.tsp || linkedData.socialSecurity) && (
          <div className="mb-8 rounded-lg border border-blue/20 bg-blue-50 px-5 py-4 text-sm text-text-2">
            <div className="font-semibold text-text mb-1">Auto-filled from your other calculators</div>
            <div>TSP inputs now seed your retirement date, salary, and savings baseline, while your Social Security estimate is included automatically in this gap analysis.</div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8 overflow-x-auto gap-4 pb-2">
          {STEP_TITLES.map((title, index) => {
            const stepNumber = index + 1;
            const isCurrent = step === stepNumber;
            const isComplete = step > stepNumber;
            return (
              <div key={title} className="flex items-center min-w-fit flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${isCurrent ? 'bg-blue text-white' : isComplete ? 'bg-green text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {isComplete ? '✓' : stepNumber}
                </div>
                <div className="ml-3 min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.08em] text-text-3">Step {stepNumber}</div>
                  <div className="text-sm font-medium text-text truncate">{title}</div>
                </div>
                {stepNumber < STEP_TITLES.length && <div className={`mx-3 h-1 flex-1 rounded min-w-[20px] ${isComplete ? 'bg-green' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
          {step === 1 && (
            <div className="p-8">
              <div className="flex items-start justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-xl font-semibold text-text mb-2">Savings and Rate Assumptions</h2>
                  <p className="text-sm text-text-2 max-w-2xl">All fields are required to generate a valid retirement savings gap projection. Enter annual values unless otherwise noted.</p>
                </div>
                <div className="bg-blue-lt rounded-lg px-4 py-3 text-sm text-text-2 min-w-[230px]">
                  <div className="font-semibold text-text mb-1">Projection timeline</div>
                  <div>Years to retirement: <span className="font-mono text-text">{metrics.yearsToRetirement.toFixed(1)}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  ['plannedRetirementDate', 'Planned Retirement date', 'date'],
                  ['currentAnnualSalary', 'Current Annual Salary', 'number'],
                  ['percentIncomeNeeded', 'Percent of Current Income Needed in Retirement', 'number'],
                  ['futureSalaryIncrease', 'Estimated Future Annual Salary Increases', 'number'],
                  ['currentSavings', 'Current Savings', 'number'],
                  ['savingsReturn', 'Estimated Rate of Return on Savings', 'number'],
                  ['federalRetirement', 'FERS or CSRS Annuity (annual)', 'number'],
                  ['socialSecurity', 'Social Security (annual)', 'number'],
                  ['otherPensions', 'Other Pension(s)', 'number'],
                  ['pensionCola', 'Estimated Pension Cost of Living Increases', 'number'],
                  ['yearsInRetirement', 'Number of Years in Retirement', 'number'],
                ].map(([key, label, type]) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-text-2 mb-2">{label} <span className="text-red-500">*</span></label>
                    <input
                      type={type}
                      value={String(form[key as keyof GapForm] ?? '')}
                      onChange={(e) => setField(key as keyof GapForm, e.target.value)}
                      className={fieldClass(key)}
                    />
                    {type === 'number' && ['percentIncomeNeeded', 'futureSalaryIncrease', 'savingsReturn', 'pensionCola'].includes(key) && (
                      <p className="text-xs text-text-3 mt-1">Enter as a percentage.</p>
                    )}
                    {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-semibold text-text mb-2">Retirement Savings GAP Results</h2>
                  <p className="text-sm text-text-2 max-w-2xl">Compare your current-dollar targets with retirement-year projections, then review the total projected shortfall and savings action plan.</p>
                </div>
                <div className="bg-[#F7FAFC] border border-border rounded-lg px-4 py-3 text-sm min-w-[260px]">
                  <div className="text-text-3 uppercase tracking-[0.08em] text-[11px] mb-1">Additional Savings Needed</div>
                  <div className="font-serif text-3 text-text">{currency(metrics.additionalSavingsNeeded)}</div>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden mb-8">
                <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-3 bg-bg px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-text-3">
                  <div>Income comparison</div>
                  <div className="text-right">Now</div>
                  <div className="text-right">At Retirement</div>
                </div>
                <div className="px-4">
                  <ResultCell label="Target Retirement Income" now={currency(metrics.targetIncomeNow)} retirement={currency(metrics.targetIncomeAtRetirement)} emphasize />
                  <ResultCell label="Federal Retirement" now={currency(metrics.federalNow)} retirement={currency(metrics.federalAtRetirement)} />
                  <ResultCell label="Social Security" now={currency(metrics.socialSecurityNow)} retirement={currency(metrics.socialSecurityAtRetirement)} />
                  <ResultCell label="Other Pensions" now={currency(metrics.otherPensionsNow)} retirement={currency(metrics.otherPensionsAtRetirement)} />
                  <ResultCell label="Shortfall" now={currency(metrics.shortfallNow)} retirement={currency(metrics.shortfallAtRetirement)} emphasize />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="border border-border rounded-lg p-6 bg-white">
                  <h3 className="text-lg font-semibold mb-4">Shortfall Summary</h3>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-text-2">Total Projected Shortfall for all retirement years</dt><dd className="font-mono text-text">{currency(metrics.totalProjectedShortfall)}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-text-2">Current Savings at retirement value</dt><dd className="font-mono text-text">{currency(metrics.futureValueCurrentSavings)}</dd></div>
                    <div className="flex justify-between gap-4 pt-3 border-t border-border"><dt className="font-semibold text-text">Additional Savings Needed</dt><dd className="font-mono font-semibold text-text">{currency(metrics.additionalSavingsNeeded)}</dd></div>
                  </dl>
                </div>

                <div className="border border-border rounded-lg p-6 bg-white">
                  <h3 className="text-lg font-semibold mb-4">Actionable Guidance</h3>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-text-2">Annual Savings Needed Until Retirement</dt><dd className="font-mono text-text">{currency(metrics.annualSavingsNeeded)}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-text-2">Percent of Annual Salary to Save</dt><dd className="font-mono text-text">{percent(metrics.annualSavingsRate)}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-text-2">Projected salary at retirement</dt><dd className="font-mono text-text">{currency(metrics.finalSalaryAtRetirement)}</dd></div>
                  </dl>
                </div>
              </div>

              <div className="border border-border rounded-lg p-6 bg-bg">
                <h3 className="text-lg font-semibold mb-4">Supporting Assumptions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
                  <div><div className="text-text-3 uppercase tracking-[0.08em] text-[11px] mb-1">Inflation</div><div className="font-mono">{percent(metrics.inflationRate)}</div></div>
                  <div><div className="text-text-3 uppercase tracking-[0.08em] text-[11px] mb-1">Investment Return</div><div className="font-mono">{percent(form.savingsReturn)}</div></div>
                  <div><div className="text-text-3 uppercase tracking-[0.08em] text-[11px] mb-1">Years to Retirement</div><div className="font-mono">{metrics.yearsToRetirement.toFixed(1)}</div></div>
                  <div><div className="text-text-3 uppercase tracking-[0.08em] text-[11px] mb-1">Years in Retirement</div><div className="font-mono">{form.yearsInRetirement}</div></div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-semibold text-text mb-2">Email Report</h2>
                  <p className="text-sm text-text-2 max-w-xl">Enter and confirm your email address to receive your personalized retirement gap analysis. Both fields are required and must match.</p>
                </div>
                <button onClick={handlePrinterFriendly} className="inline-flex items-center justify-center rounded-md border border-blue px-4 py-2 text-sm font-semibold text-blue hover:bg-blue-lt">
                  Friendly Printer Version
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Email address <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    value={emailData.email} 
                    onChange={(e) => {
                      setEmailData((prev) => ({ ...prev, email: e.target.value }));
                      updateProfile({ email: e.target.value });
                    }} 
                    className={`${fieldClass('email')} min-h-[44px]`} 
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Confirm email address <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    value={emailData.confirmEmail} 
                    onChange={(e) => setEmailData((prev) => ({ ...prev, confirmEmail: e.target.value }))} 
                    className={`${fieldClass('confirmEmail')} min-h-[44px]`} 
                  />
                  {errors.confirmEmail && <p className="text-xs text-red-500 mt-1">{errors.confirmEmail}</p>}
                </div>
              </div>

              <div className="border border-border rounded-lg p-6 bg-bg text-sm text-text-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><div className="text-[11px] uppercase tracking-[0.08em] text-text-3 mb-1">Target Income</div><div className="font-mono text-text">{currency(metrics.targetIncomeAtRetirement)}</div></div>
                  <div><div className="text-[11px] uppercase tracking-[0.08em] text-text-3 mb-1">Projected Shortfall</div><div className="font-mono text-text">{currency(metrics.totalProjectedShortfall)}</div></div>
                  <div><div className="text-[11px] uppercase tracking-[0.08em] text-text-3 mb-1">Annual Savings Needed</div><div className="font-mono text-text">{currency(metrics.annualSavingsNeeded)}</div></div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 px-8 py-5 border-t border-border bg-[#FBFBFC]">
            <button onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1} className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-text disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg">
              Back
            </button>
            <div className="flex items-center gap-3">
              {step < 3 ? (
                <button onClick={handleContinue} className="inline-flex items-center justify-center rounded-md bg-blue px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95">
                  {step === 1 ? 'Run calculation' : 'Continue'}
                </button>
              ) : (
                <button onClick={handleSend} className="inline-flex items-center justify-center rounded-md bg-blue px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95">
                  Email report
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}