import React from 'react';

export function RelatedCalculators({ 
  links, 
  onNavigate 
}: { 
  links: { id: string; title: string; description: string; url: string }[], 
  onNavigate: (id: string) => void 
}) {
  return (
    <div className="mt-16 pt-12 border-t border-border">
      <h2 className="font-serif text-2xl text-text mb-6">Related Federal Retirement Calculators</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(link.id);
            }}
            className="block bg-white border border-border rounded-lg p-5 hover:border-blue/30 transition-colors no-underline"
          >
            <h3 className="font-serif text-lg text-blue mb-2">{link.title}</h3>
            <p className="text-sm text-text-2">{link.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
