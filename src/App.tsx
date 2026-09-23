import { useState } from 'react';
import Panel from './ui/Panel';
import SegmentedControl from './ui/SegmentedControl';
import NumberField from './ui/NumberField';
import ResultsPanel from './ui/ResultsPanel';
import { useEstimate } from './ui/useEstimate';
import { initialFormState, type FormState, type GeometryKind, type UnitSystem } from './ui/formState';
import type { CalculationErrorCode } from './domain/types';

// Maps a domain error's field name (which varies by geometry and unit
// system -- lengthFt, lengthM, diameterInches, diameterCm all mean the
// same UI slot) to the one input that should show it. Keeps the mapping
// in one place instead of scattering geometry-specific logic through JSX.
const FIELD_MAP: Record<string, 'quantity' | 'primary' | 'width' | 'depth' | 'wastage'> = {
  quantity: 'quantity',
  lengthFt: 'primary',
  lengthM: 'primary',
  diameterInches: 'primary',
  diameterCm: 'primary',
  widthFt: 'width',
  widthM: 'width',
  depthInches: 'depth',
  depthCm: 'depth',
  depthFt: 'depth',
  depthM: 'depth',
  depthMm: 'depth',
  wastagePercent: 'wastage',
};

const ERROR_TEXT: Record<CalculationErrorCode, string> = {
  INVALID_DIMENSION_NEGATIVE: 'Cannot be negative.',
  INVALID_DIMENSION_NAN: 'Enter a number.',
  INVALID_QUANTITY_NON_INTEGER: 'Must be a whole number.',
  INVALID_QUANTITY_NEGATIVE: 'Cannot be negative.',
  INVALID_WASTAGE_RANGE: 'Enter a value from 0 to 100.',
};

const GEOMETRY_OPTIONS: { value: GeometryKind; label: string }[] = [
  { value: 'slab', label: 'Slab' },
  { value: 'rectangularFooting', label: 'Rectangular footing' },
  { value: 'cylindricalFooting', label: 'Cylindrical footing' },
];

const UNIT_OPTIONS: { value: UnitSystem; label: string }[] = [
  { value: 'imperial', label: 'Imperial' },
  { value: 'metric', label: 'Metric' },
];

// Depth's own unit label genuinely differs by geometry and system --
// slab uses inches/cm, cylindrical uses feet/metres, rectangular footing
// uses inches/millimetres. This is a frozen quirk of the verified engine
// (see the Freeze Notice), not a UI bug -- the labels below reflect it
// precisely rather than paper over it.
function depthUnit(geometry: GeometryKind, system: UnitSystem): string {
  if (system === 'imperial') {
    return geometry === 'cylindricalFooting' ? 'ft' : 'in';
  }
  if (geometry === 'slab') return 'cm';
  if (geometry === 'cylindricalFooting') return 'm';
  return 'mm';
}

function primaryLabel(geometry: GeometryKind): string {
  return geometry === 'cylindricalFooting' ? 'Diameter' : 'Length';
}

export default function App() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const estimate = useEstimate(form);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const fieldError =
    estimate.status === 'error' ? FIELD_MAP[estimate.error.field] : undefined;
  const fieldErrorText =
    estimate.status === 'error' ? ERROR_TEXT[estimate.error.code] : undefined;

  const errorFor = (slot: string) =>
    fieldError === slot ? fieldErrorText : undefined;

  const lengthUnit = form.system === 'imperial' ? 'ft' : 'm';
  const diameterUnit = form.system === 'imperial' ? 'in' : 'cm';

  return (
    <div className="min-h-screen font-sans">
      <header className="border-b border-border-hairline px-6 py-4">
        <h1 className="text-lg font-medium">Concrete Slab &amp; Footing Estimator</h1>
        <p className="text-sm text-ink-muted">
          concrete.headsup-consulting.com -- runs entirely in your browser, no data leaves
          this page
        </p>
      </header>

      <main className="mx-auto grid max-w-4xl grid-cols-1 gap-6 p-6 md:grid-cols-2">
        <Panel title="Job details">
          <div className="space-y-5">
            <SegmentedControl
              label="Shape"
              options={GEOMETRY_OPTIONS}
              value={form.geometry}
              onChange={(v) => set('geometry', v)}
            />
            <SegmentedControl
              label="Units"
              options={UNIT_OPTIONS}
              value={form.system}
              onChange={(v) => set('system', v)}
            />

            {form.geometry !== 'slab' && (
              <NumberField
                label="Quantity"
                unit="count"
                value={form.quantity}
                onChange={(v) => set('quantity', v)}
                errorMessage={errorFor('quantity')}
                step="1"
              />
            )}

            <NumberField
              label={primaryLabel(form.geometry)}
              unit={form.geometry === 'cylindricalFooting' ? diameterUnit : lengthUnit}
              value={form.lengthOrDiameter}
              onChange={(v) => set('lengthOrDiameter', v)}
              errorMessage={errorFor('primary')}
            />

            {form.geometry !== 'cylindricalFooting' && (
              <NumberField
                label="Width"
                unit={lengthUnit}
                value={form.width}
                onChange={(v) => set('width', v)}
                errorMessage={errorFor('width')}
              />
            )}

            <NumberField
              label="Depth"
              unit={depthUnit(form.geometry, form.system)}
              value={form.depth}
              onChange={(v) => set('depth', v)}
              errorMessage={errorFor('depth')}
            />

            <NumberField
              label="Wastage"
              unit="%"
              value={form.wastagePercent}
              onChange={(v) => set('wastagePercent', v)}
              errorMessage={errorFor('wastage')}
              step="1"
            />
          </div>
        </Panel>

        <Panel title="Estimate">
          {estimate.status === 'incomplete' && (
            <p className="text-sm text-ink-muted">
              Enter the job dimensions to see bags needed.
            </p>
          )}
          {estimate.status === 'error' && (
            <p className="text-sm text-ink-muted">Check the highlighted field.</p>
          )}
          {estimate.status === 'ready' && (
            <ResultsPanel data={estimate.data} system={form.system} />
          )}
        </Panel>
      </main>
    </div>
  );
}
