import type { Project } from '../types';
import { Section } from './Section';

function Links({ project }: { project: Project }) {
  if (!project.github && !project.demo) return null;
  return (
    <span className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.88rem]">
      {project.demo ? (
        <a
          className="inline-flex items-center gap-1 rounded-md bg-accent px-3 py-1.5 font-medium text-white no-underline transition-colors hover:bg-[#15305c]"
          href={project.demo}
          target="_blank"
          rel="noopener noreferrer"
        >
          Live demo <span aria-hidden="true">↗</span>
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
    <article className="card p-5 sm:p-7">
      <p className="m-0 text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-mark">
        {project.kind}
        {project.period ? <span className="text-ink-3"> · {project.period}</span> : null}
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
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
      <div className="grid gap-5">
        {featured.map((project) => (
          <Featured key={project.id} project={project} />
        ))}
      </div>

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
