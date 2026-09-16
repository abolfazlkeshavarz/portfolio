import type { SkillLayer } from '../types';
import { Panel } from './Panel';
import { TiltCard } from './TiltCard';

export function StackPanel({ skills }: { skills: SkillLayer[] }) {
  return (
    <Panel id="stack" index="02" title="Stack" meta="interface → hardware">
      <div className="flex flex-col">
        {skills.map((layer, i) => (
          <TiltCard
            key={layer.id}
            max={4}
            lift={8}
            className={`flex flex-col gap-3 rounded-md px-2 py-3.5 sm:flex-row sm:gap-5 ${
              i > 0 ? 'border-t border-dashed border-edge-soft' : ''
            }`}
          >
            <div className="shrink-0 pt-1 font-mono text-[0.68rem] uppercase tracking-wider text-cool sm:w-36 sm:text-right">
              {layer.category}
            </div>
            <div className="depth-1 flex flex-1 flex-wrap gap-2">
              {layer.chips.map((chip) => (
                <span key={chip} className="chip">
                  {chip}
                </span>
              ))}
            </div>
          </TiltCard>
        ))}
      </div>
    </Panel>
  );
}
