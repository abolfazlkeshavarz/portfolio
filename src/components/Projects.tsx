import type { Project } from '../types';
import { Section } from './Section';

function Links({ project }: { project: Project }) {
  if (!project.github && !project.demo) return null;
  return (
    <span className="flex gap-4 text-[0.88rem]">
      {project.demo ? (
        <a className="link" href={project.demo} target="_blank" rel="noopener noreferrer">
          Live demo
        </a>
      ) : null}
      {project.github ? (
        <a className="link" href={project.github} target="_blank" rel="noopener noreferrer">
          Source
        </a>
      ) : null}
    </span>
  );
}

function Featured({ project }: { project: Project }) {
  return (
    <article className="border-b border-rule-soft py-9 first:pt-0 last:border-b-0">
      <p className="m-0 text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-mark">
        {project.kind}
        {project.period ? <span className="text-ink-3"> · {project.period}</span> : null}
      </p>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="m-0 text-[1.45rem] font-semibold">{project.title}</h3>
        <Links project={project} />
      </div>
      <p className="mb-0 mt-1 text-ink-3">{project.context}</p>
      <p className="mb-0 mt-4 max-w-[64ch] text-[1.02rem] text-ink-2">{project.summary}</p>
      <ul className="mb-0 mt-4 max-w-[64ch] list-disc space-y-1.5 pl-5 text-[0.95rem] text-ink-2 marker:text-ink-3">
        {project.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
      <ul className="m-0 mt-5 flex list-none flex-wrap gap-2 p-0">
        {project.tech.map((tech) => (
          <li key={tech} className="tag">
            {tech}
          </li>
        ))}
      </ul>
    </article>
  );
}

function Row({ project }: { project: Project }) {
  return (
    <article className="grid gap-x-8 gap-y-1 border-t border-rule-soft py-5 first:border-t-0 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div>
        <h4 className="m-0 font-serif text-[1.08rem] font-semibold">{project.title}</h4>
        <p className="mb-0 mt-0.5 text-[0.86rem] text-ink-3">
          {project.context}
          {project.period ? ` · ${project.period}` : ''}
        </p>
        <p className="mb-0 mt-2 max-w-[64ch] text-[0.94rem] text-ink-2">{project.summary}</p>
        <p className="mb-0 mt-2 font-mono text-[0.76rem] text-ink-3">{project.tech.join(' · ')}</p>
      </div>
      <div className="sm:pt-1">
        <Links project={project} />
      </div>
    </article>
  );
}

export function Projects({ projects }: { projects: Project[] }) {
  const featured = projects.filter((project) => project.featured);
  const more = projects.filter((project) => !project.featured);

  return (
    <Section id="projects" title="Selected projects">
      {featured.map((project) => (
        <Featured key={project.id} project={project} />
      ))}

      <h3 className="mb-2 mt-10 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-ink-3">
        Further work
      </h3>
      <div>
        {more.map((project) => (
          <Row key={project.id} project={project} />
        ))}
      </div>
    </Section>
  );
}
