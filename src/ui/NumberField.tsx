interface NumberFieldProps {
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
  step?: string;
}

export default function NumberField({
  label,
  unit,
  value,
  onChange,
  errorMessage,
  step = 'any',
}: NumberFieldProps) {
  const hasError = Boolean(errorMessage);
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between text-sm text-ink-muted">
        <span>{label}</span>
        <span className="font-mono text-xs">{unit}</span>
      </span>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={hasError}
        className={[
          'w-full rounded-field border bg-surface px-3 py-2 font-mono text-ink',
          'focus:outline-none focus:ring-1 focus:ring-accent',
          hasError ? 'border-error' : 'border-border-hairline',
        ].join(' ')}
      />
      {hasError && <p className="mt-1 text-sm text-error">{errorMessage}</p>}
    </label>
  );
}
