import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { LinkedCalculatorData, applyLinkedDataToFullAnalysis } from '../utils/calculatorLinking';
import { FedEmployee, myfedplanApi } from '../services/myfedplanApi';
import { openBrandedPrintReport } from '../utils/reportPrint';
import { DebugPanel } from './DebugPanel';
import { useSharedProfile } from '../hooks/useSharedProfile';
import { SEO } from './SEO';

type AnalysisStep =
  | 'background'
  | 'salary'
  | 'deposits'
  | 'military'
  | 'tsp'
  | 'insurance'
  | 'cola'
  | 'reports'
  | 'summary'
  | 'email';

type YesNoField =
  | 'bAirTraffic'
  | 'bCustomsBorderPatrol'
  | 'bLawEnforce'
  | 'bEarlyOut'
  | 'bCSRSTransfer'
  | 'bLifeIns'
  | 'bSSEligible';

type ReportToggle =
  | 'bRptSummary'
  | 'bRptAnnuity'
  | 'bRptTSP'
  | 'bRptFEGLI'
  | 'bRptSocSec'
  | 'bRptGap'
  | 'bRptData';

const STEPS: { id: AnalysisStep; label: string; description: string }[] = [
  { id: 'background', label: 'Page 1', description: 'Background Information' },
  { id: 'salary', label: 'Page 2', description: 'Salary History' },
  { id: 'deposits', label: 'Page 3', description: 'Deposit & Redeposit Service' },
  { id: 'military', label: 'Page 4', description: 'Military Deposits' },
  { id: 'tsp', label: 'Page 5', description: 'TSP Contributions' },
  { id: 'insurance', label: 'Page 6', description: 'Life Insurance & Survivor' },
  { id: 'cola', label: 'Page 7', description: 'COLA & Interest Rates' },
  { id: 'reports', label: 'Page 8', description: 'Select Analysis Reports' },
  { id: 'summary', label: 'Page 9', description: 'Annuity Summary Report' },
  { id: 'email', label: 'Page 10', description: 'Email Report' },
];

const FUND_NAMES = ['G Fund', 'F Fund', 'C Fund', 'S Fund', 'I Fund', 'Lifecycle Funds'];
const REPORT_OPTIONS: { key: ReportToggle; label: string; description: string }[] = [
  { key: 'bRptSummary', label: 'Quick Summary', description: 'Executive overview of the retirement scenario.' },
  { key: 'bRptAnnuity', label: 'Projected Retirement Income Chart', description: 'Core annuity results and payout framing.' },
  { key: 'bRptTSP', label: 'TSP Analysis', description: 'Fund balances, allocation mix, and projected growth.' },
  { key: 'bRptFEGLI', label: 'FEGLI Analysis', description: 'Insurance reduction and survivor cost modeling.' },
  { key: 'bRptSocSec', label: 'Social Security', description: 'Social Security earnings and estimate module.' },
  { key: 'bRptGap', label: 'Retirement Savings Gap Analysis', description: 'Income replacement and sustainability outlook.' },
  { key: 'bRptData', label: 'Detailed Data Appendix', description: 'Input detail tables for salary, service, and assumptions.' },
];

const ELIGIBILITY_FIELDS: { key: YesNoField; label: string; required?: boolean }[] = [
  { key: 'bAirTraffic', label: 'Air Traffic Controller', required: true },
  { key: 'bCustomsBorderPatrol', label: 'Customs and Border Protection Officer', required: true },
  { key: 'bLawEnforce', label: 'Law Enforcement or Firefighter', required: true },
  { key: 'bEarlyOut', label: 'Early Out authority applies', required: true },
];

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

const defaultData: Partial<FedEmployee> = {
  dateOfBirth: '',
  dateServiceComp: '',
  dateRetire: '',
  bCSRS: 'N',
  bCSRSTransfer: 'N',
  bAirTraffic: '',
  bCustomsBorderPatrol: '',
  bLawEnforce: '',
  bEarlyOut: '',
  bLifeIns: 'N',
  bLifeInsA: 'N',
  bLifeInsB: 'N',
  bLifeInsC: 'N',
  bSSEligible: 'N',
  nLifeInsBasic: 0,
  nLifeInsOption: 0,
  nSurvivor: 0,
  nSurvivorBase: 0,
  dateCSRSTransfer: '',
  nXFerSickLeave: 0,
  nSickLeaveHrs: 0,
  nAnnualLeaveHrs: 0,
  fLastSalary: 0,
  fManualHigh3: 0,
  fCurrentYearSalary: 0,
  fFutureYearsSalary: 0,
  fCatchupContrib: 0,
  nFuncPctContrib: 0,
  fCurrentSavings: 0,
  fRateOfReturn: 5,
  fSalaryCOLA: 2,
  fAnnuityCOLA: 2,
  fYearsR: 25,
  fOtherPensions: 0,
  fHealthInsDeduct: 0,
  fSocSec: 0,
  fFedAnnuity: 0,
  fCurBalance: 0,
  fTotEarnings: 0,
  fCivilEarnings: 0,
  fEarnings1999: 0,
  fEarnings2000: 0,
  dateAnniversaryDate: '',
  salaryHistory: [{ startDate: '', startAmount: 0 }],
  deposits: [],
  redeposits: [],
  partTime: [],
  arrSSEarnings: [],
  arrFundAlloc: [0, 0, 0, 0, 0, 0],
  arrFundBalance: [0, 0, 0, 0, 0, 0],
  arrFundPctReturn: [2, 3, 7, 8, 6, 5],
  bRptSummary: 'Y',
  bRptAnnuity: 'Y',
  bRptTSP: 'Y',
  bRptFEGLI: 'N',
  bRptSocSec: 'N',
  bRptGap: 'Y',
  bRptData: 'Y',
};

function yearsBetween(from?: string, to?: string) {
  if (!from || !to) return 0;
  const diff = new Date(to).getTime() - new Date(from).getTime();
  return Number.isNaN(diff) ? 0 : diff / MS_PER_YEAR;
}

