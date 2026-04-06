import { AdSenseDesktop } from './AdSenseDesktop';

export function SponsorBanner({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <AdSenseDesktop />
    </div>
  );
}