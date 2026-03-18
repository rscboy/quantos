import React, { useState } from 'react';
import { fedcalcApi, FedEmployee } from '../services/fedcalcApi';

export function HowSoonCalculator({ onBack, onNavigateToFers }: { onBack: () => void, onNavigateToFers: () => void }) {
  const [step, setStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<FedEmployee>>({
    bCSRS: 'N',
    bAirTraffic: 'N',
    bCustomsBorderPatrol: 'N',
    bLawEnforce: 'N',
    bPhasedRetire: 'N',
    dateOfBirth: '',
    dateServiceComp: '',
  });

  const [emailData, setEmailData] = useState({ email: '', confirmEmail: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = async () => {
    if (step === 1) {
      const errors: Record<string, string> = {};
      
      if (!formData.bCSRS) errors.bCSRS = 'Retirement system is required';
      if (!formData.bAirTraffic) errors.bAirTraffic = 'This field is required';
      if (!formData.bCustomsBorderPatrol) errors.bCustomsBorderPatrol = 'This field is required';
      if (!formData.bLawEnforce) errors.bLawEnforce = 'This field is required';
      if (!formData.bPhasedRetire) errors.bPhasedRetire = 'This field is required';
      if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
      if (!formData.dateServiceComp) errors.dateServiceComp = 'Start date is required';

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      setValidationErrors({});
      await handleApiCalculate();
    } else {
      setStep(s => Math.min(3, s + 1));
    }
  };

  const handleApiCalculate = async () => {
    setIsCalculating(true);
    setApiError(null);
    
    try {
      const payload = fedcalcApi.mapToFedEmployee(formData);
      console.log('Submitting HowSoon payload to /api/fedcalc/calculate?type=howsoon:', JSON.stringify(payload, null, 2));
      const apiResults = await fedcalcApi.calculateRetirement(formData, 'howsoon');
      setReportData(apiResults);
      setStep(2); // Go to results step
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
      const ageAtRetirement = formData.dateOfBirth && reportData?.howSoon?.eligibilityDate
        ? Math.floor((new Date(reportData.howSoon.eligibilityDate).getTime() - new Date(formData.dateOfBirth).getTime()) / 31557600000) 
        : 'N/A';
        
      const serviceTime = formData.dateServiceComp && reportData?.howSoon?.eligibilityDate
        ? Math.floor((new Date(reportData.howSoon.eligibilityDate).getTime() - new Date(formData.dateServiceComp).getTime()) / 31557600000)
        : 'N/A';

      printWindow.document.write(`
        <html>
          <head>
            <title>How Soon Can I Retire? - Report</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-w-3xl mx-auto p-8; }
              h1 { color: #1a365d; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
              .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
              .summary-item { margin-bottom: 10px; }
              .summary-label { font-weight: bold; color: #4a5568; }
              .result-box { background-color: #ebf8ff; padding: 20px; border-radius: 8px; border: 1px solid #bee3f8; margin-top: 30px; }
              .result-title { font-size: 1.2rem; font-weight: bold; color: #2b6cb0; margin-bottom: 10px; }
              .result-value { font-size: 2rem; font-weight: bold; color: #2b6cb0; font-family: monospace; }
            </style>
          </head>
          <body>
            <h1>How Soon Can I Retire? - Report</h1>
            
            <div class="summary-grid">
              <div>
                <div class="summary-item"><span class="summary-label">Retirement System:</span> ${formData.bCSRS === 'Y' ? 'CSRS' : 'FERS'}</div>
                <div class="summary-item"><span class="summary-label">Date of Birth:</span> ${formData.dateOfBirth} (Age: ${ageAtRetirement})</div>
                <div class="summary-item"><span class="summary-label">Service Comp Date:</span> ${formData.dateServiceComp} (Service: ${serviceTime} years)</div>
              </div>
              <div>
                <div class="summary-item"><span class="summary-label">Air Traffic Controller:</span> ${formData.bAirTraffic === 'Y' ? 'Yes' : 'No'}</div>
                <div class="summary-item"><span class="summary-label">Customs/Border Patrol:</span> ${formData.bCustomsBorderPatrol === 'Y' ? 'Yes' : 'No'}</div>
                <div class="summary-item"><span class="summary-label">Law Enforcement/Firefighter:</span> ${formData.bLawEnforce === 'Y' ? 'Yes' : 'No'}</div>
                <div class="summary-item"><span class="summary-label">Phased Retirement:</span> ${formData.bPhasedRetire === 'Y' ? 'Yes' : 'No'}</div>
              </div>
            </div>

            <div class="result-box">
              <div class="result-title">Earliest Unreduced Retirement Date</div>
              <div class="result-value">${reportData?.howSoon?.eligibilityDate || 'N/A'}</div>
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
      {[1, 2, 3].map(s => (
        <div key={s} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === s ? 'bg-blue text-white' : step > s ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
            {step > s ? '✓' : s}
          </div>
          {s < 3 && <div className={`w-8 sm:w-24 h-1 mx-1 sm:mx-2 rounded ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );

  const calculateAge = (dob: string) => {
    if (!dob) return 'N/A';
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / 31557600000);
  };

  const calculateService = (scd: string) => {
    if (!scd) return 'N/A';
    const diff = Date.now() - new Date(scd).getTime();
    return Math.floor(diff / 31557600000);
  };

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

        <h1 className="font-serif text-4xl font-normal text-text mb-8">How Soon Can I Retire?</h1>

        {renderStepIndicator()}

        <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
          {step === 1 && (
            <div className="p-8">
              <h2 className="text-xl font-semibold mb-6">Collect Your Info</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Retirement System <span className="text-red-500">*</span></label>
                  <select name="bCSRS" value={formData.bCSRS} onChange={handleChange} className={`w-full p-2.5 border ${validationErrors.bCSRS ? 'border-red-500' : 'border-border'} rounded-md`}>
                    <option value="N">FERS</option>
                    <option value="Y">CSRS</option>
                  </select>
                  {validationErrors.bCSRS && <p className="text-red-500 text-xs mt-1">{validationErrors.bCSRS}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                  <div>
                    <label className="block text-sm font-semibold text-text-2 mb-2">Air Traffic Controller <span className="text-red-500">*</span></label>
                    <select name="bAirTraffic" value={formData.bAirTraffic} onChange={handleChange} className={`w-full p-2.5 border ${validationErrors.bAirTraffic ? 'border-red-500' : 'border-border'} rounded-md`}>
                      <option value="N">No</option>
                      <option value="Y">Yes</option>
                    </select>
                    {validationErrors.bAirTraffic && <p className="text-red-500 text-xs mt-1">{validationErrors.bAirTraffic}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-2 mb-2">Customs and Border Protection Officer <span className="text-red-500">*</span></label>
                    <select name="bCustomsBorderPatrol" value={formData.bCustomsBorderPatrol} onChange={handleChange} className={`w-full p-2.5 border ${validationErrors.bCustomsBorderPatrol ? 'border-red-500' : 'border-border'} rounded-md`}>
                      <option value="N">No</option>
                      <option value="Y">Yes</option>
                    </select>
                    {validationErrors.bCustomsBorderPatrol && <p className="text-red-500 text-xs mt-1">{validationErrors.bCustomsBorderPatrol}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-2 mb-2">Law Enforcement or Firefighter <span className="text-red-500">*</span></label>
                    <select name="bLawEnforce" value={formData.bLawEnforce} onChange={handleChange} className={`w-full p-2.5 border ${validationErrors.bLawEnforce ? 'border-red-500' : 'border-border'} rounded-md`}>
                      <option value="N">No</option>
                      <option value="Y">Yes</option>
                    </select>
                    {validationErrors.bLawEnforce && <p className="text-red-500 text-xs mt-1">{validationErrors.bLawEnforce}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-2 mb-2">Check Phased Retirement Eligibility <span className="text-red-500">*</span></label>
                    <select name="bPhasedRetire" value={formData.bPhasedRetire} onChange={handleChange} className={`w-full p-2.5 border ${validationErrors.bPhasedRetire ? 'border-red-500' : 'border-border'} rounded-md`}>
                      <option value="N">No</option>
                      <option value="Y">Yes</option>
                    </select>
                    {validationErrors.bPhasedRetire && <p className="text-red-500 text-xs mt-1">{validationErrors.bPhasedRetire}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                  <div>
                    <label className="block text-sm font-semibold text-text-2 mb-2">Date of Birth <span className="text-red-500">*</span></label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={`w-full p-2.5 border ${validationErrors.dateOfBirth ? 'border-red-500' : 'border-border'} rounded-md`} />
                    {validationErrors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{validationErrors.dateOfBirth}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-2 mb-2">Start Date of Civilian Employment <span className="text-red-500">*</span></label>
                    <p className="text-xs text-text-3 mb-2">If you have prior military service, enter your service computation date instead, since this directly impacts retirement timing calculations.</p>
                    <input type="date" name="dateServiceComp" value={formData.dateServiceComp} onChange={handleChange} className={`w-full p-2.5 border ${validationErrors.dateServiceComp ? 'border-red-500' : 'border-border'} rounded-md`} />
                    {validationErrors.dateServiceComp && <p className="text-red-500 text-xs mt-1">{validationErrors.dateServiceComp}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-8 bg-gray-50">
              <div className="bg-white p-8 border border-border rounded-lg shadow-sm mb-6">
                <h2 className="text-2xl font-serif text-blue mb-6 border-b pb-4">Retirement Eligibility<br/><span className="text-xl text-text">Summary</span></h2>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm mb-8">
                  <div><span className="font-semibold">Retirement System:</span> {formData.bCSRS === 'Y' ? 'CSRS' : 'FERS'}</div>
                  <div><span className="font-semibold">Date of Birth:</span> {formData.dateOfBirth} (Age: {calculateAge(formData.dateOfBirth || '')})</div>
                  <div><span className="font-semibold">Service Comp Date:</span> {formData.dateServiceComp} (Service: {calculateService(formData.dateServiceComp || '')} years)</div>
                  <div><span className="font-semibold">Air Traffic Controller:</span> {formData.bAirTraffic === 'Y' ? 'Yes' : 'No'}</div>
                  <div><span className="font-semibold">Customs/Border Patrol:</span> {formData.bCustomsBorderPatrol === 'Y' ? 'Yes' : 'No'}</div>
                  <div><span className="font-semibold">Law Enforcement/Firefighter:</span> {formData.bLawEnforce === 'Y' ? 'Yes' : 'No'}</div>
                  <div><span className="font-semibold">Phased Retirement:</span> {formData.bPhasedRetire === 'Y' ? 'Yes' : 'No'}</div>
                </div>

                <div className="bg-blue-50 p-6 rounded-md mb-8">
                  <h3 className="font-semibold text-lg mb-4">Earliest Unreduced Retirement Date</h3>
                  <div className="text-4xl font-mono text-blue mb-2">
                    {reportData?.howSoon?.eligibilityDate || 'N/A'}
                  </div>
                  <div className="text-sm text-text-2 mt-4">
                    This is the earliest date you can retire with a full, non-reduced annuity based on the information provided.
                  </div>
                </div>

                <div className="text-sm text-text-2 space-y-4 border-t pt-6">
                  <div className="bg-gray-50 p-4 rounded-md border border-border">
                    <p className="font-semibold mb-2">Want to estimate your annuity amount?</p>
                    <p className="mb-4">Run the Free FERS Annuity Calculator to get a detailed projection of your retirement scenario.</p>
                    <button onClick={onNavigateToFers} className="px-4 py-2 bg-white border border-border text-blue rounded-md font-semibold hover:bg-gray-50 transition-colors">
                      Run FERS Annuity Calculator
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button onClick={() => setStep(3)} className="px-6 py-3 bg-blue text-white rounded-md font-semibold hover:bg-blue-hover transition-colors">
                  Continue to Email Report
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-serif mb-4">Email Report</h2>
              <p className="text-text-2 text-sm mb-6">To receive a free copy of your personalized retirement scenario, enter your email address, then click on the Send it! button below.</p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Your Email Address <span className="text-red-500">*</span></label>
                  <input type="email" value={emailData.email} onChange={e => setEmailData({...emailData, email: e.target.value})} className="w-full p-2.5 border border-border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Re-type your email <span className="text-red-500">*</span></label>
                  <p className="text-xs text-text-3 mb-2">(please type a 2nd time to validate)</p>
                  <input type="email" value={emailData.confirmEmail} onChange={e => setEmailData({...emailData, confirmEmail: e.target.value})} className="w-full p-2.5 border border-border rounded-md" />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    if (emailData.email && emailData.email === emailData.confirmEmail) {
                      alert('Report sent to ' + emailData.email);
                      setStep(2);
                    } else {
                      alert('Please enter matching email addresses.');
                    }
                  }}
                  className="w-full px-6 py-3 bg-blue text-white rounded-md font-semibold hover:bg-blue-hover transition-colors"
                >
                  Send it!
                </button>
                <button onClick={handlePrint} className="w-full px-6 py-3 bg-white border border-border text-text rounded-md font-semibold hover:bg-gray-50 transition-colors">
                  Printer-Friendly Report
                </button>
                <button onClick={() => setStep(2)} className="w-full mt-2 px-6 py-3 text-text-2 font-medium hover:text-text transition-colors">
                  Back to Results
                </button>
              </div>
            </div>
          )}

          {step < 3 && (
            <div className="p-6 bg-gray-50 border-t border-border flex justify-between items-center">
              <button
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1}
                className="px-6 py-2.5 text-sm font-semibold text-text-2 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {step === 1 && (
                <button
                  onClick={handleNext}
                  disabled={isCalculating}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-blue hover:bg-blue-hover rounded-md transition-colors shadow-sm flex items-center gap-2"
                >
                  {isCalculating ? 'Calculating...' : 'Calculate Eligibility'}
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
