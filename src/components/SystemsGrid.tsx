import type { Project } from '../types';
import { Panel } from './Panel';
import { TiltCard } from './TiltCard';

const TONE_COLOR: Record<Project['statusTone'], string> = {
  live: 'bg-good',
  wip: 'bg-signal',
  done: 'bg-ink-faint',
};

function SystemCard({ project }: { project: Project }) {
  return (
    <TiltCard max={9} lift={18} sceneClassName="h-full" className="panel h-full rounded-md bg-surface-3 p-5">
      <div className="flex h-full flex-col gap-2.5">
        <div className="depth-1 flex items-start justify-between gap-3">
          <h3 className="font-mono text-[0.98rem] text-white">{project.title}</h3>
          {project.github ? (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} on GitHub`}
              className="shrink-0 text-ink-faint transition-colors hover:text-signal"
            >
              <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden="true">
                <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.19c0 .21.15.46.55.38A8 8 0 0 0 8 0Z" />
              </svg>
            </a>
          ) : null}
        </div>

        <p className="font-mono text-[0.7rem] text-cool">{project.tagline}</p>
        <p className="flex-1 text-[0.86rem] leading-relaxed text-ink-dim">{project.description}</p>

        <div className="depth-1 flex flex-wrap gap-1.5">
          {project.tech.map((tech) => (
            <span key={tech} className="rounded-sm border border-edge px-1.5 py-0.5 font-mono text-[0.64rem] text-ink-faint">
              {tech}
            </span>
          ))}
        </div>

        <p className="flex items-center gap-1.5 font-mono text-[0.65rem] text-ink-faint">
          <span className={`size-[6px] rounded-full ${TONE_COLOR[project.statusTone]}`} />
          {project.status}
        </p>
      </div>
    </TiltCard>
  );
}

export function SystemsGrid({ projects }: { projects: Project[] }) {
  return (
    <Panel id="systems" index="04" title="Other systems" meta={`${projects.length} projects`}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <SystemCard key={project.id} project={project} />
        ))}
      </div>
    </Panel>
  );
}
