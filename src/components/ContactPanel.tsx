import type { Profile } from '../types';
import { Panel } from './Panel';

type Line = {
  flag: string;
  value: string;
  href?: string;
};

export function ContactPanel({ profile }: { profile: Profile }) {
  const lines: Line[] = [
    { flag: '--email', value: profile.email, href: `mailto:${profile.email}` },
    {
      flag: '--github',
      value: profile.github.replace('https://', ''),
      href: profile.github,
    },
  ];

  if (profile.linkedin) {
    lines.push({ flag: '--linkedin', value: profile.linkedin.replace('https://', ''), href: profile.linkedin });
  }
  if (profile.cvUrl) {
    lines.push({ flag: '--cv', value: profile.cvUrl, href: profile.cvUrl });
  }

  return (
    <Panel id="connect" index="07" title="Connect" meta="open to roles in the EU · AT / DE preferred">
      <div className="font-mono text-[0.92rem] leading-[2.1]">
        {lines.map((line) => (
          <div key={line.flag}>
            <span className="text-ink-faint">$</span> <span className="text-ink-dim">contact</span>{' '}
            <span className="text-signal">{line.flag}</span>{' '}
            {line.href ? (
              <a
                href={line.href}
                target={line.href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="text-cool hover:underline"
              >
                {line.value}
              </a>
            ) : (
              <span className="text-cool">{line.value}</span>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}
