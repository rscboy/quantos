import { AdPlaceholder } from './AdPlaceholder';

export function SponsorBanner({ className = '' }: { className?: string }) {
  return (
    <AdPlaceholder
      className={className}
      label="Advertisement"
      slot="Inline banner placement"
      detail="Reserved for lightweight banner inventory between calculator discovery sections."
      compact
    />
  );
}