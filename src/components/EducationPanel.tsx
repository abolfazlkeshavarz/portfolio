import type { EducationItem } from '../types';
import { Panel } from './Panel';
import { TiltCard } from './TiltCard';

export function EducationPanel({ education }: { education: EducationItem[] }) {
  return (
    <Panel index="06" title="Education" meta="completed + planned">
      <div className="grid gap-4 md:grid-cols-2">
        {education.map((item) => (
          <TiltCard key={item.id} max={8} lift={14} sceneClassName="h-full" className="panel h-full rounded-md bg-surface-3 p-5">
            <div className="depth-1">
              <p className="font-mono text-[0.65rem] uppercase tracking-wider text-signal">{item.badge}</p>
              <h3 className="mt-2 text-[1.02rem] font-semibold text-white">{item.degree}</h3>
              <p className="mt-0.5 text-[0.86rem] text-ink-dim">{item.school}</p>

              <div className="mt-4 flex flex-wrap gap-5">
                {item.metrics.map((metric) => (
                  <div key={metric.label}>
                    <div className="font-mono text-[1.02rem] tabular-nums text-cool">{metric.value}</div>
                    <div className="mt-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-ink-faint">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TiltCard>
        ))}
      </div>
    </Panel>
  );
}
