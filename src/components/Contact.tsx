import type { Profile } from '../types';
import { Section } from './Section';

export function Contact({ profile }: { profile: Profile }) {
  return (
    <Section id="contact" title="Contact">
      <p className="m-0 max-w-[56ch] font-serif text-[1.3rem] leading-snug text-ink">
        I'm happy to talk about research, machine learning, or a system that needs building.
      </p>
      <ul className="mb-0 mt-6 list-none space-y-2.5 p-0 text-[1rem] [overflow-wrap:anywhere]">
        <li>
          <a className="link" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </li>
        {profile.phone ? (
          <li>
            <a className="link" href={`tel:${profile.phone.replace(/\s/g, '')}`}>
              {profile.phone}
            </a>
          </li>
        ) : null}
        <li>
          <a className="link" href={profile.github} target="_blank" rel="noopener noreferrer">
            {profile.github.replace('https://', '')}
          </a>
        </li>
        {profile.linkedin ? (
          <li>
            <a className="link" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              {profile.linkedin.replace('https://', '')}
            </a>
          </li>
        ) : null}
      </ul>
      <p className="mb-0 mt-5 text-[0.92rem] text-ink-3">
        Academic references are available on request.
      </p>
    </Section>
  );
}
