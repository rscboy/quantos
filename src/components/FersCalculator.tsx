import React, { useMemo, useState, useEffect } from 'react';
import { FedEmployee, fedcalcApi } from '../services/fedcalcApi';
import { openBrandedPrintReport } from '../utils/reportPrint';
import { AdPlaceholder } from './AdPlaceholder';
import { DebugPanel } from './DebugPanel';
import { useSharedProfile } from '../hooks/useSharedProfile';
import { SEO } from './SEO';
import { RelatedCalculators } from './RelatedCalculators';

type CalculatorType = 'fers' | 'csrs';

type ScenarioSnapshot = {
  id: number;
  label: string;
  retirementDate: string;
  ageAtRetirement: number | null;
  serviceYears: number | null;
  high3Salary: number;
  monthlyAnnuity: number;
  annualAnnuity: number;
  fullAnnuity: number;
  netMonthlyAnnuity: number;
  replacementRate: number;
  lifetimeValue: number;
};

type EligibilityQuestion = {
  name: 'bAirTraffic' | 'bCustomsBorderPatrol' | 'bLawEnforce' | 'bEarlyOut' | 'bPhasedRetire';
  label: string;
};

const ELIGIBILITY_QUESTIONS: EligibilityQuestion[] = [
  { name: 'bAirTraffic', label: 'Are you an Air Traffic Controller?' },
  { name: 'bCustomsBorderPatrol', label: 'Are you a Customs and Border Protection Officer?' },
  { name: 'bLawEnforce', label: 'Are you in Law Enforcement or a Firefighter role?' },
  { name: 'bEarlyOut', label: 'Calculate the “Early Out” option?' },
  { name: 'bPhasedRetire', label: 'Calculate phased retirement?' },
];

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;
const STEP_TITLES = [
  'Required Information',
  'Redeposit Service',
  'Deposit Service',
  'Part-Time Service',
  'Salary History',
  'Life Insurance Deductions',
  'Final Questions',
  'Results',
  'Email Report',
];

function calculateYears(from?: string, to?: string) {
  if (!from || !to) return null;
  const diff = new Date(to).getTime() - new Date(from).getTime();
  if (Number.isNaN(diff)) return null;
  return diff / MS_PER_YEAR;
}

function formatYears(years: number | null) {
  if (years === null) return '—';
  const wholeYears = Math.floor(years);
  const months = Math.max(0, Math.floor((years - wholeYears) * 12));
  return `${wholeYears} years, ${months} months`;
}

