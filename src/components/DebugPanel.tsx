import React, { useState } from 'react';

interface DebugPanelProps {
  debugInfo?: {
    payload: any;
    calculatorType: string;
    backendUrl: string;
    isMockMode: boolean;
  };
  parsedData?: any;
  rawResponse?: any;
}

export function DebugPanel({ debugInfo, parsedData, rawResponse }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  if (!debugInfo) {
    return null;
  }

  return (
    <div className="mt-8 border border-amber-300 bg-amber-50 rounded-lg overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-amber-100 hover:bg-amber-200 transition-colors text-amber-900 font-mono text-sm font-semibold"
      >
        <span>🛠️ API Integration Debug (Dev Only)</span>
        <span>{isOpen ? '▼' : '▶'}</span>
      </button>
      
      {isOpen && (
        <div className="p-4 space-y-4 text-xs font-mono text-amber-900 overflow-x-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-bold">Calculator Type:</span> {debugInfo.calculatorType}
            </div>
            <div>
              <span className="font-bold">Mode:</span> {debugInfo.isMockMode ? 'MOCK' : 'LIVE'}
            </div>
            <div className="col-span-2">
              <span className="font-bold">Backend URL:</span> {debugInfo.backendUrl || '(None configured)'}
            </div>
          </div>
          
          <div>
            <div className="font-bold mb-1">Exact Payload Sent:</div>
            <pre className="bg-white/50 p-2 rounded border border-amber-200 whitespace-pre-wrap">
              {JSON.stringify(debugInfo.payload, null, 2)}
            </pre>
          </div>

          {rawResponse && (
            <div>
              <div className="font-bold mb-1">Raw API Response:</div>
              <pre className="bg-white/50 p-2 rounded border border-amber-200 whitespace-pre-wrap">
                {JSON.stringify(rawResponse, null, 2)}
              </pre>
            </div>
          )}

          {parsedData && (
            <div>
              <div className="font-bold mb-1">Parsed Response Object:</div>
              <pre className="bg-white/50 p-2 rounded border border-amber-200 whitespace-pre-wrap">
                {JSON.stringify(parsedData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