function currency(value?: number) {
  return Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatYears(value: number) {
  const years = Math.max(0, Math.floor(value));
  const months = Math.max(0, Math.round((value - years) * 12));
  return `${years} years, ${months} months`;
}

export function FullRetirementAnalysis({ onNavigate, linkedData }: { onNavigate: (view: string) => void; linkedData: LinkedCalculatorData }) {
  const { profile, updateProfile } = useSharedProfile();
  const [stepIndex, setStepIndex] = useState(0);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [stepIndex]);

  const handleHtmlClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A') {
      e.preventDefault();
      const href = target.getAttribute('href') || '';
      const text = target.textContent?.toLowerCase() || '';
      
      if (href.includes('fullanalysis') || text.includes('full retirement')) {
        onNavigate('full');
      } else if (href.includes('tsp') || text.includes('tsp') || text.includes('thrift')) {
        onNavigate('tsp');
      } else if (href.includes('fers') || text.includes('fers')) {
        onNavigate('fers');
      } else if (href.includes('csrs') || text.includes('csrs')) {
        onNavigate('csrs');
      } else if (href.includes('military') || text.includes('military')) {
        onNavigate('military');
      } else if (href.includes('gap') || text.includes('gap')) {
        onNavigate('gap');
      } else if (href.includes('howsoon') || text.includes('how soon') || text.includes('eligibility')) {
        onNavigate('eligibility');
      } else if (href.includes('ss') || text.includes('social security')) {
        onNavigate('ss');
      }
    }
  }, [onNavigate]);
  const [formData, setFormData] = useState<Partial<FedEmployee>>(() => ({ 
    ...defaultData, 
    ...applyLinkedDataToFullAnalysis(linkedData),
    dateOfBirth: profile.dateOfBirth || '',
    dateServiceComp: profile.dateServiceComp || '',
    dateRetire: profile.dateRetire || '',
    bCSRS: profile.bCSRS || 'N',
    bAirTraffic: profile.bAirTraffic || '',
    bCustomsBorderPatrol: profile.bCustomsBorderPatrol || '',
    bLawEnforce: profile.bLawEnforce || '',
  }));
  const [email, setEmail] = useState(profile.email || '');
  const [confirmEmail, setConfirmEmail] = useState('');

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
    }));
    if (profile.email) {
      setEmail(prev => profile.email || prev);
    }
  }, [profile]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [timelineMode, setTimelineMode] = useState<'nominal' | 'real'>('real');

  const currentStep = STEPS[stepIndex];
  const ageAtRetirement = useMemo(() => yearsBetween(formData.dateOfBirth, formData.dateRetire), [formData.dateOfBirth, formData.dateRetire]);
  const serviceYears = useMemo(() => yearsBetween(formData.dateServiceComp, formData.dateRetire), [formData.dateServiceComp, formData.dateRetire]);
  const high3FromHistory = useMemo(() => {
    const history = (formData.salaryHistory || []).filter((row) => row.startDate && Number(row.startAmount || 0) > 0);
    if (!history.length) return 0;
    const sorted = [...history].sort((a, b) => String(b.startDate).localeCompare(String(a.startDate))).slice(0, 3);
    return sorted.reduce((sum, row) => sum + Number(row.startAmount || 0), 0) / sorted.length;
  }, [formData.salaryHistory]);
  const high3Value = Number(formData.fManualHigh3 || 0) || high3FromHistory || Number(formData.fLastSalary || 0);
  const annualLeaveCash = (Number(formData.nAnnualLeaveHrs || 0) / 2087) * Number(formData.fLastSalary || 0);
  const monthlyHealth = Number(formData.fHealthInsDeduct || 0) * 26 / 12;
  const fundAllocTotal = (formData.arrFundAlloc || []).reduce((sum, value) => sum + Number(value || 0), 0);
  const currentTspBalance = (formData.arrFundBalance || []).reduce((sum, value) => sum + Number(value || 0), 0);
  const avgFundReturn = (() => {
    const balances = formData.arrFundBalance || [];
    const rates = formData.arrFundPctReturn || [];
    const totalBalance = balances.reduce((sum, value) => sum + Number(value || 0), 0);
    if (!totalBalance) return rates.reduce((sum, value) => sum + Number(value || 0), 0) / Math.max(rates.length, 1);
    return balances.reduce((sum, balance, index) => sum + Number(balance || 0) * Number(rates[index] || 0), 0) / totalBalance;
  })();
  const projectedTspAtRetirement = useMemo(() => {
    const years = Math.max(0, ageAtRetirement ? 0 : 0) + Math.max(0, yearsBetween(new Date().toISOString().slice(0, 10), formData.dateRetire));
    const annualContribution = Number(formData.fCurrentYearSalary || formData.fLastSalary || 0) * (Number(formData.nFuncPctContrib || 0) / 100) + Number(formData.fCatchupContrib || 0);
    const rate = Number(avgFundReturn || formData.fRateOfReturn || 0) / 100;
    let balance = currentTspBalance;
    for (let i = 0; i < Math.round(years); i += 1) {
      balance = balance * (1 + rate) + annualContribution;
    }
    return balance;
  }, [formData.dateRetire, formData.fCurrentYearSalary, formData.fLastSalary, formData.nFuncPctContrib, formData.fCatchupContrib, avgFundReturn, formData.fRateOfReturn, currentTspBalance, ageAtRetirement]);

  const reportSections = REPORT_OPTIONS.filter((option) => formData[option.key] === 'Y');
  const socialSecurityStartAge = useMemo(() => {
    if (Number(formData.fSocSec || 0) <= 0) return null;
    return Math.max(62, Math.ceil(ageAtRetirement || 62));
  }, [formData.fSocSec, ageAtRetirement]);
  const summary = useMemo(() => {
    const result = reportData?.fers || reportData?.csrs || {};
    const annualAnnuity = Number(result.annualAnnuity || result.basicAnnuity || high3Value * (formData.bCSRS === 'Y' ? 0.018 : serviceYears >= 20 && ageAtRetirement >= 62 ? 0.011 : 0.01) * serviceYears);
    const monthlyAnnuity = Number(result.monthlyAnnuity || annualAnnuity / 12);
    const survivorReduction = Number(formData.nSurvivor || 0) > 0 ? annualAnnuity * (Number(formData.nSurvivor || 0) === 50 ? 0.1 : 0.05) / 12 : 0;
    const fegliReduction = formData.bLifeIns === 'Y' ? (Number(formData.nLifeInsOption || 0) * 15) + (Number(formData.nLifeInsBasic || 0) === 2 ? 45 : Number(formData.nLifeInsBasic || 0) === 1 ? 25 : 10) : 0;
    const deductions = Number(result.monthlyDeductions || 0) + monthlyHealth + survivorReduction + fegliReduction;
    return {
      annualAnnuity,
      monthlyAnnuity,
      annuityPercent: high3Value ? (annualAnnuity / high3Value) * 100 : 0,
      deductions,
      fullAnnuity: monthlyAnnuity,
      netMonthly: Math.max(monthlyAnnuity - deductions, 0),
    };
  }, [reportData, high3Value, formData.bCSRS, serviceYears, ageAtRetirement, formData.nSurvivor, formData.bLifeIns, formData.nLifeInsOption, formData.nLifeInsBasic, monthlyHealth]);

  const lifeProjection = useMemo(() => {
    const retirementDate = formData.dateRetire ? new Date(formData.dateRetire) : null;
    const currentDate = new Date();
    const yearsToRetirement = Math.max(0, yearsBetween(currentDate.toISOString().slice(0, 10), formData.dateRetire));
    const retirementYears = Math.max(1, Math.round(Number(formData.fYearsR || 25)));
    const currentSalary = Number(formData.fCurrentYearSalary || formData.fLastSalary || 0);
    const salaryGrowth = Number(formData.fSalaryCOLA || 0) / 100;
    const annuityGrowth = Number(formData.fAnnuityCOLA || 0) / 100;
    const inflationRate = Number(formData.fAnnuityCOLA || formData.fSalaryCOLA || 0) / 100;
    const annualPension = Number(summary.annualAnnuity || 0);
    const annualOtherPension = Number(formData.fOtherPensions || 0);
    const annualSocialSecurity = Number(formData.fSocSec || 0);

    const timeline = [] as Array<{
      yearIndex: number;
      calendarYear: number;
      age: number | null;
      phase: string;
      salary: number;
      pension: number;
      socialSecurity: number;
      otherPension: number;
      total: number;
      displayTotal: number;
      displaySalary: number;
      displayPension: number;
      displaySocialSecurity: number;
      displayOtherPension: number;
    }>;

    for (let yearIndex = 0; yearIndex <= yearsToRetirement + retirementYears; yearIndex += 1) {
      const isWorking = yearIndex < yearsToRetirement;
      const yearsIntoRetirement = Math.max(0, yearIndex - Math.ceil(yearsToRetirement));
      const salary = isWorking ? currentSalary * Math.pow(1 + salaryGrowth, yearIndex) : 0;
      const pension = !isWorking ? annualPension * Math.pow(1 + annuityGrowth, yearsIntoRetirement) : 0;
      const otherPension = !isWorking ? annualOtherPension * Math.pow(1 + annuityGrowth, yearsIntoRetirement) : 0;
      const age = formData.dateOfBirth ? ageAtRetirement - yearsToRetirement + yearIndex : null;
      const socialSecurityActive = socialSecurityStartAge !== null && age !== null && age >= socialSecurityStartAge;
      const socialSecurity = socialSecurityActive ? annualSocialSecurity * Math.pow(1 + annuityGrowth, Math.max(0, (age || 0) - socialSecurityStartAge)) : 0;
      const total = salary + pension + otherPension + socialSecurity;
      const discountFactor = timelineMode === 'real' ? Math.pow(1 + inflationRate, yearIndex) : 1;
      timeline.push({
        yearIndex,
        calendarYear: currentDate.getUTCFullYear() + yearIndex,
        age: age === null ? null : Number(age.toFixed(1)),
        phase: isWorking ? 'Salary years' : socialSecurity > 0 ? 'Retirement + Social Security' : 'Retirement income only',
        salary,
        pension,
        socialSecurity,
        otherPension,
        total,
        displayTotal: total / discountFactor,
        displaySalary: salary / discountFactor,
        displayPension: pension / discountFactor,
        displaySocialSecurity: socialSecurity / discountFactor,
        displayOtherPension: otherPension / discountFactor,
      });
    }

    const maxIncome = timeline.reduce((max, row) => Math.max(max, row.displayTotal), 0);
    const milestones = [
      {
        label: 'Today',
        yearIndex: 0,
        detail: currentSalary ? `Salary $${currency(timeline[0]?.displaySalary || 0)}` : 'Baseline'
      },
      ...(retirementDate ? [{
        label: 'Retirement',
        yearIndex: Math.round(yearsToRetirement),
        detail: `Pension starts at age ${ageAtRetirement.toFixed(1)}`
      }] : []),
      ...(socialSecurityStartAge !== null ? [{
        label: 'Social Security',
        yearIndex: Math.max(0, Math.round(socialSecurityStartAge - (ageAtRetirement - yearsToRetirement))),
        detail: `Starts at age ${socialSecurityStartAge}`
      }] : []),
    ];

    return { timeline, maxIncome, milestones, yearsToRetirement, inflationRate };
  }, [
    formData.dateRetire,
    formData.dateOfBirth,
    formData.fYearsR,
    formData.fCurrentYearSalary,
    formData.fLastSalary,
    formData.fSalaryCOLA,
    formData.fAnnuityCOLA,
    formData.fOtherPensions,
    formData.fSocSec,
    summary.annualAnnuity,
    timelineMode,
    socialSecurityStartAge,
    ageAtRetirement,
  ]);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
    const checked = (event.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'Y' : 'N') : type === 'number' ? Number(value) : value,
    }));
  };

  const setArrayValue = (name: keyof FedEmployee, index: number, field: string, value: string | number) => {
    setFormData((prev) => {
      const next = [...((prev[name] as any[]) || [])];
      next[index] = { ...(next[index] || {}), [field]: value };
      return { ...prev, [name]: next };
    });
  };

  const addArrayRow = (name: keyof FedEmployee, row: any) => setFormData((prev) => ({ ...prev, [name]: [...((prev[name] as any[]) || []), row] }));
  const removeArrayRow = (name: keyof FedEmployee, index: number) => setFormData((prev) => ({ ...prev, [name]: ((prev[name] as any[]) || []).filter((_, i) => i !== index) }));

  const validateCurrentStep = (showErrors = false) => {
    const nextErrors: Record<string, string> = {};

    if (currentStep.id === 'background') {
      if (!formData.dateOfBirth) nextErrors.dateOfBirth = 'Date of Birth is required.';
      if (!formData.dateServiceComp) nextErrors.dateServiceComp = 'Service Comp date is required.';
      if (!formData.dateRetire) nextErrors.dateRetire = 'Planned Retirement date is required.';
      if (!formData.bCSRS && formData.bCSRS !== 'N') nextErrors.bCSRS = 'Retirement System is required.';
      ELIGIBILITY_FIELDS.forEach((field) => {
        if (field.required && formData[field.key] !== 'Y' && formData[field.key] !== 'N') {
          nextErrors[field.key] = 'This field is required.';
        }
      });
      if (formData.bCSRSTransfer === 'Y' && !formData.dateCSRSTransfer) nextErrors.dateCSRSTransfer = 'FERS Transfer date is required for transfer scenarios.';
    }

    if (currentStep.id === 'salary') {
      // Removed strict blocking validation to allow partial data testing
      // if (!Number(formData.fLastSalary || 0)) nextErrors.fLastSalary = 'Salary at time of retirement is required.';
      // const validRows = (formData.salaryHistory || []).filter((row) => row.startDate && Number(row.startAmount || 0) > 0);
      // if (!Number(formData.fManualHigh3 || 0) && validRows.length < 3) nextErrors.salaryHistory = 'Provide a known High-3 salary or at least three salary history rows.';
    }

    if (currentStep.id === 'tsp') {
      if (!Number(formData.fCurrentYearSalary || formData.fLastSalary || 0)) nextErrors.fCurrentYearSalary = 'Current annual salary is required for TSP projections.';
      if (fundAllocTotal > 100.01) nextErrors.arrFundAlloc = 'Fund allocation cannot exceed 100%.';
    }

    if (currentStep.id === 'email') {
      if (!email) nextErrors.email = 'Email is required.';
      if (!confirmEmail) nextErrors.confirmEmail = 'Confirm email is required.';
      if (email && confirmEmail && email !== confirmEmail) nextErrors.confirmEmail = 'Email addresses must match.';
    }

    if (showErrors) setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = async () => {
    if (!validateCurrentStep(true)) return;
    if (currentStep.id === 'reports') {
      setIsCalculating(true);
      setApiError(null);
      try {
        const data = await myfedplanApi.calculateRetirement(formData, formData.bCSRS === 'Y' ? 'csrs' : 'fers');
        setReportData(data);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Calculation error:', error);
        }
        setApiError('Unable to calculate eligibility. Please check your dates or required fields and try again.');
      } finally {
        setIsCalculating(false);
      }
    }
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
  };

  const goPrevious = () => {
    setErrors({});
    setApiError(null);
    setStepIndex((index) => Math.max(index - 1, 0));
  };

  const handlePrint = () => openBrandedPrintReport({
    title: 'Full Retirement Analysis',
    subtitle: 'Friendly printer version of your multi-report retirement analysis.',
    sections: [
      {
        title: 'Scenario Summary',
        lines: [
          { label: 'Retirement System', value: formData.bCSRS === 'Y' ? 'CSRS' : 'FERS' },
          { label: 'Date of Birth', value: formData.dateOfBirth || 'N/A' },
          { label: 'Service Computation Date', value: formData.dateServiceComp || 'N/A' },
          { label: 'Planned Retirement Date', value: formData.dateRetire || 'N/A' },
          { label: 'Age at Retirement', value: formatYears(ageAtRetirement) },
          { label: 'Creditable Service', value: formatYears(serviceYears) },
          { label: 'High-3 Salary', value: `$${currency(high3Value)}` },
          { label: 'Selected Modules', value: reportSections.length ? reportSections.map((section) => section.label).join(', ') : 'None selected' },
        ],
      },
      {
        title: 'Income Summary',
        lines: [
          { label: 'Annual Annuity', value: `$${currency(summary.annualAnnuity)}` },
          { label: 'Monthly Annuity', value: `$${currency(summary.monthlyAnnuity)}` },
          { label: 'Monthly Deductions', value: `$${currency(summary.deductions)}` },
          { label: 'Net Monthly Income', value: `$${currency(summary.netMonthly)}` },
          { label: 'Current TSP Balance', value: `$${currency(currentTspBalance)}` },
          { label: 'Projected TSP at Retirement', value: `$${currency(projectedTspAtRetirement)}` },
          { label: 'Social Security Estimate', value: `$${currency(Number(formData.fSocSec || 0))}` },
          { label: 'Other Pension Income', value: `$${currency(Number(formData.fOtherPensions || 0))}` },
        ],
      },
    ],
  });

  const systemLabel = formData.bCSRS === 'Y' ? (formData.bCSRSTransfer === 'Y' ? 'CSRS Offset / CSRS-to-FERS Transfer' : 'CSRS') : 'FERS';

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Full Retirement Analysis",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "provider": {
      "@type": "Organization",
      "name": "MyFedPlan"
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <SEO 
        title="Comprehensive Federal Retirement Analysis | FERS, CSRS, TSP | MyFedPlan"
        description="Run a complete federal retirement analysis. Combine FERS/CSRS pension estimates, TSP projections, and Social Security for a full financial picture."
        schema={schema}
      />
      <main className="max-w-[1120px] mx-auto px-6 pb-20 pt-12">
        <button onClick={() => onNavigate('home')} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-2 mb-8 cursor-pointer bg-none border-none p-0 font-sans transition-colors duration-120 hover:text-blue">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5"><path d="M10 3L5 8l5 5" /></svg>
          All Calculators
        </button>

        <div className="flex flex-col gap-3 mb-8">
          <h1 className="font-serif text-4xl font-normal text-text">Full Retirement Analysis</h1>
          <p className="text-text-2 text-sm max-w-4xl">A comprehensive guided scenario builder that collects foundational retirement, income, benefits, TSP, military deposit, and reporting preferences to generate a detailed retirement analysis.</p>
        </div>

        {(linkedData.tsp || linkedData.socialSecurity) && (
          <div className="mb-8 rounded-lg border border-blue/20 bg-blue-50 px-5 py-4 text-sm text-text-2">
            <div className="font-semibold text-text mb-1">Unified calculator data detected</div>
            <div>Your saved TSP scenario has preloaded salary, retirement-date, and fund details here, and your Social Security estimate is already included in the full analysis inputs.</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
          <aside className="bg-white border border-border rounded-lg p-5 h-fit">
            <div className="text-xs uppercase tracking-[0.08em] text-text-3 mb-4">Scenario Builder</div>
            <div className="space-y-3">
              {STEPS.map((step, index) => {
                const isClickable = index < stepIndex || (index > stepIndex && validateCurrentStep());
                return (
                  <button 
                    key={step.id} 
                    onClick={() => isClickable && setStepIndex(index)}
                    disabled={!isClickable}
                    className={`w-full text-left rounded-md border px-3 py-3 transition-colors ${index === stepIndex ? 'border-blue bg-blue-50' : index < stepIndex ? 'border-green-200 bg-green-50 cursor-pointer hover:bg-green-100' : isClickable ? 'border-border bg-white cursor-pointer hover:bg-gray-50' : 'border-border bg-gray-50 opacity-50 cursor-not-allowed'}`}
                  >
                    <div className="text-xs font-semibold uppercase tracking-wide text-text-3">{step.label}</div>
                    <div className="font-semibold text-sm text-text">{step.description}</div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-border bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-serif text-2xl text-text">{currentStep.description}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={goPrevious}
                    disabled={stepIndex === 0}
                    className="px-3 py-1.5 text-xs font-medium text-text-2 bg-white border border-border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {stepIndex < STEPS.length - 1 && (
                    <button
                      onClick={goNext}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-blue rounded-md hover:bg-blue/90 transition-colors"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-text-2 mt-2">{currentStep.id === 'background' && 'Collect the dates, retirement system, and eligibility factors that drive downstream age, service, and annuity logic.'}
                {currentStep.id === 'salary' && 'Capture salary-at-retirement, High-3 inputs, salary history, Social Security earnings, and part-time adjustments.'}
                {currentStep.id === 'deposits' && 'Add non-deduction service and refunded service details that affect service credit and redeposit assumptions.'}
                {currentStep.id === 'military' && 'Model military deposit balances using either simplified or detailed buyback information, including USERRA-related values.'}
                {currentStep.id === 'tsp' && 'Set contribution behavior, catch-up contributions, fund allocations, balances, and assumed returns for future TSP projections.'}
                {currentStep.id === 'insurance' && 'Apply FEGLI, FEHB, and survivor benefit choices that influence retirement deductions.'}
                {currentStep.id === 'cola' && 'Configure salary growth, annuity COLA, savings return, retirement duration, and income-gap planning assumptions.'}
                {currentStep.id === 'reports' && 'Choose which report modules should appear in the generated analysis package.'}
                {currentStep.id === 'summary' && 'Review the consolidated annuity summary, salary breakdown, and explanatory notes.'}
                {currentStep.id === 'email' && 'Enter a matching email address to receive the personalized retirement analysis, or print the report for offline use.'}
              </p>
            </div>

            <div className="p-8 space-y-8">
              {currentStep.id === 'background' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Field label="Date of Birth *" error={errors.dateOfBirth}><input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} className={inputClass(errors.dateOfBirth)} /></Field>
                    <Field label="Service Comp *" error={errors.dateServiceComp}><input type="date" name="dateServiceComp" value={formData.dateServiceComp || ''} onChange={handleChange} className={inputClass(errors.dateServiceComp)} /></Field>
                    <Field label="Planned Retirement date *" error={errors.dateRetire}><input type="date" name="dateRetire" value={formData.dateRetire || ''} onChange={handleChange} className={inputClass(errors.dateRetire)} /></Field>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <Metric label="Age at retirement" value={formatYears(ageAtRetirement)} />
                    <Metric label="Total service" value={formatYears(serviceYears)} />
                    <Metric label="Retirement system logic" value={systemLabel} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Retirement System *" error={errors.bCSRS}>
                      <select name="bCSRS" value={formData.bCSRS || 'N'} onChange={handleChange} className={inputClass(errors.bCSRS)}>
                        <option value="N">FERS</option>
                        <option value="Y">CSRS</option>
                      </select>
                    </Field>
                    <Field label="CSRS-to-FERS transfer scenario">
                      <select name="bCSRSTransfer" value={formData.bCSRSTransfer || 'N'} onChange={handleChange} className={inputClass()}>
                        <option value="N">No</option>
                        <option value="Y">Yes</option>
                      </select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ELIGIBILITY_FIELDS.map((field) => (
                      <div key={field.key}>
                        <Field label={`${field.label} *`} error={errors[field.key]}>
                          <select name={field.key} value={(formData[field.key] as string) || ''} onChange={handleChange} className={inputClass(errors[field.key])}>
                            <option value="">Select...</option>
                            <option value="Y">Yes</option>
                            <option value="N">No</option>
                          </select>
                        </Field>
                      </div>
                    ))}
                  </div>
                  {formData.bCSRSTransfer === 'Y' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
                      <Field label="FERS Transfer date" error={errors.dateCSRSTransfer}><input type="date" name="dateCSRSTransfer" value={formData.dateCSRSTransfer || ''} onChange={handleChange} className={inputClass(errors.dateCSRSTransfer)} /></Field>
                      <Field label="Sick leave at time of transfer (hours)"><input type="number" name="nXFerSickLeave" value={formData.nXFerSickLeave || ''} onChange={handleChange} className={inputClass()} /></Field>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
                    <Field label="Unused sick leave at retirement (hours)"><input type="number" name="nSickLeaveHrs" value={formData.nSickLeaveHrs || ''} onChange={handleChange} className={inputClass()} /></Field>
                    <Field label="Annual leave at retirement (hours)"><input type="number" name="nAnnualLeaveHrs" value={formData.nAnnualLeaveHrs || ''} onChange={handleChange} className={inputClass()} /></Field>
                  </div>
                </>
              )}

              {currentStep.id === 'salary' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Salary at time of retirement *" error={errors.fLastSalary}><input type="number" name="fLastSalary" value={formData.fLastSalary || ''} onChange={handleChange} className={inputClass(errors.fLastSalary)} /></Field>
                    <Field label="Known High-3 salary"><input type="number" name="fManualHigh3" value={formData.fManualHigh3 || ''} onChange={handleChange} className={inputClass()} /></Field>
                  </div>
                  <Field label="Salary History (minimum three rows if High-3 is not entered)" error={errors.salaryHistory}>
                    <div className="space-y-3">
                      {(formData.salaryHistory || []).map((row, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
                          <input type="date" value={row.startDate || ''} onChange={(e) => setArrayValue('salaryHistory', index, 'startDate', e.target.value)} className={inputClass()} />
                          <input type="number" value={row.startAmount || ''} onChange={(e) => setArrayValue('salaryHistory', index, 'startAmount', Number(e.target.value))} className={inputClass()} placeholder="Salary Amount" />
                          <button onClick={() => removeArrayRow('salaryHistory', index)} className="px-3 py-2 border border-border rounded-md text-sm hover:bg-gray-50">Remove</button>
                        </div>
                      ))}
                      <button onClick={() => addArrayRow('salaryHistory', { startDate: '', startAmount: 0 })} className="text-sm text-blue font-semibold hover:underline">+ Add salary history row</button>
                    </div>
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border">
                    <Field label="Current year FICA-covered earnings"><input type="number" name="fCurrentYearSalary" value={formData.fCurrentYearSalary || ''} onChange={handleChange} className={inputClass()} /></Field>
                    <Field label="Projected future yearly earnings"><input type="number" name="fFutureYearsSalary" value={formData.fFutureYearsSalary || ''} onChange={handleChange} className={inputClass()} /></Field>
                    <Field label="Social Security estimate at retirement (annual)"><input type="number" name="fSocSec" value={formData.fSocSec || ''} onChange={handleChange} className={inputClass()} /></Field>
                  </div>
                  <div className="pt-6 border-t border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-text">Part-time service adjustments</h3>
                      <button onClick={() => addArrayRow('partTime', { fromDate: '', toDate: '', hrsPerPeriod: 0 })} className="text-sm text-blue font-semibold hover:underline">+ Add adjustment</button>
                    </div>
                    {(formData.partTime || []).length === 0 && <p className="text-sm text-text-3">No part-time adjustments entered.</p>}
                    {(formData.partTime || []).map((row, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3">
                        <input type="date" value={row.fromDate || ''} onChange={(e) => setArrayValue('partTime', index, 'fromDate', e.target.value)} className={inputClass()} />
                        <input type="date" value={row.toDate || ''} onChange={(e) => setArrayValue('partTime', index, 'toDate', e.target.value)} className={inputClass()} />
                        <input type="number" value={row.hrsPerPeriod || ''} onChange={(e) => setArrayValue('partTime', index, 'hrsPerPeriod', Number(e.target.value))} className={inputClass()} placeholder="Hours per Pay Period" />
                        <button onClick={() => removeArrayRow('partTime', index)} className="px-3 py-2 border border-border rounded-md text-sm hover:bg-gray-50">Remove</button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {currentStep.id === 'deposits' && (
                <div className="space-y-8">
                  <RepeatGroup title="Deposit Service" buttonLabel="+ Add deposit period" onAdd={() => addArrayRow('deposits', { fromDate: '', toDate: '', salary: 0 })}>
                    {(formData.deposits || []).map((row, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3">
                        <input type="date" value={row.fromDate || ''} onChange={(e) => setArrayValue('deposits', index, 'fromDate', e.target.value)} className={inputClass()} />
                        <input type="date" value={row.toDate || ''} onChange={(e) => setArrayValue('deposits', index, 'toDate', e.target.value)} className={inputClass()} />
                        <input type="number" value={row.salary || ''} onChange={(e) => setArrayValue('deposits', index, 'salary', Number(e.target.value))} className={inputClass()} placeholder="Salary" />
                        <button onClick={() => removeArrayRow('deposits', index)} className="px-3 py-2 border border-border rounded-md text-sm hover:bg-gray-50">Remove</button>
                      </div>
                    ))}
                  </RepeatGroup>
                  <RepeatGroup title="Redeposit Service" buttonLabel="+ Add redeposit period" onAdd={() => addArrayRow('redeposits', { depositDate: '', fromDate: '', toDate: '', amount: 0 })}>
                    {(formData.redeposits || []).map((row, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3">
                        <input type="date" value={row.depositDate || ''} onChange={(e) => setArrayValue('redeposits', index, 'depositDate', e.target.value)} className={inputClass()} />
                        <input type="date" value={row.fromDate || ''} onChange={(e) => setArrayValue('redeposits', index, 'fromDate', e.target.value)} className={inputClass()} />
                        <input type="date" value={row.toDate || ''} onChange={(e) => setArrayValue('redeposits', index, 'toDate', e.target.value)} className={inputClass()} />
                        <input type="number" value={row.amount || ''} onChange={(e) => setArrayValue('redeposits', index, 'amount', Number(e.target.value))} className={inputClass()} placeholder="Refund Amount" />
                        <button onClick={() => removeArrayRow('redeposits', index)} className="px-3 py-2 border border-border rounded-md text-sm hover:bg-gray-50">Remove</button>
                      </div>
                    ))}
                  </RepeatGroup>
                </div>
              )}

              {currentStep.id === 'military' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Current military deposit balance"><input type="number" name="fCurBalance" value={formData.fCurBalance || ''} onChange={handleChange} className={inputClass()} /></Field>
                    <Field label="Anniversary date for simplified interest"><input type="date" name="dateAnniversaryDate" value={formData.dateAnniversaryDate || ''} onChange={handleChange} className={inputClass()} /></Field>
                    <Field label="Civilian service start date"><input type="date" name="dateServiceComp" value={formData.dateServiceComp || ''} onChange={handleChange} className={inputClass()} /></Field>
                    <Field label="Total military earnings"><input type="number" name="fTotEarnings" value={formData.fTotEarnings || ''} onChange={handleChange} className={inputClass()} /></Field>
                    <Field label="USERRA / interrupted civilian-service earnings"><input type="number" name="fCivilEarnings" value={formData.fCivilEarnings || ''} onChange={handleChange} className={inputClass()} /></Field>
                    <Field label="Special case 1999 earnings"><input type="number" name="fEarnings1999" value={formData.fEarnings1999 || ''} onChange={handleChange} className={inputClass()} /></Field>
                    <Field label="Special case 2000 earnings"><input type="number" name="fEarnings2000" value={formData.fEarnings2000 || ''} onChange={handleChange} className={inputClass()} /></Field>
                    <Field label="Retirement system for deposit logic">
                      <select name="bCSRS" value={formData.bCSRS || 'N'} onChange={handleChange} className={inputClass()}>
                        <option value="N">FERS</option>
                        <option value="Y">CSRS</option>
                      </select>
                    </Field>
                  </div>
                </>
              )}

              {currentStep.id === 'tsp' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Field label="Current annual salary *" error={errors.fCurrentYearSalary}><input type="number" name="fCurrentYearSalary" value={formData.fCurrentYearSalary || ''} onChange={handleChange} className={inputClass(errors.fCurrentYearSalary)} /></Field>
                    <Field label="Annual contribution percentage"><input type="number" name="nFuncPctContrib" value={formData.nFuncPctContrib || ''} onChange={handleChange} className={inputClass()} /></Field>
                    <Field label="Catch-up contributions"><input type="number" name="fCatchupContrib" value={formData.fCatchupContrib || ''} onChange={handleChange} className={inputClass()} /></Field>
                  </div>
                  <Field label="Fund allocation, balances, and rate of return" error={errors.arrFundAlloc}>
                    <div className="space-y-3">
                      {FUND_NAMES.map((fund, index) => (
                        <div key={fund} className="grid grid-cols-1 md:grid-cols-[180px_1fr_1fr_1fr] gap-3 items-center">
                          <div className="font-medium text-sm text-text">{fund}</div>
                          <input type="number" value={formData.arrFundAlloc?.[index] || ''} onChange={(e) => updateNumberArray(setFormData, 'arrFundAlloc', index, Number(e.target.value))} className={inputClass()} placeholder="Allocation %" />
                          <input type="number" value={formData.arrFundBalance?.[index] || ''} onChange={(e) => updateNumberArray(setFormData, 'arrFundBalance', index, Number(e.target.value))} className={inputClass()} placeholder="Current Balance" />
                          <input type="number" value={formData.arrFundPctReturn?.[index] || ''} onChange={(e) => updateNumberArray(setFormData, 'arrFundPctReturn', index, Number(e.target.value))} className={inputClass()} placeholder="Rate of Return %" />
                        </div>
                      ))}
                    </div>
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <Metric label="Allocation total" value={`${fundAllocTotal.toFixed(2)}%`} />
                    <Metric label="Current TSP balance" value={`$${currency(currentTspBalance)}`} />
                    <Metric label="Projected balance at retirement" value={`$${currency(projectedTspAtRetirement)}`} />
                  </div>
                </>
              )}

              {currentStep.id === 'insurance' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Apply life insurance deductions?">
                      <select name="bLifeIns" value={formData.bLifeIns || 'N'} onChange={handleChange} className={inputClass()}>
                        <option value="Y">Yes</option>
                        <option value="N">No</option>
                      </select>
                    </Field>
                    <Field label="Current bi-weekly health insurance deductions"><input type="number" name="fHealthInsDeduct" value={formData.fHealthInsDeduct || ''} onChange={handleChange} className={inputClass()} /></Field>
                  </div>
                  {formData.bLifeIns === 'Y' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                      <Field label="Basic FEGLI reduction option">
                        <select name="nLifeInsBasic" value={Number(formData.nLifeInsBasic || 0)} onChange={handleChange} className={inputClass()}>
                          <option value={0}>75% reduction</option>
                          <option value={1}>50% reduction</option>
                          <option value={2}>No reduction</option>
                        </select>
                      </Field>
                      <Field label="Additional option multiples">
                        <select name="nLifeInsOption" value={Number(formData.nLifeInsOption || 0)} onChange={handleChange} className={inputClass()}>
                          {[0, 1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value === 0 ? 'None' : `${value}x`}</option>)}
                        </select>
                      </Field>
                      <ToggleField label="Option A" name="bLifeInsA" value={formData.bLifeInsA || 'N'} onChange={handleChange} />
                      <ToggleField label="Option B" name="bLifeInsB" value={formData.bLifeInsB || 'N'} onChange={handleChange} />
                      <ToggleField label="Option C" name="bLifeInsC" value={formData.bLifeInsC || 'N'} onChange={handleChange} />
                    </div>
                  )}
                  <div className="pt-6 border-t border-border space-y-4">
                    <Field label="Calculate survivor benefits?">
                      <select name="nSurvivor" value={Number(formData.nSurvivor || 0)} onChange={handleChange} className={inputClass()}>
                        <option value={0}>No</option>
                        <option value={50}>Yes — 50%</option>
                        <option value={25}>Yes — 25%</option>
                      </select>
                    </Field>
                    {Number(formData.nSurvivor || 0) > 0 && <Field label="Survivor annuity base override"><input type="number" name="nSurvivorBase" value={formData.nSurvivorBase || ''} onChange={handleChange} className={inputClass()} /></Field>}
                  </div>
                </>
              )}

              {currentStep.id === 'cola' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Estimated annual salary increase %"><input type="number" name="fSalaryCOLA" value={formData.fSalaryCOLA || ''} onChange={handleChange} className={inputClass()} /></Field>
                  <Field label="Estimated annuity COLA %"><input type="number" name="fAnnuityCOLA" value={formData.fAnnuityCOLA || ''} onChange={handleChange} className={inputClass()} /></Field>
                  <Field label="Percent of current income desired in retirement"><input type="number" name="fFedAnnuity" value={formData.fFedAnnuity || ''} onChange={handleChange} className={inputClass()} /></Field>
                  <Field label="Estimated rate of return on savings %"><input type="number" name="fRateOfReturn" value={formData.fRateOfReturn || ''} onChange={handleChange} className={inputClass()} /></Field>
                  <Field label="Years in retirement"><input type="number" name="fYearsR" value={formData.fYearsR || ''} onChange={handleChange} className={inputClass()} /></Field>
                  <Field label="Other pension income (annual)"><input type="number" name="fOtherPensions" value={formData.fOtherPensions || ''} onChange={handleChange} className={inputClass()} /></Field>
                  <Field label="Current savings balance"><input type="number" name="fCurrentSavings" value={formData.fCurrentSavings || ''} onChange={handleChange} className={inputClass()} /></Field>
                </div>
              )}

              {currentStep.id === 'reports' && (
                <div className="space-y-4">
                  {REPORT_OPTIONS.map((option) => (
                    <label key={option.key} className="flex items-start gap-3 p-4 border border-border rounded-md hover:bg-gray-50">
                      <input type="checkbox" checked={formData[option.key] === 'Y'} onChange={(e) => setFormData((prev) => ({ ...prev, [option.key]: e.target.checked ? 'Y' : 'N' }))} className="mt-1" />
                      <span>
                        <span className="block font-semibold text-text">{option.label}</span>
                        <span className="block text-sm text-text-2">{option.description}</span>
                      </span>
                    </label>
                  ))}
                  {apiError && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{apiError}</div>}
                </div>
              )}

              {currentStep.id === 'summary' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <Metric label="Retirement system" value={systemLabel} />
                    <Metric label="Retirement date" value={formData.dateRetire || '—'} />
                    <Metric label="Age at retirement" value={formatYears(ageAtRetirement)} />
                    <Metric label="Total service time" value={formatYears(serviceYears)} />
                    <Metric label="High-3 salary" value={`$${currency(high3Value)}`} />
                    <Metric label="Annuity percentage" value={`${summary.annuityPercent.toFixed(2)}%`} />
                    <Metric label="Basic annuity (annual)" value={`$${currency(summary.annualAnnuity)}`} />
                    <Metric label="Basic annuity (monthly)" value={`$${currency(summary.monthlyAnnuity)}`} />
                    <Metric label="Cash value of annual leave" value={`$${currency(annualLeaveCash)}`} />
                    <Metric label="Monthly deductions" value={`$${currency(summary.deductions)}`} />
                    <Metric label="Full annuity" value={`$${currency(summary.fullAnnuity)}`} />
                    <Metric label="Net monthly annuity" value={`$${currency(summary.netMonthly)}`} />
                  </div>

                  {summary.annualAnnuity === 0 && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                      <strong>Note:</strong> The calculated annuity is $0. Additional inputs (such as salary history or creditable service) may improve the accuracy of this estimate.
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-text mb-3">Salary history breakdown</h3>
                    <div className="overflow-x-auto border border-border rounded-md">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-text-2">
                          <tr>
                            <th className="px-4 py-3 text-left">Starting Date</th>
                            <th className="px-4 py-3 text-left">Salary Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(formData.salaryHistory || []).map((row, index) => (
                            <tr key={index} className="border-t border-border">
                              <td className="px-4 py-3">{row.startDate || '—'}</td>
                              <td className="px-4 py-3">${currency(row.startAmount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-gradient-to-br from-slate-50 to-white p-5 space-y-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h3 className="font-semibold text-text">Timeline / Life Projection View</h3>
                        <p className="text-sm text-text-2 mt-1">See the transition from working salary to retirement pension and the later Social Security step-up in {timelineMode === 'real' ? 'inflation-adjusted' : 'nominal'} dollars.</p>
                      </div>
                      <div className="inline-flex rounded-md border border-border bg-white p-1">
                        <button onClick={() => setTimelineMode('real')} className={`px-3 py-2 text-sm rounded ${timelineMode === 'real' ? 'bg-blue text-white' : 'text-text-2'}`}>Inflation-adjusted</button>
                        <button onClick={() => setTimelineMode('nominal')} className={`px-3 py-2 text-sm rounded ${timelineMode === 'nominal' ? 'bg-blue text-white' : 'text-text-2'}`}>Nominal</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      {lifeProjection.milestones.map((milestone) => (
                        <div key={milestone.label} className="rounded-md border border-border bg-white px-4 py-3">
                          <div className="text-xs uppercase tracking-wide text-text-3">{milestone.label}</div>
                          <div className="font-semibold text-text mt-1">Year {new Date().getUTCFullYear() + milestone.yearIndex}</div>
                          <div className="text-text-2 mt-1">{milestone.detail}</div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {lifeProjection.timeline.map((row) => {
                        return (
                          <div key={row.yearIndex} className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 items-center">
                            <div className="text-xs text-text-3">
                              <div className="font-semibold text-text">{row.calendarYear}</div>
                              <div>{row.age !== null ? `Age ${row.age.toFixed(1)}` : 'Age —'}</div>
                            </div>
                            <div>
                              <div className="relative h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                <div className="absolute inset-y-0 left-0 bg-sky-500" style={{ width: `${lifeProjection.maxIncome ? (row.displaySalary / lifeProjection.maxIncome) * 100 : 0}%` }} />
                                <div className="absolute inset-y-0 bg-emerald-500" style={{ left: `${lifeProjection.maxIncome ? (row.displaySalary / lifeProjection.maxIncome) * 100 : 0}%`, width: `${lifeProjection.maxIncome ? (row.displayPension / lifeProjection.maxIncome) * 100 : 0}%` }} />
                                <div className="absolute inset-y-0 bg-violet-500" style={{ left: `${lifeProjection.maxIncome ? ((row.displaySalary + row.displayPension) / lifeProjection.maxIncome) * 100 : 0}%`, width: `${lifeProjection.maxIncome ? (row.displaySocialSecurity / lifeProjection.maxIncome) * 100 : 0}%` }} />
                                <div className="absolute inset-y-0 bg-amber-400" style={{ left: `${lifeProjection.maxIncome ? ((row.displaySalary + row.displayPension + row.displaySocialSecurity) / lifeProjection.maxIncome) * 100 : 0}%`, width: `${lifeProjection.maxIncome ? (row.displayOtherPension / lifeProjection.maxIncome) * 100 : 0}%` }} />
                                <div className="absolute inset-0 flex items-center justify-between px-4 text-xs font-medium text-slate-900">
                                  <span>{row.phase}</span>
                                  <span>${currency(row.displayTotal)}</span>
                                </div>
                              </div>
                              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-3">
                                <span>Salary ${currency(row.displaySalary)}</span>
                                <span>Pension ${currency(row.displayPension)}</span>
                                <span>Social Security ${currency(row.displaySocialSecurity)}</span>
                                <span>Other ${currency(row.displayOtherPension)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-text-3">
                      <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-sky-500" />Salary</span>
                      <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Pension / annuity</span>
                      <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-violet-500" />Social Security</span>
                      <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />Other pension</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-text-2">
                    <p><strong>Selected report modules:</strong> {reportSections.length ? reportSections.map((section) => section.label).join(', ') : 'None selected.'}</p>
                    <p><strong>Additional explanatory notes:</strong> Age/service formulas, special retirement eligibility, leave balances, and CSRS/FERS transfer splits are preserved as scenario inputs and reflected in the summary output.</p>
                    <p><strong>Projection note:</strong> Timeline amounts use salary growth of {Number(formData.fSalaryCOLA || 0).toFixed(1)}% and retirement-income COLA / inflation assumption of {(lifeProjection.inflationRate * 100).toFixed(1)}%.</p>
                    {formData.bCSRSTransfer === 'Y' && <p>This scenario includes CSRS-to-FERS transfer handling with transfer date {formData.dateCSRSTransfer || '—'} and transfer sick leave of {Number(formData.nXFerSickLeave || 0)} hours.</p>}
                    {Number(formData.nSurvivor || 0) > 0 && <p>Survivor reduction assumptions are included using the selected {Number(formData.nSurvivor || 0)}% option.</p>}
                  </div>

                  {reportData?.fers?.html && formData.bCSRS !== 'Y' && (
                    <div className="mt-8">
                      <h3 className="font-semibold text-lg mb-4 border-b pb-2">Detailed Report</h3>
                      <div 
                        className="myfedplan-report"
                        onClick={handleHtmlClick}
                        dangerouslySetInnerHTML={{ __html: reportData.fers.html }}
                      />
                    </div>
                  )}
                  {reportData?.csrs?.html && formData.bCSRS === 'Y' && (
                    <div className="mt-8">
                      <h3 className="font-semibold text-lg mb-4 border-b pb-2">Detailed Report</h3>
                      <div 
                        className="myfedplan-report"
                        onClick={handleHtmlClick}
                        dangerouslySetInnerHTML={{ __html: reportData.csrs.html }}
                      />
                    </div>
                  )}
                </div>
              )}

              {currentStep.id === 'email' && (
                <div className="max-w-xl space-y-6">
                  <Field label="Email address *" error={errors.email}>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => {
                        setEmail(e.target.value);
                        updateProfile({ email: e.target.value });
                      }} 
                      className={`${inputClass(errors.email)} min-h-[44px]`} 
                    />
                  </Field>
                  <Field label="Confirm email address *" error={errors.confirmEmail}>
                    <input 
                      type="email" 
                      value={confirmEmail} 
                      onChange={(e) => setConfirmEmail(e.target.value)} 
                      className={`${inputClass(errors.confirmEmail)} min-h-[44px]`} 
                    />
                  </Field>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={handlePrint} className="px-6 py-3 bg-white border border-border text-text rounded-md font-semibold hover:bg-gray-50 transition-colors">Friendly Printer Version</button>
                    <button onClick={() => validateCurrentStep() && alert(`Report queued for ${email}`)} className="px-6 py-3 bg-blue text-white rounded-md font-semibold hover:bg-blue-hover transition-colors">Email My Report</button>
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 py-5 border-t border-border bg-gray-50 flex items-center justify-between gap-3">
              <button onClick={goPrevious} disabled={stepIndex === 0} className="px-5 py-2.5 border border-border rounded-md text-sm font-semibold disabled:opacity-50">Previous</button>
              <div className="text-xs text-text-3">{currentStep.label} of {STEPS.length}</div>
              {stepIndex < STEPS.length - 1 ? (
                <button onClick={goNext} disabled={isCalculating} className="px-5 py-2.5 bg-blue text-white rounded-md text-sm font-semibold hover:bg-blue-hover disabled:opacity-70">{currentStep.id === 'reports' ? (isCalculating ? 'Generating...' : 'Generate Report') : 'Next'}</button>
              ) : (
                <button onClick={() => validateCurrentStep() && alert(`Report queued for ${email}`)} className="px-5 py-2.5 bg-blue text-white rounded-md text-sm font-semibold hover:bg-blue-hover">Finish</button>
              )}
            </div>
          </section>
        </div>

        <DebugPanel 
          debugInfo={reportData?.debugInfo} 
          parsedData={formData.bCSRS === 'Y' ? reportData?.csrs : reportData?.fers} 
          rawResponse={reportData?.rawResponse}
        />
      </main>
    </div>
  );
}

function updateNumberArray(setter: React.Dispatch<React.SetStateAction<Partial<FedEmployee>>>, name: 'arrFundAlloc' | 'arrFundBalance' | 'arrFundPctReturn', index: number, value: number) {
  setter((prev) => {
    const next = [...(prev[name] || [])];
    next[index] = value;
    return { ...prev, [name]: next };
  });
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return <div><label className="block text-sm font-semibold text-text-2 mb-2">{label}</label>{children}{error && <p className="text-red-500 text-xs mt-1">{error}</p>}</div>;
}

function RepeatGroup({ title, buttonLabel, onAdd, children }: { title: string; buttonLabel: string; onAdd: () => void; children: React.ReactNode }) {
  return <div className="space-y-4"><div className="flex items-center justify-between"><h3 className="font-semibold text-text">{title}</h3><button onClick={onAdd} className="text-sm text-blue font-semibold hover:underline">{buttonLabel}</button></div>{children || <p className="text-sm text-text-3">No entries added yet.</p>}</div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-border bg-gray-50 px-4 py-3"><div className="text-xs uppercase tracking-wide text-text-3 mb-1">{label}</div><div className="font-semibold text-text">{value}</div></div>;
}

function ToggleField({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void }) {
  return <Field label={label}><select name={name} value={value} onChange={onChange} className={inputClass()}><option value="Y">Yes</option><option value="N">No</option></select></Field>;
}

function inputClass(error?: string) {
  return `w-full p-2.5 border rounded-md ${error ? 'border-red-500' : 'border-border'}`;
}