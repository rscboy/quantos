/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { OpenApiViewer } from './components/OpenApiViewer';
import { TermsOfService } from './components/TermsOfService';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { RouteMeta } from './components/RouteMeta';
import { AboutUs } from './components/AboutUs';
import { ContactUs } from './components/ContactUs';
import { Disclaimer } from './components/Disclaimer';
import { CookieConsent } from './components/CookieConsent';
import { CalculatorContentGuide } from './components/CalculatorContentGuide';
import { Guides } from './components/Guides';
import { CookiePolicy } from './components/CookiePolicy';
import { Methodology } from './components/Methodology';

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

const STATIC_VIEWS = new Set(['home', 'guides', 'openapi', 'terms', 'privacy', 'cookie-policy', 'about', 'contact', 'disclaimer', 'methodology']);

export default function App() {
  const [view, setView] = useState(() => {
    const path = window.location.pathname.replace(/^\/+/, '').replace(/\/+$/, '').replace(/\.html$/, '');
    return CALCULATOR_VIEWS.has(path) || STATIC_VIEWS.has(path) ? path : 'home';
  });
  const [showModal, setShowModal] = useState(false);
  const [pendingView, setPendingView] = useState<string | null>(null);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(() => localStorage.getItem('hasCompletedProfile') === 'true');
  const [linkedCalculatorData, setLinkedCalculatorData] = useState<LinkedCalculatorData>(() => loadLinkedCalculatorData());

  const handleLinkedDataUpdate = useCallback((update: Partial<LinkedCalculatorData>) => {
    setLinkedCalculatorData((current) => mergeLinkedData(current, update));
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/+/, '').replace(/\/+$/, '').replace(/\.html$/, '');
      setView(CALCULATOR_VIEWS.has(path) || STATIC_VIEWS.has(path) ? path : 'home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    // Attempt instant scroll immediately after DOM paints
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    
    // Fallback: sometimes browsers drop the scroll if content is still laying out
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [view]);

  const navigateToView = useCallback((nextView: string) => {
    setView(nextView);
    const path = nextView === 'home' ? '/' : `/${nextView}`;
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    
    // Also try immediately
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const handleNavigate = useCallback((nextView: string) => {
    // Calculators are open to all visitors. The optional profile modal can be
    // opened explicitly by the user but never gates access to publisher content.
    navigateToView(nextView);
  }, [navigateToView]);

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
      <RouteMeta view={view} />
      <Nav setView={handleNavigate} />

      <div className="flex-1">
        {view === 'home' && <Home onSelectCalc={handleNavigate} />}
        {view === 'fers' && <FersCalculator onNavigate={handleNavigate} />}
        {view === 'csrs' && <CsrsCalculator onNavigate={handleNavigate} />}
        {view === 'eligibility' && <HowSoonCalculator onNavigate={handleNavigate} />}
        {view === 'tsp' && <TspCalculator onBack={() => handleNavigate('home')} linkedData={linkedCalculatorData} onLinkedDataChange={handleLinkedDataUpdate} />}
        {view === 'gap' && <RetirementGapCalculator onNavigate={handleNavigate} linkedData={linkedCalculatorData} />}
        {view === 'military' && <MilitaryDepositCalculator onBack={() => handleNavigate('home')} />}
        {view === 'full' && <FullRetirementAnalysis onNavigate={handleNavigate} linkedData={linkedCalculatorData} />}
        {view === 'ss' && <SocialSecurityEstimator onBack={() => handleNavigate('home')} linkedData={linkedCalculatorData} onLinkedDataChange={handleLinkedDataUpdate} />}
        {CALCULATOR_VIEWS.has(view) && <CalculatorContentGuide view={view as 'fers' | 'csrs' | 'eligibility' | 'tsp' | 'gap' | 'military' | 'full' | 'ss'} />}
        {view === 'guides' && <Guides />}
        {view === 'openapi' && <OpenApiViewer onBack={() => handleNavigate('home')} />}
        {view === 'terms' && <TermsOfService />}
        {view === 'privacy' && <PrivacyPolicy />}
        {view === 'cookie-policy' && <CookiePolicy />}
        {view === 'about' && <AboutUs />}
        {view === 'contact' && <ContactUs />}
        {view === 'disclaimer' && <Disclaimer />}
        {view === 'methodology' && <Methodology />}
      </div>

      <Footer setView={handleNavigate} />
      <CookieConsent />

      <NewMemberModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setPendingView(null);
        }}
        onComplete={handleCompleteRegistration}
        canClose={true}
        description={modalMessage}
        onOpenTerms={(tab) => {
          setShowModal(false);
          handleNavigate(tab);
        }}
      />
    </div>
  );
}
