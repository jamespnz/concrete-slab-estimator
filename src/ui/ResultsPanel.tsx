import type { VolumeOutput } from '../domain/types';
import type { UnitSystem } from './formState';
import { formatVolume } from '../lib/format';
import BagTable from './BagTable';

interface ReadoutProps {
  label: string;
  value: string;
  unit: string;
}

function Readout({ label, value, unit }: ReadoutProps) {
  return (
    <div>
      <div className="text-sm text-ink-muted">{label}</div>
      <div className="font-mono text-3xl text-accent">
        {value}
        <span className="ml-1 text-base text-ink-muted">{unit}</span>
      </div>
    </div>
  );
}

interface ResultsPanelProps {
  data: VolumeOutput;
  system: UnitSystem;
}

export default function ResultsPanel({ data, system }: ResultsPanelProps) {
  const primaryUnit = system === 'imperial' ? 'yd3' : 'm3';
  const primaryNet = system === 'imperial' ? data.netVolumeYd3 : data.netVolumeM3;
  const primaryGross = system === 'imperial' ? data.grossVolumeYd3 : data.grossVolumeM3;
  const secondaryUnit = 'ft3';
  const secondaryGross = data.grossVolumeFt3;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Readout label="Net volume" value={formatVolume(primaryNet, 3)} unit={primaryUnit} />
        <Readout label="With wastage" value={formatVolume(primaryGross, 3)} unit={primaryUnit} />
      </div>
      <div className="text-sm text-ink-muted">
        {formatVolume(secondaryGross, 2)} {secondaryUnit} with wastage
      </div>
      <div>
        <h3 className="mb-2 text-sm text-ink-muted">Bags needed</h3>
        <BagTable demands={data.bagDemands} />
      </div>
      <p className="border-t border-border-hairline pt-4 text-xs text-ink-muted">
        Yields vary by manufacturer. Confirm against the yield printed on your specific bag
        before ordering.
      </p>
    </div>
  );
}
