const links = [
  ['about', 'About'],
  ['education', 'Education'],
  ['research', 'Research'],
  ['projects', 'Projects'],
  ['experience', 'Experience'],
  ['skills', 'Skills'],
  ['contact', 'Contact'],
] as const;

export function Nav({ name }: { name: string }) {
  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-30 border-b border-rule-soft bg-paper/85 backdrop-blur"
    >
      <div className="mx-auto flex max-w-[1040px] items-center justify-between gap-6 px-6 py-3.5">
        <a href="#top" className="font-serif text-[1.02rem] font-semibold text-ink no-underline">
          {name}
        </a>
        <ul className="m-0 hidden list-none gap-6 p-0 text-[0.86rem] text-ink-2 md:flex">
          {links.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="no-underline transition-colors hover:text-accent">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