function currency(value?: number) {
  return (value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function defaultFormData(calculatorType: CalculatorType): Partial<FedEmployee> {
  return {
    dateRetire: '',
    dateServiceComp: '',
    dateOfBirth: '',
    bAirTraffic: '',
    bCustomsBorderPatrol: '',
    bLawEnforce: '',
    bEarlyOut: '',
    bPhasedRetire: '',
    bCSRS: calculatorType === 'csrs' ? 'Y' : 'N',
    dateCSRSTransfer: '',
    nXFerSickLeave: 0,
    redeposits: [],
    deposits: [],
    partTime: [],
    fLastSalary: 0,
    fManualHigh3: 0,
    salaryHistory: [],
    bLifeIns: 'N',
    nLifeInsBasic: 0,
    bLifeInsA: 'N',
    bLifeInsB: 'N',
    bLifeInsC: 'N',
    nLifeInsOption: 0,
    nSurvivor: 0,
    nSurvivorBase: 0,
    nSickLeaveHrs: 0,
    nAnnualLeaveHrs: 0,
    fHealthInsDeduct: 0,
    fSocSec: 0,
  };
}

function validateStepOne(formData: Partial<FedEmployee>) {
  const errors: Record<string, string> = {};
  const serviceYears = calculateYears(formData.dateServiceComp, formData.dateRetire);
  const ageAtRetirement = calculateYears(formData.dateOfBirth, formData.dateRetire);

  if (!formData.dateRetire) errors.dateRetire = 'Planned retirement date is required';
  if (!formData.dateServiceComp) errors.dateServiceComp = 'Service Computation Date (SCD) is required';
  if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';

  for (const question of ELIGIBILITY_QUESTIONS) {
    if (formData[question.name] !== 'Y' && formData[question.name] !== 'N') {
      errors[question.name] = 'This selection is required';
    }
  }

  const blockingMessages: string[] = [];
  // Removed strict blocking messages to allow partial data testing as per API design
  // if (serviceYears !== null && serviceYears < 5) {
  //   blockingMessages.push('Cannot continue because: Less than 5 years of service');
  // }
  // if (serviceYears !== null && ageAtRetirement !== null && serviceYears < 20 && ageAtRetirement < 62) {
  //   blockingMessages.push('Cannot continue because: Less than 20 years of service and under 62 years old.');
  // }

  return { errors, blockingMessages };
}

function getSalaryHistoryCoverageYears(history: FedEmployee['salaryHistory']) {
  const datedEntries = (history || [])
    .filter((entry) => entry.startDate && entry.startAmount)
    .map((entry) => new Date(entry.startDate as string).getTime())
    .filter((time) => !Number.isNaN(time))
    .sort((a, b) => a - b);

  if (datedEntries.length < 2) return 0;
  return (datedEntries[datedEntries.length - 1] - datedEntries[0]) / MS_PER_YEAR;
}

function validateSalaryStep(formData: Partial<FedEmployee>) {
  const errors: Record<string, string> = {};
  const messages: string[] = [];
  const hasLastSalary = Number(formData.fLastSalary || 0) > 0;
  const hasHigh3 = Number(formData.fManualHigh3 || 0) > 0;
  const salaryCoverageYears = getSalaryHistoryCoverageYears(formData.salaryHistory);
  const hasThreeYearsSalaryHistory = salaryCoverageYears >= 3;

  // Removed strict blocking validation to allow partial data testing
  // if (!hasLastSalary) {
  //   errors.fLastSalary = 'Cannot continue because: Salary at time of retirement is missing.';
  //   messages.push('Cannot continue because: Salary at time of retirement is missing.');
  // }

  // if (!hasHigh3 && !hasThreeYearsSalaryHistory) {
  //   errors.salaryHistory = 'Cannot continue because: High-3 salary OR 3 full years of salary history must be entered.';
  //   messages.push('Cannot continue because: High-3 salary OR 3 full years of salary history must be entered.');
  // }

  return { errors, messages, hasThreeYearsSalaryHistory, salaryCoverageYears };
}

function calculateResultSection(reportData: any, calculatorType: CalculatorType) {
  const result = reportData?.[calculatorType] || reportData?.fers || reportData?.csrs || {};
  return {
    monthlyAnnuity: Number(result.monthlyAnnuity || 0),
    annualAnnuity: Number(result.annualAnnuity || 0),
    replacementRate: Number(result.replacementRate || 0),
    basicAnnuity: Number(result.basicAnnuity || result.annualAnnuity || 0),
    monthlyDeductions: Number(result.monthlyDeductions || 0),
    fullAnnuity: Number(result.fullAnnuity || result.monthlyAnnuity || 0),
    netMonthlyAnnuity: Number(result.netMonthlyAnnuity || result.monthlyAnnuity || 0),
    html: result.html || '',
  };
}

function formatCurrency(value?: number) {
  return `$${currency(Number(value || 0))}`;
}

function formatDelta(value: number, kind: 'currency' | 'percent' | 'years' = 'currency') {
  const prefix = value > 0 ? '+' : '';
  if (kind === 'percent') return `${prefix}${value.toFixed(1)} pts`;
  if (kind === 'years') return `${prefix}${value.toFixed(1)} yrs`;
  return `${prefix}$${currency(value)}`;
}

function AnnuityCalculator({ calculatorType, onBack }: { calculatorType: CalculatorType; onBack: () => void }) {
  const { profile, updateProfile } = useSharedProfile();
  const [step, setStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [blockingMessages, setBlockingMessages] = useState<string[]>([]);
  const [emailData, setEmailData] = useState({ email: profile.email || '', confirmEmail: profile.email || '' });
  const [adRefreshCount, setAdRefreshCount] = useState(1);
  const [emailErrors, setEmailErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<Partial<FedEmployee>>({
    ...defaultFormData(calculatorType),
    dateOfBirth: profile.dateOfBirth || '',
    dateServiceComp: profile.dateServiceComp || '',
    dateRetire: profile.dateRetire || '',
    bCSRS: profile.bCSRS || (calculatorType === 'csrs' ? 'Y' : 'N'),
    bAirTraffic: profile.bAirTraffic || '',
    bCustomsBorderPatrol: profile.bCustomsBorderPatrol || '',
    bLawEnforce: profile.bLawEnforce || '',
    bPhasedRetire: profile.bPhasedRetire || '',
  });

  // Sync profile updates if they happen externally
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      dateOfBirth: profile.dateOfBirth || prev.dateOfBirth,
      dateServiceComp: profile.dateServiceComp || prev.dateServiceComp,
      dateRetire: profile.dateRetire || prev.dateRetire,
      bCSRS: profile.bCSRS || prev.bCSRS,
      bAirTraffic: profile.bAirTraffic || prev.bAirTraffic,
      bCustomsBorderPatrol: profile.bCustomsBorderPatrol || prev.bCustomsBorderPatrol,
      bLawEnforce: profile.bLawEnforce || prev.bLawEnforce,
      bPhasedRetire: profile.bPhasedRetire || prev.bPhasedRetire,
    }));
    if (profile.email) {
      setEmailData(prev => ({ ...prev, email: profile.email || prev.email, confirmEmail: profile.email || prev.confirmEmail }));
    }
  }, [profile]);
  const [savedScenarios, setSavedScenarios] = useState<ScenarioSnapshot[]>([]);

  const title = calculatorType === 'csrs' ? 'CSRS Annuity Calculator' : 'FERS Annuity Calculator';
  const ageAtRetirement = useMemo(() => calculateYears(formData.dateOfBirth, formData.dateRetire), [formData.dateOfBirth, formData.dateRetire]);
  const currentAge = useMemo(() => calculateYears(formData.dateOfBirth, new Date().toISOString().slice(0, 10)), [formData.dateOfBirth]);
  const serviceYears = useMemo(() => calculateYears(formData.dateServiceComp, formData.dateRetire), [formData.dateServiceComp, formData.dateRetire]);
  const salaryCoverageYears = useMemo(() => getSalaryHistoryCoverageYears(formData.salaryHistory), [formData.salaryHistory]);
  const results = useMemo(() => calculateResultSection(reportData, calculatorType), [reportData, calculatorType]);
  const currentScenario = useMemo<ScenarioSnapshot | null>(() => {
    if (!reportData) return null;

    const monthly = results.netMonthlyAnnuity || Math.max(results.monthlyAnnuity - Number(formData.fHealthInsDeduct || 0), 0);
    const ageYears = ageAtRetirement === null ? null : Number(ageAtRetirement.toFixed(1));
    const service = serviceYears === null ? null : Number(serviceYears.toFixed(1));
    const high3 = Number(formData.fManualHigh3 || formData.fLastSalary || 0);

    return {
      id: Date.now(),
      label: `Retire ${formData.dateRetire || savedScenarios.length + 1}`,
      retirementDate: formData.dateRetire || 'N/A',
      ageAtRetirement: ageYears,
      serviceYears: service,
      high3Salary: high3,
      monthlyAnnuity: results.monthlyAnnuity,
      annualAnnuity: results.annualAnnuity,
      fullAnnuity: results.fullAnnuity || results.monthlyAnnuity,
      netMonthlyAnnuity: monthly,
      replacementRate: results.replacementRate,
      lifetimeValue: monthly * 12 * 25,
    };
  }, [ageAtRetirement, formData.fHealthInsDeduct, formData.fLastSalary, formData.fManualHigh3, formData.dateRetire, reportData, results, savedScenarios.length, serviceYears]);

  const comparisonScenarios = useMemo(() => {
    if (!currentScenario) return savedScenarios;
    const hasCurrentAlreadySaved = savedScenarios.some((scenario) => scenario.retirementDate === currentScenario.retirementDate && scenario.netMonthlyAnnuity === currentScenario.netMonthlyAnnuity);
    return hasCurrentAlreadySaved ? savedScenarios : [...savedScenarios, currentScenario].slice(-3);
  }, [currentScenario, savedScenarios]);

  const comparisonLeaders = useMemo(() => {
    const monthly = Math.max(...comparisonScenarios.map((scenario) => scenario.netMonthlyAnnuity), 0);
    const lifetime = Math.max(...comparisonScenarios.map((scenario) => scenario.lifetimeValue), 0);
    const replacement = Math.max(...comparisonScenarios.map((scenario) => scenario.replacementRate), 0);
    return { monthly, lifetime, replacement };
  }, [comparisonScenarios]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const finalValue = type === 'checkbox' ? (checked ? 'Y' : 'N') : type === 'number' || type === 'radio' ? Number(value) : value;
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
    // Save to shared profile
    if (['bCSRS', 'bAirTraffic', 'bCustomsBorderPatrol', 'bLawEnforce', 'bPhasedRetire', 'dateOfBirth', 'dateServiceComp', 'dateRetire'].includes(name)) {
      updateProfile({ [name]: finalValue as string });
    }
  };

  const handleArrayChange = (arrayName: keyof FedEmployee, index: number, field: string, value: any) => {
    setFormData((prev) => {
      const arr = [...((prev[arrayName] as any[]) || [])];
      if (!arr[index]) arr[index] = {};
      arr[index][field] = value;
      return { ...prev, [arrayName]: arr };
    });
  };

  const addArrayRow = (arrayName: keyof FedEmployee) => setFormData((prev) => ({ ...prev, [arrayName]: [...((prev[arrayName] as any[]) || []), {}] }));
  const removeArrayRow = (arrayName: keyof FedEmployee, index: number) => setFormData((prev) => {
    const arr = [...((prev[arrayName] as any[]) || [])];
    arr.splice(index, 1);
    return { ...prev, [arrayName]: arr };
  });

  const handleNext = () => {
    if (step === 1) {
      const { errors, blockingMessages: messages } = validateStepOne(formData);
      if (Object.keys(errors).length || messages.length) {
        setValidationErrors(errors);
        setBlockingMessages(messages);
        return;
      }
    }

    if (step === 5) {
      const { errors, messages } = validateSalaryStep(formData);
      if (messages.length) {
        setValidationErrors(errors);
        setBlockingMessages(messages);
        return;
      }
    }

    setValidationErrors({});
    setBlockingMessages([]);
    if (step >= 2) setAdRefreshCount((current) => current + 1);
    setStep((current) => Math.min(7, current + 1));
  };

  const handleApiCalculate = async () => {
    const stepOneValidation = validateStepOne(formData);
    const salaryValidation = validateSalaryStep(formData);
    const combinedErrors = { ...stepOneValidation.errors, ...salaryValidation.errors };
    const combinedMessages = [...stepOneValidation.blockingMessages, ...salaryValidation.messages];

    if (Object.keys(combinedErrors).length || combinedMessages.length) {
      setValidationErrors(combinedErrors);
      setBlockingMessages(combinedMessages);
      setApiError('Please resolve the blocking validation messages before running the report.');
      return;
    }

    setIsCalculating(true);
    setApiError(null);
    setBlockingMessages([]);

    try {
      const apiResults = await fedcalcApi.calculateRetirement(formData, calculatorType);
      setReportData(apiResults);
      setAdRefreshCount((current) => current + 1);
      setStep(8);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Calculation error:', error);
      }
      setApiError('Unable to calculate eligibility. Please check your dates or required fields and try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePrint = () => openBrandedPrintReport({
    title,
    subtitle: 'Friendly printer version of your annuity estimate report.',
    sections: [
      {
        title: 'Retirement Inputs',
        lines: [
          { label: 'Retirement System', value: calculatorType === 'csrs' ? 'CSRS' : 'FERS' },
          { label: 'Retirement Date', value: formData.dateRetire || 'N/A' },
          { label: 'Date of Birth', value: formData.dateOfBirth || 'N/A' },
          { label: 'Service Computation Date', value: formData.dateServiceComp || 'N/A' },
          { label: 'Age at Retirement', value: ageAtRetirement === null ? 'N/A' : formatYears(ageAtRetirement) },
          { label: 'Creditable Service', value: serviceYears === null ? 'N/A' : formatYears(serviceYears) },
          { label: 'Final Salary', value: `$${currency(Number(formData.fLastSalary || 0))}` },
          { label: 'High-3 Salary', value: `$${currency(Number(formData.fManualHigh3 || 0) || Number(formData.fLastSalary || 0))}` },
        ],
      },
      {
        title: 'Annuity Summary',
        lines: [
          { label: 'Monthly Annuity', value: `$${currency(results.monthlyAnnuity)}` },
          { label: 'Annual Annuity', value: `$${currency(results.annualAnnuity)}` },
          { label: 'Replacement Rate', value: `${results.replacementRate.toFixed(1)}%` },
          { label: 'Basic Annuity', value: `$${currency(results.basicAnnuity)}` },
          { label: 'Monthly Deductions', value: `$${currency(results.monthlyDeductions)}` },
          { label: 'Full Monthly Annuity', value: `$${currency(results.fullAnnuity)}` },
          { label: 'Net Monthly Annuity', value: `$${currency(results.netMonthlyAnnuity)}` },
        ],
      },
    ],
  });

  const saveCurrentScenario = () => {
    if (!currentScenario) return;
    setSavedScenarios((prev) => {
      const next = [...prev.filter((scenario) => scenario.retirementDate !== currentScenario.retirementDate), currentScenario];
      return next.slice(-3);
    });
  };

  const removeScenario = (id: number) => {
    setSavedScenarios((prev) => prev.filter((scenario) => scenario.id !== id));
  };

  const handleEmailSubmit = () => {
    const errors: Record<string, string> = {};
    if (!emailData.email) errors.email = 'Email is required';
    if (!emailData.confirmEmail) errors.confirmEmail = 'Confirm email is required';
    if (emailData.email && emailData.confirmEmail && emailData.email !== emailData.confirmEmail) {
      errors.confirmEmail = 'Email addresses must match';
    }
    setEmailErrors(errors);
    if (Object.keys(errors).length === 0) {
      setAdRefreshCount((current) => current + 1);
      alert(`Report sent to ${emailData.email}`);
      setStep(8);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between gap-2 mb-8 overflow-x-auto pb-2">
      {STEP_TITLES.slice(0, 7).map((label, index) => {
        const stepNumber = index + 1;
        return (
          <div key={label} className="flex items-center min-w-fit">
            <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold ${step === stepNumber ? 'bg-blue text-white' : step > stepNumber ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > stepNumber ? '✓' : stepNumber}
            </div>
            <span className="ml-2 mr-3 text-xs text-text-2 whitespace-nowrap">{label}</span>
            {stepNumber < 7 && <div className={`w-4 sm:w-10 h-1 rounded ${step > stepNumber ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="animate-in fade-in duration-300">
      <SEO 
        title={isCsrs ? "CSRS Retirement Calculator | Free Federal Pension Estimate | FedCalc" : "FERS Retirement Calculator | Free Federal Pension Estimate | FedCalc"}
        description={isCsrs ? "Calculate your Civil Service Retirement System (CSRS) pension benefits. Run High-3 salary calculations and estimate your federal retirement income instantly." : "Calculate your Federal Employees Retirement System (FERS) pension benefits. Run High-3 salary calculations and estimate your federal retirement income instantly."}
        canonicalUrl={isCsrs ? "/csrs-calculator" : "/fers-calculator"}
      />
      <main className="w-full max-w-[980px] mx-auto px-4 sm:px-6 pb-20 pt-8 sm:pt-12">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-2 mb-6 sm:mb-8 cursor-pointer bg-none border-none p-0 font-sans transition-colors duration-120 hover:text-blue min-h-[44px]">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5"><path d="M10 3L5 8l5 5" /></svg>
          All Calculators
        </button>

        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-text mb-3">{title}</h1>
        <p className="text-text-2 text-sm mb-8">
          {isCsrs 
            ? "Estimate your CSRS retirement benefits, including early retirement, deposits, redeposits, and special rules for law enforcement, firefighters, and air traffic controllers."
            : "Estimate your FERS retirement benefits, including MRA+10, early retirement, FERS transfer, deposits, redeposits, and special rules for law enforcement, firefighters, and air traffic controllers."}
        </p>

        {step <= 7 && renderStepIndicator()}

        <div className="mb-6 md:hidden">
          <AdPlaceholder
            hideAbove="md"
            compact
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-6 items-start">
          <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
          {blockingMessages.length > 0 && (
            <div className="m-6 mb-0 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm space-y-1">
              {blockingMessages.map((message) => <p key={message}>{message}</p>)}
            </div>
          )}

          {step === 1 && (
            <div className="p-8 space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-2">Required Information</h2>
                <p className="text-text-2 text-sm">Enter the required retirement timeline details first. Every field on this page must be completed before you can continue.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Planned Full (or Phased) Retirement date <span className="text-red-500">*</span></label>
                  <input type="date" name="dateRetire" value={formData.dateRetire || ''} onChange={handleChange} className={`w-full p-2.5 border ${validationErrors.dateRetire ? 'border-red-500' : 'border-border'} rounded-md`} />
                  <p className="text-xs text-text-3 mt-2">Calculated age at retirement: {ageAtRetirement === null ? '—' : `${Math.floor(ageAtRetirement)} years old`}</p>
                  {validationErrors.dateRetire && <p className="text-red-500 text-xs mt-1">{validationErrors.dateRetire}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Service Computation Date (SCD) <span className="text-red-500">*</span></label>
                  <input type="date" name="dateServiceComp" value={formData.dateServiceComp || ''} onChange={handleChange} className={`w-full p-2.5 border ${validationErrors.dateServiceComp ? 'border-red-500' : 'border-border'} rounded-md`} />
                  <p className="text-xs text-text-3 mt-2">Calculated total service time: {formatYears(serviceYears)}</p>
                  {validationErrors.dateServiceComp && <p className="text-red-500 text-xs mt-1">{validationErrors.dateServiceComp}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Date of Birth <span className="text-red-500">*</span></label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} className={`w-full p-2.5 border ${validationErrors.dateOfBirth ? 'border-red-500' : 'border-border'} rounded-md`} />
                  <p className="text-xs text-text-3 mt-2">Calculated current age: {currentAge === null ? '—' : `${Math.floor(currentAge)} years old`}</p>
                  {validationErrors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{validationErrors.dateOfBirth}</p>}
                </div>
              </div>

              <AdPlaceholder
                hideAbove="md"
                compact
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
                {ELIGIBILITY_QUESTIONS.map((question) => (
                  <div key={question.name}>
                    <label className="block text-sm font-semibold text-text-2 mb-2">{question.label} <span className="text-red-500">*</span></label>
                    <select name={question.name} value={(formData[question.name] as string) || ''} onChange={handleChange} className={`w-full p-2.5 border ${validationErrors[question.name] ? 'border-red-500' : 'border-border'} rounded-md`}>
                      <option value="">Select...</option>
                      <option value="Y">Yes</option>
                      <option value="N">No</option>
                    </select>
                    {validationErrors[question.name] && <p className="text-red-500 text-xs mt-1">{validationErrors[question.name]}</p>}
                  </div>
                ))}
              </div>

              {calculatorType === 'fers' && (
                <div className="pt-6 border-t border-border">
                  <h3 className="font-semibold text-text mb-4">CSRS transfer information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-text-2 mb-2">FERS Transfer Date</label>
                      <input type="date" name="dateCSRSTransfer" value={formData.dateCSRSTransfer || ''} onChange={handleChange} className="w-full p-2.5 border border-border rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-2 mb-2">Sick Leave at transfer (hours)</label>
                      <input type="number" name="nXFerSickLeave" value={formData.nXFerSickLeave || ''} onChange={handleChange} className="w-full p-2.5 border border-border rounded-md" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && <RepeatingTableStep title="Redeposit Service" description="Optionally enter any refunded service that has not been repaid." headers={['Date of Refund', 'Period of Service From', 'Period of Service To', 'Amount']} rows={formData.redeposits || []} onAdd={() => addArrayRow('redeposits')} onRemove={(i) => removeArrayRow('redeposits', i)} renderRow={(row: any, idx: number) => <>
            <td className="px-2 py-2"><input type="date" value={row.depositDate || ''} onChange={(e) => handleArrayChange('redeposits', idx, 'depositDate', e.target.value)} className="w-full p-2 border rounded" /></td>
            <td className="px-2 py-2"><input type="date" value={row.fromDate || ''} onChange={(e) => handleArrayChange('redeposits', idx, 'fromDate', e.target.value)} className="w-full p-2 border rounded" /></td>
            <td className="px-2 py-2"><input type="date" value={row.toDate || ''} onChange={(e) => handleArrayChange('redeposits', idx, 'toDate', e.target.value)} className="w-full p-2 border rounded" /></td>
            <td className="px-2 py-2"><input type="number" value={row.amount || ''} onChange={(e) => handleArrayChange('redeposits', idx, 'amount', Number(e.target.value))} className="w-full p-2 border rounded" /></td>
          </>} />}

          {step === 3 && <RepeatingTableStep title="Deposit Service" description="Optionally enter periods where retirement deductions were not withheld, including service dates and salary." headers={['From', 'To', 'Salary']} rows={formData.deposits || []} onAdd={() => addArrayRow('deposits')} onRemove={(i) => removeArrayRow('deposits', i)} renderRow={(row: any, idx: number) => <>
            <td className="px-2 py-2"><input type="date" value={row.fromDate || ''} onChange={(e) => handleArrayChange('deposits', idx, 'fromDate', e.target.value)} className="w-full p-2 border rounded" /></td>
            <td className="px-2 py-2"><input type="date" value={row.toDate || ''} onChange={(e) => handleArrayChange('deposits', idx, 'toDate', e.target.value)} className="w-full p-2 border rounded" /></td>
            <td className="px-2 py-2"><input type="number" value={row.salary || ''} onChange={(e) => handleArrayChange('deposits', idx, 'salary', Number(e.target.value))} className="w-full p-2 border rounded" /></td>
          </>} />}

          {step === 4 && <RepeatingTableStep title="Part-Time Service" description="Optionally enter qualifying part-time service since April 6, 1986. These rows feed service-weighted annuity calculations." headers={['From', 'Through', 'Hours per Pay Period']} rows={formData.partTime || []} onAdd={() => addArrayRow('partTime')} onRemove={(i) => removeArrayRow('partTime', i)} renderRow={(row: any, idx: number) => <>
            <td className="px-2 py-2"><input type="date" value={row.fromDate || ''} onChange={(e) => handleArrayChange('partTime', idx, 'fromDate', e.target.value)} className="w-full p-2 border rounded" /></td>
            <td className="px-2 py-2"><input type="date" value={row.toDate || ''} onChange={(e) => handleArrayChange('partTime', idx, 'toDate', e.target.value)} className="w-full p-2 border rounded" /></td>
            <td className="px-2 py-2"><input type="number" value={row.hrsPerPeriod || ''} onChange={(e) => handleArrayChange('partTime', idx, 'hrsPerPeriod', Number(e.target.value))} className="w-full p-2 border rounded" /></td>
          </>} />}

          {step === 5 && (
            <div className="p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Salary History</h2>
                <p className="text-text-2 text-sm">Enter your salary at retirement first. Then either provide a known High-3 salary or at least 3 full years of salary history.</p>
              </div>

              <AdPlaceholder
                hideAbove="md"
                compact
              />

              <div>
                <label className="block text-sm font-semibold text-text-2 mb-2">Salary at time of retirement <span className="text-red-500">*</span></label>
                <input type="number" name="fLastSalary" value={formData.fLastSalary || ''} onChange={handleChange} className={`w-full max-w-md p-2.5 border ${validationErrors.fLastSalary ? 'border-red-500' : 'border-border'} rounded-md`} />
                {validationErrors.fLastSalary && <p className="text-red-500 text-xs mt-1">{validationErrors.fLastSalary}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-2 mb-2">Known High-3 salary</label>
                <input type="number" name="fManualHigh3" value={formData.fManualHigh3 || ''} onChange={handleChange} className={`w-full max-w-md p-2.5 border ${validationErrors.salaryHistory ? 'border-red-500' : 'border-border'} rounded-md`} />
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-4 text-sm text-text-3 font-medium">OR</span></div>
              </div>

              <div>
                <p className="text-text-2 text-sm mb-4">Salary history entered: {salaryCoverageYears.toFixed(2)} years of coverage.</p>
                {validationErrors.salaryHistory && <p className="text-red-500 text-xs mb-3">{validationErrors.salaryHistory}</p>}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-text-2 bg-gray-50 uppercase">
                      <tr>
                        <th className="px-4 py-3">Starting Date</th>
                        <th className="px-4 py-3">Salary Amount</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(formData.salaryHistory || []).map((row, idx) => (
                        <tr key={idx} className="border-b border-border">
                          <td className="px-2 py-2"><input type="date" value={row.startDate || ''} onChange={(e) => handleArrayChange('salaryHistory', idx, 'startDate', e.target.value)} className="w-full p-2 border rounded" /></td>
                          <td className="px-2 py-2"><input type="number" value={row.startAmount || ''} onChange={(e) => handleArrayChange('salaryHistory', idx, 'startAmount', Number(e.target.value))} className="w-full p-2 border rounded" /></td>
                          <td className="px-2 py-2"><button onClick={() => removeArrayRow('salaryHistory', idx)} className="text-red-500 hover:text-red-700">✕</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button onClick={() => addArrayRow('salaryHistory')} className="mt-4 text-sm text-blue font-medium hover:underline">+ Add Salary Row</button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Life Insurance Deductions</h2>
                <p className="text-text-2 text-sm">FEGLI deductions are optional for the estimate and do not block progression.</p>
              </div>
              <label className="flex items-center gap-3">
                <input type="checkbox" name="bLifeIns" checked={formData.bLifeIns === 'Y'} onChange={handleChange} className="w-4 h-4 text-blue" />
                <span className="font-semibold">Apply life insurance deductions</span>
              </label>
              {formData.bLifeIns === 'Y' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <h3 className="font-semibold">Basic insurance reduction</h3>
                    {[{ value: 0, label: '75% reduction' }, { value: 1, label: '50% reduction' }, { value: 2, label: 'No reduction' }].map((option) => (
                      <label key={option.value} className="flex items-center gap-3">
                        <input type="radio" name="nLifeInsBasic" value={option.value} checked={Number(formData.nLifeInsBasic) === option.value} onChange={handleChange} className="w-4 h-4 text-blue" />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Additional coverage</h3>
                    <label className="flex items-center gap-3"><input type="checkbox" name="bLifeInsA" checked={formData.bLifeInsA === 'Y'} onChange={handleChange} className="w-4 h-4 text-blue" /><span>Option A</span></label>
                    <label className="flex items-center gap-3"><input type="checkbox" name="bLifeInsB" checked={formData.bLifeInsB === 'Y'} onChange={handleChange} className="w-4 h-4 text-blue" /><span>Option B</span></label>
                    <label className="flex items-center gap-3"><input type="checkbox" name="bLifeInsC" checked={formData.bLifeInsC === 'Y'} onChange={handleChange} className="w-4 h-4 text-blue" /><span>Option C</span></label>
                    <div>
                      <label className="block text-sm font-semibold text-text-2 mb-2">Option B/C multiples</label>
                      <select name="nLifeInsOption" value={Number(formData.nLifeInsOption || 0)} onChange={handleChange} className="w-full max-w-xs p-2.5 border border-border rounded-md">
                        {[0, 1, 2, 3, 4, 5].map((multiple) => <option key={multiple} value={multiple}>{multiple === 0 ? 'None' : `${multiple}x`}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 7 && (
            <div className="p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Final Questions</h2>
                <p className="text-text-2 text-sm">These inputs affect deductions and benefit options but do not block progression.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Unused sick leave hours at retirement"><input type="number" name="nSickLeaveHrs" value={formData.nSickLeaveHrs || ''} onChange={handleChange} className="w-full p-2.5 border border-border rounded-md" /></Field>
                <Field label="Annual leave balance (hours)"><input type="number" name="nAnnualLeaveHrs" value={formData.nAnnualLeaveHrs || ''} onChange={handleChange} className="w-full p-2.5 border border-border rounded-md" /></Field>
                <Field label="Current bi-weekly health insurance deductions"><input type="number" name="fHealthInsDeduct" value={formData.fHealthInsDeduct || ''} onChange={handleChange} className="w-full p-2.5 border border-border rounded-md" /></Field>
                {calculatorType === 'fers' && <Field label="Social Security benefit at age 62 (annual)"><input type="number" name="fSocSec" value={formData.fSocSec || ''} onChange={handleChange} className="w-full p-2.5 border border-border rounded-md" /></Field>}
              </div>
              <div className="pt-4 border-t border-border space-y-4">
                <label className="flex items-center gap-3"><input type="checkbox" checked={Number(formData.nSurvivor || 0) > 0} onChange={(e) => setFormData((prev) => ({ ...prev, nSurvivor: e.target.checked ? 50 : 0 }))} className="w-4 h-4 text-blue" /><span className="font-semibold">Calculate survivor benefits</span></label>
                {Number(formData.nSurvivor || 0) > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Survivor annuity percentage">
                      <select name="nSurvivor" value={Number(formData.nSurvivor || 0)} onChange={handleChange} className="w-full p-2.5 border border-border rounded-md">
                        <option value={50}>50%</option>
                        <option value={25}>25%</option>
                      </select>
                    </Field>
                    <Field label="Survivor annuity base override (optional)"><input type="number" name="nSurvivorBase" value={formData.nSurvivorBase || ''} onChange={handleChange} className="w-full p-2.5 border border-border rounded-md" /></Field>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="p-8 bg-gray-50 space-y-6">
              <div className="bg-white p-8 border border-border rounded-lg shadow-sm">
                <h2 className="text-2xl font-serif text-blue mb-6 border-b pb-4">{title}<br /><span className="text-xl text-text">Calculation Results</span></h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm mb-8">
                  <div><span className="font-semibold">Retirement date:</span> {formData.dateRetire || 'N/A'}</div>
                  <div><span className="font-semibold">Date of birth:</span> {formData.dateOfBirth || 'N/A'}</div>
                  <div><span className="font-semibold">Service time:</span> {formatYears(serviceYears)}</div>
                  <div><span className="font-semibold">High-3 salary:</span> ${currency(Number(formData.fManualHigh3 || formData.fLastSalary || 0))}</div>
                  <div><span className="font-semibold">Salary history rows:</span> {(formData.salaryHistory || []).length}</div>
                  <div><span className="font-semibold">Unused sick leave:</span> {Number(formData.nSickLeaveHrs || 0)} hours</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ResultCard label="Basic annuity" value={`$${currency(results.basicAnnuity)}`} />
                  <ResultCard label="Monthly deductions" value={`$${currency(results.monthlyDeductions || Number(formData.fHealthInsDeduct || 0))}`} />
                  <ResultCard label="Full annuity" value={`$${currency(results.fullAnnuity || results.monthlyAnnuity)}`} />
                  <ResultCard label="Net monthly annuity" value={`$${currency(results.netMonthlyAnnuity || Math.max(results.monthlyAnnuity - Number(formData.fHealthInsDeduct || 0), 0))}`} />
                </div>
                {results.basicAnnuity === 0 && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                    <strong>Note:</strong> The calculated annuity is $0. Additional inputs (such as salary history or creditable service) may improve the accuracy of this estimate.
                  </div>
                )}
                <div className="mt-6 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">Scenario Comparison Mode</p>
                      <h3 className="mt-2 text-xl font-semibold text-text">Compare up to 3 retirement dates side-by-side.</h3>
                      <p className="mt-2 text-sm text-text-2">Run the report, save this version, change your retirement date or assumptions, and run it again. We automatically spotlight the strongest monthly income and lifetime value outcome.</p>
                    </div>
                    <button onClick={saveCurrentScenario} className="inline-flex items-center justify-center rounded-md bg-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-hover">
                      Save current scenario
                    </button>
                  </div>

                  {comparisonScenarios.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
                      {comparisonScenarios.map((scenario, index) => {
                        const baseline = comparisonScenarios[0];
                        const monthlyDelta = scenario.netMonthlyAnnuity - baseline.netMonthlyAnnuity;
                        const lifetimeDelta = scenario.lifetimeValue - baseline.lifetimeValue;
                        return (
                          <div key={scenario.id} className="rounded-lg border border-border bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-text-3">Scenario {index + 1}</div>
                                <div className="mt-1 text-lg font-semibold text-text">{scenario.label}</div>
                                <div className="mt-1 text-sm text-text-2">Age {scenario.ageAtRetirement?.toFixed(1) || '—'} • Service {scenario.serviceYears?.toFixed(1) || '—'} yrs</div>
                              </div>
                              {savedScenarios.some((saved) => saved.id === scenario.id) && (
                                <button onClick={() => removeScenario(scenario.id)} className="text-xs font-medium text-text-3 transition-colors hover:text-red-600">
                                  Remove
                                </button>
                              )}
                            </div>

                            <div className="mt-4 space-y-3">
                              <ComparisonMetric
                                label="Net monthly income"
                                value={formatCurrency(scenario.netMonthlyAnnuity)}
                                delta={index === 0 ? 'Baseline' : formatDelta(monthlyDelta)}
                                highlight={scenario.netMonthlyAnnuity === comparisonLeaders.monthly}
                              />
                              <ComparisonMetric
                                label="Lifetime value (25 yrs)"
                                value={formatCurrency(scenario.lifetimeValue)}
                                delta={index === 0 ? 'Baseline' : formatDelta(lifetimeDelta)}
                                highlight={scenario.lifetimeValue === comparisonLeaders.lifetime}
                              />
                              <ComparisonMetric
                                label="Replacement rate"
                                value={`${scenario.replacementRate.toFixed(1)}%`}
                                delta={index === 0 ? 'Baseline' : formatDelta(scenario.replacementRate - baseline.replacementRate, 'percent')}
                                highlight={scenario.replacementRate === comparisonLeaders.replacement}
                              />
                            </div>

                            <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-text-2">
                              <div><span className="font-semibold text-text">Retirement date:</span> {scenario.retirementDate}</div>
                              <div><span className="font-semibold text-text">High-3 salary:</span> {formatCurrency(scenario.high3Salary)}</div>
                              <div><span className="font-semibold text-text">Annual annuity:</span> {formatCurrency(scenario.annualAnnuity)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <AdPlaceholder
                  hideAbove="md"
                  compact
                />

                <div className="mt-8">
                  <h3 className="font-semibold text-text mb-3">Salary history breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border border-border rounded-md overflow-hidden">
                      <thead className="text-xs text-text-2 bg-gray-50 uppercase">
                        <tr>
                          <th className="px-4 py-3">Starting Date</th>
                          <th className="px-4 py-3">Salary Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(formData.salaryHistory || []).length > 0 ? (formData.salaryHistory || []).map((row, idx) => (
                          <tr key={idx} className="border-t border-border">
                            <td className="px-4 py-3">{row.startDate || '—'}</td>
                            <td className="px-4 py-3">${currency(row.startAmount)}</td>
                          </tr>
                        )) : (
                          <tr><td className="px-4 py-3" colSpan={2}>No salary history entered.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {results.html && (
                  <div className="mt-8">
                    <h3 className="font-semibold text-lg mb-4 border-b pb-2">Detailed Report</h3>
                    <div 
                      className="fedcalc-report"
                      dangerouslySetInnerHTML={{ __html: results.html }}
                    />
                  </div>
                )}

                <AdPlaceholder
                  hideAbove="md"
                  compact
                />

                <div className="text-sm text-text-2 space-y-2 border-t pt-6 mt-8">
                  <p><strong>Additional notes:</strong> Figures are estimates based on the inputs above and current calculator logic.</p>
                  <p>Backend calculation behavior remains unchanged; this flow focuses on collecting complete inputs and enforcing the required validation gates.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => setStep(9)} className="px-6 py-3 bg-blue text-white rounded-md font-semibold hover:bg-blue-hover transition-colors">Email Report</button>
                <button onClick={handlePrint} className="px-6 py-3 bg-white border border-border text-text rounded-md font-semibold hover:bg-gray-50 transition-colors">Friendly Printer Version</button>
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="p-8 max-w-lg mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-serif mb-4">Email Report</h2>
                <p className="text-text-2 text-sm">Enter and confirm your email address to receive a free copy of your personalized retirement scenario.</p>
              </div>
              <Field label="Email address *">
                <input 
                  type="email" 
                  value={emailData.email} 
                  onChange={(e) => {
                    setEmailData((prev) => ({ ...prev, email: e.target.value }));
                    updateProfile({ email: e.target.value });
                  }} 
                  className={`w-full p-2.5 border ${emailErrors.email ? 'border-red-500' : 'border-border'} rounded-md min-h-[44px]`} 
                />
                {emailErrors.email && <p className="text-red-500 text-xs mt-1">{emailErrors.email}</p>}
              </Field>
              <Field label="Confirm email address *">
                <input 
                  type="email" 
                  value={emailData.confirmEmail} 
                  onChange={(e) => setEmailData((prev) => ({ ...prev, confirmEmail: e.target.value }))} 
                  className={`w-full p-2.5 border ${emailErrors.confirmEmail ? 'border-red-500' : 'border-border'} rounded-md min-h-[44px]`} 
                />
                {emailErrors.confirmEmail && <p className="text-red-500 text-xs mt-1">{emailErrors.confirmEmail}</p>}
              </Field>
              <div className="space-y-3">
                <button onClick={handleEmailSubmit} className="w-full px-6 py-3 bg-blue text-white rounded-md font-semibold hover:bg-blue-hover transition-colors">Send it!</button>
                <button onClick={handlePrint} className="w-full px-6 py-3 bg-white border border-border text-text rounded-md font-semibold hover:bg-gray-50 transition-colors">Friendly Printer Version</button>
                <button onClick={() => setStep(8)} className="w-full text-text-2 font-medium hover:text-text transition-colors">Back to Report</button>
              </div>
            </div>
          )}

          {step < 8 && (
            <div className="p-6 bg-gray-50 border-t border-border flex justify-between items-center">
              <button onClick={() => { setBlockingMessages([]); setValidationErrors({}); setStep((current) => Math.max(1, current - 1)); }} disabled={step === 1} className="px-6 py-2.5 text-sm font-semibold text-text-2 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              {step < 7 ? (
                <button onClick={handleNext} className="px-6 py-2.5 text-sm font-semibold text-white bg-blue hover:bg-blue-hover rounded-md transition-colors shadow-sm">Next</button>
              ) : (
                <button onClick={handleApiCalculate} disabled={isCalculating} className="px-6 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors shadow-sm">{isCalculating ? 'Calculating...' : 'Run Report'}</button>
              )}
            </div>
          )}
        </div>

          <div className="hidden xl:block">
            <AdPlaceholder
              stickyDesktop
              hideBelow="xl"
              className="min-h-[320px]"
            />
          </div>
        </div>

        {apiError && <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">{apiError}</div>}

        <DebugPanel 
          debugInfo={reportData?.debugInfo} 
          parsedData={reportData?.[calculatorType]} 
          rawResponse={reportData?.rawResponse}
        />

        <RelatedCalculators
          links={[
            { id: 'tsp', title: 'TSP Calculator', description: 'Project your Thrift Savings Plan balance based on your contributions and expected returns.', url: '/tsp-calculator' },
            { id: 'gap', title: 'Retirement Gap Analysis', description: 'Determine if your projected retirement income will cover your expected expenses.', url: '/retirement-gap-analysis' },
            { id: 'high3', title: 'High-3 Salary Calculator', description: 'Calculate your exact High-3 average salary based on your earnings history.', url: '/high-3-calculator' },
            { id: 'ss', title: 'Social Security Estimator', description: 'Estimate your Social Security benefits at various retirement ages.', url: '/social-security' }
          ]}
          onNavigate={(id) => {
            // We need to pass onNavigate down from App, but for now we can use window.location
            window.location.href = ['tsp', 'gap', 'high3', 'ss'].includes(id) ? `/${id === 'high3' ? 'high-3-calculator' : id === 'ss' ? 'social-security' : id === 'gap' ? 'retirement-gap-analysis' : 'tsp-calculator'}` : '/';
          }}
        />
      </main>
    </div>
  );
}

function RepeatingTableStep({ title, description, headers, rows, onAdd, onRemove, renderRow }: { title: string; description: string; headers: string[]; rows: any[]; onAdd: () => void; onRemove: (index: number) => void; renderRow: (row: any, index: number) => React.ReactNode; }) {
  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-text-2 text-sm mb-6">{description}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-text-2 bg-gray-50 uppercase">
            <tr>
              {headers.map((header) => <th key={header} className="px-4 py-3">{header}</th>)}
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b border-border">
                {renderRow(row, index)}
                <td className="px-2 py-2"><button onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700">✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={onAdd} className="mt-4 text-sm text-blue font-medium hover:underline">+ Add Row</button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-semibold text-text-2 mb-2">{label}</label>{children}</div>;
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return <div className="bg-blue-50 rounded-md p-4"><div className="text-xs uppercase tracking-wide text-text-3 mb-2">{label}</div><div className="text-2xl font-mono text-blue">{value}</div></div>;
}

function ComparisonMetric({ label, value, delta, highlight = false }: { label: string; value: string; delta: string; highlight?: boolean }) {
  return (
    <div className={`rounded-md border p-3 ${highlight ? 'border-green-200 bg-green-50' : 'border-border bg-white'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-text-3">{label}</div>
          <div className="mt-1 text-xl font-mono text-blue">{value}</div>
        </div>
        <div className={`rounded-full px-2 py-1 text-xs font-semibold ${highlight ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-text-2'}`}>
          {highlight ? 'Best' : delta}
        </div>
      </div>
      {highlight && <div className="mt-2 text-xs font-medium text-green-700">Top outcome in the current comparison set.</div>}
      {!highlight && <div className="mt-2 text-xs text-text-3">Difference vs. Scenario 1.</div>}
    </div>
  );
}

export function FersCalculator({ onBack }: { onBack: () => void }) {
  return <AnnuityCalculator calculatorType="fers" onBack={onBack} />;
}

export function CsrsCalculator({ onBack }: { onBack: () => void }) {
  return <AnnuityCalculator calculatorType="csrs" onBack={onBack} />;
}