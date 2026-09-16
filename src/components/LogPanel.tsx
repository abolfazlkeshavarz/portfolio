import type { ExperienceItem } from '../types';
import { Panel } from './Panel';
import { TiltCard } from './TiltCard';

export function LogPanel({ experience }: { experience: ExperienceItem[] }) {
  return (
    <Panel id="log" index="05" title="Experience & research" meta="reverse chronological">
      <div className="flex flex-col">
        {experience.map((item, i) => (
          <TiltCard
            key={item.id}
            max={4}
            lift={8}
            className={`grid gap-1 rounded-md px-2 py-3.5 sm:grid-cols-[10rem_1fr] sm:gap-5 ${
              i > 0 ? 'border-t border-dashed border-edge-soft' : ''
            }`}
          >
            <div className="pt-0.5 font-mono text-[0.7rem] text-ink-faint">{item.period}</div>
            <div className="depth-1">
              <h3 className="text-[0.95rem] font-semibold text-ink">{item.role}</h3>
              <p className="mt-0.5 font-mono text-[0.72rem] text-cool">{item.org}</p>
              <p className="mt-1.5 text-[0.86rem] leading-relaxed text-ink-dim">{item.description}</p>
            </div>
          </TiltCard>
        ))}
      </div>
    </Panel>
  );
}
