import type { Certification, SkillGroup } from '../types';
import { Section } from './Section';

type SkillsProps = {
  skills: SkillGroup[];
  certifications: Certification[];
  languages: { name: string; level: string }[];
};

export function Skills({ skills, certifications, languages }: SkillsProps) {
  return (
    <Section id="skills" title="Skills & certificates">
      <dl className="m-0 grid gap-x-8 gap-y-4 sm:grid-cols-[190px_minmax(0,1fr)]">
        {skills.map((group) => (
          <div key={group.id} className="contents">
            <dt className="text-[0.9rem] font-semibold text-ink">{group.category}</dt>
            <dd className="m-0 mb-3 text-[0.95rem] text-ink-2 sm:mb-0">{group.items.join(' · ')}</dd>
          </div>
        ))}
        <div className="contents">
          <dt className="text-[0.9rem] font-semibold text-ink">Languages</dt>
          <dd className="m-0 text-[0.95rem] text-ink-2">
            {languages.map((language) => `${language.name} (${language.level})`).join(' · ')}
          </dd>
        </div>
      </dl>

      <h3 className="mb-3 mt-12 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-ink-3">
        Certifications
      </h3>
      <ul className="m-0 list-none p-0">
        {certifications.map((cert) => (
          <li
            key={cert.title}
            className="flex flex-wrap items-baseline justify-between gap-x-6 border-t border-rule-soft py-2.5 text-[0.95rem] first:border-t-0"
          >
            <span className="text-ink">
              {cert.title} <span className="text-ink-3">· {cert.issuer}</span>
            </span>
            <span className="text-[0.86rem] text-ink-3">{cert.date}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
