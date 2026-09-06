type Status = 'draft' | 'published' | 'archived' | 'active' | 'inactive' | 'default';

const labels: Record<Status, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
  active: 'Aktif',
  inactive: 'Tidak aktif',
  default: 'Status belum diatur',
};

export function StatusBadge({ status }: { status?: string | null }) {
  const normalized = (status ?? '').toLowerCase();
  const resolved: Status =
    normalized === 'draft' ? 'draft' :
    normalized === 'published' ? 'published' :
    normalized === 'archived' ? 'archived' :
    normalized === 'active' ? 'active' :
    normalized === 'inactive' ? 'inactive' : 'default';

  return <span className={`rc-status rc-status-${resolved}`}>{labels[resolved]}</span>;
}
