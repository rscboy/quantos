import React, { useMemo, useState } from 'react';

type RetirementSystem = 'FERS' | 'CSRS';
type FundKey = 'G Fund' | 'F Fund' | 'C Fund' | 'S Fund' | 'I Fund';
type PrimaryFundOption = 'L Fund 2025' | 'L Fund 2030' | 'L Fund 2035' | 'L Fund 2040' | 'L Fund 2045' | 'L Fund 2050' | 'L Fund 2055' | 'L Fund 2060' | 'L Fund 2065' | 'Custom Allocation';

type FundInput = {
  allocation: number;
  balance: number;
  rate: number;
  oneYear: string;
  tenYear: string;
};

type ContributionForm = {
  retirementSystem: RetirementSystem;
  plannedRetirementDate: string;
  dateOfBirth: string;
  currentAnnualSalary: number;
  annualPercentContribution: number;
  annualCatchUpContribution: number;
  annualCOLA: number;
};

type AnalysisRow = {
  year: number;
  age: number;
  salary: number;
  employeeContribution: number;
  catchUp: number;
  agencyMatch: number;
  funds: Record<FundKey, number>;
  total: number;
};

const STEP_TITLES = ['Annual Contributions', 'Fund Allocations', 'Thrift Savings Plan Analysis', 'Email Report'];
const FUND_ORDER: FundKey[] = ['G Fund', 'F Fund', 'C Fund', 'S Fund', 'I Fund'];
const FUND_CONTEXT: Record<FundKey, { oneYear: string; tenYear: string; defaultRate: number }> = {
  'G Fund': { oneYear: '4.9%', tenYear: '2.5%', defaultRate: 4.5 },
  'F Fund': { oneYear: '6.1%', tenYear: '1.9%', defaultRate: 4.8 },
  'C Fund': { oneYear: '26.3%', tenYear: '12.1%', defaultRate: 8.5 },
  'S Fund': { oneYear: '18.2%', tenYear: '8.7%', defaultRate: 9.1 },
  'I Fund': { oneYear: '11.4%', tenYear: '6.2%', defaultRate: 7.2 },
};
const L_FUNDS: PrimaryFundOption[] = ['L Fund 2025', 'L Fund 2030', 'L Fund 2035', 'L Fund 2040', 'L Fund 2045', 'L Fund 2050', 'L Fund 2055', 'L Fund 2060', 'L Fund 2065'];
const L_FUND_TARGETS: Record<PrimaryFundOption, Record<FundKey, number>> = {
  'L Fund 2025': { 'G Fund': 72, 'F Fund': 6, 'C Fund': 11, 'S Fund': 3, 'I Fund': 8 },
  'L Fund 2030': { 'G Fund': 64, 'F Fund': 7, 'C Fund': 16, 'S Fund': 4, 'I Fund': 9 },
  'L Fund 2035': { 'G Fund': 55, 'F Fund': 8, 'C Fund': 21, 'S Fund': 5, 'I Fund': 11 },
  'L Fund 2040': { 'G Fund': 46, 'F Fund': 8, 'C Fund': 28, 'S Fund': 6, 'I Fund': 12 },
  'L Fund 2045': { 'G Fund': 37, 'F Fund': 8, 'C Fund': 35, 'S Fund': 7, 'I Fund': 13 },
  'L Fund 2050': { 'G Fund': 29, 'F Fund': 7, 'C Fund': 42, 'S Fund': 8, 'I Fund': 14 },
  'L Fund 2055': { 'G Fund': 21, 'F Fund': 6, 'C Fund': 49, 'S Fund': 9, 'I Fund': 15 },
  'L Fund 2060': { 'G Fund': 16, 'F Fund': 5, 'C Fund': 53, 'S Fund': 10, 'I Fund': 16 },
  'L Fund 2065': { 'G Fund': 12, 'F Fund': 4, 'C Fund': 56, 'S Fund': 11, 'I Fund': 17 },
  'Custom Allocation': { 'G Fund': 20, 'F Fund': 10, 'C Fund': 40, 'S Fund': 15, 'I Fund': 15 },
};
const CONSERVATIVE_TARGET: Record<FundKey, number> = { 'G Fund': 74, 'F Fund': 6, 'C Fund': 11, 'S Fund': 3, 'I Fund': 6 };

