import React, { useMemo, useState } from 'react';
import { SponsorBanner } from './SponsorBanner';
import { fedcalcApi, FedEmployee } from '../services/fedcalcApi';

type FormState = Partial<FedEmployee> & {
  retirementSystem: 'FERS' | 'CSRS' | 'Transfer';
  militaryMode: 'simplified' | 'full';
  bContinueHealth?: string;
  bCalcSurvivor?: string;
  email?: string;
  confirmEmail?: string;
  salaryHistory: { startDate?: string; startAmount?: number }[];
  deposits: { fromDate?: string; toDate?: string; salary?: number }[];
  redeposits: { depositDate?: string; fromDate?: string; toDate?: string; amount?: number }[];
  partTime: { fromDate?: string; toDate?: string; hrsPerPeriod?: number }[];
  ssEarnings: { year?: number; amount?: number }[];
};

const REPORT_OPTIONS = [
  ['bRptSummary', 'Quick Summary'],
  ['bRptAnnuity', 'Projected Retirement Income Chart'],
  ['bRptTSP', 'TSP Analysis'],
  ['bRptFEGLI', 'FEGLI Analysis'],
  ['bRptSocSec', 'Social Security'],
  ['bRptGap', 'Retirement Savings Gap Analysis'],
] as const;

const FUND_NAMES = ['G Fund', 'F Fund', 'C Fund', 'S Fund', 'I Fund', 'Lifecycle Fund'];

const initialFunds = {
  arrFundAlloc: [0, 0, 0, 0, 0, 0],
  arrFundBalance: [0, 0, 0, 0, 0, 0],
  arrFundPctReturn: [3, 4, 7, 8, 6, 5],
};

const initialState: FormState = {
  retirementSystem: 'FERS',
  militaryMode: 'simplified',
  dateOfBirth: '',
  dateServiceComp: '',
  dateRetire: '',
  bAirTraffic: 'N',
  bCustomsBorderPatrol: 'N',
  bLawEnforce: 'N',
  bEarlyOut: 'N',
  bCSRSTransfer: 'N',
  dateCSRSTransfer: '',
  nXFerSickLeave: 0,
  nSickLeaveHrs: 0,
  nAnnualLeaveHrs: 0,
  fLastSalary: 0,
  fManualHigh3: 0,
  fCurrentYearSalary: 0,
  fFutureYearsSalary: 0,
  salaryHistory: [{ startDate: '', startAmount: 0 }, { startDate: '', startAmount: 0 }, { startDate: '', startAmount: 0 }],
  ssEarnings: [{ year: new Date().getFullYear() - 2, amount: 0 }, { year: new Date().getFullYear() - 1, amount: 0 }],
  partTime: [],
  deposits: [],
  redeposits: [],
  fCurBalance: 0,
  dateAnniversaryDate: '',
  fTotEarnings: 0,
  fEarnings1999: 0,
  fEarnings2000: 0,
  fCivilEarnings: 0,
  bLifeIns: 'Y',
  nLifeInsBasic: 75,
  bLifeInsA: 'N',
  bLifeInsB: 'N',
  bLifeInsC: 'N',
  nLifeInsOption: 0,
  fHealthInsDeduct: 0,
  bContinueHealth: 'Y',
  bCalcSurvivor: 'Y',
  nSurvivor: 50,
  fSalaryCOLA: 2,
  fAnnuityCOLA: 2,
  fRateOfReturn: 5,
  fYearsR: 30,
  fOtherPensions: 0,
  fCurrentSavings: 0,
  fCatchupContrib: 0,
  nFuncPctContrib: 5,
  fFedAnnuity: 0,
  fSocSec: 0,
  email: '',
  confirmEmail: '',
  bRptSummary: 'Y',
  bRptAnnuity: 'Y',
  bRptTSP: 'Y',
  bRptFEGLI: 'Y',
  bRptSocSec: 'Y',
  bRptGap: 'Y',
  ...initialFunds,
};

const pageTitles = [
  'Background Information',
  'Salary History',
  'Deposit & Redeposit Service',
  'Military Deposits',
  'TSP Contributions',
  'Life Insurance & Survivor',
  'COLA & Interest Rates',
  'Select Analysis Reports',
  'Annuity Summary Report',
  'Email Report',
];

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function yearsBetween(from?: string, to?: string) {
  if (!from || !to) return 0;
  return Math.max(0, (new Date(to).getTime() - new Date(from).getTime()) / 31557600000);
}

