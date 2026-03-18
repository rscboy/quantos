/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useLayoutEffect, useState } from 'react';
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

export default function App() {
  const [view, setView] = useState('home');
  const [showModal, setShowModal] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [view]);

  const handleSelectCalc = (calcId: string) => {
    setView(calcId);
    
    // Check if they need to see the modal
    const hasCompleted = localStorage.getItem('hasCompletedProfile');
    if (!hasCompleted) {
      setShowModal(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-text bg-bg">
      <Nav setView={setView} />
      
      <div className="flex-1">
        {view === 'home' && <Home onSelectCalc={handleSelectCalc} />}
        {view === 'fers' && <FersCalculator onBack={() => handleSelectCalc('home')} />}
        {view === 'csrs' && <CsrsCalculator onBack={() => handleSelectCalc('home')} />}
        {view === 'eligibility' && <HowSoonCalculator onBack={() => handleSelectCalc('home')} onNavigateToFers={() => handleSelectCalc('fers')} />}
        {view === 'tsp' && <TspCalculator onBack={() => handleSelectCalc('home')} />}
        {view === 'gap' && <RetirementGapCalculator onBack={() => handleSelectCalc('home')} />}
        {view === 'military' && <MilitaryDepositCalculator onBack={() => handleSelectCalc('home')} />}
        {view === 'full' && <FullRetirementAnalysis onBack={() => handleSelectCalc('home')} />}
      </div>
      
      <Footer setView={setView} />

      <NewMemberModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onComplete={() => setShowModal(false)} 
      />
    </div>
  );
}

