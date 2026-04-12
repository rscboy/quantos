import React, { useEffect, useMemo, useState } from 'react';
import { LinkedCalculatorData, LinkedSocialSecurityData } from '../utils/calculatorLinking';
import { openBrandedPrintReport } from '../utils/reportPrint';
import { useSharedProfile } from '../hooks/useSharedProfile';
import { SEO } from './SEO';

type Step = 1 | 2 | 3;
type DateParts = { month: string; day: string; year: string };
type FormState = {
  birthDate: DateParts;
  retirementDate: DateParts;
  currentYearEarnings: string;
  futureYearEarnings: string;
  earningsHistory: Record<number, string>;
};

type EstimateResults = {
  retirementAgeText: string;
  retirementInsured: boolean;
  disabilityInsured: boolean;
  survivorInsured: boolean;
  retirementBenefit: number;
  disabilityBenefit: number;
  childBenefit: number;
  spouseBenefit: number;
  survivingSpouseBenefit: number;
  familyMaximum: number;
  quartersEarned: number;
  requiredQuartersRetirement: number;
  recentQuartersDisability: number;
};

const STEP_TITLES = ['Earnings History + Personal Inputs', 'Eligibility + Benefit Estimates', 'Email Report Delivery'];
const START_YEAR = 1951;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - START_YEAR + 1 }, (_, index) => START_YEAR + index);
const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];
const DAYS = Array.from({ length: 31 }, (_, index) => String(index + 1));
const BIRTH_YEARS_FOR_DROPDOWN = Array.from({ length: CURRENT_YEAR - 1900 + 1 }, (_, index) => String(1900 + index)).reverse();
const RETIREMENT_YEARS_FOR_DROPDOWN = Array.from({ length: (CURRENT_YEAR + 50) - 1900 + 1 }, (_, index) => String(1900 + index)).reverse();
const CURRENCY = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const QUARTER_COVERAGE_AMOUNT: Record<number, number> = {
  1951: 370, 1952: 400, 1953: 400, 1954: 400, 1955: 410, 1956: 420, 1957: 440, 1958: 450, 1959: 500,
  1960: 520, 1961: 540, 1962: 570, 1963: 580, 1964: 600, 1965: 630, 1966: 660, 1967: 700, 1968: 750,
  1969: 780, 1970: 820, 1971: 900, 1972: 1080, 1973: 1150, 1974: 1250, 1975: 1320, 1976: 1410, 1977: 1500,
  1978: 1610, 1979: 1740, 1980: 1810, 1981: 1900, 1982: 1970, 1983: 2220, 1984: 2340, 1985: 2470, 1986: 2580,
  1987: 2900, 1988: 3060, 1989: 3390, 1990: 3670, 1991: 4000, 1992: 4210, 1993: 4340, 1994: 4600, 1995: 630,
  1996: 640, 1997: 670, 1998: 700, 1999: 740, 2000: 780, 2001: 830, 2002: 870, 2003: 890, 2004: 900,
  2005: 920, 2006: 970, 2007: 1000, 2008: 1050, 2009: 1090, 2010: 1120, 2011: 1120, 2012: 1130, 2013: 1160,
  2014: 1200, 2015: 1220, 2016: 1260, 2017: 1300, 2018: 1320, 2019: 1360, 2020: 1410, 2021: 1470, 2022: 1510,
  2023: 1640, 2024: 1730, 2025: 1810, 2026: 1870,
};

const TAXABLE_MAXIMUM: Record<number, number> = {
  1951: 3600, 1952: 3600, 1953: 3600, 1954: 3600, 1955: 4200, 1956: 4200, 1957: 4200, 1958: 4200, 1959: 4800,
  1960: 4800, 1961: 4800, 1962: 4800, 1963: 4800, 1964: 4800, 1965: 4800, 1966: 6600, 1967: 6600, 1968: 7800,
  1969: 7800, 1970: 7800, 1971: 7800, 1972: 9000, 1973: 10800, 1974: 13200, 1975: 14100, 1976: 15300, 1977: 16500,
  1978: 17700, 1979: 22900, 1980: 25900, 1981: 29700, 1982: 32400, 1983: 35700, 1984: 37800, 1985: 39600, 1986: 42000,
  1987: 43800, 1988: 45000, 1989: 48000, 1990: 51300, 1991: 53400, 1992: 55500, 1993: 57600, 1994: 60600, 1995: 61200,
  1996: 62700, 1997: 65400, 1998: 68400, 1999: 72600, 2000: 76200, 2001: 80400, 2002: 84900, 2003: 87000, 2004: 87900,
  2005: 90000, 2006: 94200, 2007: 97500, 2008: 102000, 2009: 106800, 2010: 106800, 2011: 106800, 2012: 110100, 2013: 113700,
  2014: 117000, 2015: 118500, 2016: 118500, 2017: 127200, 2018: 128400, 2019: 132900, 2020: 137700, 2021: 142800, 2022: 147000,
  2023: 160200, 2024: 168600, 2025: 176100, 2026: 183600,
};

