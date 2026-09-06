import type { ReactNode } from 'react';

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <section className="rc-empty-state">
      <div className="rc-empty-icon" aria-hidden="true">{icon}</div>
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mx-auto max-w-md text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {action}
    </section>
  );
}
