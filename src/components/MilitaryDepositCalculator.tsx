import React, { useMemo, useState } from 'react';
import { FedEmployee, fedcalcApi } from '../services/fedcalcApi';
import { openBrandedPrintReport } from '../utils/reportPrint';

type RetirementSystem = 'FERS' | 'CSRS' | 'CSRS Offset' | 'Other';
type FormData = {
  simplifiedBalance: string;
  anniversaryDate: string;
  retirementSystem: RetirementSystem;
  civilianEmploymentDate: string;
  totalMilitaryEarnings: string;
  earnings1999: string;
  earnings2000: string;
  userraDeductionEquivalent: string;
};

type ReportData = {
  accrualDate: string;
  principal: number;
  interest: number;
  balance: number;
  priorBalanceDue: number;
  mode: 'simplified' | 'full';
};

const STEP_TITLES = ['Collect Information', 'Military Deposits Calculator', 'Email Report'];
const RETIREMENT_SYSTEMS: RetirementSystem[] = ['FERS', 'CSRS', 'CSRS Offset', 'Other'];
const CURRENCY = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const INITIAL_FORM: FormData = {
  simplifiedBalance: '',
  anniversaryDate: '',
  retirementSystem: 'FERS',
  civilianEmploymentDate: '',
  totalMilitaryEarnings: '',
  earnings1999: '',
  earnings2000: '',
  userraDeductionEquivalent: '',
};

function formatCurrency(value: number) {
  return CURRENCY.format(Number.isFinite(value) ? value : 0);
}

function parseAmount(value: string) {
  return Number(value || 0);
}

function isPositive(value: string) {
  return Number(value) > 0;
}

function addOneYear(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
}

function calculateFallbackReport(formData: FormData): ReportData {
  const simplified = isPositive(formData.simplifiedBalance) && !!formData.anniversaryDate;
  if (simplified) {
    const principal = parseAmount(formData.simplifiedBalance);
    const interest = principal * 0.03;
    return {
      accrualDate: addOneYear(formData.anniversaryDate),
      principal,
      interest,
      balance: principal + interest,
      priorBalanceDue: principal,
      mode: 'simplified',
    };
  }

  const totalMilitaryEarnings = parseAmount(formData.totalMilitaryEarnings);
  const earnings1999 = parseAmount(formData.earnings1999);
  const earnings2000 = parseAmount(formData.earnings2000);
  const userraEquivalent = parseAmount(formData.userraDeductionEquivalent);
  const principalBase = totalMilitaryEarnings * 0.03;
  const historicalInterest = earnings1999 * 0.02875 + earnings2000 * 0.0325;
  const userraCredit = userraEquivalent > 0 ? userraEquivalent : 0;
  const principal = Math.max(principalBase - userraCredit, 0);
  const interest = Math.max(principal * 0.03 + historicalInterest, 0);
  return {
    accrualDate: formData.civilianEmploymentDate || '',
    principal,
    interest,
    balance: principal + interest,
    priorBalanceDue: principal,
    mode: 'full',
  };
}

function mapMilitaryResults(result: any, fallback: ReportData): ReportData {
  const raw = result?.military || result?.rawResponse || {};
  return {
    accrualDate: raw.interestAccrualDate || raw.InterestAccrualDate || fallback.accrualDate,
    principal: Number(raw.principal || raw.Principal || fallback.principal),
    interest: Number(raw.interest || raw.Interest || fallback.interest),
    balance: Number(raw.balance || raw.Balance || fallback.balance),
    priorBalanceDue: Number(raw.priorBalanceDue || raw.PriorBalanceDue || fallback.priorBalanceDue),
    mode: fallback.mode,
  };
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-3 mb-2">{label}</p>
      <p className="text-2xl font-mono text-text">{value}</p>
    </div>
  );
}