const AWI: Record<number, number> = {
  1951: 2799.16, 1952: 2973.32, 1953: 3139.44, 1954: 3155.64, 1955: 3301.44, 1956: 3532.36, 1957: 3641.72, 1958: 3673.8,
  1959: 3855.8, 1960: 4007.12, 1961: 4086.76, 1962: 4291.4, 1963: 4396.64, 1964: 4576.32, 1965: 4658.72, 1966: 4938.36,
  1967: 5213.44, 1968: 5571.76, 1969: 5893.76, 1970: 6186.24, 1971: 6497.08, 1972: 7133.8, 1973: 7580.16, 1974: 8030.76,
  1975: 8630.92, 1976: 9226.48, 1977: 9779.44, 1978: 10556.03, 1979: 11479.46, 1980: 12513.46, 1981: 13773.1, 1982: 14531.34,
  1983: 15239.24, 1984: 16135.07, 1985: 16822.51, 1986: 17321.82, 1987: 18426.51, 1988: 19334.04, 1989: 20099.55, 1990: 21027.98,
  1991: 21811.6, 1992: 22935.42, 1993: 23132.67, 1994: 23753.53, 1995: 24705.66, 1996: 25913.9, 1997: 27426.0, 1998: 28861.44,
  1999: 30469.84, 2000: 32154.82, 2001: 32921.92, 2002: 33252.09, 2003: 34064.95, 2004: 35648.55, 2005: 36952.94, 2006: 38651.41,
  2007: 40405.48, 2008: 41334.97, 2009: 40711.61, 2010: 41673.83, 2011: 42979.61, 2012: 44321.67, 2013: 44888.16, 2014: 46481.52,
  2015: 48098.63, 2016: 48642.15, 2017: 50321.89, 2018: 52145.8, 2019: 54099.99, 2020: 55628.6, 2021: 60575.07, 2022: 63795.13,
  2023: 66621.8, 2024: 66621.8, 2025: 66621.8, 2026: 66621.8,
};

const INITIAL_FORM: FormState = {
  birthDate: { month: '', day: '', year: '' },
  retirementDate: { month: '', day: '', year: '' },
  currentYearEarnings: '',
  futureYearEarnings: '',
  earningsHistory: Object.fromEntries(YEARS.map((year) => [year, ''])),
};

function parseDate(parts: DateParts) {
  const month = Number(parts.month);
  const day = Number(parts.day);
  const year = Number(parts.year);
  if (!month || !day || !year) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function ageOnDate(birthDate: Date | null, targetDate: Date | null) {
  if (!birthDate || !targetDate) return null;
  let years = targetDate.getFullYear() - birthDate.getFullYear();
  let months = targetDate.getMonth() - birthDate.getMonth();
  let days = targetDate.getDate() - birthDate.getDate();
  if (days < 0) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months: Math.max(months, 0) };
}

function formatRetirementAge(birthDate: Date | null, retirementDate: Date | null) {
  const age = ageOnDate(birthDate, retirementDate);
  if (!age) return 'Select a retirement date to reflect retirement age.';
  return `${age.years} years, ${age.months} months`;
}

function formatCurrency(value: number) {
  return CURRENCY.format(Number.isFinite(value) ? Math.max(0, value) : 0);
}

function clampAnnualEarnings(year: number, amount: number) {
  const cap = TAXABLE_MAXIMUM[year] ?? amount;
  return Math.max(0, Math.min(amount, cap));
}

function getQuarterAmount(year: number) {
  return QUARTER_COVERAGE_AMOUNT[year] ?? QUARTER_COVERAGE_AMOUNT[CURRENT_YEAR] ?? 0;
}

