import type { BagDemand } from '../domain/types';
import { formatBags, formatFractional } from '../lib/format';

interface BagTableProps {
  demands: readonly BagDemand[];
}

export default function BagTable({ demands }: BagTableProps) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-border-hairline text-ink-muted">
          <th className="py-2 font-normal">Bag</th>
          <th className="py-2 text-right font-normal">Exact</th>
          <th className="py-2 text-right font-normal">Bags to buy</th>
        </tr>
      </thead>
      <tbody>
        {demands.map((d) => (
          <tr key={d.spec.id} className="border-b border-border-hairline last:border-b-0">
            <td className="py-2">
              <div>{d.spec.label}</div>
              <div className="text-xs text-ink-muted">{d.spec.citation}</div>
            </td>
            <td className="py-2 text-right font-mono text-ink-muted">
              {formatFractional(d.fractional)}
            </td>
            <td className="py-2 text-right font-mono text-lg text-accent">
              {formatBags(d.wholeBags)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
