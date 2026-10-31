import type { Profile } from '../types';

export function Intro({ profile }: { profile: Profile }) {
  return (
    <header id="top" className="reveal grid items-center gap-10 pb-16 pt-14 md:grid-cols-[minmax(0,1fr)_300px] md:gap-14 md:pt-20">
      <div>
        <p className="m-0 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-accent">
          {profile.role}
        </p>
        <h1 className="mb-0 mt-4 text-[clamp(2.3rem,5vw,3.6rem)] font-semibold">{profile.name}</h1>
        <p className="mb-0 mt-5 max-w-[34ch] font-serif text-[clamp(1.25rem,2.3vw,1.6rem)] leading-snug text-ink-2">
          {profile.headline}
        </p>
        <p className="mb-0 mt-6 max-w-[58ch] text-[1.02rem] text-ink-2">{profile.lede}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a className="btn btn-primary" href={`mailto:${profile.email}`}>
            Email me
          </a>
          <a className="btn" href={profile.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          {profile.linkedin ? (
            <a className="btn" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          ) : null}
          {profile.cvUrl ? (
            <a className="btn" href={profile.cvUrl}>
              Curriculum vitae
            </a>
          ) : null}
        </div>
        <p className="mb-0 mt-5 text-[0.88rem] text-ink-3">{profile.location}</p>
      </div>

      <figure className="m-0 justify-self-start md:justify-self-end">
        <img
          src={profile.portrait}
          alt={`Portrait of ${profile.name}`}
          width={300}
          height={375}
          className="aspect-[4/5] w-[min(300px,70vw)] rounded-sm border border-rule object-cover shadow-[0_18px_40px_-24px_rgb(28_32_38/0.45)]"
        />
      </figure>
    </header>
  );
}
