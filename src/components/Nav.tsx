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
      className="sticky top-0 z-30 border-b border-rule bg-paper/90 backdrop-blur"
    >
      <div className="mx-auto flex max-w-[1040px] items-center justify-between gap-6 px-5 pb-1 pt-3 sm:px-6 md:py-3.5">
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
      <ul className="m-0 flex list-none gap-1 overflow-x-auto px-3 pb-2 pt-1 text-[0.84rem] [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        {links.map(([id, label]) => (
          <li key={id} className="shrink-0">
            <a href={`#${id}`} className="block rounded-full px-3 py-1.5 text-ink-2 no-underline active:bg-accent-soft">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