function computeCreditsForYear(year: number, amount: number) {
  const quarterAmount = getQuarterAmount(year);
  if (quarterAmount <= 0 || amount <= 0) return 0;
  return Math.min(4, Math.floor(amount / quarterAmount));
}

function yearsBetween(start: Date, end: Date) {
  return Math.max(0, end.getFullYear() - start.getFullYear());
}

function computeResults(form: FormState): EstimateResults {
  const birthDate = parseDate(form.birthDate);
  const retirementDate = parseDate(form.retirementDate);
  const currentYearEarnings = Number(form.currentYearEarnings || 0);
  const futureYearEarnings = Number(form.futureYearEarnings || 0);
  const ageAtRetirement = ageOnDate(birthDate, retirementDate);
  const attainmentYear = birthDate ? birthDate.getFullYear() + 60 : CURRENT_YEAR;
  const indexingYear = Math.min(attainmentYear - 2, CURRENT_YEAR);
  const indexingAwi = AWI[indexingYear] ?? AWI[2023];

  const earningsByYear = YEARS.map((year) => {
    let amount = Number(form.earningsHistory[year] || 0);
    if (year === CURRENT_YEAR) amount = Math.max(amount, currentYearEarnings);
    if (retirementDate && year > CURRENT_YEAR && year <= retirementDate.getFullYear()) {
      amount = Math.max(amount, futureYearEarnings);
    }
    return { year, amount: clampAnnualEarnings(year, amount) };
  });

  const quartersEarned = earningsByYear.reduce((sum, entry) => sum + computeCreditsForYear(entry.year, entry.amount), 0);
  const requiredQuartersRetirement = birthDate ? Math.min(40, Math.max(0, yearsBetween(new Date(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate()), new Date((birthDate.getFullYear() + 62), birthDate.getMonth(), birthDate.getDate())) - 21) * 4) : 40;
  const retirementInsured = quartersEarned >= 40;

  const disabilityWindowStart = CURRENT_YEAR - 10;
  const recentQuartersDisability = earningsByYear
    .filter(({ year }) => year >= disabilityWindowStart && year <= CURRENT_YEAR)
    .reduce((sum, entry) => sum + computeCreditsForYear(entry.year, entry.amount), 0);
  const disabilityThreshold = birthDate && birthDate.getFullYear() + 24 > CURRENT_YEAR ? 6 : 20;
  const disabilityInsured = quartersEarned >= 6 && recentQuartersDisability >= disabilityThreshold;
  const survivorInsured = quartersEarned >= 6;

  const indexed = earningsByYear.map(({ year, amount }) => {
    const awi = AWI[year] ?? indexingAwi;
    const factor = year >= indexingYear ? 1 : indexingAwi / awi;
    return Math.round(amount * factor);
  }).sort((a, b) => b - a);
  const top35 = indexed.slice(0, 35);
  while (top35.length < 35) top35.push(0);
  const aime = Math.floor(top35.reduce((sum, value) => sum + value, 0) / 420);

  const bend1 = 1226;
  const bend2 = 7391;
  let pia = 0;
  if (aime > 0) {
    pia += Math.min(aime, bend1) * 0.9;
    if (aime > bend1) pia += Math.min(aime - bend1, bend2 - bend1) * 0.32;
    if (aime > bend2) pia += (aime - bend2) * 0.15;
  }
  pia = Math.floor(pia * 10) / 10;

  const reductionMonths = birthDate && retirementDate
    ? Math.max(0, (67 * 12) - ((retirementDate.getFullYear() - birthDate.getFullYear()) * 12 + (retirementDate.getMonth() - birthDate.getMonth())))
    : 0;
  const retirementFactor = reductionMonths <= 36
    ? 1 - (reductionMonths * (5 / 9) / 100)
    : 1 - (36 * (5 / 9) / 100) - ((reductionMonths - 36) * (5 / 12) / 100);
  const retirementBenefit = retirementInsured ? Math.max(0, pia * Math.max(0, retirementFactor)) : 0;
  const disabilityBenefit = disabilityInsured ? pia : 0;
  const childBenefit = survivorInsured ? pia * 0.75 : 0;
  const spouseBenefit = survivorInsured ? pia * 0.5 : 0;
  const survivingSpouseBenefit = survivorInsured ? pia : 0;
  const familyMaximum = survivorInsured ? Math.max(childBenefit + spouseBenefit + survivingSpouseBenefit, pia * 1.5) : 0;

  return {
    retirementAgeText: formatRetirementAge(birthDate, retirementDate),
    retirementInsured,
    disabilityInsured,
    survivorInsured,
    retirementBenefit,
    disabilityBenefit,
    childBenefit,
    spouseBenefit,
    survivingSpouseBenefit,
    familyMaximum,
    quartersEarned,
    requiredQuartersRetirement,
    recentQuartersDisability,
  };
}


