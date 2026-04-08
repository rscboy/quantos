import React, { useState, useEffect } from 'react';
import { fedcalcApi, FedEmployee } from '../services/fedcalcApi';
import { openBrandedPrintReport } from '../utils/reportPrint';
import { DebugPanel } from './DebugPanel';
import { useSharedProfile } from '../hooks/useSharedProfile';
import { SEO } from './SEO';

export function HowSoonCalculator({ onBack, onNavigateToFers }: { onBack: () => void, onNavigateToFers: () => void }) {
  const { profile, updateProfile } = useSharedProfile();
  const [step, setStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<FedEmployee>>({
    bCSRS: profile.bCSRS || 'N',
    bAirTraffic: profile.bAirTraffic || 'N',
    bCustomsBorderPatrol: profile.bCustomsBorderPatrol || 'N',
    bLawEnforce: profile.bLawEnforce || 'N',
    bPhasedRetire: profile.bPhasedRetire || 'N',
    dateOfBirth: profile.dateOfBirth || '',
    dateServiceComp: profile.dateServiceComp || '',
  });

  const [emailData, setEmailData] = useState({ email: profile.email || '', confirmEmail: '' });

  // Sync profile updates if they happen externally
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      bCSRS: profile.bCSRS || prev.bCSRS,
      bAirTraffic: profile.bAirTraffic || prev.bAirTraffic,
      bCustomsBorderPatrol: profile.bCustomsBorderPatrol || prev.bCustomsBorderPatrol,
      bLawEnforce: profile.bLawEnforce || prev.bLawEnforce,
      bPhasedRetire: profile.bPhasedRetire || prev.bPhasedRetire,
      dateOfBirth: profile.dateOfBirth || prev.dateOfBirth,
      dateServiceComp: profile.dateServiceComp || prev.dateServiceComp,
    }));
    if (profile.email) {
      setEmailData(prev => ({ ...prev, email: profile.email || prev.email }));
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Save to shared profile
    if (['bCSRS', 'bAirTraffic', 'bCustomsBorderPatrol', 'bLawEnforce', 'bPhasedRetire', 'dateOfBirth', 'dateServiceComp'].includes(name)) {
      updateProfile({ [name]: value });
    }
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
      if (import.meta.env.DEV) {
        console.log('Submitting HowSoon payload to /api/fedcalc/calculate?type=howsoon:', JSON.stringify(payload, null, 2));
      }
      const apiResults = await fedcalcApi.calculateRetirement(formData, 'howsoon');
      setReportData(apiResults);
      setStep(2); // Go to results step
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Calculation error:', error);
      }
      setApiError('Unable to calculate eligibility. Please check your dates or required fields and try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePrint = () => {
    const ageAtRetirement = formData.dateOfBirth && reportData?.howSoon?.fullRetire
      ? Math.floor((new Date(reportData.howSoon.fullRetire).getTime() - new Date(formData.dateOfBirth).getTime()) / 31557600000)
      : null;
    const serviceTime = formData.dateServiceComp && reportData?.howSoon?.fullRetire
      ? Math.floor((new Date(reportData.howSoon.fullRetire).getTime() - new Date(formData.dateServiceComp).getTime()) / 31557600000)
      : null;

    openBrandedPrintReport({
      title: 'How Soon Can I Retire?',
      subtitle: 'Friendly printer version of your retirement eligibility report.',
      sections: [
        {
          title: 'Eligibility Summary',
          lines: [
            { label: 'Retirement System', value: formData.bCSRS === 'Y' ? 'CSRS' : 'FERS' },
            { label: 'Date of Birth', value: formData.dateOfBirth || 'N/A' },
            { label: 'Age at Eligibility', value: ageAtRetirement === null ? 'N/A' : `${ageAtRetirement} years` },
            { label: 'Service Computation Date', value: formData.dateServiceComp || 'N/A' },
            { label: 'Service at Eligibility', value: serviceTime === null ? 'N/A' : `${serviceTime} years` },
            { label: 'Air Traffic Controller', value: formData.bAirTraffic === 'Y' ? 'Yes' : 'No' },
            { label: 'Customs / Border Patrol', value: formData.bCustomsBorderPatrol === 'Y' ? 'Yes' : 'No' },
            { label: 'Law Enforcement / Firefighter', value: formData.bLawEnforce === 'Y' ? 'Yes' : 'No' },
            { label: 'Phased Retirement', value: formData.bPhasedRetire === 'Y' ? 'Yes' : 'No' },
          ],
        },
        {
          title: 'Report Result',
          lines: [
            { label: 'Earliest Unreduced Retirement Date', value: reportData?.howSoon?.fullRetire || 'N/A' },
            { label: 'Earliest Reduced (Partial) Retirement Date', value: reportData?.howSoon?.partialRetire || 'N/A' },
          ],
        },
      ],
    });
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
      {[1, 2, 3].map(s => (
        <div key={s} className="flex items-center shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === s ? 'bg-blue text-white' : step > s ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
            {step > s ? '✓' : s}
          </div>
          {s < 3 && <div className={`w-4 sm:w-16 md:w-24 h-1 mx-1 sm:mx-2 rounded ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />}
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

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Retirement Eligibility Calculator",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "provider": {
      "@type": "Organization",
      "name": "FedCalc"
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <SEO 
        title="Federal Retirement Eligibility Calculator | When Can I Retire? | FedCalc"
        description="Find out exactly when you are eligible to retire under FERS or CSRS rules. Calculate your earliest retirement date instantly with FedCalc."
        schema={schema}
      />
      <main className="w-full max-w-[900px] mx-auto px-4 sm:px-6 pb-20 pt-8 sm:pt-12">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-2 mb-6 sm:mb-8 cursor-pointer bg-none border-none p-0 font-sans transition-colors duration-120 hover:text-blue min-h-[44px]"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
            <path d="M10 3L5 8l5 5" />
          </svg>
          All Calculators
        </button>

        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-text mb-6 sm:mb-8">How Soon Can I Retire?</h1>
        <p className="text-text-2 text-sm mb-8">Find out the soonest possible date you can retire from Federal service and still receive a retirement annuity.</p>

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
                    {reportData?.howSoon?.fullRetire || 'N/A'}
                  </div>
                  <div className="text-sm text-text-2 mt-4">
                    This is the earliest date you can retire with a full, non-reduced annuity based on the information provided.
                  </div>
                  {!reportData?.howSoon?.fullRetire && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                      <strong>Note:</strong> We could not determine a full retirement date. Additional inputs may improve the accuracy of this estimate.
                    </div>
                  )}
                </div>

                {reportData?.howSoon?.partialRetire && (
                  <div className="bg-gray-50 p-6 rounded-md mb-8 border border-border">
                    <h3 className="font-semibold text-lg mb-4">Earliest Reduced (MRA+10) Retirement Date</h3>
                    <div className="text-3xl font-mono text-text mb-2">
                      {reportData.howSoon.partialRetire}
                    </div>
                    <div className="text-sm text-text-2 mt-4">
                      This is the earliest date you can retire with a reduced annuity (Minimum Retirement Age with at least 10 years of service).
                    </div>
                  </div>
                )}

                {reportData?.howSoon?.html && (
                  <div className="mb-8">
                    <h3 className="font-semibold text-lg mb-4 border-b pb-2">Detailed Report</h3>
                    <div 
                      className="fedcalc-report"
                      dangerouslySetInnerHTML={{ __html: reportData.howSoon.html }}
                    />
                  </div>
                )}

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
                  <input 
                    type="email" 
                    value={emailData.email} 
                    onChange={e => {
                      setEmailData({...emailData, email: e.target.value});
                      updateProfile({ email: e.target.value });
                    }} 
                    className="w-full p-2.5 border border-border rounded-md min-h-[44px]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-2 mb-2">Re-type your email <span className="text-red-500">*</span></label>
                  <p className="text-xs text-text-3 mb-2">(please type a 2nd time to validate)</p>
                  <input 
                    type="email" 
                    value={emailData.confirmEmail} 
                    onChange={e => setEmailData({...emailData, confirmEmail: e.target.value})} 
                    className="w-full p-2.5 border border-border rounded-md min-h-[44px]" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={async () => {
                    if (emailData.email && emailData.email === emailData.confirmEmail) {
                      setIsCalculating(true);
                      try {
                        const { generateReportHtml } = await import('../utils/reportPrint');
                        const { sendEmailReport } = await import('../utils/emailReport');
                        
                        const ageAtRetirement = formData.dateOfBirth && reportData?.howSoon?.fullRetire
                          ? Math.floor((new Date(reportData.howSoon.fullRetire).getTime() - new Date(formData.dateOfBirth).getTime()) / 31557600000)
                          : null;
                        const serviceTime = formData.dateServiceComp && reportData?.howSoon?.fullRetire
                          ? Math.floor((new Date(reportData.howSoon.fullRetire).getTime() - new Date(formData.dateServiceComp).getTime()) / 31557600000)
                          : null;

                        const htmlBody = generateReportHtml({
                          title: 'How Soon Can I Retire?',
                          subtitle: 'Your retirement eligibility report.',
                          sections: [
                            {
                              title: 'Eligibility Summary',
                              lines: [
                                { label: 'Retirement System', value: formData.bCSRS === 'Y' ? 'CSRS' : 'FERS' },
                                { label: 'Date of Birth', value: formData.dateOfBirth || 'N/A' },
                                { label: 'Age at Eligibility', value: ageAtRetirement === null ? 'N/A' : `${ageAtRetirement} years` },
                                { label: 'Service Computation Date', value: formData.dateServiceComp || 'N/A' },
                                { label: 'Service at Eligibility', value: serviceTime === null ? 'N/A' : `${serviceTime} years` },
                                { label: 'Air Traffic Controller', value: formData.bAirTraffic === 'Y' ? 'Yes' : 'No' },
                                { label: 'Customs / Border Patrol', value: formData.bCustomsBorderPatrol === 'Y' ? 'Yes' : 'No' },
                                { label: 'Law Enforcement / Firefighter', value: formData.bLawEnforce === 'Y' ? 'Yes' : 'No' },
                                { label: 'Phased Retirement', value: formData.bPhasedRetire === 'Y' ? 'Yes' : 'No' },
                              ],
                            },
                            {
                              title: 'Report Result',
                              lines: [
                                { label: 'Earliest Unreduced Retirement Date', value: reportData?.howSoon?.fullRetire || 'N/A' },
                                { label: 'Earliest Reduced (Partial) Retirement Date', value: reportData?.howSoon?.partialRetire || 'N/A' },
                              ],
                            },
                          ],
                          isEmail: true
                        });
                        
                        await sendEmailReport(emailData.email, 'Your Retirement Eligibility Estimate', htmlBody);
                        alert('Report sent successfully to ' + emailData.email);
                      } catch (error) {
                        console.error('Failed to send email:', error);
                        alert('Failed to send email. Please try again.');
                      } finally {
                        setIsCalculating(false);
                      }
                    } else {
                      alert('Please enter matching email addresses.');
                    }
                  }}
                  className="w-full px-6 py-3 bg-blue text-white rounded-md font-semibold hover:bg-blue-hover transition-colors"
                >
                  Send it!
                </button>
                <button onClick={handlePrint} className="w-full px-6 py-3 bg-white border border-border text-text rounded-md font-semibold hover:bg-gray-50 transition-colors">
                  Friendly Printer Version
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

        <DebugPanel 
          debugInfo={reportData?.debugInfo} 
          parsedData={reportData?.howSoon} 
          rawResponse={reportData?.rawResponse}
        />
      </main>
    </div>
  );
}