import type { Project, TelemetryField } from '../types';
import { Panel } from './Panel';
import { TiltCard } from './TiltCard';

function RouteTrace() {
  return (
    <svg
      viewBox="0 0 300 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Sample GPS route with the current position marked"
      className="mb-4 w-full"
    >
      <path
        d="M8 70 C 50 20, 90 78, 130 40 S 210 12, 240 46 S 275 30, 292 18"
        stroke="#5fd0c4"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx="8" cy="70" r="3" fill="#3a4453" />
      <circle cx="292" cy="18" r="5" fill="#0e131b" stroke="#ffb454" strokeWidth="2" />
      <circle cx="292" cy="18" r="9" fill="none" stroke="#ffb454" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

type Props = {
  project: Project;
  telemetry: TelemetryField[];
};

export function FeaturedSystem({ project, telemetry }: Props) {
  return (
    <Panel
      id="radgard"
      index="03"
      title={`Featured system — ${project.title}`}
      meta={
        project.github ? (
          <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-cool hover:underline">
            {project.github.replace('https://github.com/', 'github.com/')}
          </a>
        ) : null
      }
      bare
    >
      <div className="grid lg:grid-cols-[1.15fr_1fr]">
        <div className="border-b border-edge p-5 sm:p-7 lg:border-b-0 lg:border-r">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-signal">{project.tagline}</p>
          <p className="mt-3.5 text-[0.97rem] leading-relaxed text-ink-dim">{project.description}</p>

          <dl className="mt-5 space-y-4">
            {project.detailFields?.map((field) => (
              <div key={field.k}>
                <dt className="font-mono text-[0.68rem] uppercase tracking-wider text-ink-faint">{field.k}</dt>
                <dd className="mt-1 text-[0.92rem] leading-relaxed text-ink">{field.v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-good/40 bg-good/8 px-2.5 py-1 font-mono text-[0.68rem] text-good">
            <span className="size-[7px] rounded-full bg-good animate-pulse-dot" />
            {project.status}
          </p>
        </div>

        <TiltCard max={7} lift={14} sceneClassName="bg-surface-3" className="h-full rounded-md p-5 sm:p-6">
          <div className="mb-3.5 flex justify-between font-mono text-[0.65rem] uppercase tracking-wider text-ink-faint">
            <span>Sample telemetry frame</span>
            <span className="font-semibold text-crit">· illustrative</span>
          </div>

          <div className="depth-1">
            <RouteTrace />
          </div>

          <dl className="depth-2 grid grid-cols-2 gap-x-5 gap-y-3.5">
            {telemetry.map((field) => (
              <div key={field.k}>
                <dt className="font-mono text-[0.65rem] uppercase tracking-wide text-ink-faint">{field.k}</dt>
                <dd
                  className={`mt-0.5 font-mono text-[0.95rem] font-medium tabular-nums ${
                    field.tone === 'good' ? 'text-good' : 'text-cool'
                  }`}
                >
                  {field.v}
                  {field.unit ? <span className="ml-1 text-[0.7rem] font-normal text-ink-faint">{field.unit}</span> : null}
                </dd>
              </div>
            ))}
          </dl>
        </TiltCard>
      </div>
    </Panel>
  );
}
