import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  children: ReactNode;
}

export default function Panel({ title, children }: PanelProps) {
  return (
    <section className="border border-border-hairline bg-panel">
      <h2 className="border-b border-border-hairline px-4 py-3 text-sm font-medium text-ink-muted">
        {title}
      </h2>
      <div className="p-4">{children}</div>
    </section>
  );
}
