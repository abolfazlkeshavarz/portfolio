// Structural check on content submitted from the control panel. It exists to
// stop a broken save from taking the public site down, and to keep unsafe
// URL schemes (javascript:) out of the links the page renders.
const ARRAYS = ['education', 'research', 'projects', 'experience', 'skills', 'certifications', 'languages'];
const URL_KEYS = new Set(['github', 'demo', 'linkedin', 'cvUrl', 'portrait']);
const KINDS = new Set(['Systems', 'Research', 'Embedded']);
const SAFE_URL = /^(https?:\/\/|\/(?!\/)|mailto:|tel:)/i;

function walk(value, trail, problems) {
  if (Array.isArray(value)) {
    value.forEach((item, i) => walk(item, `${trail}[${i}]`, problems));
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (URL_KEYS.has(key) && typeof child === 'string' && child !== '' && !SAFE_URL.test(child)) {
        problems.push(`${trail}.${key} must start with https://, http:// or /`);
      }
      walk(child, `${trail}.${key}`, problems);
    }
  } else if (typeof value === 'string' && value.length > 5000) {
    problems.push(`${trail} is too long`);
  }
}

export function validateContent(content) {
  if (!content || typeof content !== 'object' || Array.isArray(content)) return 'Content must be an object';
  const { profile } = content;
  if (!profile || typeof profile !== 'object') return 'Missing profile';
  for (const key of ['name', 'role', 'headline', 'lede', 'location', 'email', 'github', 'portrait']) {
    if (typeof profile[key] !== 'string') return `profile.${key} must be text`;
  }
  if (!profile.name.trim()) return 'Your name cannot be empty';
  if (!Array.isArray(profile.aboutParagraphs) || !Array.isArray(profile.researchInterests)) {
    return 'profile.aboutParagraphs and profile.researchInterests must be lists';
  }
  for (const key of ARRAYS) {
    if (!Array.isArray(content[key])) return `${key} must be a list`;
  }
  for (const project of content.projects) {
    if (!project || typeof project.title !== 'string' || !project.title.trim()) return 'Every project needs a title';
    if (!KINDS.has(project.kind)) return `Project "${project.title}" has an unknown kind`;
    if (!Array.isArray(project.highlights) || !Array.isArray(project.tech)) return `Project "${project.title}" is malformed`;
  }
  for (const key of ['education', 'research', 'experience', 'skills']) {
    for (const item of content[key]) {
      if (!item || typeof item !== 'object' || typeof item.id !== 'string') return `An item in ${key} is missing its id`;
    }
  }

  const problems = [];
  walk(content, 'content', problems);
  return problems[0] ?? null;
}