export function MilitaryDepositCalculator({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [emailData, setEmailData] = useState({ email: '', confirmEmail: '' });
  const [emailErrors, setEmailErrors] = useState<Record<string, string>>({});

  const isSimplifiedPath = useMemo(() => isPositive(formData.simplifiedBalance) || !!formData.anniversaryDate, [formData.simplifiedBalance, formData.anniversaryDate]);

  const setField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (isSimplifiedPath) {
      if (!isPositive(formData.simplifiedBalance)) nextErrors.simplifiedBalance = 'Current Balance is required for the simplified interest check.';
      if (!formData.anniversaryDate) nextErrors.anniversaryDate = 'Anniversary Date is required for the simplified interest check.';
      setErrors(nextErrors);
      return Object.keys(nextErrors).length === 0;
    }

    if (!formData.retirementSystem) nextErrors.retirementSystem = 'Retirement System is required.';
    if (!formData.civilianEmploymentDate) nextErrors.civilianEmploymentDate = 'Start Date of Civilian Employment is required.';
    if (!isPositive(formData.totalMilitaryEarnings)) nextErrors.totalMilitaryEarnings = 'Total Amount of Military Earnings is required.';
    if (formData.earnings1999 && Number(formData.earnings1999) < 0) nextErrors.earnings1999 = '1999 earnings cannot be negative.';
    if (formData.earnings2000 && Number(formData.earnings2000) < 0) nextErrors.earnings2000 = '2000 earnings cannot be negative.';
    if (formData.userraDeductionEquivalent && Number(formData.userraDeductionEquivalent) < 0) nextErrors.userraDeductionEquivalent = 'USERRA amount cannot be negative.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateEmail = () => {
    const nextErrors: Record<string, string> = {};
    if (!emailData.email) nextErrors.email = 'Email is required.';
    if (!emailData.confirmEmail) nextErrors.confirmEmail = 'Please confirm your email address.';
    if (emailData.email && emailData.confirmEmail && emailData.email !== emailData.confirmEmail) {
      nextErrors.confirmEmail = 'Email addresses must match.';
    }
    setEmailErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCalculate = async () => {
    if (!validateForm()) return;

    setIsCalculating(true);
    setApiError(null);
    const fallback = calculateFallbackReport(formData);

    try {
      const payload: Partial<FedEmployee> = {
        bCSRS: formData.retirementSystem === 'FERS' ? 'N' : 'Y',
        dateServiceComp: formData.civilianEmploymentDate,
        dateAnniversaryDate: formData.anniversaryDate,
        fCurBalance: parseAmount(formData.simplifiedBalance),
        fTotEarnings: parseAmount(formData.totalMilitaryEarnings),
        fEarnings1999: parseAmount(formData.earnings1999),
        fEarnings2000: parseAmount(formData.earnings2000),
        fCivilEarnings: parseAmount(formData.userraDeductionEquivalent),
      };
      const apiResults = await fedcalcApi.calculateRetirement(payload, 'military');
      setReportData(mapMilitaryResults(apiResults, fallback));
      setStep(2);
    } catch (error) {
      setReportData(fallback);
      setApiError(error instanceof Error ? error.message : 'Unable to contact the calculation service. Showing the client-side estimate instead.');
      setStep(2);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSend = () => {
    if (!validateEmail()) return;
    alert(`Report sent to ${emailData.email}`);
  };

  const handlePrint = () => openBrandedPrintReport({
    title: 'Military Deposits Calculator',
    subtitle: 'Friendly printer version of your military deposit report.',
    sections: [
      {
        title: 'Input Summary',
        lines: [
          { label: 'Calculation Mode', value: reportData?.mode === 'simplified' ? 'Simplified interest check' : 'Full military deposit calculation' },
          { label: 'Retirement System', value: formData.retirementSystem },
          { label: 'Civilian Employment Date', value: formData.civilianEmploymentDate || 'N/A' },
          { label: 'Anniversary Date', value: formData.anniversaryDate || 'N/A' },
          { label: 'Current Balance', value: formatCurrency(parseAmount(formData.simplifiedBalance)) },
          { label: 'Total Military Earnings', value: formatCurrency(parseAmount(formData.totalMilitaryEarnings)) },
          { label: '1999 Earnings', value: formatCurrency(parseAmount(formData.earnings1999)) },
          { label: '2000 Earnings', value: formatCurrency(parseAmount(formData.earnings2000)) },
          { label: 'USERRA Deduction Equivalent', value: formatCurrency(parseAmount(formData.userraDeductionEquivalent)) },
        ],
      },
      {
        title: 'Deposit Summary',
        lines: [
          { label: 'Interest Accrual Date', value: reportData?.accrualDate || 'N/A' },
          { label: 'Principal Amount', value: formatCurrency(reportData?.principal || 0) },
          { label: 'Calculated Interest', value: formatCurrency(reportData?.interest || 0) },
          { label: 'Total Balance', value: formatCurrency(reportData?.balance || 0) },
          { label: 'Prior Balance Due', value: formatCurrency(reportData?.priorBalanceDue || 0) },
        ],
      },
    ],
  });

  return (
    <div className="animate-in fade-in duration-300">
      <main className="max-w-[980px] mx-auto px-6 pb-20 pt-12">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-2 mb-8 cursor-pointer bg-none border-none p-0 font-sans transition-colors duration-120 hover:text-blue">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5"><path d="M10 3L5 8l5 5" /></svg>
          All Calculators
        </button>

        <h1 className="font-serif text-4xl font-normal text-text mb-3">Military Deposits Calculator</h1>
        <p className="text-text-2 text-sm mb-8">Three-step military deposit workflow with a simplified one-year interest check, a full deposit calculation path, results summary, email delivery, and printer-friendly output.</p>

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
                <h2 className="text-xl font-semibold mb-2">Collect Information</h2>
                <p className="text-text-2 text-sm">Choose either the simplified one-year interest estimate or complete the full military deposit inputs below. Both paths feed the same reporting outcome, but the simplified section only needs the balance and anniversary date.</p>
              </div>

              <section className="rounded-lg border border-blue/20 bg-[#F7FAFF] p-6 space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-text mb-1">Simplified interest check</h3>
                  <p className="text-sm text-text-2">Use this section only if you want to calculate one year of interest. If you complete this path, the remaining sections below are not required.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-text-2 mb-2">Current Balance (prior to anniversary date) <span className="text-red-500">*</span></label>
                    <input type="number" min="0" value={formData.simplifiedBalance} onChange={(e) => setField('simplifiedBalance', e.target.value)} className={`w-full p-2.5 border ${errors.simplifiedBalance ? 'border-red-500' : 'border-border'} rounded-md`} />
                    {errors.simplifiedBalance && <p className="text-red-500 text-xs mt-1">{errors.simplifiedBalance}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-2 mb-2">Anniversary Date <span className="text-red-500">*</span></label>
                    <input type="date" value={formData.anniversaryDate} onChange={(e) => setField('anniversaryDate', e.target.value)} className={`w-full p-2.5 border ${errors.anniversaryDate ? 'border-red-500' : 'border-border'} rounded-md`} />
                    <p className="text-xs text-text-3 mt-2">Accepted formats in the legacy workflow are month/day/year; this date picker stores the same value in YYYY-MM-DD format.</p>
                    {errors.anniversaryDate && <p className="text-red-500 text-xs mt-1">{errors.anniversaryDate}</p>}
                  </div>
                </div>
              </section>

              <section className="space-y-6 border-t border-border pt-8">
                <div>
                  <h3 className="text-lg font-semibold text-text mb-1">Full military deposit calculation</h3>
                  <p className="text-sm text-text-2">If you skip the simplified interest check, complete the required fields below to calculate the full military deposit balance with interest.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-text-2 mb-2">Retirement System <span className="text-red-500">*</span></label>
                    <select value={formData.retirementSystem} onChange={(e) => setField('retirementSystem', e.target.value)} className={`w-full p-2.5 border ${errors.retirementSystem ? 'border-red-500' : 'border-border'} rounded-md`}>
                      {RETIREMENT_SYSTEMS.map((system) => <option key={system} value={system}>{system}</option>)}
                    </select>
                    {errors.retirementSystem && <p className="text-red-500 text-xs mt-1">{errors.retirementSystem}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-2 mb-2">Start Date of Civilian Employment <span className="text-red-500">*</span></label>
                    <input type="date" value={formData.civilianEmploymentDate} onChange={(e) => setField('civilianEmploymentDate', e.target.value)} className={`w-full p-2.5 border ${errors.civilianEmploymentDate ? 'border-red-500' : 'border-border'} rounded-md`} />
                    <p className="text-xs text-text-3 mt-2">Used to determine military deposit interest accrual timing.</p>
                    {errors.civilianEmploymentDate && <p className="text-red-500 text-xs mt-1">{errors.civilianEmploymentDate}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-text-2 mb-2">Total Amount of Military Earnings <span className="text-red-500">*</span></label>
                    <input type="number" min="0" value={formData.totalMilitaryEarnings} onChange={(e) => setField('totalMilitaryEarnings', e.target.value)} className={`w-full p-2.5 border ${errors.totalMilitaryEarnings ? 'border-red-500' : 'border-border'} rounded-md`} />
                    <p className="text-xs text-text-3 mt-2">Enter total basic military pay that was not subject to FICA. Refer to official documentation such as SF-2801-1 or RI 20-97 when available.</p>
                    {errors.totalMilitaryEarnings && <p className="text-red-500 text-xs mt-1">{errors.totalMilitaryEarnings}</p>}
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-bg p-6">
                  <h4 className="text-base font-semibold text-text mb-2">Special-case earnings for 1999 and 2000</h4>
                  <p className="text-sm text-text-2 mb-4">Complete these amounts when applicable to account for historical interest rule differences.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-text-2 mb-2">Military Earnings for 1999</label>
                      <input type="number" min="0" value={formData.earnings1999} onChange={(e) => setField('earnings1999', e.target.value)} className={`w-full p-2.5 border ${errors.earnings1999 ? 'border-red-500' : 'border-border'} rounded-md`} />
                      {errors.earnings1999 && <p className="text-red-500 text-xs mt-1">{errors.earnings1999}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-2 mb-2">Military Earnings for 2000</label>
                      <input type="number" min="0" value={formData.earnings2000} onChange={(e) => setField('earnings2000', e.target.value)} className={`w-full p-2.5 border ${errors.earnings2000 ? 'border-red-500' : 'border-border'} rounded-md`} />
                      {errors.earnings2000 && <p className="text-red-500 text-xs mt-1">{errors.earnings2000}</p>}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">USERRA (P.L. 103-353) civilian deduction equivalent</label>
                  <input type="number" min="0" value={formData.userraDeductionEquivalent} onChange={(e) => setField('userraDeductionEquivalent', e.target.value)} className={`w-full p-2.5 border ${errors.userraDeductionEquivalent ? 'border-red-500' : 'border-border'} rounded-md`} />
                  <p className="text-xs text-text-3 mt-2">Use this amount when military service interrupted civilian employment and you need to capture the retirement deductions that would have been withheld during the same period.</p>
                  {errors.userraDeductionEquivalent && <p className="text-red-500 text-xs mt-1">{errors.userraDeductionEquivalent}</p>}
                </div>
              </section>
            </div>
          )}

          {step === 2 && reportData && (
            <div className="p-8 bg-gray-50 space-y-6">
              <div className="bg-white p-8 border border-border rounded-lg shadow-sm space-y-6">
                <div>
                  <h2 className="text-2xl font-serif text-blue mb-2">Military Deposits Calculator</h2>
                  <p className="text-sm text-text-2">{reportData.mode === 'simplified' ? 'Single-year interest estimate based on your current prior-anniversary balance.' : 'Full military deposit estimate using the required earnings and civilian service inputs.'}</p>
                </div>

                {apiError && <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{apiError}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ResultCard label="Interest Accrual Date" value={reportData.accrualDate || '—'} />
                  <ResultCard label="Principal amount" value={formatCurrency(reportData.principal)} />
                  <ResultCard label="Calculated Interest" value={formatCurrency(reportData.interest)} />
                  <ResultCard label="Total Balance" value={formatCurrency(reportData.balance)} />
                </div>

                <div className="rounded-md border border-blue/20 bg-[#F7FAFF] p-4 text-sm text-text-2">
                  If payment is made before the accrual date, only the prior balance is due. Prior balance due: <span className="font-semibold text-text">{formatCurrency(reportData.priorBalanceDue)}</span>.
                </div>
              </div>

              <div className="flex justify-center">
                <button onClick={() => setStep(3)} className="px-6 py-3 bg-blue text-white rounded-md font-semibold hover:bg-blue-hover transition-colors">
                  Continue to Email Report
                </button>
              </div>
            </div>
          )}

          {step === 3 && reportData && (
            <div className="p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-serif mb-4">Email Report</h2>
              <p className="text-text-2 text-sm mb-6">Enter and confirm your email address to receive your personalized military deposit calculation.</p>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Your Email Address <span className="text-red-500">*</span></label>
                  <input type="email" value={emailData.email} onChange={(e) => setEmailData((prev) => ({ ...prev, email: e.target.value }))} className={`w-full p-2.5 border ${emailErrors.email ? 'border-red-500' : 'border-border'} rounded-md`} />
                  {emailErrors.email && <p className="text-red-500 text-xs mt-1">{emailErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Confirm Email Address <span className="text-red-500">*</span></label>
                  <input type="email" value={emailData.confirmEmail} onChange={(e) => setEmailData((prev) => ({ ...prev, confirmEmail: e.target.value }))} className={`w-full p-2.5 border ${emailErrors.confirmEmail ? 'border-red-500' : 'border-border'} rounded-md`} />
                  {emailErrors.confirmEmail && <p className="text-red-500 text-xs mt-1">{emailErrors.confirmEmail}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={handleSend} className="w-full px-6 py-3 bg-blue text-white rounded-md font-semibold hover:bg-blue-hover transition-colors">Send it!</button>
                <button onClick={handlePrint} className="w-full px-6 py-3 bg-white border border-border text-text rounded-md font-semibold hover:bg-gray-50 transition-colors">Friendly Printer Version</button>
                <button onClick={() => setStep(2)} className="w-full mt-2 px-6 py-3 text-text-2 font-medium hover:text-text transition-colors">Back to Results</button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-between gap-3">
          <button onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1 || isCalculating} className="px-5 py-2.5 border border-border rounded-md bg-white text-text font-medium disabled:opacity-50 disabled:cursor-not-allowed">Back</button>
          {step === 1 && <button onClick={handleCalculate} disabled={isCalculating} className="px-6 py-2.5 bg-blue text-white rounded-md font-semibold hover:bg-blue-hover disabled:opacity-70">{isCalculating ? 'Calculating...' : 'Calculate'}</button>}
        </div>
      </main>
    </div>
  );
}
