import type { Profile } from '../types';
import { Panel } from './Panel';
import { TiltCard } from './TiltCard';
import { Photo } from './Photo';

export function ProfilePanel({ profile }: { profile: Profile }) {
  return (
    <Panel id="profile" index="01" title="Profile" meta="Rasht, Iran → Genoa, Italy (MSc, 2026)">
      <div className="grid gap-8 md:grid-cols-[1.35fr_1fr]">
        <div>
          {profile.aboutParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="mb-3.5 text-[0.97rem] leading-[1.75] text-ink-dim last:mb-0">
              {paragraph}
            </p>
          ))}

          <div className="mt-6 flex flex-wrap gap-2">
            {profile.tags.map((tag) => (
              <span key={tag} className="chip text-[0.72rem] text-ink-dim">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <TiltCard max={9} lift={16} className="panel overflow-hidden rounded-md bg-surface-3">
          <Photo
            src={profile.aboutImage}
            alt={`${profile.name} at work`}
            hint={`drop a working shot at ${profile.aboutImage}`}
            className="aspect-4/3 w-full object-cover"
          />
          {profile.aboutImageCaption ? (
            <p className="border-t border-edge px-4 py-3 font-mono text-[0.68rem] leading-relaxed text-ink-faint">
              {profile.aboutImageCaption}
            </p>
          ) : null}
        </TiltCard>
      </div>
    </Panel>
  );
}
