/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { Home } from './components/Home';
import { FersCalculator } from './components/FersCalculator';
import { NewMemberModal } from './components/NewMemberModal';

export default function App() {
  const [view, setView] = useState('home');
  const [showModal, setShowModal] = useState(false);

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
        {view === 'fers' && <FersCalculator onBack={() => setView('home')} />}
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

