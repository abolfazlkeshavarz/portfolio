import type { Degree } from '../types';
import { Section } from './Section';

function DegreeBlock({ degree }: { degree: Degree }) {
  return (
    <article className="border-b border-rule-soft pb-10 last:border-b-0 last:pb-0 [&:not(:first-child)]:pt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="m-0 text-[1.35rem] font-semibold">{degree.degree}</h3>
        <span className="text-[0.88rem] text-ink-3">{degree.period}</span>
      </div>
      <p className="mb-0 mt-1.5 text-ink-2">
        {degree.school} <span className="text-ink-3">· {degree.status}</span>
      </p>

      {degree.seniorProject ? (
        <div className="mt-6 border-l-2 border-accent pl-5">
          <p className="m-0 text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-ink-3">
            Senior project
          </p>
          <p className="mb-0 mt-1.5 font-serif text-[1.1rem] font-semibold">{degree.seniorProject.title}</p>
          <p className="mb-0 mt-1.5 max-w-[60ch] text-[0.97rem] text-ink-2">{degree.seniorProject.summary}</p>
        </div>
      ) : null}

      {degree.notes && degree.notes.length > 0 ? (
        <ul className="mb-0 mt-6 max-w-[64ch] list-disc space-y-1.5 pl-5 text-[0.97rem] text-ink-2 marker:text-ink-3">
          {degree.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}

      {degree.coursework ? (
        <>
          <p className="mb-2.5 mt-7 text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-ink-3">
            Relevant coursework
          </p>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {degree.coursework.map((course) => (
              <li key={course} className="tag">
                {course}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </article>
  );
}

export function Education({ education }: { education: Degree[] }) {
  return (
    <Section id="education" title="Education">
      {education.map((degree) => (
        <DegreeBlock key={degree.id} degree={degree} />
      ))}
    </Section>
  );
}
