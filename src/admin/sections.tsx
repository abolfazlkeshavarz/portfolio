import { useRef, useState } from 'react';
import type { Content, Degree, ExperienceItem, Project, ProjectKind, ResearchItem, SkillGroup } from '../types';
import { api, prepareImage } from './api';
import { Repeater, SelectField, SmallButton, StringList, TagsField, TextArea, TextField, Check, newId } from './fields';

type Props = { content: Content; set: (next: Content) => void };

const KINDS: readonly ProjectKind[] = ['Systems', 'Research', 'Embedded'];

function Group({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <section className="rounded-xl border border-rule bg-card p-5 shadow-[0_1px_2px_rgb(15_23_42/0.04)] sm:p-6">
      <h3 className="m-0 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-ink-3">{title}</h3>
      {note ? <p className="mb-0 mt-1.5 text-[0.85rem] text-ink-3">{note}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function PhotoField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const { url } = await api.upload(await prepareImage(file));
      onChange(url);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Upload failed');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div className="flex items-start gap-4">
      <img src={value} alt="Current portrait" className="aspect-[4/5] w-24 shrink-0 rounded-md border border-rule bg-paper-2 object-cover" />
      <div className="min-w-0">
        <p className="m-0 text-[0.8rem] font-semibold text-ink-2">Portrait</p>
        <p className="mb-2.5 mt-1 text-[0.8rem] text-ink-3">Portrait orientation (4:5) works best. It is resized for you.</p>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          id="portrait-file"
          onChange={(event) => void pick(event.target.files?.[0])}
        />
        <SmallButton onClick={() => input.current?.click()} disabled={busy}>
          {busy ? 'Uploading…' : 'Upload new photo'}
        </SmallButton>
        {error ? (
          <p role="alert" className="mb-0 mt-2 text-[0.82rem] text-[#b42318]">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function ProfileSection({ content, set }: Props) {
  const { profile } = content;
  const up = (patch: Partial<typeof profile>) => set({ ...content, profile: { ...profile, ...patch } });
  return (
    <>
      <Group title="Introduction">
        <TextField label="Name" value={profile.name} onChange={(name) => up({ name })} />
        <TextField label="Role line" value={profile.role} onChange={(role) => up({ role })} hint="Small caps text above your name." />
        <TextField label="Headline" value={profile.headline} onChange={(headline) => up({ headline })} />
        <TextArea label="Introduction" value={profile.lede} onChange={(lede) => up({ lede })} rows={4} />
        <TextField label="Location" value={profile.location} onChange={(location) => up({ location })} />
        <PhotoField value={profile.portrait} onChange={(portrait) => up({ portrait })} />
      </Group>

      <Group title="Contact and links" note="Leave a field empty to hide it on the site.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Email" type="email" value={profile.email} onChange={(email) => up({ email })} />
          <TextField label="Phone" value={profile.phone ?? ''} onChange={(phone) => up({ phone })} />
          <TextField label="GitHub URL" value={profile.github} onChange={(github) => up({ github })} />
          <TextField label="LinkedIn URL" value={profile.linkedin ?? ''} onChange={(linkedin) => up({ linkedin })} />
        </div>
        <TextField
          label="CV link"
          value={profile.cvUrl ?? ''}
          onChange={(cvUrl) => up({ cvUrl })}
          hint="A full address or a path such as /resume.pdf. Adds a “Curriculum vitae” button."
        />
      </Group>

      <Group title="About">
        <StringList
          label="Paragraphs"
          items={profile.aboutParagraphs}
          onChange={(aboutParagraphs) => up({ aboutParagraphs })}
          multiline
          addLabel="Add paragraph"
        />
        <StringList
          label="Research interests"
          items={profile.researchInterests}
          onChange={(researchInterests) => up({ researchInterests })}
          addLabel="Add interest"
        />
      </Group>
    </>
  );
}

export function EducationSection({ content, set }: Props) {
  return (
    <Repeater<Degree>
      items={content.education}
      onChange={(education) => set({ ...content, education })}
      noun="degree"
      addLabel="Add degree"
      title={(d) => d.degree}
      create={() => ({ id: newId(), degree: '', school: '', period: '', status: 'Completed' })}
      render={(d, up) => (
        <>
          <TextField label="Degree" value={d.degree} onChange={(degree) => up({ degree })} />
          <TextField label="University" value={d.school} onChange={(school) => up({ school })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Period" value={d.period} onChange={(period) => up({ period })} />
            <TextField label="Status" value={d.status} onChange={(status) => up({ status })} />
          </div>
          <Check
            label="Show a senior project"
            checked={Boolean(d.seniorProject)}
            onChange={(on) => up({ seniorProject: on ? { title: '', summary: '' } : undefined })}
          />
          {d.seniorProject ? (
            <>
              <TextField
                label="Senior project title"
                value={d.seniorProject.title}
                onChange={(title) => up({ seniorProject: { ...d.seniorProject!, title } })}
              />
              <TextArea
                label="Senior project summary"
                value={d.seniorProject.summary}
                onChange={(summary) => up({ seniorProject: { ...d.seniorProject!, summary } })}
              />
            </>
          ) : null}
          <StringList label="Highlights" items={d.notes ?? []} onChange={(notes) => up({ notes })} multiline addLabel="Add highlight" />
          <TagsField label="Relevant coursework" items={d.coursework ?? []} onChange={(coursework) => up({ coursework })} />
        </>
      )}
    />
  );
}

export function ResearchSection({ content, set }: Props) {
  return (
    <Repeater<ResearchItem>
      items={content.research}
      onChange={(research) => set({ ...content, research })}
      noun="research entry"
      addLabel="Add research entry"
      title={(r) => r.title}
      create={() => ({ id: newId(), title: '', org: '', period: '', bullets: [] })}
      render={(r, up) => (
        <>
          <TextField label="Title" value={r.title} onChange={(title) => up({ title })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Institution" value={r.org} onChange={(org) => up({ org })} />
            <TextField label="Period" value={r.period} onChange={(period) => up({ period })} />
          </div>
          <StringList label="What you did" items={r.bullets} onChange={(bullets) => up({ bullets })} multiline addLabel="Add point" />
        </>
      )}
    />
  );
}

export function ProjectsSection({ content, set }: Props) {
  return (
    <Repeater<Project>
      items={content.projects}
      onChange={(projects) => set({ ...content, projects })}
      noun="project"
      addLabel="Add project"
      title={(p) => `${p.title}${p.featured ? '  ★' : ''}`}
      create={() => ({ id: newId(), title: '', kind: 'Systems', context: '', summary: '', highlights: [], tech: [] })}
      render={(p, up) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Title" value={p.title} onChange={(title) => up({ title })} />
            <SelectField label="Category" value={p.kind} options={KINDS} onChange={(kind) => up({ kind })} />
            <TextField label="Subtitle" value={p.context} onChange={(context) => up({ context })} />
            <TextField label="Year or period" value={p.period ?? ''} onChange={(period) => up({ period })} />
          </div>
          <TextArea label="Summary" value={p.summary} onChange={(summary) => up({ summary })} rows={3} />
          <Check
            label="Featured — shown as a full card with the bullet points below"
            checked={Boolean(p.featured)}
            onChange={(featured) => up({ featured })}
          />
          {p.featured ? (
            <StringList label="Bullet points" items={p.highlights} onChange={(highlights) => up({ highlights })} multiline addLabel="Add point" />
          ) : null}
          <TagsField label="Technologies" items={p.tech} onChange={(tech) => up({ tech })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Live demo URL" value={p.demo ?? ''} onChange={(demo) => up({ demo })} />
            <TextField label="Source code URL" value={p.github ?? ''} onChange={(github) => up({ github })} />
          </div>
        </>
      )}
    />
  );
}

export function ExperienceSection({ content, set }: Props) {
  return (
    <Repeater<ExperienceItem>
      items={content.experience}
      onChange={(experience) => set({ ...content, experience })}
      noun="position"
      addLabel="Add position"
      title={(e) => `${e.role}${e.org ? ` — ${e.org}` : ''}`}
      create={() => ({ id: newId(), role: '', org: '', period: '', description: '' })}
      render={(e, up) => (
        <>
          <TextField label="Role" value={e.role} onChange={(role) => up({ role })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Organisation" value={e.org} onChange={(org) => up({ org })} />
            <TextField label="Period" value={e.period} onChange={(period) => up({ period })} />
          </div>
          <TextArea label="Description" value={e.description} onChange={(description) => up({ description })} />
        </>
      )}
    />
  );
}

export function SkillsSection({ content, set }: Props) {
  return (
    <div className="space-y-6">
      <Group title="Skill groups">
        <Repeater<SkillGroup>
          items={content.skills}
          onChange={(skills) => set({ ...content, skills })}
          noun="skill group"
          addLabel="Add skill group"
          title={(s) => s.category}
          create={() => ({ id: newId(), category: '', items: [] })}
          render={(s, up) => (
            <>
              <TextField label="Group name" value={s.category} onChange={(category) => up({ category })} />
              <TagsField label="Skills" items={s.items} onChange={(items) => up({ items })} />
            </>
          )}
        />
      </Group>

      <Group title="Certifications">
        <Repeater<{ id?: string; title: string; issuer: string; date: string }>
          items={content.certifications}
          onChange={(certifications) => set({ ...content, certifications })}
          noun="certification"
          addLabel="Add certification"
          title={(c) => c.title}
          create={() => ({ title: '', issuer: '', date: '' })}
          render={(c, up) => (
            <>
              <TextField label="Title" value={c.title} onChange={(title) => up({ title })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Issuer" value={c.issuer} onChange={(issuer) => up({ issuer })} />
                <TextField label="Date" value={c.date} onChange={(date) => up({ date })} />
              </div>
            </>
          )}
        />
      </Group>

      <Group title="Languages">
        <Repeater<{ id?: string; name: string; level: string }>
          items={content.languages}
          onChange={(languages) => set({ ...content, languages })}
          noun="language"
          addLabel="Add language"
          title={(l) => `${l.name}${l.level ? ` (${l.level})` : ''}`}
          create={() => ({ name: '', level: '' })}
          render={(l, up) => (
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Language" value={l.name} onChange={(name) => up({ name })} />
              <TextField label="Level" value={l.level} onChange={(level) => up({ level })} />
            </div>
          )}
        />
      </Group>
    </div>
  );
}
