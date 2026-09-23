interface SegmentedControlProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export default function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div>
      <span className="mb-2 block text-sm text-ink-muted">{label}</span>
      <div className="flex border border-border-hairline">
        {options.map((opt, i) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={active}
              className={[
                'flex-1 px-3 py-2 text-sm transition-colors',
                i > 0 ? 'border-l border-border-hairline' : '',
                active
                  ? 'bg-accent text-accent-ink font-medium'
                  : 'bg-transparent text-ink-muted hover:text-ink',
              ].join(' ')}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