const DEFAULT_CONTRIBUTION_FORM: ContributionForm = {
  retirementSystem: 'FERS',
  plannedRetirementDate: '',
  dateOfBirth: '',
  currentAnnualSalary: 90000,
  annualPercentContribution: 5,
  annualCatchUpContribution: 0,
  annualCOLA: 2,
};

const DEFAULT_FUNDS: Record<FundKey, FundInput> = FUND_ORDER.reduce((acc, fund) => {
  acc[fund] = {
    allocation: L_FUND_TARGETS['L Fund 2040'][fund],
    balance: 0,
    rate: FUND_CONTEXT[fund].defaultRate,
    oneYear: FUND_CONTEXT[fund].oneYear,
    tenYear: FUND_CONTEXT[fund].tenYear,
  };
  return acc;
}, {} as Record<FundKey, FundInput>);

function currency(value: number) {
  return value.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

function percent(value: number) {
  return `${value.toFixed(1)}%`;
}

function getAgeOnDate(dateOfBirth: string, date: Date) {
  if (!dateOfBirth) return 0;
  const birthDate = new Date(dateOfBirth);
  let age = date.getFullYear() - birthDate.getFullYear();
  const monthDelta = date.getMonth() - birthDate.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && date.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return Math.max(age, 0);
}

function getAgencyMatch(system: RetirementSystem, employeeContribution: number, salary: number) {
  if (system !== 'FERS') return 0;
  const contributionPct = salary > 0 ? (employeeContribution / salary) * 100 : 0;
  const autoOne = salary * 0.01;
  const firstThree = salary * Math.min(contributionPct, 3) * 0.01;
  const nextTwo = salary * Math.min(Math.max(contributionPct - 3, 0), 2) * 0.005;
  return autoOne + firstThree + nextTwo;
}

function normalizeAllocations(funds: Record<FundKey, FundInput>) {
  const total = FUND_ORDER.reduce((sum, fund) => sum + Number(funds[fund].allocation || 0), 0);
  return total;
}

function getGlideAllocation(primaryFund: PrimaryFundOption, baseAllocations: Record<FundKey, FundInput>, yearIndex: number, totalYears: number) {
  if (!L_FUNDS.includes(primaryFund)) {
    return FUND_ORDER.reduce((acc, fund) => {
      acc[fund] = Number(baseAllocations[fund].allocation || 0);
      return acc;
    }, {} as Record<FundKey, number>);
  }

  const start = L_FUND_TARGETS[primaryFund];
  const progress = totalYears <= 1 ? 1 : Math.min(yearIndex / Math.max(totalYears - 1, 1), 1);

  return FUND_ORDER.reduce((acc, fund) => {
    acc[fund] = start[fund] + (CONSERVATIVE_TARGET[fund] - start[fund]) * progress;
    return acc;
  }, {} as Record<FundKey, number>);
}

function projectAnalysisRows(contributionForm: ContributionForm, primaryFund: PrimaryFundOption, funds: Record<FundKey, FundInput>) {
  const today = new Date();
  const retirementDate = contributionForm.plannedRetirementDate ? new Date(contributionForm.plannedRetirementDate) : today;
  const startYear = today.getFullYear() + 1;
  const totalYears = Math.max(retirementDate.getFullYear() - today.getFullYear(), 1);
  const balances = FUND_ORDER.reduce((acc, fund) => {
    acc[fund] = Number(funds[fund].balance || 0);
    return acc;
  }, {} as Record<FundKey, number>);

  const rows: AnalysisRow[] = [];
  let totalContributions = 0;

  for (let yearIndex = 0; yearIndex < totalYears; yearIndex += 1) {
    const year = startYear + yearIndex;
    const age = getAgeOnDate(contributionForm.dateOfBirth, new Date(year, retirementDate.getMonth(), retirementDate.getDate() || 1));
    const salary = Number(contributionForm.currentAnnualSalary || 0) * Math.pow(1 + Number(contributionForm.annualCOLA || 0) / 100, yearIndex + 1);
    const employeeContribution = salary * (Number(contributionForm.annualPercentContribution || 0) / 100);
    const catchUp = age >= 50 ? Number(contributionForm.annualCatchUpContribution || 0) : 0;
    const agencyMatch = getAgencyMatch(contributionForm.retirementSystem, employeeContribution, salary);
    const annualDeposit = employeeContribution + catchUp + agencyMatch;
    const yearAllocations = getGlideAllocation(primaryFund, funds, yearIndex, totalYears);
    const rowFunds = {} as Record<FundKey, number>;

    FUND_ORDER.forEach((fund) => {
      const allocationPct = yearAllocations[fund] / 100;
      const contributionShare = annualDeposit * allocationPct;
      const rate = Number(funds[fund].rate || 0) / 100;
      balances[fund] = (balances[fund] + contributionShare) * (1 + rate);
      rowFunds[fund] = balances[fund];
    });

    totalContributions += annualDeposit;
    rows.push({
      year,
      age,
      salary,
      employeeContribution,
      catchUp,
      agencyMatch,
      funds: rowFunds,
      total: FUND_ORDER.reduce((sum, fund) => sum + rowFunds[fund], 0),
    });
  }

  return { rows, totalContributions };
}

export function TspCalculator({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [contributionForm, setContributionForm] = useState<ContributionForm>(DEFAULT_CONTRIBUTION_FORM);
  const [primaryFund, setPrimaryFund] = useState<PrimaryFundOption>('L Fund 2040');
  const [funds, setFunds] = useState<Record<FundKey, FundInput>>(DEFAULT_FUNDS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailData, setEmailData] = useState({ email: '', confirmEmail: '' });
  const totalAllocation = useMemo(() => normalizeAllocations(funds), [funds]);
  const { rows, totalContributions } = useMemo(() => projectAnalysisRows(contributionForm, primaryFund, funds), [contributionForm, primaryFund, funds]);

  const setContributionField = (field: keyof ContributionForm, value: string | number) => {
    setContributionForm((prev) => ({ ...prev, [field]: value }));
  };

  const setFundField = (fund: FundKey, field: keyof FundInput, value: number | string) => {
    setFunds((prev) => ({
      ...prev,
      [fund]: {
        ...prev[fund],
        [field]: typeof value === 'string' ? value : Number(value),
      },
    }));
  };

  const applyPrimaryFund = (option: PrimaryFundOption) => {
    setPrimaryFund(option);
    if (option !== 'Custom Allocation') {
      setFunds((prev) => {
        const next = { ...prev };
        FUND_ORDER.forEach((fund) => {
          next[fund] = { ...next[fund], allocation: L_FUND_TARGETS[option][fund] };
        });
        return next;
      });
    }
  };

  const validateStep = (stepToValidate: number) => {
    const nextErrors: Record<string, string> = {};

    if (stepToValidate === 1) {
      if (!contributionForm.retirementSystem) nextErrors.retirementSystem = 'Retirement System is required.';
      if (!contributionForm.plannedRetirementDate) nextErrors.plannedRetirementDate = 'Planned Retirement date is required.';
      if (!contributionForm.dateOfBirth) nextErrors.dateOfBirth = 'Date of Birth is required.';
      if (Number(contributionForm.currentAnnualSalary) <= 0) nextErrors.currentAnnualSalary = 'Current Annual Salary is required.';
      if (Number(contributionForm.annualPercentContribution) < 0) nextErrors.annualPercentContribution = 'Annual Percent Contribution is required.';
      if (Number(contributionForm.annualCOLA) < 0) nextErrors.annualCOLA = 'Annual Cost of Living Increase is required.';
      if (contributionForm.dateOfBirth && Number(contributionForm.annualCatchUpContribution) > 0 && getAgeOnDate(contributionForm.dateOfBirth, new Date()) < 50) {
        nextErrors.annualCatchUpContribution = 'Catch-up contributions are only allowed when the participant is age 50 or older.';
      }
    }

    if (stepToValidate === 2) {
      if (!primaryFund) nextErrors.primaryFund = 'Primary fund selection is required.';
      FUND_ORDER.forEach((fund) => {
        if (Number(funds[fund].allocation) < 0) nextErrors[`allocation-${fund}`] = 'Allocation must be zero or greater.';
        if (Number(funds[fund].balance) < 0) nextErrors[`balance-${fund}`] = 'Current balance must be zero or greater.';
      });
      if (Math.abs(totalAllocation - 100) > 0.001) nextErrors.totalAllocation = 'Combined allocation total must equal exactly 100%.';
    }

    if (stepToValidate === 4) {
      if (!emailData.email) nextErrors.email = 'Email address is required.';
      if (!emailData.confirmEmail) nextErrors.confirmEmail = 'Please re-type your email address.';
      if (emailData.email && emailData.confirmEmail && emailData.email !== emailData.confirmEmail) {
        nextErrors.confirmEmail = 'Email addresses must match before sending.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(current + 1, 4));
  };

  const handleSend = () => {
    if (!validateStep(4)) return;
    alert(`Report sent to ${emailData.email}`);
  };

  const handlePrint = () => window.print();
  const lastRow = rows[rows.length - 1];
  const currentAge = contributionForm.dateOfBirth ? getAgeOnDate(contributionForm.dateOfBirth, new Date()) : 0;

  return (
    <div className="animate-in fade-in duration-300">
      <main className="max-w-[1200px] mx-auto px-6 pb-20 pt-12">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-2 mb-8 cursor-pointer bg-none border-none p-0 font-sans transition-colors duration-120 hover:text-blue">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5"><path d="M10 3L5 8l5 5" /></svg>
          All Calculators
        </button>

        <h1 className="font-serif text-4xl font-normal text-text mb-3">Thrift Savings Plan Calculator</h1>
        <p className="text-text-2 text-sm mb-8">Focused four-step TSP projection flow with required annual contribution inputs, fund allocation math, year-by-year analysis, and legacy report delivery actions.</p>

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
                <h2 className="text-xl font-semibold mb-2">Annual Contributions</h2>
                <p className="text-text-2 text-sm">Enter the contribution assumptions that drive the TSP projection model. The Retirement System controls whether agency matching is applied.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Retirement System *">
                  <select value={contributionForm.retirementSystem} onChange={(e) => setContributionField('retirementSystem', e.target.value as RetirementSystem)} className={`w-full p-2.5 border ${errors.retirementSystem ? 'border-red-500' : 'border-border'} rounded-md`}>
                    <option value="FERS">FERS</option>
                    <option value="CSRS">CSRS</option>
                  </select>
                  {errors.retirementSystem && <ErrorText>{errors.retirementSystem}</ErrorText>}
                </Field>
                <Field label="Planned Retirement date *">
                  <input type="date" value={contributionForm.plannedRetirementDate} onChange={(e) => setContributionField('plannedRetirementDate', e.target.value)} className={`w-full p-2.5 border ${errors.plannedRetirementDate ? 'border-red-500' : 'border-border'} rounded-md`} />
                  {errors.plannedRetirementDate && <ErrorText>{errors.plannedRetirementDate}</ErrorText>}
                </Field>
                <Field label="Date of Birth *">
                  <input type="date" value={contributionForm.dateOfBirth} onChange={(e) => setContributionField('dateOfBirth', e.target.value)} className={`w-full p-2.5 border ${errors.dateOfBirth ? 'border-red-500' : 'border-border'} rounded-md`} />
                  <p className="text-xs text-text-3 mt-2">Current age: {currentAge || '—'}</p>
                  {errors.dateOfBirth && <ErrorText>{errors.dateOfBirth}</ErrorText>}
                </Field>
                <Field label="Current Annual Salary *">
                  <input type="number" min="0" value={contributionForm.currentAnnualSalary} onChange={(e) => setContributionField('currentAnnualSalary', Number(e.target.value))} className={`w-full p-2.5 border ${errors.currentAnnualSalary ? 'border-red-500' : 'border-border'} rounded-md`} />
                  {errors.currentAnnualSalary && <ErrorText>{errors.currentAnnualSalary}</ErrorText>}
                </Field>
                <Field label="Annual Percent Contribution *">
                  <input type="number" min="0" step="0.1" value={contributionForm.annualPercentContribution} onChange={(e) => setContributionField('annualPercentContribution', Number(e.target.value))} className={`w-full p-2.5 border ${errors.annualPercentContribution ? 'border-red-500' : 'border-border'} rounded-md`} />
                  {errors.annualPercentContribution && <ErrorText>{errors.annualPercentContribution}</ErrorText>}
                </Field>
                <Field label="Annual Catch-Up Contribution">
                  <input type="number" min="0" step="0.01" value={contributionForm.annualCatchUpContribution} onChange={(e) => setContributionField('annualCatchUpContribution', Number(e.target.value))} className={`w-full p-2.5 border ${errors.annualCatchUpContribution ? 'border-red-500' : 'border-border'} rounded-md`} />
                  <p className="text-xs text-text-3 mt-2">Catch-up contributions are extra annual deposits allowed only if the participant is age 50 or older.</p>
                  {errors.annualCatchUpContribution && <ErrorText>{errors.annualCatchUpContribution}</ErrorText>}
                </Field>
                <Field label="Annual Cost of Living Increase *">
                  <input type="number" min="0" step="0.1" value={contributionForm.annualCOLA} onChange={(e) => setContributionField('annualCOLA', Number(e.target.value))} className={`w-full p-2.5 border ${errors.annualCOLA ? 'border-red-500' : 'border-border'} rounded-md`} />
                  <p className="text-xs text-text-3 mt-2">This percentage controls annual salary growth assumptions over time.</p>
                  {errors.annualCOLA && <ErrorText>{errors.annualCOLA}</ErrorText>}
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-8 space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-2">Fund Allocations</h2>
                <p className="text-text-2 text-sm">Select a primary fund strategy, then enter allocation percentages, balances, and estimated returns for the underlying TSP funds. The combined allocation total is preserved and displayed exactly.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Primary fund selection *">
                  <select value={primaryFund} onChange={(e) => applyPrimaryFund(e.target.value as PrimaryFundOption)} className={`w-full p-2.5 border ${errors.primaryFund ? 'border-red-500' : 'border-border'} rounded-md`}>
                    {L_FUNDS.map((option) => <option key={option} value={option}>{option}</option>)}
                    <option value="Custom Allocation">Custom Allocation</option>
                  </select>
                  <p className="text-xs text-text-3 mt-2">Selecting an L Fund retains the legacy behavior that shifts allocations toward a conservative mix over time.</p>
                  {errors.primaryFund && <ErrorText>{errors.primaryFund}</ErrorText>}
                </Field>
                <div className="rounded-md border border-border bg-blue-lt/40 p-4">
                  <div className="text-xs uppercase tracking-wide text-text-3 mb-2">Combined allocation total</div>
                  <div className={`font-mono text-3xl ${Math.abs(totalAllocation - 100) < 0.001 ? 'text-blue' : 'text-red'}`}>{percent(totalAllocation)}</div>
                  {errors.totalAllocation && <ErrorText>{errors.totalAllocation}</ErrorText>}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border border-border rounded-md overflow-hidden">
                  <thead className="text-xs text-text-2 bg-gray-50 uppercase">
                    <tr>
                      <th className="px-4 py-3">Fund</th>
                      <th className="px-4 py-3">Allocation %</th>
                      <th className="px-4 py-3">Current Balance</th>
                      <th className="px-4 py-3">Estimated Return %</th>
                      <th className="px-4 py-3">Past 1-Year</th>
                      <th className="px-4 py-3">Past 10-Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FUND_ORDER.map((fund) => (
                      <tr key={fund} className="border-t border-border">
                        <td className="px-4 py-3 font-semibold">{fund}</td>
                        <td className="px-4 py-3">
                          <input type="number" min="0" step="0.1" value={funds[fund].allocation} onChange={(e) => setFundField(fund, 'allocation', Number(e.target.value))} className={`w-28 p-2 border ${errors[`allocation-${fund}`] ? 'border-red-500' : 'border-border'} rounded-md`} />
                          {errors[`allocation-${fund}`] && <ErrorText>{errors[`allocation-${fund}`]}</ErrorText>}
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" min="0" step="0.01" value={funds[fund].balance} onChange={(e) => setFundField(fund, 'balance', Number(e.target.value))} className={`w-36 p-2 border ${errors[`balance-${fund}`] ? 'border-red-500' : 'border-border'} rounded-md`} />
                          {errors[`balance-${fund}`] && <ErrorText>{errors[`balance-${fund}`]}</ErrorText>}
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" step="0.1" value={funds[fund].rate} onChange={(e) => setFundField(fund, 'rate', Number(e.target.value))} className="w-28 p-2 border border-border rounded-md" />
                        </td>
                        <td className="px-4 py-3 text-text-2">{funds[fund].oneYear}</td>
                        <td className="px-4 py-3 text-text-2">{funds[fund].tenYear}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-8 space-y-8 bg-gray-50">
              <div className="bg-white p-8 border border-border rounded-lg shadow-sm space-y-6">
                <div>
                  <h2 className="text-2xl font-serif text-blue mb-2">Thrift Savings Plan Analysis</h2>
                  <p className="text-text-2 text-sm">Year-by-year projected growth beginning one year from today and continuing through the planned retirement year.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ResultCard label="Projected balance at retirement" value={currency(lastRow?.total || 0)} />
                  <ResultCard label="Total Contributions" value={currency(totalContributions)} />
                  <ResultCard label="Years projected" value={`${rows.length}`} />
                </div>

                <div className="border border-border rounded-md p-4 bg-[#FCFCFD]">
                  <h3 className="font-semibold text-text mb-2">Data Assumptions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-text-2">
                    <div><span className="font-semibold text-text">Retirement System:</span> {contributionForm.retirementSystem}</div>
                    <div><span className="font-semibold text-text">Planned Retirement date:</span> {contributionForm.plannedRetirementDate || '—'}</div>
                    <div><span className="font-semibold text-text">Primary fund:</span> {primaryFund}</div>
                    <div><span className="font-semibold text-text">Agency match logic:</span> {contributionForm.retirementSystem === 'FERS' ? 'Applied' : 'Not applied'}</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border border-border rounded-md overflow-hidden bg-white">
                    <thead className="text-xs text-text-2 bg-gray-50 uppercase">
                      <tr>
                        <th className="px-4 py-3">Year</th>
                        <th className="px-4 py-3">Age</th>
                        <th className="px-4 py-3">Salary</th>
                        <th className="px-4 py-3">Employee Contribution</th>
                        <th className="px-4 py-3">Catch-Up</th>
                        <th className="px-4 py-3">Agency Match</th>
                        {FUND_ORDER.map((fund) => <th key={fund} className="px-4 py-3">{fund}</th>)}
                        <th className="px-4 py-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.year} className="border-t border-border">
                          <td className="px-4 py-3">{row.year}</td>
                          <td className="px-4 py-3">{row.age}</td>
                          <td className="px-4 py-3">{currency(row.salary)}</td>
                          <td className="px-4 py-3">{currency(row.employeeContribution)}</td>
                          <td className="px-4 py-3">{currency(row.catchUp)}</td>
                          <td className="px-4 py-3">{currency(row.agencyMatch)}</td>
                          {FUND_ORDER.map((fund) => <td key={fund} className="px-4 py-3">{currency(row.funds[fund])}</td>)}
                          <td className="px-4 py-3 font-semibold text-blue">{currency(row.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="p-8 max-w-lg mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-serif mb-4">Email Report</h2>
                <p className="text-text-2 text-sm">Enter your email address twice to validate delivery before the report is sent.</p>
              </div>
              <Field label="Email address *">
                <input type="email" value={emailData.email} onChange={(e) => setEmailData((prev) => ({ ...prev, email: e.target.value }))} className={`w-full p-2.5 border ${errors.email ? 'border-red-500' : 'border-border'} rounded-md`} />
                {errors.email && <ErrorText>{errors.email}</ErrorText>}
              </Field>
              <Field label="Confirm email address *">
                <input type="email" value={emailData.confirmEmail} onChange={(e) => setEmailData((prev) => ({ ...prev, confirmEmail: e.target.value }))} className={`w-full p-2.5 border ${errors.confirmEmail ? 'border-red-500' : 'border-border'} rounded-md`} />
                {errors.confirmEmail && <ErrorText>{errors.confirmEmail}</ErrorText>}
              </Field>
              <div className="space-y-3">
                <button onClick={handleSend} className="w-full px-6 py-3 bg-blue text-white rounded-md font-semibold hover:bg-blue-hover transition-colors">Send it!</button>
                <button onClick={handlePrint} className="w-full px-6 py-3 bg-white border border-border text-text rounded-md font-semibold hover:bg-gray-50 transition-colors">Printer-Friendly Report</button>
                <button onClick={() => setStep(3)} className="w-full text-text-2 font-medium hover:text-text transition-colors">Back to Report</button>
              </div>
            </div>
          )}

          {step < 4 && (
            <div className="p-6 bg-gray-50 border-t border-border flex justify-between items-center">
              <button onClick={() => { setErrors({}); setStep((current) => Math.max(1, current - 1)); }} disabled={step === 1} className="px-6 py-2.5 text-sm font-semibold text-text-2 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              {step < 3 ? (
                <button onClick={handleContinue} className="px-6 py-2.5 text-sm font-semibold text-white bg-blue hover:bg-blue-hover rounded-md transition-colors shadow-sm">Next</button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => setStep(4)} className="px-6 py-2.5 text-sm font-semibold text-white bg-blue hover:bg-blue-hover rounded-md transition-colors shadow-sm">Email Report</button>
                  <button onClick={handlePrint} className="px-6 py-2.5 text-sm font-semibold bg-white border border-border text-text rounded-md hover:bg-gray-50 transition-colors shadow-sm">Printer-Friendly Report</button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
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