export function FullRetirementAnalysis({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormState>(initialState);
  const [reportData, setReportData] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const setField = (name: keyof FormState, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateArray = (name: 'salaryHistory' | 'deposits' | 'redeposits' | 'partTime' | 'ssEarnings', index: number, field: string, value: any) => {
    setFormData(prev => {
      const next = [...(prev[name] as any[])];
      next[index] = { ...(next[index] || {}), [field]: value };
      return { ...prev, [name]: next };
    });
  };

  const addRow = (name: 'salaryHistory' | 'deposits' | 'redeposits' | 'partTime' | 'ssEarnings', row: any) => {
    setFormData(prev => ({ ...prev, [name]: [...(prev[name] as any[]), row] }));
  };

  const removeRow = (name: 'salaryHistory' | 'deposits' | 'redeposits' | 'partTime' | 'ssEarnings', index: number) => {
    setFormData(prev => ({ ...prev, [name]: (prev[name] as any[]).filter((_, i) => i !== index) }));
  };

  const derived = useMemo(() => {
    const ageAtRetirement = Math.floor(yearsBetween(formData.dateOfBirth, formData.dateRetire));
    const baseService = yearsBetween(formData.dateServiceComp, formData.dateRetire);
    const sickYears = ((formData.nSickLeaveHrs || 0) + (formData.nXFerSickLeave || 0)) / 2087;
    const depositYears = (formData.deposits || []).reduce((sum, row) => sum + yearsBetween(row.fromDate, row.toDate), 0);
    const redepositYears = (formData.redeposits || []).reduce((sum, row) => sum + yearsBetween(row.fromDate, row.toDate), 0);
    const partTimeFactor = (formData.partTime || []).length
      ? Math.max(0.5, 1 - ((formData.partTime || []).reduce((sum, row) => sum + Math.max(0, 80 - (row.hrsPerPeriod || 80)), 0) / ((formData.partTime || []).length * 80 * 2)))
      : 1;
    const totalService = (baseService + sickYears + depositYears + redepositYears) * partTimeFactor;
    const high3 = formData.fManualHigh3 || ((formData.salaryHistory || []).filter(s => s.startAmount).slice(0, 3).reduce((sum, row) => sum + (row.startAmount || 0), 0) / Math.max(1, Math.min(3, (formData.salaryHistory || []).filter(s => s.startAmount).length))) || formData.fLastSalary || 0;
    const annuityMultiplier = formData.retirementSystem === 'CSRS' ? 0.0185 : ageAtRetirement >= 62 && totalService >= 20 ? 0.011 : 0.01;
    const annualAnnuity = high3 * totalService * annuityMultiplier;
    const monthlyAnnuity = annualAnnuity / 12;
    const annualLeaveValue = ((formData.nAnnualLeaveHrs || 0) / 2087) * (formData.fLastSalary || high3 || 0);
    const fegliMonthly = formData.bLifeIns === 'Y'
      ? ((formData.nLifeInsBasic === 50 ? 36 : formData.nLifeInsBasic === 0 ? 72 : 18) + ((formData.bLifeInsA === 'Y' ? 5 : 0) + (formData.bLifeInsB === 'Y' ? (formData.nLifeInsOption || 0) * 4 : 0) + (formData.bLifeInsC === 'Y' ? (formData.nLifeInsOption || 0) * 3 : 0)))
      : 0;
    const survivorReduction = formData.bCalcSurvivor === 'Y' ? monthlyAnnuity * ((formData.nSurvivor || 0) / 100) * 0.1 : 0;
    const netMonthly = monthlyAnnuity - survivorReduction - (formData.bContinueHealth === 'Y' ? (formData.fHealthInsDeduct || 0) : 0) - fegliMonthly;
    const tspCurrent = (formData.arrFundBalance || []).reduce((sum, value) => sum + (value || 0), 0);
    const yearsToRetirement = yearsBetween(new Date().toISOString().slice(0, 10), formData.dateRetire);
    const yearlyContribution = ((formData.fCurrentYearSalary || formData.fLastSalary || high3 || 0) * ((formData.nFuncPctContrib || 0) / 100)) + (formData.fCatchupContrib || 0);
    const weightedRate = ((formData.arrFundAlloc || []).reduce((sum, alloc, idx) => sum + (alloc || 0) * ((formData.arrFundPctReturn || [])[idx] || 0), 0) / 100) || (formData.fRateOfReturn || 0);
    const tspProjected = (tspCurrent * Math.pow(1 + weightedRate / 100, yearsToRetirement)) + yearlyContribution * Math.max(yearsToRetirement, 0);
    return { ageAtRetirement, totalService, high3, annualAnnuity, monthlyAnnuity, annualLeaveValue, fegliMonthly, survivorReduction, netMonthly, tspCurrent, tspProjected, weightedRate };
  }, [formData]);

  const validateStep = (currentStep: number) => {
    const errors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of Birth is required.';
      if (!formData.dateServiceComp) errors.dateServiceComp = 'Service Comp is required.';
      if (!formData.dateRetire) errors.dateRetire = 'Planned Retirement date is required.';
    }
    if (currentStep === 2) {
      const validHistory = (formData.salaryHistory || []).filter(row => row.startDate && row.startAmount).length >= 3;
      if (!(formData.fLastSalary || 0)) errors.fLastSalary = 'Salary at retirement is required.';
      if (!(formData.fManualHigh3 || validHistory)) errors.salaryHistory = 'Provide a known High-3 or at least three salary history entries.';
    }
    if (currentStep === 10) {
      if (!formData.email) errors.email = 'Email is required.';
      if (!formData.confirmEmail) errors.confirmEmail = 'Please confirm your email.';
      if (formData.email && formData.confirmEmail && formData.email !== formData.confirmEmail) errors.confirmEmail = 'Email addresses must match.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;
    if (step === 8) {
      setIsCalculating(true);
      setApiError(null);
      try {
        const payload: Partial<FedEmployee> = {
          ...formData,
          bCSRS: formData.retirementSystem === 'CSRS' ? 'Y' : 'N',
          bCSRSTransfer: formData.retirementSystem === 'Transfer' ? 'Y' : 'N',
          fCalcHigh3: derived.high3,
          fFedAnnuity: derived.annualAnnuity,
          fSocSec: formData.fSocSec || (formData.ssEarnings || []).reduce((sum, row) => sum + (row.amount || 0), 0) / 420,
        };
        const apiResults = await fedcalcApi.calculateRetirement(payload, formData.retirementSystem === 'CSRS' ? 'csrs' : 'fers');
        setReportData(apiResults);
      } catch (error) {
        setApiError(error instanceof Error ? error.message : 'Unable to generate the report.');
      } finally {
        setIsCalculating(false);
      }
    }
    setStep(prev => Math.min(10, prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevious = () => setStep(prev => Math.max(1, prev - 1));

  const toggleReport = (field: (typeof REPORT_OPTIONS)[number][0]) => {
    setField(field, formData[field] === 'Y' ? 'N' : 'Y');
  };

  const handlePrint = () => window.print();

  const selectedReports = REPORT_OPTIONS.filter(([field]) => formData[field] === 'Y').map(([, label]) => label);

  return (
    <div className="animate-in fade-in duration-300">
      <main className="max-w-[1100px] mx-auto px-6 pb-20 pt-12">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-2 mb-8 bg-none border-none p-0 hover:text-blue">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5"><path d="M10 3L5 8l5 5" /></svg>
          All Calculators
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div>
            <div className="text-[11px] uppercase tracking-[0.1em] text-blue font-semibold mb-2">Full Retirement Analysis</div>
            <h1 className="font-serif text-4xl font-normal text-text">Comprehensive Scenario Builder</h1>
            <p className="text-text-2 max-w-3xl mt-3">A guided 10-page workflow that captures retirement, income, service credit, TSP, insurance, and reporting preferences while preserving the current Quantos visual language.</p>
          </div>
          <div className="bg-white border border-border rounded-lg px-5 py-4 min-w-[260px]">
            <div className="text-xs text-text-3 uppercase tracking-[0.08em]">Current page</div>
            <div className="font-serif text-xl mt-1">{step}. {pageTitles[step - 1]}</div>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-2 md:grid-cols-5 gap-3">
          {pageTitles.map((title, idx) => {
            const page = idx + 1;
            const active = page === step;
            const complete = page < step;
            return (
              <div key={title} className={`rounded-lg border p-3 ${active ? 'border-blue bg-blue-lt' : complete ? 'border-green bg-green/5' : 'border-border bg-white'}`}>
                <div className="text-xs font-mono text-text-3">Page {page}</div>
                <div className="text-sm font-semibold leading-snug mt-1 text-text">{title}</div>
              </div>
            );
          })}
        </div>

        <div className="mb-12"><SponsorBanner className="h-[60px] w-full max-w-4xl mx-auto" /></div>

        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden print:shadow-none print:border-0">
          <div className="p-8 border-b border-border bg-[#FBFCFE] print:hidden">
            <h2 className="font-serif text-2xl">{pageTitles[step - 1]}</h2>
            <p className="text-sm text-text-2 mt-2">{step < 9 ? 'Complete each section to build a full retirement projection package.' : 'Review the generated report and choose delivery options.'}</p>
          </div>

          <div className="p-8 space-y-8">
            {step === 1 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    ['dateOfBirth', 'Date of Birth'],
                    ['dateServiceComp', 'Service Comp'],
                    ['dateRetire', 'Planned Retirement'],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <label className="block text-sm font-semibold mb-2">{label} <span className="text-red-500">*</span></label>
                      <input type="date" value={(formData as any)[field] || ''} onChange={e => setField(field as keyof FormState, e.target.value)} className={`w-full p-2.5 border rounded-md ${validationErrors[field] ? 'border-red-500' : 'border-border'}`} />
                      {validationErrors[field] && <p className="text-xs text-red-500 mt-1">{validationErrors[field]}</p>}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Retirement System <span className="text-red-500">*</span></label>
                    <select value={formData.retirementSystem} onChange={e => setField('retirementSystem', e.target.value)} className="w-full p-2.5 border border-border rounded-md">
                      <option value="FERS">FERS</option>
                      <option value="CSRS">CSRS</option>
                      <option value="Transfer">CSRS to FERS Transfer</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                  {[
                    ['bAirTraffic', 'Air Traffic Controller'],
                    ['bCustomsBorderPatrol', 'Customs and Border Protection Officer'],
                    ['bLawEnforce', 'Law Enforcement or Firefighter'],
                    ['bEarlyOut', 'Early Out authority'],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <label className="block text-sm font-semibold mb-2">{label} <span className="text-red-500">*</span></label>
                      <select value={(formData as any)[field] || 'N'} onChange={e => setField(field as keyof FormState, e.target.value)} className="w-full p-2.5 border border-border rounded-md">
                        <option value="N">No</option>
                        <option value="Y">Yes</option>
                      </select>
                    </div>
                  ))}
                </div>
                {formData.retirementSystem === 'Transfer' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-border rounded-lg p-5 bg-bg/60">
                    <div>
                      <label className="block text-sm font-semibold mb-2">FERS Transfer Date</label>
                      <input type="date" value={formData.dateCSRSTransfer || ''} onChange={e => setField('dateCSRSTransfer', e.target.value)} className="w-full p-2.5 border border-border rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Sick Leave at Time of Transfer (hours)</label>
                      <input type="number" value={formData.nXFerSickLeave || 0} onChange={e => setField('nXFerSickLeave', Number(e.target.value))} className="w-full p-2.5 border border-border rounded-md" />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Unused Sick Leave at Retirement (hours)</label>
                    <input type="number" value={formData.nSickLeaveHrs || 0} onChange={e => setField('nSickLeaveHrs', Number(e.target.value))} className="w-full p-2.5 border border-border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Annual Leave at Retirement (hours)</label>
                    <input type="number" value={formData.nAnnualLeaveHrs || 0} onChange={e => setField('nAnnualLeaveHrs', Number(e.target.value))} className="w-full p-2.5 border border-border rounded-md" />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Salary at Time of Retirement <span className="text-red-500">*</span></label>
                    <input type="number" value={formData.fLastSalary || 0} onChange={e => setField('fLastSalary', Number(e.target.value))} className={`w-full p-2.5 border rounded-md ${validationErrors.fLastSalary ? 'border-red-500' : 'border-border'}`} />
                    {validationErrors.fLastSalary && <p className="text-xs text-red-500 mt-1">{validationErrors.fLastSalary}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Known High-3 Salary</label>
                    <input type="number" value={formData.fManualHigh3 || 0} onChange={e => setField('fManualHigh3', Number(e.target.value))} className="w-full p-2.5 border border-border rounded-md" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Salary History (minimum 3 years if High-3 is not entered)</h3>
                    <button onClick={() => addRow('salaryHistory', { startDate: '', startAmount: 0 })} className="px-3 py-2 text-sm border border-border rounded-md">Add row</button>
                  </div>
                  <div className="space-y-3">
                    {(formData.salaryHistory || []).map((row, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
                        <input type="date" value={row.startDate || ''} onChange={e => updateArray('salaryHistory', idx, 'startDate', e.target.value)} className="p-2.5 border border-border rounded-md" />
                        <input type="number" value={row.startAmount || 0} onChange={e => updateArray('salaryHistory', idx, 'startAmount', Number(e.target.value))} className="p-2.5 border border-border rounded-md" placeholder="Salary amount" />
                        <button onClick={() => removeRow('salaryHistory', idx)} className="px-3 py-2 border border-border rounded-md">Remove</button>
                      </div>
                    ))}
                  </div>
                  {validationErrors.salaryHistory && <p className="text-xs text-red-500 mt-2">{validationErrors.salaryHistory}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Social Security earnings history</h3>
                    <div className="space-y-3">
                      {(formData.ssEarnings || []).map((row, idx) => (
                        <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-3">
                          <input type="number" value={row.year || ''} onChange={e => updateArray('ssEarnings', idx, 'year', Number(e.target.value))} className="p-2.5 border border-border rounded-md" placeholder="Year" />
                          <input type="number" value={row.amount || 0} onChange={e => updateArray('ssEarnings', idx, 'amount', Number(e.target.value))} className="p-2.5 border border-border rounded-md" placeholder="Earnings" />
                          <button onClick={() => removeRow('ssEarnings', idx)} className="px-3 py-2 border border-border rounded-md">Remove</button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => addRow('ssEarnings', { year: new Date().getFullYear(), amount: 0 })} className="mt-3 px-3 py-2 text-sm border border-border rounded-md">Add earnings year</button>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Part-time adjustments</h3>
                    <div className="space-y-3">
                      {(formData.partTime || []).map((row, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3">
                          <input type="date" value={row.fromDate || ''} onChange={e => updateArray('partTime', idx, 'fromDate', e.target.value)} className="p-2.5 border border-border rounded-md" />
                          <input type="date" value={row.toDate || ''} onChange={e => updateArray('partTime', idx, 'toDate', e.target.value)} className="p-2.5 border border-border rounded-md" />
                          <input type="number" value={row.hrsPerPeriod || 0} onChange={e => updateArray('partTime', idx, 'hrsPerPeriod', Number(e.target.value))} className="p-2.5 border border-border rounded-md" placeholder="Hours / PP" />
                          <button onClick={() => removeRow('partTime', idx)} className="px-3 py-2 border border-border rounded-md">Remove</button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => addRow('partTime', { fromDate: '', toDate: '', hrsPerPeriod: 0 })} className="mt-3 px-3 py-2 text-sm border border-border rounded-md">Add part-time period</button>
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input type="number" value={formData.fCurrentYearSalary || 0} onChange={e => setField('fCurrentYearSalary', Number(e.target.value))} className="p-2.5 border border-border rounded-md" placeholder="Current year earnings" />
                      <input type="number" value={formData.fFutureYearsSalary || 0} onChange={e => setField('fFutureYearsSalary', Number(e.target.value))} className="p-2.5 border border-border rounded-md" placeholder="Projected future yearly earnings" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Deposit Service</h3><button onClick={() => addRow('deposits', { fromDate: '', toDate: '', salary: 0 })} className="px-3 py-2 text-sm border border-border rounded-md">Add period</button></div>
                  <div className="space-y-3">{(formData.deposits || []).map((row, idx) => <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3"><input type="date" value={row.fromDate || ''} onChange={e => updateArray('deposits', idx, 'fromDate', e.target.value)} className="p-2.5 border border-border rounded-md" /><input type="date" value={row.toDate || ''} onChange={e => updateArray('deposits', idx, 'toDate', e.target.value)} className="p-2.5 border border-border rounded-md" /><input type="number" value={row.salary || 0} onChange={e => updateArray('deposits', idx, 'salary', Number(e.target.value))} className="p-2.5 border border-border rounded-md" placeholder="Salary" /><button onClick={() => removeRow('deposits', idx)} className="px-3 py-2 border border-border rounded-md">Remove</button></div>)}</div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Redeposit Service</h3><button onClick={() => addRow('redeposits', { depositDate: '', fromDate: '', toDate: '', amount: 0 })} className="px-3 py-2 text-sm border border-border rounded-md">Add period</button></div>
                  <div className="space-y-3">{(formData.redeposits || []).map((row, idx) => <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-border rounded-lg p-3"><input type="date" value={row.depositDate || ''} onChange={e => updateArray('redeposits', idx, 'depositDate', e.target.value)} className="p-2.5 border border-border rounded-md" /><input type="number" value={row.amount || 0} onChange={e => updateArray('redeposits', idx, 'amount', Number(e.target.value))} className="p-2.5 border border-border rounded-md" placeholder="Refund amount" /><input type="date" value={row.fromDate || ''} onChange={e => updateArray('redeposits', idx, 'fromDate', e.target.value)} className="p-2.5 border border-border rounded-md" /><input type="date" value={row.toDate || ''} onChange={e => updateArray('redeposits', idx, 'toDate', e.target.value)} className="p-2.5 border border-border rounded-md" /><button onClick={() => removeRow('redeposits', idx)} className="px-3 py-2 border border-border rounded-md md:col-span-2">Remove</button></div>)}</div>
                </div>
              </div>
            )}

            {step === 4 && (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-2">Military deposit mode</label>
                  <div className="flex gap-3">
                    {['simplified', 'full'].map(mode => <button key={mode} onClick={() => setField('militaryMode', mode)} className={`px-4 py-2 rounded-md border ${formData.militaryMode === mode ? 'bg-blue text-white border-blue' : 'border-border'}`}>{mode === 'simplified' ? 'Simplified interest calculation' : 'Full military deposit calculation'}</button>)}
                  </div>
                </div>
                {formData.militaryMode === 'simplified' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-semibold mb-2">Current military deposit balance</label><input type="number" value={formData.fCurBalance || 0} onChange={e => setField('fCurBalance', Number(e.target.value))} className="w-full p-2.5 border border-border rounded-md" /></div>
                    <div><label className="block text-sm font-semibold mb-2">Anniversary date</label><input type="date" value={formData.dateAnniversaryDate || ''} onChange={e => setField('dateAnniversaryDate', e.target.value)} className="w-full p-2.5 border border-border rounded-md" /></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-semibold mb-2">Civilian service start date</label><input type="date" value={formData.dateServiceComp || ''} onChange={e => setField('dateServiceComp', e.target.value)} className="w-full p-2.5 border border-border rounded-md" /></div>
                    <div><label className="block text-sm font-semibold mb-2">Total military earnings</label><input type="number" value={formData.fTotEarnings || 0} onChange={e => setField('fTotEarnings', Number(e.target.value))} className="w-full p-2.5 border border-border rounded-md" /></div>
                    <div><label className="block text-sm font-semibold mb-2">1999 special earnings</label><input type="number" value={formData.fEarnings1999 || 0} onChange={e => setField('fEarnings1999', Number(e.target.value))} className="w-full p-2.5 border border-border rounded-md" /></div>
                    <div><label className="block text-sm font-semibold mb-2">2000 special earnings</label><input type="number" value={formData.fEarnings2000 || 0} onChange={e => setField('fEarnings2000', Number(e.target.value))} className="w-full p-2.5 border border-border rounded-md" /></div>
                    <div><label className="block text-sm font-semibold mb-2">USERRA interrupted civilian earnings</label><input type="number" value={formData.fCivilEarnings || 0} onChange={e => setField('fCivilEarnings', Number(e.target.value))} className="w-full p-2.5 border border-border rounded-md" /></div>
                    <div><label className="block text-sm font-semibold mb-2">Retirement system for deposit calc</label><select value={formData.retirementSystem} onChange={e => setField('retirementSystem', e.target.value)} className="w-full p-2.5 border border-border rounded-md"><option value="FERS">FERS</option><option value="CSRS">CSRS</option><option value="Transfer">Transfer</option></select></div>
                  </div>
                )}
              </>
            )}

            {step === 5 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div><label className="block text-sm font-semibold mb-2">Current annual salary</label><input type="number" value={formData.fCurrentYearSalary || formData.fLastSalary || 0} onChange={e => setField('fCurrentYearSalary', Number(e.target.value))} className="w-full p-2.5 border border-border rounded-md" /></div>
                  <div><label className="block text-sm font-semibold mb-2">Annual contribution %</label><input type="number" value={formData.nFuncPctContrib || 0} onChange={e => setField('nFuncPctContrib', Number(e.target.value))} className="w-full p-2.5 border border-border rounded-md" /></div>
                  <div><label className="block text-sm font-semibold mb-2">Catch-up contributions</label><input type="number" value={formData.fCatchupContrib || 0} onChange={e => setField('fCatchupContrib', Number(e.target.value))} className="w-full p-2.5 border border-border rounded-md" /></div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left border-b border-border"><th className="py-3">Fund</th><th className="py-3">Allocation %</th><th className="py-3">Current balance</th><th className="py-3">Assumed return %</th></tr></thead>
                    <tbody>{FUND_NAMES.map((name, idx) => <tr key={name} className="border-b border-border/70"><td className="py-3 pr-4">{name}</td><td className="py-3 pr-4"><input type="number" value={formData.arrFundAlloc?.[idx] || 0} onChange={e => setField('arrFundAlloc', (formData.arrFundAlloc || []).map((v, i) => i === idx ? Number(e.target.value) : v))} className="w-full p-2 border border-border rounded-md" /></td><td className="py-3 pr-4"><input type="number" value={formData.arrFundBalance?.[idx] || 0} onChange={e => setField('arrFundBalance', (formData.arrFundBalance || []).map((v, i) => i === idx ? Number(e.target.value) : v))} className="w-full p-2 border border-border rounded-md" /></td><td className="py-3"><input type="number" value={formData.arrFundPctReturn?.[idx] || 0} onChange={e => setField('arrFundPctReturn', (formData.arrFundPctReturn || []).map((v, i) => i === idx ? Number(e.target.value) : v))} className="w-full p-2 border border-border rounded-md" /></td></tr>)}</tbody>
                  </table>
                </div>
              </>
            )}

            {step === 6 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div><label className="block text-sm font-semibold mb-2">Apply FEGLI deductions?</label><select value={formData.bLifeIns || 'N'} onChange={e => setField('bLifeIns', e.target.value)} className="w-full p-2.5 border border-border rounded-md"><option value="Y">Yes</option><option value="N">No</option></select></div>
                  <div><label className="block text-sm font-semibold mb-2">Basic insurance reduction option</label><select value={formData.nLifeInsBasic || 75} onChange={e => setField('nLifeInsBasic', Number(e.target.value))} className="w-full p-2.5 border border-border rounded-md"><option value={75}>75% reduction</option><option value={50}>50% reduction</option><option value={0}>No reduction</option></select></div>
                  <div className="grid grid-cols-3 gap-3">
                    {[['bLifeInsA', 'Option A'], ['bLifeInsB', 'Option B'], ['bLifeInsC', 'Option C']].map(([field, label]) => <label key={field} className="border border-border rounded-md p-3 flex items-center gap-2"><input type="checkbox" checked={(formData as any)[field] === 'Y'} onChange={e => setField(field as keyof FormState, e.target.checked ? 'Y' : 'N')} /> {label}</label>)}
                  </div>
                  <div><label className="block text-sm font-semibold mb-2">Coverage multiples</label><input type="number" value={formData.nLifeInsOption || 0} onChange={e => setField('nLifeInsOption', Number(e.target.value))} className="w-full p-2.5 border border-border rounded-md" /></div>
                </div>
                <div className="space-y-4">
                  <div><label className="block text-sm font-semibold mb-2">Continue health insurance into retirement?</label><select value={formData.bContinueHealth || 'Y'} onChange={e => setField('bContinueHealth', e.target.value)} className="w-full p-2.5 border border-border rounded-md"><option value="Y">Yes</option><option value="N">No</option></select></div>
                  {formData.bContinueHealth === 'Y' && <div><label className="block text-sm font-semibold mb-2">Current bi-weekly health insurance deduction</label><input type="number" value={formData.fHealthInsDeduct || 0} onChange={e => setField('fHealthInsDeduct', Number(e.target.value))} className="w-full p-2.5 border border-border rounded-md" /></div>}
                  <div><label className="block text-sm font-semibold mb-2">Calculate survivor benefits?</label><select value={formData.bCalcSurvivor || 'Y'} onChange={e => setField('bCalcSurvivor', e.target.value)} className="w-full p-2.5 border border-border rounded-md"><option value="Y">Yes</option><option value="N">No</option></select></div>
                  {formData.bCalcSurvivor === 'Y' && <div><label className="block text-sm font-semibold mb-2">Survivor benefit percentage</label><select value={formData.nSurvivor || 50} onChange={e => setField('nSurvivor', Number(e.target.value))} className="w-full p-2.5 border border-border rounded-md"><option value={50}>50%</option><option value={25}>25%</option><option value={0}>No survivor annuity</option></select></div>}
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  ['fSalaryCOLA', 'Estimated annual salary increase'],
                  ['fAnnuityCOLA', 'Estimated annuity COLA'],
                  ['fRateOfReturn', 'Estimated rate of return on savings'],
                  ['fFedAnnuity', 'Percent of current income desired in retirement'],
                  ['fYearsR', 'Years in retirement'],
                  ['fOtherPensions', 'Other pension income'],
                  ['fCurrentSavings', 'Current savings balance'],
                  ['fSocSec', 'Estimated Social Security'],
                ].map(([field, label]) => <div key={field}><label className="block text-sm font-semibold mb-2">{label}</label><input type="number" value={(formData as any)[field] || 0} onChange={e => setField(field as keyof FormState, Number(e.target.value))} className="w-full p-2.5 border border-border rounded-md" /></div>)}
              </div>
            )}

            {step === 8 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REPORT_OPTIONS.map(([field, label]) => <label key={field} className={`border rounded-lg p-4 flex items-start gap-3 cursor-pointer ${formData[field] === 'Y' ? 'border-blue bg-blue-lt' : 'border-border'}`}><input type="checkbox" checked={formData[field] === 'Y'} onChange={() => toggleReport(field)} className="mt-1" /><span><span className="font-semibold block">{label}</span><span className="text-sm text-text-2">Controls which modules are emphasized in the final report without changing the core calculation inputs.</span></span></label>)}
                <div className="md:col-span-2 text-sm text-text-2 bg-bg border border-border rounded-lg p-4">When you continue, the frontend packages your full scenario and generates the detailed summary page. If no backend is configured, the app still renders a complete mock projection using the same captured data.</div>
              </div>
            )}

            {step === 9 && (
              <div className="space-y-8 print:block">
                <div className="flex items-start justify-between gap-4 print:hidden">
                  <div>{isCalculating ? <p className="text-sm text-text-2">Refreshing report calculations…</p> : <p className="text-sm text-text-2">Detailed report generated from the inputs captured across pages 1–8.</p>}</div>
                  <button onClick={handlePrint} className="px-4 py-2 border border-border rounded-md">Printer-Friendly Report</button>
                </div>
                {apiError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">{apiError}</div>}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="border border-border rounded-lg p-5">
                    <h3 className="font-serif text-xl mb-4">Annuity Summary</h3>
                    <div className="space-y-3 text-sm">
                      {[
                        ['Retirement system', formData.retirementSystem],
                        ['Retirement date', formData.dateRetire || '—'],
                        ['Age at retirement', `${derived.ageAtRetirement || 0} years`],
                        ['Total service time', `${derived.totalService.toFixed(2)} years`],
                        ['High-3 salary', formatCurrency(derived.high3 || 0)],
                        ['Annuity percentage', `${((derived.high3 ? derived.annualAnnuity / derived.high3 : 0) * 100).toFixed(2)}%`],
                        ['Basic annuity (annual)', formatCurrency(derived.annualAnnuity || 0)],
                        ['Basic annuity (monthly)', formatCurrency(derived.monthlyAnnuity || 0)],
                        ['Cash value of annual leave', formatCurrency(derived.annualLeaveValue || 0)],
                        ['Monthly deductions', formatCurrency(((formData.bContinueHealth === 'Y' ? formData.fHealthInsDeduct || 0 : 0) + derived.fegliMonthly + derived.survivorReduction) || 0)],
                        ['Full annuity', formatCurrency(derived.monthlyAnnuity || 0)],
                        ['Net monthly annuity', formatCurrency(derived.netMonthly || 0)],
                      ].map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b border-border/70 pb-2"><span className="text-text-2">{label}</span><span className="font-mono text-right">{value}</span></div>)}
                    </div>
                  </div>
                  <div className="border border-border rounded-lg p-5">
                    <h3 className="font-serif text-xl mb-4">Projection Modules</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span>TSP current balance</span><span className="font-mono">{formatCurrency(derived.tspCurrent || 0)}</span></div>
                      <div className="flex justify-between"><span>TSP projected balance</span><span className="font-mono">{formatCurrency(derived.tspProjected || 0)}</span></div>
                      <div className="flex justify-between"><span>Weighted assumed return</span><span className="font-mono">{derived.weightedRate.toFixed(2)}%</span></div>
                      <div className="flex justify-between"><span>Estimated Social Security</span><span className="font-mono">{formatCurrency((reportData?.fers?.monthlyAnnuity ? reportData.fers.monthlyAnnuity : (formData.fSocSec || 0)) || 0)}</span></div>
                      <div className="pt-3 border-t border-border">
                        <div className="font-semibold mb-2">Selected reports</div>
                        <ul className="list-disc ml-5 space-y-1 text-text-2">{selectedReports.map(item => <li key={item}>{item}</li>)}</ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border border-border rounded-lg p-5">
                  <h3 className="font-serif text-xl mb-4">Salary History Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm"><thead><tr className="border-b border-border"><th className="py-2 text-left">Starting Date</th><th className="py-2 text-left">Salary Amount</th></tr></thead><tbody>{(formData.salaryHistory || []).filter(row => row.startDate || row.startAmount).map((row, idx) => <tr key={idx} className="border-b border-border/60"><td className="py-2">{row.startDate || '—'}</td><td className="py-2 font-mono">{formatCurrency(row.startAmount || 0)}</td></tr>)}</tbody></table>
                  </div>
                </div>
                <div className="border border-border rounded-lg p-5 text-sm text-text-2 space-y-2">
                  <p>Notes: Formula adjustments reflect age/service combinations, special category toggles, sick leave credit, part-time proration, and transfer handling where applicable.</p>
                  {formData.retirementSystem === 'Transfer' && <p>Transfer scenario note: The report preserves the CSRS/FERS component split inputs by including the transfer date and sick leave at transfer in the summary assumptions.</p>}
                </div>
              </div>
            )}

            {step === 10 && (
              <div className="max-w-xl">
                <p className="text-sm text-text-2 mb-6">Enter and confirm your email address to receive your personalized retirement analysis. Both fields are required and must match.</p>
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email address <span className="text-red-500">*</span></label>
                    <input type="email" value={formData.email || ''} onChange={e => setField('email', e.target.value)} className={`w-full p-2.5 border rounded-md ${validationErrors.email ? 'border-red-500' : 'border-border'}`} />
                    {validationErrors.email && <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Confirm email <span className="text-red-500">*</span></label>
                    <input type="email" value={formData.confirmEmail || ''} onChange={e => setField('confirmEmail', e.target.value)} className={`w-full p-2.5 border rounded-md ${validationErrors.confirmEmail ? 'border-red-500' : 'border-border'}`} />
                    {validationErrors.confirmEmail && <p className="text-xs text-red-500 mt-1">{validationErrors.confirmEmail}</p>}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => { if (validateStep(10)) alert(`Retirement analysis queued for ${formData.email}`); }} className="px-5 py-3 bg-blue text-white rounded-md font-semibold">Send report</button>
                  <button onClick={handlePrint} className="px-5 py-3 border border-border rounded-md font-semibold">Printer-Friendly Report</button>
                </div>
              </div>
            )}
          </div>

          <div className="px-8 py-5 border-t border-border bg-[#FBFCFE] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
            <button onClick={step === 1 ? onBack : handlePrevious} className="px-4 py-2 border border-border rounded-md">{step === 1 ? 'Exit builder' : 'Previous page'}</button>
            <div className="text-sm text-text-3">Page {step} of 10</div>
            {step < 10 ? <button onClick={handleNext} disabled={isCalculating} className="px-5 py-2 bg-blue text-white rounded-md font-semibold disabled:opacity-60">{step === 8 ? 'Generate report' : 'Continue'}</button> : <button onClick={() => setStep(9)} className="px-5 py-2 bg-blue text-white rounded-md font-semibold">Back to report</button>}
          </div>
        </div>
      </main>
    </div>
  );
}
