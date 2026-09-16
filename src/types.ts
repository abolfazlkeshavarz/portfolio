export type Stat = {
  value: string;
  unit?: string;
  label: string;
};

export type Profile = {
  name: string;
  role: string;
  eyebrow: string;
  headline: string;
  /** Substring of `headline` rendered in the signal colour. */
  accent: string;
  lede: string;
  terminalCmd: string;
  location: string;
  stats: Stat[];
  email: string;
  github: string;
  linkedin?: string;
  cvUrl?: string;
  /** 4:5 portrait for the hero card. */
  portrait: string;
  aboutParagraphs: string[];
  tags: string[];
};

export type SkillLayer = {
  id: string;
  category: string;
  chips: string[];
};

export type DetailField = {
  k: string;
  v: string;
};

export type Project = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  tech: string[];
  status: string;
  statusTone: 'live' | 'done' | 'wip';
  github?: string;
  featured?: boolean;
  detailFields?: DetailField[];
};

export type TelemetryField = {
  k: string;
  v: string;
  unit?: string;
  tone?: 'good' | 'default';
};

export type ExperienceItem = {
  id: string;
  role: string;
  org: string;
  period: string;
  description: string;
};

export type EducationItem = {
  id: string;
  badge: string;
  degree: string;
  school: string;
  metrics: { value: string; label: string }[];
};

export type Content = {
  profile: Profile;
  skills: SkillLayer[];
  projects: Project[];
  featuredTelemetry: TelemetryField[];
  experience: ExperienceItem[];
  education: EducationItem[];
};
