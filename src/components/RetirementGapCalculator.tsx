import React, { useMemo, useState } from 'react';

type GapForm = {
  plannedRetirementDate: string;
  currentAnnualSalary: number;
  percentIncomeNeeded: number;
  futureSalaryIncrease: number;
  currentSavings: number;
  rateOfReturn: number;
  federalRetirement: number;
  socialSecurity: number;
  otherPensions: number;
  pensionCola: number;
  yearsInRetirement: number;
};

type EmailForm = {
  email: string;
  confirmEmail: string;
};

type GapResults = {
  yearsToRetirement: number;
  targetIncomeNow: number;
  targetIncomeAtRetirement: number;
  federalRetirementNow: number;
  federalRetirementAtRetirement: number;
  socialSecurityNow: number;
  socialSecurityAtRetirement: number;
  otherPensionsNow: number;
  otherPensionsAtRetirement: number;
  shortfallNow: number;
  shortfallAtRetirement: number;
  totalProjectedShortfall: number;
  currentSavingsAtRetirement: number;
  additionalSavingsNeeded: number;
  annualSavingsNeeded: number;
  percentOfSalaryToSave: number;
};

const STEP_TITLES = ['Savings and Rate Assumptions', 'Results', 'Email Report'];
const DEFAULT_FORM: GapForm = {
  plannedRetirementDate: '',
  currentAnnualSalary: 90000,
  percentIncomeNeeded: 80,
  futureSalaryIncrease: 2.5,
  currentSavings: 150000,
  rateOfReturn: 6,
  federalRetirement: 25000,
  socialSecurity: 18000,
  otherPensions: 0,
  pensionCola: 2,
  yearsInRetirement: 25,
};

