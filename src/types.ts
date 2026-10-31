export type Profile = {
  name: string;
  role: string;
  headline: string;
  lede: string;
  /** Short city label shown under the name. */
  location: string;
  email: string;
  github: string;
  linkedin?: string;
  cvUrl?: string;
  /** 4:5 portrait shown beside the introduction. */
  portrait: string;
  aboutParagraphs: string[];
  researchInterests: string[];
};

export type SkillGroup = {
  id: string;
  category: string;
  items: string[];
};

export type ProjectKind = 'Systems' | 'Research' | 'Embedded';

export type Project = {
  id: string;
  title: string;
  kind: ProjectKind;
  context: string;
  period?: string;
  summary: string;
  highlights: string[];
  tech: string[];
  github?: string;
  demo?: string;
  /** Featured projects get the full write-up; the rest render as compact rows. */
  featured?: boolean;
};

export type ResearchItem = {
  id: string;
  title: string;
  org: string;
  period: string;
  bullets: string[];
};

export type ExperienceItem = {
  id: string;
  role: string;
  org: string;
  period: string;
  description: string;
};

export type Degree = {
  id: string;
  degree: string;
  school: string;
  period: string;
  status: string;
  seniorProject?: { title: string; summary: string };
  coursework?: string[];
  notes?: string[];
};

export type Certification = {
  title: string;
  issuer: string;
  date: string;
};

export type Content = {
  profile: Profile;
  education: Degree[];
  research: ResearchItem[];
  projects: Project[];
  experience: ExperienceItem[];
  skills: SkillGroup[];
  certifications: Certification[];
  languages: { name: string; level: string }[];
};
