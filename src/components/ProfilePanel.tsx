import type { Profile } from '../types';
import { Panel } from './Panel';

export function ProfilePanel({ profile }: { profile: Profile }) {
  return (
    <Panel id="profile" index="01" title="Profile" meta="Rasht, Iran → Genoa, Italy (MSc, 2026)">
      <div className="max-w-[68ch]">
        {profile.aboutParagraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className="mb-3.5 text-[0.97rem] leading-[1.75] text-ink-dim last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {profile.tags.map((tag) => (
          <span key={tag} className="chip text-[0.72rem] text-ink-dim">
            {tag}
          </span>
        ))}
      </div>
    </Panel>
  );
}
