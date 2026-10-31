import contentData from './content/content.json';
import type { Content } from './types';
import { Nav } from './components/Nav';
import { Intro } from './components/Intro';
import { About } from './components/About';
import { Education } from './components/Education';
import { Research } from './components/Research';
import { Projects } from './components/Projects';
import { Experience } from './components/Experience';
import { Skills } from './components/Skills';
import { Contact } from './components/Contact';

const content = contentData as Content;

export function App() {
  const { profile, education, research, projects, experience, skills, certifications, languages } = content;

  return (
    <>
      <Nav name={profile.name} />
      <main className="mx-auto w-full max-w-[1040px] px-6">
        <Intro profile={profile} />
        <About profile={profile} />
        <Education education={education} />
        <Research research={research} />
        <Projects projects={projects} />
        <Experience experience={experience} />
        <Skills skills={skills} certifications={certifications} languages={languages} />
        <Contact profile={profile} />
      </main>

      <footer className="mx-auto max-w-[1040px] border-t border-rule px-6 pb-12 pt-7 text-[0.82rem] text-ink-3">
        © {new Date().getFullYear()} {profile.name}
      </footer>
    </>
  );
}
