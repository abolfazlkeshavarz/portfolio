import type { ReactNode } from 'react';

type PanelProps = {
  id?: string;
  index: string;
  title: string;
  meta?: ReactNode;
  children: ReactNode;
  /** Set when the panel supplies its own inner padding (split layouts). */
  bare?: boolean;
  className?: string;
};

export function Panel({ id, index, title, meta, children, bare = false, className = '' }: PanelProps) {
  return (
    <section id={id} className={`panel scroll-mt-20 ${className}`}>
      <header className="panel-head">
        <h2 className="label m-0">
          <span className="text-signal">{index}</span> · {title}
        </h2>
        {meta ? <div className="font-mono text-[0.7rem] text-ink-faint">{meta}</div> : null}
      </header>
      <div className={bare ? '' : 'p-5 sm:p-7'}>{children}</div>
    </section>
  );
}