function toDateParts(value: string): DateParts {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { month: '', day: '', year: '' };
  return { month: String(date.getMonth() + 1), day: String(date.getDate()), year: String(date.getFullYear()) };
}

function toIsoDate(parts: DateParts) {
  const date = parseDate(parts);
  if (!date) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function DateSelectors({ label, value, onChange, error, years }: { label: string; value: DateParts; onChange: (field: keyof DateParts, next: string) => void; error?: string; years: string[] }) {
  const selectClass = `w-full rounded-md border px-3 py-2.5 text-sm ${error ? 'border-red-500' : 'border-border'}`;
  return (
    <div>
      <label className="block text-sm font-semibold text-text-2 mb-2">{label} <span className="text-red-500">*</span></label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select value={value.month} onChange={(e) => onChange('month', e.target.value)} className={selectClass}>
          <option value="">Month</option>
          {MONTHS.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}
        </select>
        <select value={value.day} onChange={(e) => onChange('day', e.target.value)} className={selectClass}>
          <option value="">Day</option>
          {DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
        </select>
        <select value={value.year} onChange={(e) => onChange('year', e.target.value)} className={selectClass}>
          <option value="">Year</option>
          {years.map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export function SocialSecurityEstimator({ onBack, linkedData, onLinkedDataChange }: { onBack: () => void; linkedData: LinkedCalculatorData; onLinkedDataChange: (update: Partial<LinkedCalculatorData>) => void }) {
  const { profile, updateProfile } = useSharedProfile();
  const [step, setStep] = useState<Step>(1);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);
  const [form, setForm] = useState<FormState>(() => ({
    ...INITIAL_FORM,
    birthDate: profile.dateOfBirth ? toDateParts(profile.dateOfBirth) : linkedData.socialSecurity?.birthDate ? toDateParts(linkedData.socialSecurity.birthDate) : linkedData.tsp?.dateOfBirth ? toDateParts(linkedData.tsp.dateOfBirth) : INITIAL_FORM.birthDate,
    retirementDate: profile.dateRetire ? toDateParts(profile.dateRetire) : linkedData.socialSecurity?.retirementDate ? toDateParts(linkedData.socialSecurity.retirementDate) : linkedData.tsp?.plannedRetirementDate ? toDateParts(linkedData.tsp.plannedRetirementDate) : INITIAL_FORM.retirementDate,
    currentYearEarnings: linkedData.socialSecurity?.currentYearEarnings ? String(linkedData.socialSecurity.currentYearEarnings) : linkedData.tsp?.currentAnnualSalary ? String(linkedData.tsp.currentAnnualSalary) : '',
    futureYearEarnings: linkedData.socialSecurity?.futureYearEarnings ? String(linkedData.socialSecurity.futureYearEarnings) : linkedData.tsp?.currentAnnualSalary ? String(linkedData.tsp.currentAnnualSalary) : '',
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [email, setEmail] = useState({ primary: profile.email || '', confirm: '' });
  const results = useMemo(() => computeResults(form), [form]);

  // Sync profile updates if they happen externally
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      birthDate: profile.dateOfBirth ? toDateParts(profile.dateOfBirth) : prev.birthDate,
      retirementDate: profile.dateRetire ? toDateParts(profile.dateRetire) : prev.retirementDate,
    }));
    if (profile.email) {
      setEmail(prev => ({ ...prev, primary: profile.email || prev.primary }));
    }
  }, [profile]);

  const linkedEstimate = useMemo<LinkedSocialSecurityData>(() => ({
    birthDate: toIsoDate(form.birthDate),
    retirementDate: toIsoDate(form.retirementDate),
    currentYearEarnings: Number(form.currentYearEarnings || 0),
    futureYearEarnings: Number(form.futureYearEarnings || 0),
    annualRetirementBenefit: results.retirementBenefit * 12,
    monthlyRetirementBenefit: results.retirementBenefit,
    quartersEarned: results.quartersEarned,
    retirementInsured: results.retirementInsured,
    updatedAt: new Date().toISOString(),
  }), [form, results]);

  useEffect(() => {
    onLinkedDataChange({ socialSecurity: linkedEstimate });
  }, [linkedEstimate, onLinkedDataChange]);

  const birthDate = parseDate(form.birthDate);
  const retirementDate = parseDate(form.retirementDate);

  const setDateField = (group: 'birthDate' | 'retirementDate', field: keyof DateParts, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [group]: { ...prev[group], [field]: value } };
      if (group === 'birthDate') {
        const iso = toIsoDate(next.birthDate);
        if (iso) updateProfile({ dateOfBirth: iso });
      } else if (group === 'retirementDate') {
        const iso = toIsoDate(next.retirementDate);
        if (iso) updateProfile({ dateRetire: iso });
      }
      return next;
    });
  };

  const setNumericField = (field: 'currentYearEarnings' | 'futureYearEarnings', value: string) => {
    if (value !== '' && !/^\d*$/.test(value)) return;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setEarnings = (year: number, value: string) => {
    if (value !== '' && !/^\d*$/.test(value)) return;
    setForm((prev) => ({ ...prev, earningsHistory: { ...prev.earningsHistory, [year]: value } }));
  };

  const validateStep = (targetStep: Step) => {
    const nextErrors: Record<string, string> = {};
    if (targetStep === 1) {
      if (!birthDate) nextErrors.birthDate = 'Date of Birth is required.';
      if (!retirementDate) nextErrors.retirementDate = 'Retirement Date is required.';
      if (birthDate && retirementDate && retirementDate <= birthDate) nextErrors.retirementDate = 'Retirement Date must be after Date of Birth.';
      if (form.currentYearEarnings === '') nextErrors.currentYearEarnings = 'Current Year Earnings is required.';
      if (form.futureYearEarnings === '') nextErrors.futureYearEarnings = 'Future Year Earnings is required.';
    }
    if (targetStep === 3) {
      if (!email.primary) nextErrors.email = 'Email Address is required.';
      if (!email.confirm) nextErrors.confirm = 'Re-enter Email Address is required.';
      if (email.primary && email.confirm && email.primary !== email.confirm) nextErrors.confirm = 'Email addresses must match.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(3, s + 1) as Step);
  };

  const handlePrint = () => openBrandedPrintReport({
    title: 'Social Security Estimator',
    subtitle: 'Friendly printer version of your Social Security estimate.',
    sections: [
      {
        title: 'Personal Inputs',
        lines: [
          { label: 'Birth Date', value: toIsoDate(form.birthDate) || 'N/A' },
          { label: 'Retirement Date', value: toIsoDate(form.retirementDate) || 'N/A' },
          { label: 'Current Year Earnings', value: formatCurrency(Number(form.currentYearEarnings || 0)) },
          { label: 'Future Annual Earnings', value: formatCurrency(Number(form.futureYearEarnings || 0)) },
        ],
      },
      {
        title: 'Eligibility Summary',
        lines: [
          { label: 'Retirement Age', value: results.retirementAgeText },
          { label: 'Retirement Insured', value: results.retirementInsured ? 'Yes' : 'No' },
          { label: 'Disability Insured', value: results.disabilityInsured ? 'Yes' : 'No' },
          { label: 'Survivor Insured', value: results.survivorInsured ? 'Yes' : 'No' },
          { label: 'Quarters Earned', value: String(results.quartersEarned) },
          { label: 'Required Quarters', value: String(results.requiredQuartersRetirement) },
          { label: 'Recent Quarters for Disability', value: String(results.recentQuartersDisability) },
        ],
      },
      {
        title: 'Benefit Estimates',
        lines: [
          { label: 'Retirement Benefit', value: formatCurrency(results.retirementBenefit) },
          { label: 'Disability Benefit', value: formatCurrency(results.disabilityBenefit) },
          { label: 'Child Benefit', value: formatCurrency(results.childBenefit) },
          { label: 'Spouse Benefit', value: formatCurrency(results.spouseBenefit) },
          { label: 'Surviving Spouse Benefit', value: formatCurrency(results.survivingSpouseBenefit) },
          { label: 'Family Maximum', value: formatCurrency(results.familyMaximum) },
        ],
      },
    ],
  });

  const fieldClass = (key: string) => `w-full rounded-md border px-3 py-2.5 text-sm ${errors[key] ? 'border-red-500' : 'border-border'}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Social Security Estimator",
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
        title="Social Security Estimator | Federal Retirement Benefits | MyFedPlan"
        description="Estimate your Social Security benefits alongside your federal retirement. Calculate your retirement age, required quarters, and projected monthly income."
        schema={schema}
      />
      <main className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 pb-20 pt-8 sm:pt-12">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-2 mb-6 sm:mb-8 cursor-pointer bg-none border-none p-0 font-sans transition-colors duration-120 hover:text-blue min-h-[44px]">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5"><path d="M10 3L5 8l5 5" /></svg>
          All Calculators
        </button>

        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-text mb-3">Social Security Estimator</h1>
        <p className="text-text-2 max-w-3xl mb-8">Find out how much your monthly Social Security benefit will be at retirement. Works best when run inside the Full Retirement Analysis.</p>

        <div className="flex items-center justify-between mb-8 overflow-x-auto gap-4 pb-2">
          {STEP_TITLES.map((title, index) => {
            const stepNumber = (index + 1) as Step;
            const isCurrent = step === stepNumber;
            const isComplete = step > stepNumber;
            const isClickable = stepNumber < step || (stepNumber > step && validateStep(step));
            return (
              <div key={title} className="flex items-center min-w-fit flex-1">
                <button 
                  onClick={() => isClickable && setStep(stepNumber)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${isCurrent ? 'bg-blue text-white' : isComplete ? 'bg-green text-white cursor-pointer hover:bg-green/90' : isClickable ? 'bg-gray-200 text-gray-500 cursor-pointer hover:bg-gray-300' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  disabled={!isClickable}
                >
                  {isComplete ? '✓' : stepNumber}
                </button>
                <div className="ml-3 min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.08em] text-text-3">Step {stepNumber}</div>
                  <div className="text-sm font-medium text-text truncate">{title}</div>
                </div>
                {stepNumber < 3 && <div className={`mx-3 h-1 flex-1 rounded min-w-[20px] ${isComplete ? 'bg-green' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setStep((step - 1) as Step)}
            disabled={step === 1}
            className="px-4 py-2 text-sm font-medium text-text-2 bg-white border border-border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous Step
          </button>
          {step < 3 && (
            <button
              onClick={() => handleNext()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue rounded-md hover:bg-blue/90 transition-colors"
            >
              Next Step
            </button>
          )}
        </div>

        <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
          {step === 1 && (
            <div className="p-8 space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-text mb-2">Earnings History + Personal Inputs</h2>
                <p className="text-sm text-text-2">Complete all required fields below to continue to the Social Security eligibility and benefit estimate page.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DateSelectors label="Date of Birth" value={form.birthDate} onChange={(field, value) => setDateField('birthDate', field, value)} error={errors.birthDate} years={BIRTH_YEARS_FOR_DROPDOWN} />
                <DateSelectors label="Retirement Date" value={form.retirementDate} onChange={(field, value) => setDateField('retirementDate', field, value)} error={errors.retirementDate} years={RETIREMENT_YEARS_FOR_DROPDOWN} />
              </div>

              <div className="rounded-lg border border-blue/20 bg-[#F7FAFF] p-5">
                <div className="text-[11px] uppercase tracking-[0.08em] text-blue font-semibold mb-2">Retirement age</div>
                <div className="font-mono text-2xl text-text">{results.retirementAgeText}</div>
              </div>

              <section className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-text mb-2">Year-by-year earnings history</h3>
                  <p className="text-sm text-text-2">Enter your earnings that have been subject to FICA deposits. Normally, this will be your salary while in FERS or other pension plan where contributions are made to social security.</p>
                </div>
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="max-h-[420px] overflow-auto">
                    <table className="min-w-full border-collapse text-sm">
                      <thead className="sticky top-0 bg-bg z-10">
                        <tr>
                          <th className="text-left font-semibold text-text-2 px-4 py-3 border-b border-border">Year</th>
                          <th className="text-left font-semibold text-text-2 px-4 py-3 border-b border-border">FICA-covered earnings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {YEARS.map((year) => {
                          return (
                            <tr key={year} className="border-b border-border/80 last:border-b-0">
                              <td className="px-4 py-3 font-mono text-text">{year}</td>
                              <td className="px-4 py-3">
                                <input
                                  inputMode="numeric"
                                  value={form.earningsHistory[year]}
                                  onChange={(e) => setEarnings(year, e.target.value)}
                                  className={`w-full rounded-md border px-3 py-2.5 text-sm ${errors[`earnings-${year}`] ? 'border-red-500' : 'border-border'}`}
                                  aria-label={`${year} earnings`}
                                />
                                {errors[`earnings-${year}`] && <p className="text-red-500 text-xs mt-1">{errors[`earnings-${year}`]}</p>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Current Year Earnings <span className="text-red-500">*</span></label>
                  <input inputMode="numeric" value={form.currentYearEarnings} onChange={(e) => setNumericField('currentYearEarnings', e.target.value)} className={fieldClass('currentYearEarnings')} />
                  <p className="text-xs text-text-3 mt-2">Required numeric field.</p>
                  {errors.currentYearEarnings && <p className="text-red-500 text-xs mt-1">{errors.currentYearEarnings}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Future Year Earnings <span className="text-red-500">*</span></label>
                  <input inputMode="numeric" value={form.futureYearEarnings} onChange={(e) => setNumericField('futureYearEarnings', e.target.value)} className={fieldClass('futureYearEarnings')} />
                  <p className="text-xs text-text-3 mt-2">Required numeric field, per year projection.</p>
                  {errors.futureYearEarnings && <p className="text-red-500 text-xs mt-1">{errors.futureYearEarnings}</p>}
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={() => { if (validateStep(1)) setStep(2); }} className="rounded-md bg-blue px-5 py-3 text-sm font-semibold text-white hover:opacity-95">Run Report &gt;&gt;</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-8 space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-text mb-2">Eligibility + Benefit Estimates</h2>
                <p className="text-sm text-text-2">For the disability and survivors estimates that follow, we assumed that you become disabled or died in December of this year. We did not use future earnings in calculating these estimates.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  ['Retirement Insured Status', results.retirementInsured],
                  ['Disability Insured Status', results.disabilityInsured],
                  ['Survivor Insured Status', results.survivorInsured],
                ].map(([label, insured]) => (
                  <div key={String(label)} className="rounded-lg border border-border bg-white p-5">
                    <div className="text-xs uppercase tracking-[0.08em] text-text-3 font-semibold mb-2">{label}</div>
                    <div className={`text-2xl font-mono ${insured ? 'text-green' : 'text-text'}`}>{insured ? 'insured' : 'not insured'}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-border p-6 bg-bg/40">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  <div className="rounded-lg border border-border bg-white p-5">
                    <div className="text-xs uppercase tracking-[0.08em] text-text-3 font-semibold mb-2">Retirement Benefit</div>
                    <div className="text-3xl font-mono text-text">{formatCurrency(results.retirementBenefit)}</div>
                    <div className="text-xs text-text-3 mt-2">Monthly estimate.</div>
                  </div>
                  <div className="rounded-lg border border-border bg-white p-5">
                    <div className="text-xs uppercase tracking-[0.08em] text-text-3 font-semibold mb-2">Disability Benefit</div>
                    <div className="text-3xl font-mono text-text">{formatCurrency(results.disabilityBenefit)}</div>
                    <div className="text-xs text-text-3 mt-2">Monthly estimate.</div>
                  </div>
                  <div className="rounded-lg border border-border bg-white p-5">
                    <div className="text-xs uppercase tracking-[0.08em] text-text-3 font-semibold mb-2">Quarters of Coverage</div>
                    <div className="text-3xl font-mono text-text">{results.quartersEarned}</div>
                    <div className="text-xs text-text-3 mt-2">Recent 10-year credits: {results.recentQuartersDisability}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-bg/50">
                  <h3 className="text-lg font-semibold text-text">Survivor Benefits</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  {[
                    ['Child', results.childBenefit],
                    ['Spouse', results.spouseBenefit],
                    ['Surviving Spouse', results.survivingSpouseBenefit],
                    ['Family Maximum', results.familyMaximum],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border last:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0 md:[&:nth-child(odd)]:border-r md:border-border">
                      <span className="text-sm font-medium text-text">{label}</span>
                      <span className="text-lg font-mono text-text">{formatCurrency(Number(value))}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <button onClick={() => setStep(1)} className="rounded-md border border-border px-5 py-3 text-sm font-semibold text-text hover:bg-bg">Back</button>
                <button onClick={() => setStep(3)} className="rounded-md bg-blue px-5 py-3 text-sm font-semibold text-white hover:opacity-95">Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-8 space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-text mb-2">Email Report Delivery</h2>
                <p className="text-sm text-text-2">To receive a free copy of your personalized retirement scenario, enter your email address, then click on the Send It! button below.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Email Address <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    value={email.primary} 
                    onChange={(e) => {
                      setEmail((prev) => ({ ...prev, primary: e.target.value }));
                      updateProfile({ email: e.target.value });
                    }} 
                    className={`${fieldClass('email')} min-h-[44px]`} 
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Re-enter Email Address <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    value={email.confirm} 
                    onChange={(e) => setEmail((prev) => ({ ...prev, confirm: e.target.value }))} 
                    className={`${fieldClass('confirm')} min-h-[44px]`} 
                  />
                  {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <button onClick={() => setStep(2)} className="rounded-md border border-border px-5 py-3 text-sm font-semibold text-text hover:bg-bg">Back</button>
                <div className="flex flex-wrap justify-end gap-3">
                  <button onClick={handlePrint} className="rounded-md border border-border px-5 py-3 text-sm font-semibold text-text hover:bg-bg">Friendly Printer Version</button>
                  <button onClick={async () => {
                    if (!validateStep(3)) return;
                    try {
                      const { generateReportHtml } = await import('../utils/reportPrint');
                      const { sendEmailReport } = await import('../utils/emailReport');
                      
                      const htmlBody = generateReportHtml({
                        title: 'Social Security Estimator',
                        subtitle: 'Your Social Security benefit estimate report.',
                        sections: [
                          {
                            title: 'Basic Information',
                            lines: [
                              { label: 'Date of Birth', value: birthDate ? toIsoDate(form.birthDate) || 'N/A' : 'N/A' },
                              { label: 'Retirement Date', value: retirementDate ? toIsoDate(form.retirementDate) || 'N/A' : 'N/A' },
                              { label: 'Current Year Earnings', value: formatCurrency(Number(form.currentYearEarnings || 0)) },
                              { label: 'Future Annual Earnings', value: formatCurrency(Number(form.futureYearEarnings || 0)) },
                            ],
                          },
                          {
                            title: 'Eligibility Summary',
                            lines: [
                              { label: 'Retirement Age', value: results.retirementAgeText },
                              { label: 'Retirement Insured', value: results.retirementInsured ? 'Yes' : 'No' },
                              { label: 'Disability Insured', value: results.disabilityInsured ? 'Yes' : 'No' },
                              { label: 'Survivor Insured', value: results.survivorInsured ? 'Yes' : 'No' },
                              { label: 'Quarters Earned', value: String(results.quartersEarned) },
                              { label: 'Required Quarters', value: String(results.requiredQuartersRetirement) },
                              { label: 'Recent Quarters for Disability', value: String(results.recentQuartersDisability) },
                            ],
                          },
                          {
                            title: 'Benefit Estimates',
                            lines: [
                              { label: 'Retirement Benefit', value: formatCurrency(results.retirementBenefit) },
                              { label: 'Disability Benefit', value: formatCurrency(results.disabilityBenefit) },
                              { label: 'Child Benefit', value: formatCurrency(results.childBenefit) },
                              { label: 'Spouse Benefit', value: formatCurrency(results.spouseBenefit) },
                              { label: 'Surviving Spouse Benefit', value: formatCurrency(results.survivingSpouseBenefit) },
                              { label: 'Family Maximum', value: formatCurrency(results.familyMaximum) },
                            ],
                          },
                        ],
                        isEmail: true
                      });
                      
                      await sendEmailReport(email.primary, 'Your Social Security Estimate', htmlBody);
                      alert(`Report sent successfully to ${email.primary}`);
                    } catch (error) {
                      console.error('Failed to send email:', error);
                      alert('Failed to send email. Please try again.');
                    }
                  }} className="rounded-md bg-blue px-5 py-3 text-sm font-semibold text-white hover:opacity-95">Send it!</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}