/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
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
import { High3Calculator } from './components/High3Calculator';
import { ApiPage } from './components/ApiPage';

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

const PATH_TO_VIEW: Record<string, string> = {
  '/': 'home',
  '/calculators': 'home',
  '/fers-calculator': 'fers',
  '/csrs-calculator': 'csrs',
  '/tsp-calculator': 'tsp',
  '/high-3-calculator': 'high3',
  '/api': 'api',
  '/retirement-gap-analysis': 'gap',
  '/eligibility': 'eligibility',
  '/military-deposit': 'military',
  '/full-analysis': 'full',
  '/social-security': 'ss',
};

const VIEW_TO_PATH: Record<string, string> = Object.entries(PATH_TO_VIEW).reduce((acc, [path, view]) => {
  if (!acc[view] || path !== '/') acc[view] = path;
  return acc;
}, {} as Record<string, string>);

export default function App() {
  const [view, setView] = useState(() => {
    const path = window.location.pathname;
    return PATH_TO_VIEW[path] || 'home';
  });
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
    
    const newPath = VIEW_TO_PATH[nextView] || '/calculators';
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setView(PATH_TO_VIEW[path] || 'home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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
        {view === 'high3' && <High3Calculator onBack={() => handleNavigate('home')} onNavigate={handleNavigate} />}
        {view === 'api' && <ApiPage onBack={() => handleNavigate('home')} onNavigate={handleNavigate} />}
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