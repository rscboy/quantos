import { FedEmployee } from '../services/myfedplanApi';

export const CALCULATOR_LINKS_STORAGE_KEY = 'calculator-links';

export type LinkedTspData = {
  retirementSystem: 'FERS' | 'CSRS';
  plannedRetirementDate: string;
  dateOfBirth: string;
  currentAnnualSalary: number;
  annualPercentContribution: number;
  annualCatchUpContribution: number;
  annualCOLA: number;
  fundAllocations: number[];
  fundBalances: number[];
  fundRates: number[];
  projectedBalance: number;
  currentBalance: number;
  updatedAt: string;
};

export type LinkedSocialSecurityData = {
  birthDate: string;
  retirementDate: string;
  currentYearEarnings: number;
  futureYearEarnings: number;
  annualRetirementBenefit: number;
  monthlyRetirementBenefit: number;
  quartersEarned: number;
  retirementInsured: boolean;
  updatedAt: string;
};

export type LinkedCalculatorData = {
  tsp?: LinkedTspData;
  socialSecurity?: LinkedSocialSecurityData;
};

export function loadLinkedCalculatorData(): LinkedCalculatorData {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CALCULATOR_LINKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLinkedCalculatorData(data: LinkedCalculatorData) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CALCULATOR_LINKS_STORAGE_KEY, JSON.stringify(data));
}

export function mergeLinkedData(current: LinkedCalculatorData, update: Partial<LinkedCalculatorData>) {
  const next = { ...current, ...update };
  saveLinkedCalculatorData(next);
  return next;
}

export function applyLinkedDataToGapForm(linkedData: LinkedCalculatorData) {
  return {
    plannedRetirementDate: linkedData.tsp?.plannedRetirementDate ?? '',
    currentAnnualSalary: linkedData.tsp?.currentAnnualSalary ?? 95000,
    currentSavings: linkedData.tsp?.projectedBalance ?? linkedData.tsp?.currentBalance ?? 175000,
    socialSecurity: linkedData.socialSecurity?.annualRetirementBenefit ?? 24000,
  };
}

export function applyLinkedDataToFullAnalysis(linkedData: LinkedCalculatorData): Partial<FedEmployee> {
  const tsp = linkedData.tsp;
  const socialSecurity = linkedData.socialSecurity;

  return {
    dateOfBirth: tsp?.dateOfBirth || socialSecurity?.birthDate || '',
    dateRetire: tsp?.plannedRetirementDate || socialSecurity?.retirementDate || '',
    bCSRS: tsp ? (tsp.retirementSystem === 'CSRS' ? 'Y' : 'N') : 'N',
    fLastSalary: tsp?.currentAnnualSalary || 0,
    fCurrentYearSalary: tsp?.currentAnnualSalary || socialSecurity?.currentYearEarnings || 0,
    fFutureYearsSalary: socialSecurity?.futureYearEarnings || 0,
    fCatchupContrib: tsp?.annualCatchUpContribution || 0,
    nFuncPctContrib: tsp?.annualPercentContribution || 0,
    fSalaryCOLA: tsp?.annualCOLA || 2,
    fSocSec: socialSecurity?.annualRetirementBenefit || 0,
    bSSEligible: socialSecurity?.retirementInsured ? 'Y' : 'N',
    fCurrentSavings: tsp?.projectedBalance || tsp?.currentBalance || 0,
    arrFundAlloc: tsp?.fundAllocations || [0, 0, 0, 0, 0, 0],
    arrFundBalance: tsp?.fundBalances || [0, 0, 0, 0, 0, 0],
    arrFundPctReturn: tsp?.fundRates || [2, 3, 7, 8, 6, 5],
  };
}