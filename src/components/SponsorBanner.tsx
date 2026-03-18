export function SponsorBanner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-dashed border-border bg-bg ${className}`}
      aria-label="Advertisement placeholder"
    >
      <div className="flex min-h-[44px] w-full items-center justify-center px-3 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-3">
          Ad Placeholder
        </span>
      </div>
    </div>
  );
}
