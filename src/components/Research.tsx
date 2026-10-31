import type { ResearchItem } from '../types';
import { Section } from './Section';

export function Research({ research }: { research: ResearchItem[] }) {
  return (
    <Section id="research" title="Research">
      {research.map((item) => (
        <article key={item.id}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 className="m-0 text-[1.25rem] font-semibold">{item.title}</h3>
            <span className="text-[0.88rem] text-ink-3">{item.period}</span>
          </div>
          <p className="mb-0 mt-1.5 text-ink-2">{item.org}</p>
          <ul className="mb-0 mt-5 max-w-[64ch] list-disc space-y-2 pl-5 text-[0.97rem] text-ink-2 marker:text-ink-3">
            {item.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </article>
      ))}
    </Section>
  );
}
