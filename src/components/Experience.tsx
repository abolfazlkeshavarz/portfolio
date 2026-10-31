import type { ExperienceItem } from '../types';
import { Section } from './Section';

export function Experience({ experience }: { experience: ExperienceItem[] }) {
  return (
    <Section id="experience" title="Teaching & experience">
      <ol className="m-0 list-none p-0">
        {experience.map((item) => (
          <li
            key={item.id}
            className="grid gap-x-8 gap-y-1 border-t border-rule-soft py-5 first:border-t-0 first:pt-0 sm:grid-cols-[minmax(0,1fr)_150px]"
          >
            <div>
              <h3 className="m-0 font-serif text-[1.1rem] font-semibold">{item.role}</h3>
              <p className="mb-0 mt-0.5 text-[0.92rem] text-ink-3">{item.org}</p>
              <p className="mb-0 mt-2 max-w-[60ch] text-[0.95rem] text-ink-2">{item.description}</p>
            </div>
            <p className="m-0 text-[0.86rem] text-ink-3 sm:text-right">{item.period}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
