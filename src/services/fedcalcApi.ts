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
  bLawEnforce?: boolean;
  bAirTraffic?: boolean;
  bLifeIns?: boolean;
  bCustomsBorderPatrol?: boolean;
  bLifeInsA?: boolean;
  bLifeInsB?: boolean;
  bLifeInsC?: boolean;
  bLifeFullOptionB?: boolean;
  bLifeFullOptionC?: boolean;
  bEarlyOut?: boolean;
  bPhasedRetire?: boolean;
  bSSEligible?: boolean;
  bSpecialComp?: boolean;
  bCSRS?: boolean;
  bCSRSTransfer?: boolean;
  bRptSummary?: boolean;
  bRptAnnuity?: boolean;
  bRptTSP?: boolean;
  bRptFEGLI?: boolean;
  bRptFEHB?: boolean;
  bRptLTC?: boolean;
  bRptSocSec?: boolean;
  bRptData?: boolean;
  bRptGap?: boolean;
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
      
      // Booleans
      bLawEnforce: uiData.bLawEnforce || false,
      bAirTraffic: uiData.bAirTraffic || false,
      bLifeIns: uiData.bLifeIns || false,
      bCustomsBorderPatrol: uiData.bCustomsBorderPatrol || false,
      bLifeInsA: uiData.bLifeInsA || false,
      bLifeInsB: uiData.bLifeInsB || false,
      bLifeInsC: uiData.bLifeInsC || false,
      bLifeFullOptionB: uiData.bLifeFullOptionB || false,
      bLifeFullOptionC: uiData.bLifeFullOptionC || false,
      bEarlyOut: uiData.bEarlyOut || false,
      bPhasedRetire: uiData.bPhasedRetire || false,
      bSSEligible: uiData.bSSEligible || false,
      bSpecialComp: uiData.bSpecialComp || false,
      bCSRS: uiData.bCSRS || false,
      bCSRSTransfer: uiData.bCSRSTransfer || false,
      bRptSummary: uiData.bRptSummary || false,
      bRptAnnuity: uiData.bRptAnnuity || false,
      bRptTSP: uiData.bRptTSP || false,
      bRptFEGLI: uiData.bRptFEGLI || false,
      bRptFEHB: uiData.bRptFEHB || false,
      bRptLTC: uiData.bRptLTC || false,
      bRptSocSec: uiData.bRptSocSec || false,
      bRptData: uiData.bRptData || false,
      bRptGap: uiData.bRptGap || false,
      
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
