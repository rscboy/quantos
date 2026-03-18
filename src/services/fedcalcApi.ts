export interface FedEmployee {
  id?: string;
  email?: string;
  zipCode?: string;
  dateOfBirth?: string;
  personName?: string;
  dateRetire?: string;
  dateServiceComp?: string;
  dateMilFrom?: string;
  dateMilTo?: string;
  dateSpecialFrom?: string;
  dateSpecialTo?: string;
  dateCSRSTransfer?: string;
  dateAnniversaryDate?: string;
  bLawEnforce?: string;
  bAirTraffic?: string;
  bLifeIns?: string;
  bCustomsBorderPatrol?: string;
  bLifeInsA?: string;
  bLifeInsB?: string;
  bLifeInsC?: string;
  bLifeFullOptionB?: string;
  bLifeFullOptionC?: string;
  bEarlyOut?: string;
  bPhasedRetire?: string;
  bSSEligible?: string;
  bSpecialComp?: string;
  bCSRS?: string;
  bCSRSTransfer?: string;
  bRptSummary?: string;
  bRptAnnuity?: string;
  bRptTSP?: string;
  bRptFEGLI?: string;
  bRptFEHB?: string;
  bRptLTC?: string;
  bRptSocSec?: string;
  bRptData?: string;
  bRptGap?: string;
  nSickLeaveHrs?: number;
  nAnnualLeaveHrs?: number;
  nLifeInsBasic?: number;
  nLifeInsOption?: number;
  nSurvivor?: number;
  nSurvivorBase?: number;
  nNumFunds?: number;
  nFuncPctContrib?: number;
  nXFerSickLeave?: number;
  nSickMonths?: number;
  fLastSalary?: number;
  fFedAnnuity?: number;
  fSocSec?: number;
  fHealthInsDeduct?: number;
  fCatchupContrib?: number;
  fSalaryCOLA?: number;
  fSickAnnual?: number;
  fAnnuityCOLA?: number;
  sLFundType?: string;
  fLFundBalance?: number;
  fLFundAlloc?: number;
  fManualHigh3?: number;
  fCalcHigh3?: number;
  fTotEarnings?: number;
  fCivilEarnings?: number;
  fEarnings1999?: number;
  fEarnings2000?: number;
  fCurBalance?: number;
  fCurrentYearSalary?: number;
  fFutureYearsSalary?: number;
  fPTS?: number;
  fRateOfReturn?: number;
  fYearsR?: number;
  fOtherPensions?: number;
  fCurrentSavings?: number;
  arrSSEarnings?: number[];
  salaryHistory?: { startDate?: string; startAmount?: number }[];
  deposits?: { fromDate?: string; toDate?: string; salary?: number }[];
  redeposits?: { depositDate?: string; fromDate?: string; toDate?: string; amount?: number }[];
  partTime?: { fromDate?: string; toDate?: string; hrsPerPeriod?: number }[];
  arrFundBalance?: number[];
  arrFundAlloc?: number[];
  arrFundPctReturn?: number[];
}

export interface CalculatorResults {
  fers?: any;
  csrs?: any;
  howSoon?: any;
  rawResponse?: any;
}

