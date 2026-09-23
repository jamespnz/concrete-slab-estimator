// Display-only formatting. Never used inside src/domain -- the engine deals
// in exact numbers; formatting for humans happens only at the UI edge.

export function formatVolume(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return '--';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatBags(wholeBags: number): string {
  if (!Number.isFinite(wholeBags)) return '--';
  return wholeBags.toLocaleString('en-US');
}

export function formatFractional(value: number): string {
  if (!Number.isFinite(value)) return '--';
  return value.toFixed(2);
}
