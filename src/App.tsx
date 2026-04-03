/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useMemo, useState } from 'react';
import { LinkedCalculatorData, loadLinkedCalculatorData, mergeLinkedData } from './utils/calculatorLinking';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { Home } from './components/Home';
import { CsrsCalculator, FersCalculator } from './components/FersCalculator';
import { TspCalculator } from './components/TspCalculator';
import { RetirementGapCalculator } from './components/RetirementGapCalculator';
import { HowSoonCalculator } from './components/HowSoonCalculator';
import { MilitaryDepositCalculator } from './components/MilitaryDepositCalculator';
import { NewMemberModal } from './components/NewMemberModal';
import { FullRetirementAnalysis } from './components/FullRetirementAnalysis';
import { SocialSecurityEstimator } from './components/SocialSecurityEstimator';
import { TermsModal } from './components/TermsModal';

const CALCULATOR_VIEWS = new Set([
  'fers',
  'csrs',
  'eligibility',
  'tsp',
  'gap',
  'military',
  'full',
  'ss',
]);

export default function App() {
  const [view, setView] = useState('home');
  const [showModal, setShowModal] = useState(false);
  const [pendingView, setPendingView] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsTab, setTermsTab] = useState<'terms' | 'privacy'>('terms');
  const [hasCompletedProfile, setHasCompletedProfile] = useState(() => localStorage.getItem('hasCompletedProfile') === 'true');
  const [linkedCalculatorData, setLinkedCalculatorData] = useState<LinkedCalculatorData>(() => loadLinkedCalculatorData());

  const handleLinkedDataUpdate = useCallback((update: Partial<LinkedCalculatorData>) => {
    setLinkedCalculatorData((current) => mergeLinkedData(current, update));
  }, []);

  const navigateToView = useCallback((nextView: string) => {
    setView(nextView);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }, []);

  const openRegistrationGate = useCallback((nextView: string) => {
    setPendingView(nextView);
    setShowModal(true);
    navigateToView('home');
  }, [navigateToView]);

  const handleNavigate = useCallback((nextView: string) => {
    const isCalculatorView = CALCULATOR_VIEWS.has(nextView);

    if (isCalculatorView && !hasCompletedProfile) {
      openRegistrationGate(nextView);
      return;
    }

    navigateToView(nextView);
  }, [hasCompletedProfile, navigateToView, openRegistrationGate]);

  const handleCompleteRegistration = useCallback(() => {
    setHasCompletedProfile(true);
    setShowModal(false);

    if (pendingView) {
      navigateToView(pendingView);
      setPendingView(null);
      return;
    }

    navigateToView('home');
  }, [navigateToView, pendingView]);

  const modalMessage = useMemo(() => (
    pendingView
      ? 'Please complete your registration before you can access any calculator.'
      : 'Please fill this out the first time you use the calculators.'
  ), [pendingView]);

  const openTermsModal = useCallback((tab: 'terms' | 'privacy') => {
    setTermsTab(tab);
    setShowTermsModal(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans text-text bg-bg">
      <Nav setView={handleNavigate} />

      <div className="flex-1">
        {view === 'home' && <Home onSelectCalc={handleNavigate} />}
        {view === 'fers' && <FersCalculator onBack={() => handleNavigate('home')} />}
        {view === 'csrs' && <CsrsCalculator onBack={() => handleNavigate('home')} />}
        {view === 'eligibility' && <HowSoonCalculator onBack={() => handleNavigate('home')} onNavigateToFers={() => handleNavigate('fers')} />}
        {view === 'tsp' && <TspCalculator onBack={() => handleNavigate('home')} linkedData={linkedCalculatorData} onLinkedDataChange={handleLinkedDataUpdate} />}
        {view === 'gap' && <RetirementGapCalculator onBack={() => handleNavigate('home')} linkedData={linkedCalculatorData} />}
        {view === 'military' && <MilitaryDepositCalculator onBack={() => handleNavigate('home')} />}
        {view === 'full' && <FullRetirementAnalysis onBack={() => handleNavigate('home')} linkedData={linkedCalculatorData} />}
        {view === 'ss' && <SocialSecurityEstimator onBack={() => handleNavigate('home')} linkedData={linkedCalculatorData} onLinkedDataChange={handleLinkedDataUpdate} />}
      </div>

      <Footer setView={handleNavigate} onOpenTerms={openTermsModal} />

      <NewMemberModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setPendingView(null);
          navigateToView('home');
        }}
        onComplete={handleCompleteRegistration}
        canClose={hasCompletedProfile}
        description={modalMessage}
        onOpenTerms={openTermsModal}
      />

      <TermsModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
        initialTab={termsTab} 
      />
    </div>
  );
}