class FedcalcApiService {
  /**
   * Map UI inputs to the FedEmployee schema
   * Ensures all fields are present and safely defaulted if missing.
   */
  mapToFedEmployee(uiData: any): FedEmployee {
    // Initialize with defaults as requested: blank string, 0, false, or empty array
    const employee: FedEmployee = {
      // Strings
      id: uiData.id || '',
      email: uiData.email || '',
      zipCode: uiData.zipCode || '',
      dateOfBirth: uiData.dateOfBirth || '',
      personName: uiData.personName || '',
      dateRetire: uiData.dateRetire || '',
      dateServiceComp: uiData.dateServiceComp || '',
      dateMilFrom: uiData.dateMilFrom || '',
      dateMilTo: uiData.dateMilTo || '',
      dateSpecialFrom: uiData.dateSpecialFrom || '',
      dateSpecialTo: uiData.dateSpecialTo || '',
      dateCSRSTransfer: uiData.dateCSRSTransfer || '',
      dateAnniversaryDate: uiData.dateAnniversaryDate || '',
      sLFundType: uiData.sLFundType || '',
      
      // Booleans mapped to Y/N
      bLawEnforce: (uiData.bLawEnforce === true || uiData.bLawEnforce === 'Y') ? 'Y' : 'N',
      bAirTraffic: (uiData.bAirTraffic === true || uiData.bAirTraffic === 'Y') ? 'Y' : 'N',
      bLifeIns: (uiData.bLifeIns === true || uiData.bLifeIns === 'Y') ? 'Y' : 'N',
      bCustomsBorderPatrol: (uiData.bCustomsBorderPatrol === true || uiData.bCustomsBorderPatrol === 'Y') ? 'Y' : 'N',
      bLifeInsA: (uiData.bLifeInsA === true || uiData.bLifeInsA === 'Y') ? 'Y' : 'N',
      bLifeInsB: (uiData.bLifeInsB === true || uiData.bLifeInsB === 'Y') ? 'Y' : 'N',
      bLifeInsC: (uiData.bLifeInsC === true || uiData.bLifeInsC === 'Y') ? 'Y' : 'N',
      bLifeFullOptionB: (uiData.bLifeFullOptionB === true || uiData.bLifeFullOptionB === 'Y') ? 'Y' : 'N',
      bLifeFullOptionC: (uiData.bLifeFullOptionC === true || uiData.bLifeFullOptionC === 'Y') ? 'Y' : 'N',
      bEarlyOut: (uiData.bEarlyOut === true || uiData.bEarlyOut === 'Y') ? 'Y' : 'N',
      bPhasedRetire: (uiData.bPhasedRetire === true || uiData.bPhasedRetire === 'Y') ? 'Y' : 'N',
      bSSEligible: (uiData.bSSEligible === true || uiData.bSSEligible === 'Y') ? 'Y' : 'N',
      bSpecialComp: (uiData.bSpecialComp === true || uiData.bSpecialComp === 'Y') ? 'Y' : 'N',
      bCSRS: (uiData.bCSRS === true || uiData.bCSRS === 'Y') ? 'Y' : 'N',
      bCSRSTransfer: (uiData.bCSRSTransfer === true || uiData.bCSRSTransfer === 'Y') ? 'Y' : 'N',
      bRptSummary: (uiData.bRptSummary === true || uiData.bRptSummary === 'Y') ? 'Y' : 'N',
      bRptAnnuity: (uiData.bRptAnnuity === true || uiData.bRptAnnuity === 'Y') ? 'Y' : 'N',
      bRptTSP: (uiData.bRptTSP === true || uiData.bRptTSP === 'Y') ? 'Y' : 'N',
      bRptFEGLI: (uiData.bRptFEGLI === true || uiData.bRptFEGLI === 'Y') ? 'Y' : 'N',
      bRptFEHB: (uiData.bRptFEHB === true || uiData.bRptFEHB === 'Y') ? 'Y' : 'N',
      bRptLTC: (uiData.bRptLTC === true || uiData.bRptLTC === 'Y') ? 'Y' : 'N',
      bRptSocSec: (uiData.bRptSocSec === true || uiData.bRptSocSec === 'Y') ? 'Y' : 'N',
      bRptData: (uiData.bRptData === true || uiData.bRptData === 'Y') ? 'Y' : 'N',
      bRptGap: (uiData.bRptGap === true || uiData.bRptGap === 'Y') ? 'Y' : 'N',
      
      // Integers
      nSickLeaveHrs: uiData.nSickLeaveHrs !== undefined ? Number(uiData.nSickLeaveHrs) : 0,
      nAnnualLeaveHrs: uiData.nAnnualLeaveHrs !== undefined ? Number(uiData.nAnnualLeaveHrs) : 0,
      nLifeInsBasic: uiData.nLifeInsBasic !== undefined ? Number(uiData.nLifeInsBasic) : 0,
      nLifeInsOption: uiData.nLifeInsOption !== undefined ? Number(uiData.nLifeInsOption) : 0,
      nSurvivor: uiData.nSurvivor !== undefined ? Number(uiData.nSurvivor) : 0,
      nSurvivorBase: uiData.nSurvivorBase !== undefined ? Number(uiData.nSurvivorBase) : 0,
      nNumFunds: uiData.nNumFunds !== undefined ? Number(uiData.nNumFunds) : 0,
      nFuncPctContrib: uiData.nFuncPctContrib !== undefined ? Number(uiData.nFuncPctContrib) : 0,
      nXFerSickLeave: uiData.nXFerSickLeave !== undefined ? Number(uiData.nXFerSickLeave) : 0,
      nSickMonths: uiData.nSickMonths !== undefined ? Number(uiData.nSickMonths) : 0,
      
      // Numbers
      fLastSalary: uiData.fLastSalary !== undefined ? Number(uiData.fLastSalary) : 0,
      fFedAnnuity: uiData.fFedAnnuity !== undefined ? Number(uiData.fFedAnnuity) : 0,
      fSocSec: uiData.fSocSec !== undefined ? Number(uiData.fSocSec) : 0,
      fHealthInsDeduct: uiData.fHealthInsDeduct !== undefined ? Number(uiData.fHealthInsDeduct) : 0,
      fCatchupContrib: uiData.fCatchupContrib !== undefined ? Number(uiData.fCatchupContrib) : 0,
      fSalaryCOLA: uiData.fSalaryCOLA !== undefined ? Number(uiData.fSalaryCOLA) : 0,
      fSickAnnual: uiData.fSickAnnual !== undefined ? Number(uiData.fSickAnnual) : 0,
      fAnnuityCOLA: uiData.fAnnuityCOLA !== undefined ? Number(uiData.fAnnuityCOLA) : 0,
      fLFundBalance: uiData.fLFundBalance !== undefined ? Number(uiData.fLFundBalance) : 0,
      fLFundAlloc: uiData.fLFundAlloc !== undefined ? Number(uiData.fLFundAlloc) : 0,
      fManualHigh3: uiData.fManualHigh3 !== undefined ? Number(uiData.fManualHigh3) : 0,
      fCalcHigh3: uiData.fCalcHigh3 !== undefined ? Number(uiData.fCalcHigh3) : 0,
      fTotEarnings: uiData.fTotEarnings !== undefined ? Number(uiData.fTotEarnings) : 0,
      fCivilEarnings: uiData.fCivilEarnings !== undefined ? Number(uiData.fCivilEarnings) : 0,
      fEarnings1999: uiData.fEarnings1999 !== undefined ? Number(uiData.fEarnings1999) : 0,
      fEarnings2000: uiData.fEarnings2000 !== undefined ? Number(uiData.fEarnings2000) : 0,
      fCurBalance: uiData.fCurBalance !== undefined ? Number(uiData.fCurBalance) : 0,
      fCurrentYearSalary: uiData.fCurrentYearSalary !== undefined ? Number(uiData.fCurrentYearSalary) : 0,
      fFutureYearsSalary: uiData.fFutureYearsSalary !== undefined ? Number(uiData.fFutureYearsSalary) : 0,
      fPTS: uiData.fPTS !== undefined ? Number(uiData.fPTS) : 0,
      fRateOfReturn: uiData.fRateOfReturn !== undefined ? Number(uiData.fRateOfReturn) : 0,
      fYearsR: uiData.fYearsR !== undefined ? Number(uiData.fYearsR) : 0,
      fOtherPensions: uiData.fOtherPensions !== undefined ? Number(uiData.fOtherPensions) : 0,
      fCurrentSavings: uiData.fCurrentSavings !== undefined ? Number(uiData.fCurrentSavings) : 0,
      
      // Arrays
      arrSSEarnings: uiData.arrSSEarnings || [],
      salaryHistory: uiData.salaryHistory || [],
      deposits: uiData.deposits || [],
      redeposits: uiData.redeposits || [],
      partTime: uiData.partTime || [],
      arrFundBalance: uiData.arrFundBalance || [],
      arrFundAlloc: uiData.arrFundAlloc || [],
      arrFundPctReturn: uiData.arrFundPctReturn || []
    };

    // Specific mappings from current FERS Calculator UI
    if (uiData.salary) {
      employee.fManualHigh3 = Number(uiData.salary);
      employee.fLastSalary = Number(uiData.salary);
    }
    
    if (uiData.years) {
      employee.fYearsR = Number(uiData.years);
    }
    
    if (uiData.survivor) {
      employee.nSurvivor = Number(uiData.survivor);
    }

    // Calculate dates based on age and years of service if provided
    // This is a simplified estimation for the mapping layer
    if (uiData.age && uiData.years) {
      const today = new Date();
      
      // Estimate DOB based on age
      const dob = new Date(today.getFullYear() - uiData.age, today.getMonth(), today.getDate());
      employee.dateOfBirth = dob.toISOString().split('T')[0];
      
      // Estimate Service Computation Date based on years
      const scd = new Date(today.getFullYear() - uiData.years, today.getMonth(), today.getDate());
      employee.dateServiceComp = scd.toISOString().split('T')[0];
      
      // Assume retirement is today for this simple mapping
      employee.dateRetire = today.toISOString().split('T')[0];
    }

    return employee;
  }

