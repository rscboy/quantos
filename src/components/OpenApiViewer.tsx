import React from 'react';
import { openApiYaml } from '../openapi';
import { SEO } from './SEO';

interface OpenApiViewerProps {
  onBack: () => void;
}

export function OpenApiViewer({ onBack }: OpenApiViewerProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO 
        title="OpenAPI API Specification | MyFedPlan"
        description="View the OpenAPI specification for the MyFedPlan API, detailing federal retirement calculation endpoints."
      />
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-primary hover:text-primary-dark font-medium flex items-center"
        >
          &larr; Back to Home
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
        <h2 className="text-2xl font-bold text-navy mb-4">OpenAPI Specification</h2>
        <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm text-gray-800 font-mono border border-gray-200">
          {openApiYaml}
        </pre>
      </div>
    </div>
  );
}
