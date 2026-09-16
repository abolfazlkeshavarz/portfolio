import { useEffect, useState } from 'react';
import type { Profile } from '../types';
import { NodeField } from './NodeField';
import { TiltCard } from './TiltCard';
import { Photo } from './Photo';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

function useTypedText(full: string, enabled: boolean) {
  const [shown, setShown] = useState(enabled ? '' : full);

  useEffect(() => {
    if (!enabled) {
      setShown(full);
      return;
    }
    setShown('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(full.slice(0, i));
      if (i >= full.length) clearInterval(id);
    }, 55);
    return () => clearInterval(id);
  }, [full, enabled]);

  return shown;
}

/** Renders the headline with the accent phrase lifted into the signal colour. */
function Headline({ headline, accent }: { headline: string; accent: string }) {
  const at = accent ? headline.indexOf(accent) : -1;
  if (at === -1) return <>{headline}</>;
  return (
    <>
      {headline.slice(0, at)}
      <span className="text-signal">{accent}</span>
      {headline.slice(at + accent.length)}
    </>
  );
}

export function Hero({ profile }: { profile: Profile }) {
  const reducedMotion = usePrefersReducedMotion();
  const typed = useTypedText(profile.terminalCmd, !reducedMotion);

  return (
    <section className="relative isolate grid items-start gap-10 py-14 lg:grid-cols-[1.3fr_1fr] lg:gap-14 lg:py-20">
      <NodeField />

      <div>
        <p className="mb-4 flex items-center gap-2.5 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-signal">
          <span className="h-px w-4 bg-signal" />
          {profile.eyebrow}
        </p>

        <h1 className="font-mono text-[clamp(1.75rem,4vw,2.6rem)] font-semibold leading-[1.18] tracking-tight text-white">
          <Headline headline={profile.headline} accent={profile.accent} />
        </h1>

        <p className="mt-5 max-w-[56ch] text-[1.03rem] leading-relaxed text-ink-dim">{profile.lede}</p>

        <p className="mt-6 flex items-baseline gap-2.5 font-mono text-[0.85rem] text-cool">
          <span className="text-ink-faint">guest@keshavarz:~$</span>
          <span>
            {typed}
            <span className="ml-px inline-block h-[0.95em] w-[7px] translate-y-[0.1em] bg-cool animate-blink" />
          </span>
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <a className="btn btn-primary" href="#radgard">
            View RadGard →
          </a>
          <a className="btn" href="#connect">
            Contact
          </a>
          <a className="btn" href={profile.github} target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <TiltCard max={10} lift={20} className="panel overflow-hidden rounded-md">
          <div className="relative">
            <Photo
              src={profile.portrait}
              alt={`${profile.name}, portrait`}
              hint={`drop a portrait at ${profile.portrait}`}
              className="aspect-4/5 w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-bg via-transparent to-transparent" />
            <div className="depth-3 pointer-events-none absolute bottom-3 left-3 rounded border border-edge bg-surface-3/90 px-2.5 py-1.5 backdrop-blur-sm">
              <div className="font-mono text-[0.72rem] font-semibold text-white">{profile.name}</div>
              <div className="font-mono text-[0.62rem] text-cool">{profile.role}</div>
            </div>
          </div>
        </TiltCard>

        <div className="grid grid-cols-2 gap-3">
          {profile.stats.map((stat) => (
            <TiltCard key={stat.label} max={12} lift={10} className="panel h-full rounded-md p-4">
              <div className="depth-1">
                <div className="font-mono text-2xl font-semibold tabular-nums text-white">
                  {stat.value}
                  {stat.unit ? <span className="ml-0.5 text-[0.8rem] font-normal text-ink-faint">{stat.unit}</span> : null}
                </div>
                <div className="mt-1.5 font-mono text-[0.65rem] uppercase tracking-wider text-ink-faint">
                  {stat.label}
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