  /**
   * Submit the FedEmployee payload to the API and get calculator results
   */
  async calculateRetirement(employeeData: Partial<FedEmployee>, calculatorType: string = 'howsoon'): Promise<CalculatorResults> {
    // Ensure all fields are properly defaulted
    const payload = this.mapToFedEmployee(employeeData);

    // Determine the backend URL
    // If VITE_BACKEND_BASE_URL is set, use it. Otherwise, use Mock Mode.
    const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
    console.log('VITE_BACKEND_BASE_URL =', import.meta.env.VITE_BACKEND_BASE_URL);
    
    // If no backend is configured, use Mock Mode so the frontend preview works without credentials
    if (!backendBaseUrl) {
      console.log('[Mock Mode] No backend URL configured. Returning mock data.');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const years = payload.fYearsR || 20;
      const salary = payload.fLastSalary || 100000;
      const monthlyAnnuity = salary * years * 0.01 / 12;

      return {
        fers: {
          monthlyAnnuity: monthlyAnnuity,
          annualAnnuity: monthlyAnnuity * 12,
          replacementRate: years * 0.01 * 100,
          html: "<p>Mock report generated successfully (Client-side fallback).</p>"
        },
        howSoon: {
          eligibilityDate: "2035-01-01",
          html: "<p>Mock eligibility report generated successfully.</p>"
        },
        rawResponse: { message: "Mock response generated successfully" }
      };
    } else {
      try {
        // Call the configured backend endpoint (Cloud Run or local dev server)
        const endpoint = `${backendBaseUrl}/api/fedcalc/calculate?type=${calculatorType}`;
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Calculation failed: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        
        // If the proxy returned mock data, it will have MonthlyAnnuity directly
        // If it's the real API, it returns annuityRpt which has MonthlyAnnuity
        
        // Parse and structure the results based on the OpenAPI spec
        return {
          fers: {
            monthlyAnnuity: data.MonthlyAnnuity || data.BasicAnnuityMo || 0,
            annualAnnuity: (data.MonthlyAnnuity || data.BasicAnnuityMo || 0) * 12,
            replacementRate: data.PctHigh3 || 0,
            html: data.html || ''
          },
          howSoon: {
            eligibilityDate: data.EligibilityDate || data.eligibilityDate || data.DateRetire || data.dateRetire || '',
            html: data.html || ''
          },
          rawResponse: data
        };
      } catch (error) {
        console.error('Fedcalc API Calculation Error:', error);
        throw error;
      }
    }
  }
}

// Export a singleton instance
export const fedcalcApi = new FedcalcApiService();
