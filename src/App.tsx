/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useMemo, useState } from 'react';
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
import { AdPlacement } from './components/AdPlacement';

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
  const [hasCompletedProfile, setHasCompletedProfile] = useState(() => localStorage.getItem('hasCompletedProfile') === 'true');

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

  return (
    <div className="min-h-screen flex flex-col font-sans text-text bg-bg">
      <Nav setView={handleNavigate} />

      <div className="flex-1 pb-24 md:pb-0">
        {view === 'home' && <Home onSelectCalc={handleNavigate} />}
        {view === 'fers' && <FersCalculator onBack={() => handleNavigate('home')} />}
        {view === 'csrs' && <CsrsCalculator onBack={() => handleNavigate('home')} />}
        {view === 'eligibility' && <HowSoonCalculator onBack={() => handleNavigate('home')} onNavigateToFers={() => handleNavigate('fers')} />}
        {view === 'tsp' && <TspCalculator onBack={() => handleNavigate('home')} />}
        {view === 'gap' && <RetirementGapCalculator onBack={() => handleNavigate('home')} />}
        {view === 'military' && <MilitaryDepositCalculator onBack={() => handleNavigate('home')} />}
        {view === 'full' && <FullRetirementAnalysis onBack={() => handleNavigate('home')} />}
        {view === 'ss' && <SocialSecurityEstimator onBack={() => handleNavigate('home')} />}
      </div>

      <Footer setView={handleNavigate} />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
        <AdPlacement
          title={view === 'home' ? 'Quick mobile placement' : 'Sticky mobile placement'}
          subtitle={view === 'home' ? 'Reserved for a lightweight mobile ad below the primary content.' : 'Reserved for a bottom mobile unit that stays visible without covering any calculator inputs.'}
          compact
          refreshToken={view}
          bannerClassName="min-h-[60px]"
        />
      </div>

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
      />
    </div>
  );
}
