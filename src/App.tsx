import contentData from './content/content.json';
import type { Content } from './types';
import { TopBar } from './components/TopBar';
import { Hero } from './components/Hero';
import { ProfilePanel } from './components/ProfilePanel';
import { StackPanel } from './components/StackPanel';
import { FeaturedSystem } from './components/FeaturedSystem';
import { SystemsGrid } from './components/SystemsGrid';
import { LogPanel } from './components/LogPanel';
import { EducationPanel } from './components/EducationPanel';
import { ContactPanel } from './components/ContactPanel';

const content = contentData as Content;

export function App() {
  const { profile, skills, projects, featuredTelemetry, experience, education } = content;
  const featured = projects.find((project) => project.featured);
  const rest = projects.filter((project) => !project.featured);

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20 opacity-60 [background-image:linear-gradient(var(--color-edge-soft)_1px,transparent_1px),linear-gradient(90deg,var(--color-edge-soft)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:radial-gradient(ellipse_900px_500px_at_50%_0%,#000_0%,transparent_75%)]"
      />

      <TopBar name={profile.name} location={profile.location} />

      <main className="mx-auto w-full max-w-[1080px] space-y-6 px-6 pb-20">
        <Hero profile={profile} />
        <ProfilePanel profile={profile} />
        <StackPanel skills={skills} />
        {featured ? <FeaturedSystem project={featured} telemetry={featuredTelemetry} /> : null}
        <SystemsGrid projects={rest} />
        <LogPanel experience={experience} />
        <EducationPanel education={education} />
        <ContactPanel profile={profile} />
      </main>

      <footer className="mx-auto max-w-[1080px] border-t border-edge-soft px-6 pb-12 pt-7 font-mono text-[0.7rem] text-ink-faint">
        © {new Date().getFullYear()} {profile.name}
      </footer>
    </>
  );
}
