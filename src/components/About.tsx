import type { Profile } from '../types';
import { Section } from './Section';

export function About({ profile }: { profile: Profile }) {
  return (
    <Section id="about" title="About">
      <div className="max-w-[64ch] space-y-5 text-[1.03rem] text-ink-2">
        {profile.aboutParagraphs.map((paragraph) => (
          <p key={paragraph} className="m-0">
            {paragraph}
          </p>
        ))}
      </div>

      <h3 className="mb-3 mt-10 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-ink-3">
        Research interests
      </h3>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {profile.researchInterests.map((interest) => (
          <li key={interest} className="tag">
            {interest}
          </li>
        ))}
      </ul>
    </Section>
  );
}
