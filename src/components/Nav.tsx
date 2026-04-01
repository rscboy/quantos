import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, Facebook, Mail, Share2, X } from 'lucide-react';

export function Nav({ setView }: { setView: (view: string) => void }) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const shareRef = useRef<HTMLDivElement | null>(null);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://www.fedcalc.com';
  const shareTitle = 'FedCalc by Quantos';
  const shareText = 'Explore federal retirement calculators and planning tools with FedCalc.';

  const shareOptions = useMemo(() => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedSubject = encodeURIComponent(shareTitle);
    const encodedBody = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    const encodedXText = encodeURIComponent(`${shareText} ${shareUrl}`);

    return [
      {
        label: 'Copy URL',
        description: 'Copy a direct link to this page.',
        icon: Copy,
        action: async () => {
          if (typeof navigator === 'undefined' || !navigator.clipboard) {
            return;
          }

          await navigator.clipboard.writeText(shareUrl);
          setCopyStatus('copied');
        },
      },
      {
        label: 'Email',
        description: 'Share this page in a new email draft.',
        icon: Mail,
        href: `mailto:?subject=${encodedSubject}&body=${encodedBody}`,
      },
      {
        label: 'Share to X',
        description: 'Post this page to X with a prefilled message.',
        icon: X,
        href: `https://twitter.com/intent/tweet?text=${encodedXText}`,
      },
      {
        label: 'Share to Facebook',
        description: 'Open the Facebook share dialog for this page.',
        icon: Facebook,
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      },
    ];
  }, [shareText, shareTitle, shareUrl]);

  useEffect(() => {
    if (!isShareOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setIsShareOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsShareOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isShareOpen]);

  useEffect(() => {
    if (copyStatus !== 'copied') {
      return;
    }

    const timeoutId = window.setTimeout(() => setCopyStatus('idle'), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [copyStatus]);

  const handleCopyClick = async () => {
    try {
      await shareOptions[0].action?.();
    } catch {
      setCopyStatus('idle');
    }
  };

  return (
    <>
      <nav className="bg-navy text-white sticky top-0 z-50 border-b-[3px] border-blue">
        <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <a
            className="flex items-center gap-3 cursor-pointer no-underline"
            onClick={() => setView('home')}
          >
            <img 
              src="https://i.postimg.cc/1zXG4pSx/0B1F3A.png" 
              alt="FedCalc by Quantos" 
              className="h-10 w-auto object-contain" 
              referrerPolicy="no-referrer" 
            />
            <div className="flex flex-col justify-center items-start">
              <div className="font-serif leading-none tracking-[-0.3px]">
                <span className="text-white text-[26px]">F</span><span className="text-white text-[22px]">ed</span>
                <span className="text-[#93B4F4] text-[26px]">C</span><span className="text-[#93B4F4] text-[22px]">alc</span>
              </div>
              <span className="text-[10px] font-sans font-medium text-white/50 tracking-[0.2em] uppercase mt-1">by Quantos</span>
            </div>
          </a>
          <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
            <li>
              <a
                href="#"
                className="text-white/65 text-[14px] font-medium no-underline transition-colors duration-150 hover:text-white hover:no-underline active:text-white"
                onClick={(e) => { e.preventDefault(); setView('home'); }}
              >
                Calculators
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <div className="bg-navy-2 border-b border-white/5 py-2 px-6">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/50 tracking-[0.04em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shrink-0"></span>
            OPM Tables current · 2025 · Phased Retirement supported
          </div>
          <div className="relative flex items-center gap-5 text-[11px] text-white/40">
            <span>Audited monthly against OPM Chapter 50</span>
            <span>|</span>
            <div ref={shareRef} className="relative">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-white/40 text-[11px] transition-colors duration-150 hover:text-white/80"
                onClick={() => setIsShareOpen((current) => !current)}
                aria-expanded={isShareOpen}
                aria-haspopup="dialog"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share site
              </button>

              {isShareOpen && (
                <div className="absolute right-0 top-full mt-3 w-[320px] rounded-2xl border border-white/10 bg-[#0E2244] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-sm z-50">
                  <div className="mb-2 px-2">
                    <p className="text-sm font-semibold text-white">Share FedCalc</p>
                    <p className="mt-1 text-xs leading-5 text-white/60">Send this page with one tap using the options below.</p>
                  </div>
                  <div className="grid gap-2">
                    <button
                      type="button"
                      className="flex w-full items-start gap-3 rounded-xl border border-white/8 bg-white/3 px-3 py-3 text-left transition-colors duration-150 hover:bg-white/8"
                      onClick={handleCopyClick}
                    >
                      <div className="mt-0.5 rounded-lg bg-white/8 p-2 text-white">
                        {copyStatus === 'copied' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{copyStatus === 'copied' ? 'Copied!' : 'Copy URL'}</div>
                        <div className="text-xs text-white/60">{copyStatus === 'copied' ? 'The page link is ready to paste.' : 'Copy a direct link to this page.'}</div>
                      </div>
                    </button>

                    {shareOptions.slice(1).map(({ label, description, icon: Icon, href }) => (
                      <a
                        key={label}
                        href={href}
                        target={label === 'Email' ? undefined : '_blank'}
                        rel={label === 'Email' ? undefined : 'noreferrer'}
                        className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 px-3 py-3 no-underline transition-colors duration-150 hover:bg-white/8 hover:no-underline"
                      >
                        <div className="mt-0.5 rounded-lg bg-white/8 p-2 text-white">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{label}</div>
                          <div className="text-xs text-white/60">{description}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}