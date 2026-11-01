import type { Profile } from '../types';

export function Intro({ profile }: { profile: Profile }) {
  return (
    <header
      id="top"
      className="reveal grid items-center gap-7 pb-10 pt-8 md:grid-cols-[minmax(0,1fr)_300px] md:gap-14 md:pb-16 md:pt-20"
    >
      <figure className="m-0 md:order-last md:justify-self-end">
        <img
          src={profile.portrait}
          alt={`Portrait of ${profile.name}`}
          width={300}
          height={375}
          className="aspect-[4/5] w-[104px] rounded-lg border border-rule object-cover shadow-[0_14px_30px_-18px_rgb(15_23_42/0.5)] sm:w-[132px] md:w-[300px] md:rounded-sm"
        />
      </figure>

      <div>
        <p className="m-0 text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-accent md:text-[0.8rem] md:tracking-[0.14em]">
          {profile.role}
        </p>
        <h1 className="mb-0 mt-3 text-[clamp(2.1rem,8.5vw,3.6rem)] font-semibold md:mt-4">{profile.name}</h1>
        <p className="mb-0 mt-4 max-w-[34ch] font-serif text-[clamp(1.15rem,4.6vw,1.6rem)] leading-snug text-ink-2 md:mt-5">
          {profile.headline}
        </p>
        <p className="mb-0 mt-5 max-w-[58ch] text-[0.98rem] text-ink-2 md:mt-6 md:text-[1.02rem]">{profile.lede}</p>

        <div className="mt-7 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap md:mt-8">
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
    </header>
  );
}
