import { useState } from 'react';

type PhotoProps = {
  src: string;
  alt: string;
  className?: string;
  /** Shown in the placeholder so the missing file is self-describing. */
  hint?: string;
};

/**
 * An image that degrades into a labelled placeholder instead of a broken
 * icon — the portrait slots ship empty, so the "not added yet" state is a
 * normal state of this page, not an error.
 */
export function Photo({ src, alt, className = '', hint }: PhotoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-surface-3 p-6 text-center ${className}`}
        role="img"
        aria-label={`${alt} — image not added yet`}
      >
        <svg viewBox="0 0 24 24" className="size-7 text-ink-faint" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9.5" r="1.6" />
          <path d="m3 16 4.5-4 3.5 3 4-5 6 6" />
        </svg>
        <span className="font-mono text-[0.68rem] leading-relaxed text-ink-faint">
          {hint ?? `drop your photo at ${src}`}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
