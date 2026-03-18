import React, { useState, useEffect } from 'react';
import { SponsorBanner } from './SponsorBanner';
import { fedcalcApi, FedEmployee } from '../services/fedcalcApi';

export function FersCalculator({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<FedEmployee>>({
    dateRetire: '',
    dateServiceComp: '',
    dateOfBirth: '',
    bAirTraffic: false,
    bCustomsBorderPatrol: false,
    bLawEnforce: false,
    bEarlyOut: false,
    bPhasedRetire: false,
    dateCSRSTransfer: '',
    nXFerSickLeave: 0,
    redeposits: [],
    deposits: [],
    partTime: [],
    fLastSalary: 0,
    fManualHigh3: 0,
    salaryHistory: [],
    bLifeIns: false,
    nLifeInsBasic: 0,
    bLifeInsA: false,
    nLifeInsOption: 0,
    nSurvivor: 0,
    nSickLeaveHrs: 0,
    nAnnualLeaveHrs: 0,
    fHealthInsDeduct: 0,
    fSocSec: 0,
  });

  const [emailData, setEmailData] = useState({ email: '', confirmEmail: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleArrayChange = (arrayName: string, index: number, field: string, value: any) => {
    setFormData(prev => {
      const arr = [...(prev[arrayName as keyof FedEmployee] as any[] || [])];
      if (!arr[index]) arr[index] = {};
      arr[index][field] = value;
      return { ...prev, [arrayName]: arr };
    });
  };

  const addArrayRow = (arrayName: string) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...(prev[arrayName as keyof FedEmployee] as any[] || []), {}]
    }));
  };

  const removeArrayRow = (arrayName: string, index: number) => {
    setFormData(prev => {
      const arr = [...(prev[arrayName as keyof FedEmployee] as any[] || [])];
      arr.splice(index, 1);
      return { ...prev, [arrayName]: arr };
    });
  };

  const handleNext = () => {
    const errors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.dateRetire) errors.dateRetire = 'Planned retirement date is required';
      if (!formData.dateServiceComp) errors.dateServiceComp = 'Service computation date is required';
      if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    } else if (step === 5) {
      const hasSalary = (formData.fLastSalary && formData.fLastSalary > 0) || 
                        (formData.fManualHigh3 && formData.fManualHigh3 > 0) || 
                        (formData.salaryHistory && formData.salaryHistory.some(s => s.startAmount && s.startAmount > 0));
      if (!hasSalary) {
        errors.salary = 'Please provide either last salary, High-3 salary, or salary history';
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setStep(s => Math.min(7, s + 1));
  };

  const handleApiCalculate = async () => {
    // Final validation check
    const errors: Record<string, string> = {};
    if (!formData.dateRetire) errors.dateRetire = 'Planned retirement date is required';
    if (!formData.dateServiceComp) errors.dateServiceComp = 'Service computation date is required';
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    
    const hasSalary = (formData.fLastSalary && formData.fLastSalary > 0) || 
                      (formData.fManualHigh3 && formData.fManualHigh3 > 0) || 
                      (formData.salaryHistory && formData.salaryHistory.some(s => s.startAmount && s.startAmount > 0));
    if (!hasSalary) {
      errors.salary = 'Please provide either last salary, High-3 salary, or salary history';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setApiError('Please go back and fill in all required fields (Step 1 dates and Step 5 salary).');
      return;
    }

    setIsCalculating(true);
    setApiError(null);
    
    try {
      const payload = fedcalcApi.mapToFedEmployee(formData);
      console.log('Submitting FERS payload to /api/fedcalc/calculate?type=fers:', JSON.stringify(payload, null, 2));
      const apiResults = await fedcalcApi.calculateRetirement(formData, 'fers');
      setReportData(apiResults);
      setStep(8); // Go to report step
    } catch (error) {
      console.error('Calculation error:', error);
      setApiError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const ageAtRetirement = formData.dateOfBirth && formData.dateRetire 
        ? Math.floor((new Date(formData.dateRetire).getTime() - new Date(formData.dateOfBirth).getTime()) / 31557600000) 
        : 'N/A';
        
      const serviceTime = formData.dateServiceComp && formData.dateRetire
        ? Math.floor((new Date(formData.dateRetire).getTime() - new Date(formData.dateServiceComp).getTime()) / 31557600000)
        : 'N/A';

      const high3 = formData.fManualHigh3 || formData.fLastSalary || 0;
      const monthlyAnnuity = reportData?.fers?.monthlyAnnuity || 0;
      const annualAnnuity = reportData?.fers?.annualAnnuity || 0;
      const replacementRate = reportData?.fers?.replacementRate || 0;
      
      const survivorCut = formData.nSurvivor === 50 ? monthlyAnnuity * 0.1 : formData.nSurvivor === 25 ? monthlyAnnuity * 0.05 : 0;
      const netMonthly = monthlyAnnuity - survivorCut - (formData.fHealthInsDeduct || 0);

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>FedCalc by Quantos - Retirement Report</title>
            <style>
              @page { margin: 0.75in; }
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #222; line-height: 1.5; font-size: 13px; margin: 0; }
              .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #1a2b4c; padding-bottom: 15px; margin-bottom: 25px; }
              .brand { font-size: 28px; font-weight: 800; color: #1a2b4c; margin: 0; letter-spacing: -0.5px; }
              .brand span { color: #1a5cdb; font-weight: 400; }
              .sub-brand { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; font-weight: 600; }
              .report-title { font-size: 18px; font-weight: 600; color: #333; margin: 0; text-align: right; }
              .report-date { font-size: 12px; color: #666; margin-top: 4px; }
              
              .section { margin-bottom: 25px; }
              .section-title { font-size: 14px; font-weight: 700; background: #f4f7fb; padding: 8px 12px; border-left: 4px solid #1a5cdb; margin-bottom: 12px; color: #1a2b4c; text-transform: uppercase; letter-spacing: 0.5px; }
              
              .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              .data-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eaeaea; }
              .data-row.no-border { border-bottom: none; }
              .label { font-weight: 600; color: #555; }
              .value { text-align: right; font-family: 'Courier New', Courier, monospace; font-weight: 600; font-size: 14px; }
              
              .summary-box { border: 2px solid #1a5cdb; border-radius: 6px; padding: 15px; background: #f9fbff; margin-top: 10px; }
              .summary-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
              .summary-row:last-child { margin-bottom: 0; }
              .summary-label { font-weight: 700; font-size: 15px; color: #1a2b4c; }
              .summary-value { font-size: 18px; font-weight: 700; color: #1a5cdb; font-family: 'Courier New', Courier, monospace; }
              .net-value { font-size: 24px; color: #059669; }
              
              table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
              th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #eaeaea; }
              th { background: #f9f9f9; font-weight: 700; color: #444; }
              
              .footer-note { margin-top: 50px; font-size: 11px; color: #888; text-align: center; border-top: 1px solid #eaeaea; padding-top: 15px; line-height: 1.6; }
              .text-right { text-align: right; }
              
              .special-tags { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
              .tag { background: #e2e8f0; color: #334155; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="sub-brand">Official Estimate Report</div>
                <h1 class="brand">FedCalc <span>by Quantos</span></h1>
              </div>
              <div>
                <h2 class="report-title">FERS Basic Annuity Calculation</h2>
                <div class="report-date text-right">Generated: ${new Date().toLocaleDateString()}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Employee Profile & Service</div>
              <div class="grid-2">
                <div>
                  <div class="data-row"><span class="label">Retirement As Of:</span> <span class="value">${formData.dateRetire || 'N/A'}</span></div>
                  <div class="data-row"><span class="label">Date of Birth:</span> <span class="value">${formData.dateOfBirth || 'N/A'}</span></div>
                  <div class="data-row"><span class="label">Age at Retirement:</span> <span class="value">${ageAtRetirement} years</span></div>
                </div>
                <div>
                  <div class="data-row"><span class="label">Service Comp. Date:</span> <span class="value">${formData.dateServiceComp || 'N/A'}</span></div>
                  <div class="data-row"><span class="label">Est. Service Time:</span> <span class="value">${serviceTime} years</span></div>
                  <div class="data-row"><span class="label">Unused Sick Leave:</span> <span class="value">${formData.nSickLeaveHrs || 0} hours</span></div>
                </div>
              </div>
              <div class="special-tags">
                ${formData.bAirTraffic ? '<span class="tag">Air Traffic Controller</span>' : ''}
                ${formData.bCustomsBorderPatrol ? '<span class="tag">Customs & Border Protection</span>' : ''}
                ${formData.bLawEnforce ? '<span class="tag">Law Enforcement / Firefighter</span>' : ''}
                ${formData.bEarlyOut ? '<span class="tag">Early Out Option</span>' : ''}
                ${formData.bPhasedRetire ? '<span class="tag">Phased Retirement</span>' : ''}
              </div>
            </div>

            <div class="section">
              <div class="section-title">Financial Baseline</div>
              <div class="grid-2">
                <div>
                  <div class="data-row"><span class="label">High-Three Salary:</span> <span class="value">$${high3.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                  <div class="data-row"><span class="label">Replacement Rate:</span> <span class="value">${replacementRate.toFixed(4)}%</span></div>
                  <div class="data-row"><span class="label">Annual Leave Balance:</span> <span class="value">${formData.nAnnualLeaveHrs || 0} hours</span></div>
                </div>
                <div>
                  <div class="data-row"><span class="label">Social Security Est. (Age 62):</span> <span class="value">$${(formData.fSocSec || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                  <div class="data-row"><span class="label">FERS Transfer Date:</span> <span class="value">${formData.dateCSRSTransfer || 'N/A'}</span></div>
                  <div class="data-row"><span class="label">Transfer Sick Leave:</span> <span class="value">${formData.nXFerSickLeave || 0} hours</span></div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Monthly Deductions & Net Annuity</div>
              
              <div class="data-row"><span class="label">Gross Monthly Annuity:</span> <span class="value">$${monthlyAnnuity.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
              
              <div style="margin-top: 15px; margin-bottom: 5px; font-weight: 600; color: #555;">Optional Deductions:</div>
              <div class="data-row"><span class="label">Survivor Annuity (${formData.nSurvivor || 0}%):</span> <span class="value" style="color: #dc2626;">-$${survivorCut.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
              <div class="data-row"><span class="label">Health Insurance:</span> <span class="value" style="color: #dc2626;">-$${(formData.fHealthInsDeduct || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
              <div class="data-row"><span class="label">Life Insurance (Estimated):</span> <span class="value" style="color: #dc2626;">-$0.00</span></div>
              
              <div class="summary-box">
                <div class="summary-row">
                  <span class="summary-label">Gross Annual Annuity:</span>
                  <span class="summary-value">$${annualAnnuity.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div class="summary-row" style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #ccc;">
                  <span class="summary-label" style="color: #059669;">Estimated Net Monthly Annuity:</span>
                  <span class="summary-value net-value">$${netMonthly.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>
            </div>

            ${formData.salaryHistory && formData.salaryHistory.length > 0 ? `
            <div class="section">
              <div class="section-title">Salary History</div>
              <table>
                <thead>
                  <tr>
                    <th>Starting Date</th>
                    <th class="text-right">Salary Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${formData.salaryHistory.map(row => `
                    <tr>
                      <td>${row.startDate || 'N/A'}</td>
                      <td class="text-right">$${(row.startAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            <div class="footer-note">
              <p><strong>Disclaimer:</strong> This report is a projection based on the information provided and the current Federal Employees Retirement System (FERS) rules. It is not an official OPM estimate. Actual retirement benefits may vary based on final OPM calculations, tax withholdings, and future legislative changes.</p>
              <p>FedCalc by Quantos &copy; ${new Date().getFullYear()} — Independent resource since 2004. Audited against OPM Chapter 50 regulations.</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {[1, 2, 3, 4, 5, 6, 7].map(s => (
        <div key={s} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === s ? 'bg-blue text-white' : step > s ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
            {step > s ? '✓' : s}
          </div>
          {s < 7 && <div className={`w-4 sm:w-12 h-1 mx-1 sm:mx-2 rounded ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="animate-in fade-in duration-300">
      <main className="max-w-[900px] mx-auto px-6 pb-20 pt-12">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-2 mb-8 cursor-pointer bg-none border-none p-0 font-sans transition-colors duration-120 hover:text-blue"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
            <path d="M10 3L5 8l5 5" />
          </svg>
          All Calculators
        </button>

        <h1 className="font-serif text-4xl font-normal text-text mb-8">FERS Annuity Calculator</h1>

        {step <= 7 && renderStepIndicator()}

        <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
          {step === 1 && (
            <div className="p-8">
              <h2 className="text-xl font-semibold mb-2">Initial Information</h2>
              <p className="text-text-2 text-sm mb-8">Please enter the following information to calculate your estimated retirement annuity. These pages will walk you through the process. Start with your planned retirement date, and start of work date (a.k.a. 'service computation'), and revisit this page at any time to adjust your scenario to see the effect on your annuity.</p>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-text-2 mb-2">Planned Full (or Phased) Retirement <span className="text-red-500">*</span></label>
                    <input type="date" name="dateRetire" value={formData.dateRetire} onChange={handleChange} className={`w-full p-2.5 border ${validationErrors.dateRetire ? 'border-red-500' : 'border-border'} rounded-md`} />
                    {validationErrors.dateRetire && <p className="text-red-500 text-xs mt-1">{validationErrors.dateRetire}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-2 mb-2">Service Computation Date (SCD) <span className="text-red-500">*</span></label>
                    <input type="date" name="dateServiceComp" value={formData.dateServiceComp} onChange={handleChange} className={`w-full p-2.5 border ${validationErrors.dateServiceComp ? 'border-red-500' : 'border-border'} rounded-md`} />
                    {validationErrors.dateServiceComp && <p className="text-red-500 text-xs mt-1">{validationErrors.dateServiceComp}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-2 mb-2">Date of Birth <span className="text-red-500">*</span></label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={`w-full p-2.5 border ${validationErrors.dateOfBirth ? 'border-red-500' : 'border-border'} rounded-md`} />
                    {validationErrors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{validationErrors.dateOfBirth}</p>}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" name="bAirTraffic" checked={formData.bAirTraffic} onChange={handleChange} className="w-4 h-4 text-blue" />
                    <span className="text-sm">Are you an Air Traffic Controller?</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" name="bCustomsBorderPatrol" checked={formData.bCustomsBorderPatrol} onChange={handleChange} className="w-4 h-4 text-blue" />
                    <span className="text-sm">Are you a Customs and Border Protection Officer?</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" name="bLawEnforce" checked={formData.bLawEnforce} onChange={handleChange} className="w-4 h-4 text-blue" />
                    <span className="text-sm">Are you in Law Enforcement or a Firefighter?</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" name="bEarlyOut" checked={formData.bEarlyOut} onChange={handleChange} className="w-4 h-4 text-blue" />
                    <span className="text-sm">Calculate 'Early Out' option?</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" name="bPhasedRetire" checked={formData.bPhasedRetire} onChange={handleChange} className="w-4 h-4 text-blue" />
                    <span className="text-sm">Calculate Phased Retirement?</span>
                  </label>
                </div>

                <div className="pt-6 border-t border-border">
                  <h3 className="font-semibold text-text mb-4">If you transferred from CSRS, please enter the following two items:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-text-2 mb-2">FERS Transfer Date</label>
                      <input type="date" name="dateCSRSTransfer" value={formData.dateCSRSTransfer} onChange={handleChange} className="w-full p-2.5 border border-border rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-2 mb-2">Sick Leave at time of transfer (hours)</label>
                      <input type="number" name="nXFerSickLeave" value={formData.nXFerSickLeave || ''} onChange={handleChange} className="w-full p-2.5 border border-border rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-8">
              <h2 className="text-xl font-semibold mb-2">Redeposit Service</h2>
              <p className="text-text-2 text-sm mb-6">If there is any service for which deductions were refunded and not repaid, enter them here. Otherwise, leave this blank.</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-text-2 bg-gray-50 uppercase">
                    <tr>
                      <th className="px-4 py-3">Date of Refund</th>
                      <th className="px-4 py-3">From</th>
                      <th className="px-4 py-3">To</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(formData.redeposits || []).map((row, idx) => (
                      <tr key={idx} className="border-b border-border">
                        <td className="px-2 py-2"><input type="date" value={row.depositDate || ''} onChange={(e) => handleArrayChange('redeposits', idx, 'depositDate', e.target.value)} className="w-full p-2 border rounded" /></td>
                        <td className="px-2 py-2"><input type="date" value={row.fromDate || ''} onChange={(e) => handleArrayChange('redeposits', idx, 'fromDate', e.target.value)} className="w-full p-2 border rounded" /></td>
                        <td className="px-2 py-2"><input type="date" value={row.toDate || ''} onChange={(e) => handleArrayChange('redeposits', idx, 'toDate', e.target.value)} className="w-full p-2 border rounded" /></td>
                        <td className="px-2 py-2"><input type="number" value={row.amount || ''} onChange={(e) => handleArrayChange('redeposits', idx, 'amount', Number(e.target.value))} className="w-full p-2 border rounded" /></td>
                        <td className="px-2 py-2"><button onClick={() => removeArrayRow('redeposits', idx)} className="text-red-500 hover:text-red-700">✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={() => addArrayRow('redeposits')} className="mt-4 text-sm text-blue font-medium hover:underline">+ Add Row</button>
            </div>
          )}

          {step === 3 && (
            <div className="p-8">
              <h2 className="text-xl font-semibold mb-2">Deposit Service</h2>
              <p className="text-text-2 text-sm mb-6">If there was any deposit service (where deductions were not withheld), enter the time here. Otherwise, leave this blank. For each salary rate during a non-deposit period, enter the beginning date, ending date, and salary for that period:</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-text-2 bg-gray-50 uppercase">
                    <tr>
                      <th className="px-4 py-3">From</th>
                      <th className="px-4 py-3">To</th>
                      <th className="px-4 py-3">Annual Salary During Period</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(formData.deposits || []).map((row, idx) => (
                      <tr key={idx} className="border-b border-border">
                        <td className="px-2 py-2"><input type="date" value={row.fromDate || ''} onChange={(e) => handleArrayChange('deposits', idx, 'fromDate', e.target.value)} className="w-full p-2 border rounded" /></td>
                        <td className="px-2 py-2"><input type="date" value={row.toDate || ''} onChange={(e) => handleArrayChange('deposits', idx, 'toDate', e.target.value)} className="w-full p-2 border rounded" /></td>
                        <td className="px-2 py-2"><input type="number" value={row.salary || ''} onChange={(e) => handleArrayChange('deposits', idx, 'salary', Number(e.target.value))} className="w-full p-2 border rounded" /></td>
                        <td className="px-2 py-2"><button onClick={() => removeArrayRow('deposits', idx)} className="text-red-500 hover:text-red-700">✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={() => addArrayRow('deposits')} className="mt-4 text-sm text-blue font-medium hover:underline">+ Add Row</button>
            </div>
          )}

          {step === 4 && (
            <div className="p-8">
              <h2 className="text-xl font-semibold mb-2">Part Time</h2>
              <p className="text-text-2 text-sm mb-6">If there was any part-time service since April 6, 1986, enter the time here:</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-text-2 bg-gray-50 uppercase">
                    <tr>
                      <th className="px-4 py-3">From</th>
                      <th className="px-4 py-3">Through</th>
                      <th className="px-4 py-3">Hours per Pay Period</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(formData.partTime || []).map((row, idx) => (
                      <tr key={idx} className="border-b border-border">
                        <td className="px-2 py-2"><input type="date" value={row.fromDate || ''} onChange={(e) => handleArrayChange('partTime', idx, 'fromDate', e.target.value)} className="w-full p-2 border rounded" /></td>
                        <td className="px-2 py-2"><input type="date" value={row.toDate || ''} onChange={(e) => handleArrayChange('partTime', idx, 'toDate', e.target.value)} className="w-full p-2 border rounded" /></td>
                        <td className="px-2 py-2"><input type="number" value={row.hrsPerPeriod || ''} onChange={(e) => handleArrayChange('partTime', idx, 'hrsPerPeriod', Number(e.target.value))} className="w-full p-2 border rounded" /></td>
                        <td className="px-2 py-2"><button onClick={() => removeArrayRow('partTime', idx)} className="text-red-500 hover:text-red-700">✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={() => addArrayRow('partTime')} className="mt-4 text-sm text-blue font-medium hover:underline">+ Add Row</button>
            </div>
          )}

          {step === 5 && (
            <div className="p-8">
              <h2 className="text-xl font-semibold mb-6">Salary History</h2>
              
              <div className="space-y-6 mb-8">
                {validationErrors.salary && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm mb-4">
                    {validationErrors.salary}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Enter your salary at time of retirement</label>
                  <input type="number" name="fLastSalary" value={formData.fLastSalary || ''} onChange={handleChange} className={`w-full max-w-md p-2.5 border ${validationErrors.salary ? 'border-red-500' : 'border-border'} rounded-md`} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">If you already know your 'High 3', enter it here</label>
                  <input type="number" name="fManualHigh3" value={formData.fManualHigh3 || ''} onChange={handleChange} className={`w-full max-w-md p-2.5 border ${validationErrors.salary ? 'border-red-500' : 'border-border'} rounded-md`} />
                </div>
              </div>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                <div className="relative flex justify-center"><span className="bg-white px-4 text-sm text-text-3 font-medium">--OR--</span></div>
              </div>

              <p className="text-text-2 text-sm mb-6 mt-4">Enter your most recent salary history going back at least 3 years, and we will calculate your High-3 salary to the penny:</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-text-2 bg-gray-50 uppercase">
                    <tr>
                      <th className="px-4 py-3">Starting Date For Salary</th>
                      <th className="px-4 py-3">Salary Amount (hourly or annual)</th>
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
              <button onClick={() => addArrayRow('salaryHistory')} className="mt-4 text-sm text-blue font-medium hover:underline">+ Add Row</button>
            </div>
          )}

          {step === 6 && (
            <div className="p-8">
              <h2 className="text-xl font-semibold mb-2">Life Insurance Deductions</h2>
              
              <div className="mb-6">
                <label className="flex items-center gap-3 mb-4">
                  <input type="checkbox" name="bLifeIns" checked={formData.bLifeIns} onChange={handleChange} className="w-4 h-4 text-blue" />
                  <span className="font-semibold">Should deductions be made for life insurance?</span>
                </label>
                
                <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-900 mb-6">
                  <p className="font-semibold mb-2">Please note: FEGLI coverage in retirement is only available if you have been enrolled for either:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>a) 5 full years prior to retirement date,</li>
                    <li>b) the full period if employed less than 5 years, or</li>
                    <li>c) the full time equivalent of 5 years if some service was part time.</li>
                  </ul>
                </div>
              </div>

              {formData.bLifeIns && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <h3 className="font-semibold mb-3">Basic Life Insurance Options</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3">
                        <input type="radio" name="nLifeInsBasic" value={0} checked={formData.nLifeInsBasic === 0} onChange={handleChange} className="w-4 h-4 text-blue" />
                        <span>75% reduction</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="radio" name="nLifeInsBasic" value={1} checked={formData.nLifeInsBasic === 1} onChange={handleChange} className="w-4 h-4 text-blue" />
                        <span>50% reduction</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="radio" name="nLifeInsBasic" value={2} checked={formData.nLifeInsBasic === 2} onChange={handleChange} className="w-4 h-4 text-blue" />
                        <span>-0- NO reduction</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h3 className="font-semibold mb-3">Optional Coverage</h3>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" name="bLifeInsA" checked={formData.bLifeInsA} onChange={handleChange} className="w-4 h-4 text-blue" />
                        <span>Option A - Standard, $10,000 coverage.</span>
                      </label>
                      
                      <div>
                        <label className="block text-sm mb-2">Option B life insurance, multiples of salary:</label>
                        <select name="nLifeInsOption" value={formData.nLifeInsOption} onChange={handleChange} className="w-full max-w-xs p-2.5 border border-border rounded-md">
                          <option value={0}>None</option>
                          <option value={1}>1x Salary</option>
                          <option value={2}>2x Salary</option>
                          <option value={3}>3x Salary</option>
                          <option value={4}>4x Salary</option>
                          <option value={5}>5x Salary</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 7 && (
            <div className="p-8">
              <h2 className="text-xl font-semibold mb-6">Final Questions</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Enter any unused sick leave at time of retirement (hours)</label>
                  <input type="number" name="nSickLeaveHrs" value={formData.nSickLeaveHrs || ''} onChange={handleChange} className="w-full max-w-md p-2.5 border border-border rounded-md" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Annual Leave as of retirement (hours)</label>
                  <input type="number" name="nAnnualLeaveHrs" value={formData.nAnnualLeaveHrs || ''} onChange={handleChange} className="w-full max-w-md p-2.5 border border-border rounded-md" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Current bi-weekly deduction for health insurance</label>
                  <p className="text-xs text-text-3 mb-2">Only enter this amount if you plan to continue coverage in retirement.</p>
                  <input type="number" name="fHealthInsDeduct" value={formData.fHealthInsDeduct || ''} onChange={handleChange} className="w-full max-w-md p-2.5 border border-border rounded-md" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Social Security Benefit at Age 62 ($ annual)</label>
                  <p className="text-xs text-text-3 mb-2">This is only needed for estimating the FERS Annuity Supplement.</p>
                  <input type="number" name="fSocSec" value={formData.fSocSec || ''} onChange={handleChange} className="w-full max-w-md p-2.5 border border-border rounded-md" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Survivor Annuity</label>
                  <p className="text-xs text-text-3 mb-2">Calculate survivor annuity benefits?</p>
                  <select name="nSurvivor" value={formData.nSurvivor} onChange={handleChange} className="w-full max-w-md p-2.5 border border-border rounded-md">
                    <option value={50}>50%</option>
                    <option value={25}>25%</option>
                    <option value={0}>None</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="p-8 bg-gray-50">
              <div className="bg-white p-8 border border-border rounded-lg shadow-sm mb-6">
                <h2 className="text-2xl font-serif text-blue mb-6 border-b pb-4">FERS Transfer<br/><span className="text-xl text-text">Basic Annuity Calculation</span></h2>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm mb-8">
                  <div><span className="font-semibold">Retirement As Of:</span> {formData.dateRetire || 'N/A'}</div>
                  <div><span className="font-semibold">Date of Birth:</span> {formData.dateOfBirth || 'N/A'}</div>
                  <div><span className="font-semibold">Service Comp.:</span> {formData.dateServiceComp || 'N/A'}</div>
                  <div><span className="font-semibold">Sick Leave:</span> {formData.nSickLeaveHrs || 0} hours</div>
                  <div><span className="font-semibold">High-Three Salary:</span> ${(formData.fManualHigh3 || formData.fLastSalary || 0).toLocaleString()}</div>
                </div>

                <div className="bg-blue-50 p-6 rounded-md mb-8">
                  <h3 className="font-semibold text-lg mb-4">Estimated Monthly Annuity</h3>
                  <div className="text-4xl font-mono text-blue mb-2">
                    ${reportData?.fers?.monthlyAnnuity?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}
                  </div>
                  <div className="text-sm text-text-2">
                    Gross Annual: ${reportData?.fers?.annualAnnuity?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}
                  </div>
                </div>

                <div className="text-sm text-text-2 space-y-4 border-t pt-6">
                  <p><strong>Additional Information:</strong></p>
                  <p>Above figures include no deductions for Federal or other income taxes.</p>
                  <p className="italic">Run the Free Full Retirement Analysis Calculator to get a timeline projection of your retirement scenarios and to include other savings. The data you just entered will be automatically transferred to save you time.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => setStep(9)} className="px-6 py-3 bg-blue text-white rounded-md font-semibold hover:bg-blue-hover transition-colors">
                  Email Report
                </button>
                <button onClick={handlePrint} className="px-6 py-3 bg-white border border-border text-text rounded-md font-semibold hover:bg-gray-50 transition-colors">
                  Printer-Friendly Report
                </button>
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-serif mb-4">Email Report</h2>
              <p className="text-text-2 text-sm mb-6">To receive a free copy of your personalized retirement scenario, enter your email address, then click on the Send it! button below.</p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Your Email Address (*)</label>
                  <input type="email" value={emailData.email} onChange={e => setEmailData({...emailData, email: e.target.value})} className="w-full p-2.5 border border-border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">re-type your email</label>
                  <p className="text-xs text-text-3 mb-2">(please type a 2nd time to validate)</p>
                  <input type="email" value={emailData.confirmEmail} onChange={e => setEmailData({...emailData, confirmEmail: e.target.value})} className="w-full p-2.5 border border-border rounded-md" />
                </div>
              </div>

              <button 
                onClick={() => {
                  if (emailData.email && emailData.email === emailData.confirmEmail) {
                    alert('Report sent to ' + emailData.email);
                    setStep(8);
                  } else {
                    alert('Please enter matching email addresses.');
                  }
                }}
                className="w-full px-6 py-3 bg-blue text-white rounded-md font-semibold hover:bg-blue-hover transition-colors"
              >
                Send it!
              </button>
              <button onClick={() => setStep(8)} className="w-full mt-3 px-6 py-3 text-text-2 font-medium hover:text-text transition-colors">
                Back to Report
              </button>
            </div>
          )}

          {step < 8 && (
            <div className="p-6 bg-gray-50 border-t border-border flex justify-between items-center">
              <button
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1}
                className="px-6 py-2.5 text-sm font-semibold text-text-2 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {step < 7 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-blue hover:bg-blue-hover rounded-md transition-colors shadow-sm"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleApiCalculate}
                  disabled={isCalculating}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors shadow-sm flex items-center gap-2"
                >
                  {isCalculating ? 'Calculating...' : 'Run Report'}
                </button>
              )}
            </div>
          )}
        </div>
        
        {apiError && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
            {apiError}
          </div>
        )}
      </main>
    </div>
  );
}
