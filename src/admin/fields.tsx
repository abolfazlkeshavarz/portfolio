import { useId, useState, type ReactNode } from 'react';

const inputClass =
  'w-full rounded-md border border-rule bg-card px-3 py-2 text-[0.95rem] text-ink placeholder:text-ink-3/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20';

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.8rem] font-semibold text-ink-2">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[0.78rem] text-ink-3">{hint}</span> : null}
    </label>
  );
}

type TextProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
  type?: string;
};

export function TextField({ label, value, onChange, hint, placeholder, type = 'text' }: TextProps) {
  return (
    <Field label={label} hint={hint}>
      <input
        type={type}
        className={inputClass}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  hint,
  rows = 3,
}: Omit<TextProps, 'placeholder' | 'type'> & { rows?: number }) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        className={`${inputClass} resize-y leading-relaxed`}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <Field label={label}>
      <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 text-[0.9rem] text-ink-2">
      <input
        id={id}
        type="checkbox"
        className="size-4 accent-[#1e3a6e]"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}

export function SmallButton({
  children,
  onClick,
  tone = 'default',
  disabled,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border px-2.5 text-[0.82rem] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
        tone === 'danger'
          ? 'border-rule text-[#b42318] hover:border-[#b42318] hover:bg-[#fef3f2]'
          : 'border-rule text-ink-2 hover:border-accent hover:text-accent'
      }`}
    >
      {children}
    </button>
  );
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** A list of plain strings (paragraphs, bullets, coursework…). */
export function StringList({
  label,
  items,
  onChange,
  multiline = false,
  addLabel = 'Add',
  hint,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  multiline?: boolean;
  addLabel?: string;
  hint?: string;
}) {
  const update = (index: number, value: string) => onChange(items.map((item, i) => (i === index ? value : item)));
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-1.5 p-0 text-[0.8rem] font-semibold text-ink-2">{label}</legend>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            {multiline ? (
              <textarea
                aria-label={`${label} ${index + 1}`}
                className={`${inputClass} resize-y leading-relaxed`}
                rows={3}
                value={item}
                onChange={(event) => update(index, event.target.value)}
              />
            ) : (
              <input
                aria-label={`${label} ${index + 1}`}
                className={inputClass}
                value={item}
                onChange={(event) => update(index, event.target.value)}
              />
            )}
            <div className="flex shrink-0 gap-1">
              <SmallButton label="Move up" disabled={index === 0} onClick={() => onChange(move(items, index, index - 1))}>
                ↑
              </SmallButton>
              <SmallButton
                label="Move down"
                disabled={index === items.length - 1}
                onClick={() => onChange(move(items, index, index + 1))}
              >
                ↓
              </SmallButton>
              <SmallButton label="Remove" tone="danger" onClick={() => onChange(items.filter((_, i) => i !== index))}>
                ✕
              </SmallButton>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <SmallButton onClick={() => onChange([...items, ''])}>+ {addLabel}</SmallButton>
      </div>
      {hint ? <p className="mb-0 mt-1.5 text-[0.78rem] text-ink-3">{hint}</p> : null}
    </fieldset>
  );
}

/** Comma-separated tags (tech stacks, skill items). */
export function TagsField({
  label,
  items,
  onChange,
  hint = 'Separate with commas.',
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  hint?: string;
}) {
  // Keep the raw text locally so typing a trailing comma isn't swallowed.
  const [raw, setRaw] = useState(items.join(', '));
  return (
    <Field label={label} hint={hint}>
      <textarea
        className={`${inputClass} resize-y`}
        rows={2}
        value={raw}
        onChange={(event) => {
          setRaw(event.target.value);
          onChange(
            event.target.value
              .split(',')
              .map((part) => part.trim())
              .filter(Boolean),
          );
        }}
        onBlur={() => setRaw(items.join(', '))}
      />
    </Field>
  );
}

/** A reorderable list of structured items, each in its own collapsible card. */
export function Repeater<T extends { id?: string }>({
  items,
  onChange,
  title,
  create,
  render,
  addLabel,
  noun,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  title: (item: T, index: number) => string;
  create: () => T;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  addLabel: string;
  noun: string;
}) {
  const [open, setOpen] = useState<number | null>(items.length === 1 ? 0 : null);
  const patch = (index: number, change: Partial<T>) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...change } : item)));

  return (
    <div className="space-y-3">
      {items.length === 0 ? <p className="m-0 text-[0.9rem] text-ink-3">No {noun} yet.</p> : null}
      {items.map((item, index) => {
        const expanded = open === index;
        return (
          <section key={item.id ?? index} className="rounded-lg border border-rule bg-card">
            <div className="flex items-center gap-2 p-2.5 pl-4">
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : index)}
                className="min-w-0 flex-1 truncate bg-transparent py-1.5 text-left text-[0.95rem] font-semibold text-ink"
              >
                <span className="mr-2 inline-block w-3 text-ink-3" aria-hidden="true">
                  {expanded ? '▾' : '▸'}
                </span>
                {title(item, index) || `Untitled ${noun}`}
              </button>
              <div className="flex shrink-0 gap-1">
                <SmallButton
                  label="Move up"
                  disabled={index === 0}
                  onClick={() => {
                    onChange(move(items, index, index - 1));
                    if (expanded) setOpen(index - 1);
                  }}
                >
                  ↑
                </SmallButton>
                <SmallButton
                  label="Move down"
                  disabled={index === items.length - 1}
                  onClick={() => {
                    onChange(move(items, index, index + 1));
                    if (expanded) setOpen(index + 1);
                  }}
                >
                  ↓
                </SmallButton>
                <SmallButton
                  label={`Delete ${noun}`}
                  tone="danger"
                  onClick={() => {
                    if (window.confirm(`Delete this ${noun}?`)) {
                      onChange(items.filter((_, i) => i !== index));
                      setOpen(null);
                    }
                  }}
                >
                  ✕
                </SmallButton>
              </div>
            </div>
            {expanded ? (
              <div className="space-y-4 border-t border-rule-soft p-4">{render(item, (change) => patch(index, change), index)}</div>
            ) : null}
          </section>
        );
      })}
      <SmallButton
        onClick={() => {
          onChange([...items, create()]);
          setOpen(items.length);
        }}
      >
        + {addLabel}
      </SmallButton>
    </div>
  );
}

export const newId = () => Math.random().toString(36).slice(2, 10);