function currency(value: number) {
  return value.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

function percent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

function getYearsUntilRetirement(plannedRetirementDate: string) {
  if (!plannedRetirementDate) return 0;
  const now = new Date();
  const retirement = new Date(plannedRetirementDate);
  const diff = retirement.getTime() - now.getTime();
  return Math.max(diff / (365.25 * 24 * 60 * 60 * 1000), 0);
}

function getEscalationFactor(ratePercent: number, years: number) {
  return Math.pow(1 + ratePercent / 100, years);
}

function getGrowingAnnuityFactor(returnPercent: number, growthPercent: number, years: number) {
  if (years <= 0) return 0;
  const r = returnPercent / 100;
  const g = growthPercent / 100;

  if (Math.abs(r - g) < 0.000001) {
    return years / (1 + r);
  }

  const ratio = (1 + g) / (1 + r);
  return (1 - Math.pow(ratio, years)) / (r - g);
}

function calculateGapResults(form: GapForm): GapResults {
  const yearsToRetirement = getYearsUntilRetirement(form.plannedRetirementDate);
  const inflationFactor = getEscalationFactor(form.pensionCola, yearsToRetirement);
  const salaryFactor = getEscalationFactor(form.futureSalaryIncrease, yearsToRetirement);
  const savingsFactor = getEscalationFactor(form.rateOfReturn, yearsToRetirement);
  const incomeReplacementRatio = form.percentIncomeNeeded / 100;

  const targetIncomeNow = form.currentAnnualSalary * incomeReplacementRatio;
  const targetIncomeAtRetirement = form.currentAnnualSalary * salaryFactor * incomeReplacementRatio;

  const federalRetirementNow = form.federalRetirement;
  const socialSecurityNow = form.socialSecurity;
  const otherPensionsNow = form.otherPensions;

  const federalRetirementAtRetirement = federalRetirementNow * inflationFactor;
  const socialSecurityAtRetirement = socialSecurityNow * inflationFactor;
  const otherPensionsAtRetirement = otherPensionsNow * inflationFactor;

  const shortfallNow = Math.max(targetIncomeNow - (federalRetirementNow + socialSecurityNow + otherPensionsNow), 0);
  const shortfallAtRetirement = Math.max(targetIncomeAtRetirement - (federalRetirementAtRetirement + socialSecurityAtRetirement + otherPensionsAtRetirement), 0);

  const growingAnnuityFactor = getGrowingAnnuityFactor(form.rateOfReturn, form.pensionCola, form.yearsInRetirement);
  const totalProjectedShortfall = shortfallAtRetirement * growingAnnuityFactor;
  const currentSavingsAtRetirement = form.currentSavings * savingsFactor;
  const additionalSavingsNeeded = Math.max(totalProjectedShortfall - currentSavingsAtRetirement, 0);

  const annualSavingsFactor = yearsToRetirement <= 0
    ? 0
    : Math.abs(form.rateOfReturn) < 0.000001
      ? yearsToRetirement
      : (Math.pow(1 + form.rateOfReturn / 100, yearsToRetirement) - 1) / (form.rateOfReturn / 100);
  const annualSavingsNeeded = additionalSavingsNeeded > 0 && annualSavingsFactor > 0
    ? additionalSavingsNeeded / annualSavingsFactor
    : 0;
  const percentOfSalaryToSave = form.currentAnnualSalary > 0 ? (annualSavingsNeeded / form.currentAnnualSalary) * 100 : 0;

  return {
    yearsToRetirement,
    targetIncomeNow,
    targetIncomeAtRetirement,
    federalRetirementNow,
    federalRetirementAtRetirement,
    socialSecurityNow,
    socialSecurityAtRetirement,
    otherPensionsNow,
    otherPensionsAtRetirement,
    shortfallNow,
    shortfallAtRetirement,
    totalProjectedShortfall,
    currentSavingsAtRetirement,
    additionalSavingsNeeded,
    annualSavingsNeeded,
    percentOfSalaryToSave,
  };
}

export function RetirementGapCalculator({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<GapForm>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailForm, setEmailForm] = useState<EmailForm>({ email: '', confirmEmail: '' });
  const results = useMemo(() => calculateGapResults(form), [form]);

  const setField = (field: keyof GapForm, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validateStep = (stepToValidate: number) => {
    const nextErrors: Record<string, string> = {};

    if (stepToValidate === 1) {
      if (!form.plannedRetirementDate) nextErrors.plannedRetirementDate = 'Planned Retirement date is required.';
      if (Number(form.currentAnnualSalary) <= 0) nextErrors.currentAnnualSalary = 'Current Annual Salary is required.';
      if (Number(form.percentIncomeNeeded) <= 0) nextErrors.percentIncomeNeeded = 'Percent of Current Income Needed in Retirement is required.';
      if (Number(form.futureSalaryIncrease) < 0) nextErrors.futureSalaryIncrease = 'Estimated Future Annual Salary Increases cannot be negative.';
      if (Number(form.currentSavings) < 0) nextErrors.currentSavings = 'Current Savings cannot be negative.';
      if (Number(form.rateOfReturn) < 0) nextErrors.rateOfReturn = 'Estimated Rate of Return on Savings cannot be negative.';
      if (Number(form.federalRetirement) < 0) nextErrors.federalRetirement = 'FERS or CSRS Annuity cannot be negative.';
      if (Number(form.socialSecurity) < 0) nextErrors.socialSecurity = 'Social Security cannot be negative.';
      if (Number(form.otherPensions) < 0) nextErrors.otherPensions = 'Other Pension(s) cannot be negative.';
      if (Number(form.pensionCola) < 0) nextErrors.pensionCola = 'Estimated Pension Cost of Living Increases cannot be negative.';
      if (Number(form.yearsInRetirement) <= 0) nextErrors.yearsInRetirement = 'Number of Years in Retirement is required.';
    }

    if (stepToValidate === 3) {
      if (!emailForm.email) nextErrors.email = 'Email address is required.';
      if (!emailForm.confirmEmail) nextErrors.confirmEmail = 'Please confirm your email address.';
      if (emailForm.email && emailForm.confirmEmail && emailForm.email !== emailForm.confirmEmail) {
        nextErrors.confirmEmail = 'Email addresses must match.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCalculate = () => {
    if (!validateStep(1)) return;
    setStep(2);
  };

  const handleSend = () => {
    if (!validateStep(3)) return;
    alert(`Report sent to ${emailForm.email}`);
  };

  const handlePrint = () => window.print();

  return (
    <div className="animate-in fade-in duration-300">
      <main className="max-w-[1100px] mx-auto px-6 pb-20 pt-12">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-2 mb-8 cursor-pointer bg-none border-none p-0 font-sans transition-colors duration-120 hover:text-blue">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5"><path d="M10 3L5 8l5 5" /></svg>
          All Calculators
        </button>

        <h1 className="font-serif text-4xl font-normal text-text mb-3">Retirement Savings GAP Calculator</h1>
        <p className="text-text-2 text-sm mb-8">Focused three-step retirement income gap analysis with required savings assumptions, legacy-style shortfall reporting, and email delivery controls.</p>

        <div className="flex items-center justify-between gap-2 mb-8 overflow-x-auto pb-2">
          {STEP_TITLES.map((label, index) => {
            const stepNumber = index + 1;
            return (
              <div key={label} className="flex items-center min-w-fit">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === stepNumber ? 'bg-blue text-white' : step > stepNumber ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step > stepNumber ? '✓' : stepNumber}
                </div>
                <span className="ml-2 mr-3 text-xs text-text-2 whitespace-nowrap">{label}</span>
                {stepNumber < STEP_TITLES.length && <div className={`w-6 sm:w-10 h-1 rounded ${step > stepNumber ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
          {step === 1 && (
            <div className="p-8 space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-2">Savings and Rate Assumptions</h2>
                <p className="text-text-2 text-sm">Complete all required inputs below to anchor the retirement timeline, project income replacement needs, estimate pension growth, and determine whether additional savings are needed to close the gap.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Planned Retirement date *"><input type="date" value={form.plannedRetirementDate} onChange={(e) => setField('plannedRetirementDate', e.target.value)} className={inputClass(errors.plannedRetirementDate)} />{errors.plannedRetirementDate && <ErrorText>{errors.plannedRetirementDate}</ErrorText>}</Field>
                <Field label="Current Annual Salary *"><input type="number" min="0" value={form.currentAnnualSalary} onChange={(e) => setField('currentAnnualSalary', Number(e.target.value))} className={inputClass(errors.currentAnnualSalary)} />{errors.currentAnnualSalary && <ErrorText>{errors.currentAnnualSalary}</ErrorText>}</Field>
                <Field label="Percent of Current Income Needed in Retirement *"><input type="number" min="0" step="0.1" value={form.percentIncomeNeeded} onChange={(e) => setField('percentIncomeNeeded', Number(e.target.value))} className={inputClass(errors.percentIncomeNeeded)} />{errors.percentIncomeNeeded && <ErrorText>{errors.percentIncomeNeeded}</ErrorText>}</Field>
                <Field label="Estimated Future Annual Salary Increases *"><input type="number" min="0" step="0.1" value={form.futureSalaryIncrease} onChange={(e) => setField('futureSalaryIncrease', Number(e.target.value))} className={inputClass(errors.futureSalaryIncrease)} />{errors.futureSalaryIncrease && <ErrorText>{errors.futureSalaryIncrease}</ErrorText>}</Field>
                <Field label="Current Savings *"><input type="number" min="0" step="0.01" value={form.currentSavings} onChange={(e) => setField('currentSavings', Number(e.target.value))} className={inputClass(errors.currentSavings)} />{errors.currentSavings && <ErrorText>{errors.currentSavings}</ErrorText>}</Field>
                <Field label="Estimated Rate of Return on Savings *"><input type="number" min="0" step="0.1" value={form.rateOfReturn} onChange={(e) => setField('rateOfReturn', Number(e.target.value))} className={inputClass(errors.rateOfReturn)} />{errors.rateOfReturn && <ErrorText>{errors.rateOfReturn}</ErrorText>}</Field>
                <Field label="FERS or CSRS Annuity (annual) *"><input type="number" min="0" step="0.01" value={form.federalRetirement} onChange={(e) => setField('federalRetirement', Number(e.target.value))} className={inputClass(errors.federalRetirement)} />{errors.federalRetirement && <ErrorText>{errors.federalRetirement}</ErrorText>}</Field>
                <Field label="Social Security (annual) *"><input type="number" min="0" step="0.01" value={form.socialSecurity} onChange={(e) => setField('socialSecurity', Number(e.target.value))} className={inputClass(errors.socialSecurity)} />{errors.socialSecurity && <ErrorText>{errors.socialSecurity}</ErrorText>}</Field>
                <Field label="Other Pension(s) *"><input type="number" min="0" step="0.01" value={form.otherPensions} onChange={(e) => setField('otherPensions', Number(e.target.value))} className={inputClass(errors.otherPensions)} />{errors.otherPensions && <ErrorText>{errors.otherPensions}</ErrorText>}</Field>
                <Field label="Estimated Pension Cost of Living Increases *"><input type="number" min="0" step="0.1" value={form.pensionCola} onChange={(e) => setField('pensionCola', Number(e.target.value))} className={inputClass(errors.pensionCola)} />{errors.pensionCola && <ErrorText>{errors.pensionCola}</ErrorText>}</Field>
                <Field label="Number of Years in Retirement *"><input type="number" min="1" step="1" value={form.yearsInRetirement} onChange={(e) => setField('yearsInRetirement', Number(e.target.value))} className={inputClass(errors.yearsInRetirement)} />{errors.yearsInRetirement && <ErrorText>{errors.yearsInRetirement}</ErrorText>}</Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-8 space-y-8 bg-gray-50">
              <div className="bg-white p-8 border border-border rounded-lg shadow-sm space-y-8">
                <div>
                  <h2 className="text-2xl font-serif text-blue mb-2">Retirement Savings GAP Results</h2>
                  <p className="text-text-2 text-sm">Comparison of your retirement income target versus projected income sources in both current dollars and retirement-year dollars, followed by the savings required to close the full gap.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ResultCard label="Total Projected Shortfall" value={currency(results.totalProjectedShortfall)} />
                  <ResultCard label="Additional Savings Needed" value={currency(results.additionalSavingsNeeded)} />
                  <ResultCard label="Annual Savings Needed Until Retirement" value={currency(results.annualSavingsNeeded)} />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border border-border rounded-md overflow-hidden bg-white">
                    <thead className="text-xs text-text-2 bg-gray-50 uppercase">
                      <tr>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Now</th>
                        <th className="px-4 py-3">At Retirement</th>
                      </tr>
                    </thead>
                    <tbody>
                      <ComparisonRow label="Target Retirement Income" nowValue={currency(results.targetIncomeNow)} retirementValue={currency(results.targetIncomeAtRetirement)} strong />
                      <ComparisonRow label="Federal Retirement" nowValue={currency(results.federalRetirementNow)} retirementValue={currency(results.federalRetirementAtRetirement)} />
                      <ComparisonRow label="Social Security" nowValue={currency(results.socialSecurityNow)} retirementValue={currency(results.socialSecurityAtRetirement)} />
                      <ComparisonRow label="Other Pensions" nowValue={currency(results.otherPensionsNow)} retirementValue={currency(results.otherPensionsAtRetirement)} />
                      <ComparisonRow label="Shortfall" nowValue={currency(results.shortfallNow)} retirementValue={currency(results.shortfallAtRetirement)} strong />
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-border rounded-md p-5 bg-[#FCFCFD] space-y-3">
                    <h3 className="font-semibold text-text">Gap Summary</h3>
                    <SummaryLine label="Total Projected Shortfall for all retirement years" value={currency(results.totalProjectedShortfall)} />
                    <SummaryLine label="Projected value of Current Savings at retirement" value={currency(results.currentSavingsAtRetirement)} />
                    <SummaryLine label="Additional Savings Needed" value={currency(results.additionalSavingsNeeded)} emphasize />
                    <SummaryLine label="Annual Savings Needed Until Retirement" value={currency(results.annualSavingsNeeded)} />
                    <SummaryLine label="Percent of Annual Salary to Save" value={percent(results.percentOfSalaryToSave)} />
                  </div>
                  <div className="border border-border rounded-md p-5 bg-[#FCFCFD] space-y-3">
                    <h3 className="font-semibold text-text">Supporting Assumptions</h3>
                    <SummaryLine label="Planned Retirement date" value={form.plannedRetirementDate || '—'} />
                    <SummaryLine label="Years to retirement" value={results.yearsToRetirement.toFixed(1)} />
                    <SummaryLine label="Inflation / pension COLA" value={percent(form.pensionCola)} />
                    <SummaryLine label="Investment return" value={percent(form.rateOfReturn)} />
                    <SummaryLine label="Years in retirement" value={`${form.yearsInRetirement}`} />
                    <p className="text-xs text-text-3 pt-2">Current salary grows using the future salary increase assumption through retirement. Pension income streams grow using the pension cost-of-living increase assumption, and current savings are compounded using the estimated rate of return on savings.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-8 max-w-lg mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-serif mb-4">Email Report</h2>
                <p className="text-text-2 text-sm">Enter and confirm your email address to receive your personalized retirement gap analysis. Use the printer-friendly option below for an offline copy of the report.</p>
              </div>
              <Field label="Email address *"><input type="email" value={emailForm.email} onChange={(e) => setEmailForm((current) => ({ ...current, email: e.target.value }))} className={inputClass(errors.email)} />{errors.email && <ErrorText>{errors.email}</ErrorText>}</Field>
              <Field label="Confirm email address *"><input type="email" value={emailForm.confirmEmail} onChange={(e) => setEmailForm((current) => ({ ...current, confirmEmail: e.target.value }))} className={inputClass(errors.confirmEmail)} />{errors.confirmEmail && <ErrorText>{errors.confirmEmail}</ErrorText>}</Field>
              <div className="space-y-3">
                <button onClick={handleSend} className="w-full px-6 py-3 bg-blue text-white rounded-md font-semibold hover:bg-blue-hover transition-colors">Send it!</button>
                <button onClick={handlePrint} className="w-full px-6 py-3 bg-white border border-border text-text rounded-md font-semibold hover:bg-gray-50 transition-colors">Printer-Friendly Report</button>
                <button onClick={() => setStep(2)} className="w-full text-text-2 font-medium hover:text-text transition-colors">Back to Results</button>
              </div>
            </div>
          )}

          <div className="p-6 bg-gray-50 border-t border-border flex justify-between items-center">
            <button onClick={() => { setErrors({}); setStep((current) => Math.max(1, current - 1)); }} disabled={step === 1} className="px-6 py-2.5 text-sm font-semibold text-text-2 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            {step === 1 && <button onClick={handleCalculate} className="px-6 py-2.5 text-sm font-semibold text-white bg-blue hover:bg-blue-hover rounded-md transition-colors shadow-sm">Run Calculation</button>}
            {step === 2 && <div className="flex gap-3"><button onClick={() => setStep(3)} className="px-6 py-2.5 text-sm font-semibold text-white bg-blue hover:bg-blue-hover rounded-md transition-colors shadow-sm">Email Report</button><button onClick={handlePrint} className="px-6 py-2.5 text-sm font-semibold bg-white border border-border text-text rounded-md hover:bg-gray-50 transition-colors shadow-sm">Printer-Friendly Report</button></div>}
            {step === 3 && <button onClick={handleSend} className="px-6 py-2.5 text-sm font-semibold text-white bg-blue hover:bg-blue-hover rounded-md transition-colors shadow-sm">Send it!</button>}
          </div>
        </div>
      </main>
    </div>
  );
}

function inputClass(hasError?: string) {
  return `w-full p-2.5 border ${hasError ? 'border-red-500' : 'border-border'} rounded-md`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-semibold text-text-2 mb-2">{label}</label>{children}</div>;
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="text-red-500 text-xs mt-1">{children}</p>;
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return <div className="bg-blue-50 rounded-md p-4"><div className="text-xs uppercase tracking-wide text-text-3 mb-2">{label}</div><div className="text-2xl font-mono text-blue">{value}</div></div>;
}

function ComparisonRow({ label, nowValue, retirementValue, strong = false }: { label: string; nowValue: string; retirementValue: string; strong?: boolean }) {
  return (
    <tr className="border-t border-border">
      <td className={`px-4 py-3 ${strong ? 'font-semibold text-blue' : ''}`}>{label}</td>
      <td className={`px-4 py-3 ${strong ? 'font-semibold text-blue' : ''}`}>{nowValue}</td>
      <td className={`px-4 py-3 ${strong ? 'font-semibold text-blue' : ''}`}>{retirementValue}</td>
    </tr>
  );
}

function SummaryLine({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-text-2">{label}</span>
      <span className={`text-right font-mono ${emphasize ? 'text-blue font-semibold' : 'text-text'}`}>{value}</span>
    </div>
  );
}
