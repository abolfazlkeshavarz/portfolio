import { useEffect, useState } from 'react';

const SECTIONS = [
  { href: '#profile', label: 'Profile' },
  { href: '#stack', label: 'Stack' },
  { href: '#radgard', label: 'RadGard' },
  { href: '#systems', label: 'Systems' },
  { href: '#log', label: 'Log' },
  { href: '#connect', label: 'Connect' },
];

function useClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time.toLocaleTimeString('en-GB', { hour12: false });
}

export function TopBar({ name, location }: { name: string; location: string }) {
  const clock = useClock();

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-edge bg-bg/90 px-6 py-3.5 backdrop-blur-md">
      <div className="flex items-center gap-2.5 font-mono text-[0.8rem]">
        <span className="size-[7px] shrink-0 rounded-full bg-good shadow-[0_0_0_3px] shadow-good/20 animate-pulse-dot" />
        <span className="font-semibold uppercase tracking-wide text-white">{name}</span>
        <span className="hidden text-ink-faint sm:inline">/ systems console</span>
      </div>

      <nav className="hidden gap-6 font-mono text-[0.78rem] md:flex">
        {SECTIONS.map((section) => (
          <a key={section.href} href={section.href} className="text-ink-dim transition-colors hover:text-signal">
            {section.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-2 font-mono text-[0.72rem] whitespace-nowrap text-ink-dim">
        <span>{location}</span>
        <span className="text-ink-faint">·</span>
        <span className="tabular-nums">{clock}</span>
      </div>
    </header>
  );
}
