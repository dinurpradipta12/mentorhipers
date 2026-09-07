'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Plus, Save, Shuffle, Trash2, UsersRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { BootcampAssignmentGroup } from '@/lib/bootcamp/types';

type Student = Record<string, unknown>;

function profileOf(student: Student): { id: string; full_name?: string; username?: string } {
  const profile = student.v2_profiles;
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) return { id: String(student.profile_id ?? '') };
  return { id: String(student.profile_id ?? ''), ...(profile as Record<string, unknown>) } as { id: string; full_name?: string; username?: string };
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function memberIds(group: BootcampAssignmentGroup | null): string[] {
  return group?.members
    .map((member) => member.profile_id)
    .filter((profileId): profileId is string => typeof profileId === 'string') ?? [];
}

export function BootcampGroupManager({ workspaceId, groups, students }: { workspaceId: string; groups: BootcampAssignmentGroup[]; students: Student[] }) {
  const router = useRouter();
  const activeStudents = useMemo(() => students.filter((student) => student.role !== 'removed'), [students]);
  const selectedInitialId = groups[0]?.id ?? 'new';
  const [selectedId, setSelectedId] = useState(selectedInitialId);
  const selected = useMemo(() => groups.find((group) => group.id === selectedId) ?? null, [groups, selectedId]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [randomPrefix, setRandomPrefix] = useState('Grup');
  const [randomCount, setRandomCount] = useState('2');
  const [saving, setSaving] = useState(false);
  const [randomizing, setRandomizing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setName(selected?.name ?? '');
    setDescription(selected?.description ?? '');
    setSelectedMembers(memberIds(selected));
    setError(null);
    setMessage(null);
  }, [selected]);

  function choose(id: string) {
    setSelectedId(id);
    setError(null);
    setMessage(null);
  }

  function toggleMember(profileId: string) {
    setSelectedMembers((current) => current.includes(profileId) ? current.filter((id) => id !== profileId) : [...current, profileId]);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const endpoint = selected ? `/api/v2/groups/${encodeURIComponent(selected.id)}` : '/api/v2/groups';
      const response = await fetch(endpoint, {
        method: selected ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ workspaceId, mode: 'manual', name, description, profileIds: selectedMembers }),
      });
      const payload = await response.json() as { success?: boolean; error?: string; groups?: Array<{ id?: string }>; group?: { id?: string } };
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Grup tidak dapat disimpan.');
      const savedId = selected ? payload.group?.id : payload.groups?.[0]?.id;
      if (savedId) setSelectedId(savedId);
      setMessage(selected ? 'Perubahan grup tersimpan.' : 'Grup baru berhasil dibuat.');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Grup tidak dapat disimpan.');
    } finally {
      setSaving(false);
    }
  }

  async function randomize() {
    if (randomizing) return;
    setRandomizing(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch('/api/v2/groups', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ workspaceId, mode: 'random', prefix: randomPrefix, groupCount: Number(randomCount) }),
      });
      const payload = await response.json() as { success?: boolean; error?: string; groups?: unknown[] };
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Pembagian grup acak gagal.');
      setMessage(`${payload.groups?.length ?? 0} grup dibuat dan siswa aktif dibagi secara acak.`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Pembagian grup acak gagal.');
    } finally {
      setRandomizing(false);
    }
  }

  async function remove() {
    if (!selected || deleting) return;
    if (!window.confirm('Hapus grup ini? Penghapusan hanya diizinkan jika belum dipakai curriculum atau submission.')) return;
    setDeleting(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/v2/groups/${encodeURIComponent(selected.id)}`, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ workspaceId }),
      });
      const payload = await response.json() as { success?: boolean; error?: string };
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Grup tidak dapat dihapus.');
      setSelectedId('new');
      setMessage('Grup dihapus karena belum memiliki histori terkait.');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Grup tidak dapat dihapus.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="rc-card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6"><div><p className="rc-eyebrow">Grup siswa</p><h2 className="mt-1 font-extrabold text-slate-950">Kelompokkan peserta</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">Pindahkan siswa antar grup atau lakukan pembagian acak. Nilai, absensi, dan submission tetap berada pada profile siswa masing-masing.</p></div><span className="rc-stat-icon bg-violet-50 text-violet-700"><UsersRound size={19} aria-hidden="true" /></span></div>
      {error && <p role="alert" className="mx-5 mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 sm:mx-6">{error}</p>}
      {message && <p role="status" className="mx-5 mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 sm:mx-6"><CheckCircle2 size={17} aria-hidden="true" />{message}</p>}
      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.3fr)] sm:p-6">
        <div className="space-y-2">
          <button type="button" onClick={() => choose('new')} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${selectedId === 'new' ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-200'}`}><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-teal-700"><Plus size={16} aria-hidden="true" /></span><span className="text-sm font-bold text-slate-900">Grup baru</span></button>
          {groups.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Belum ada grup assignment.</p>}
          {groups.map((group) => <button key={group.id} type="button" onClick={() => choose(group.id)} className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${selectedId === group.id ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-200'}`}><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-violet-700"><UsersRound size={16} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-900">{group.name}</span><span className="mt-1 block text-xs text-slate-500">{group.members.length} siswa</span></span></button>)}
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4"><p className="text-sm font-extrabold text-slate-900">Acak pembagian</p><p className="mt-1 text-xs leading-5 text-slate-500">Semua siswa aktif dibagi merata dan mapping grup lama mereka diganti.</p><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1"><label className="rc-field"><span>Awalan nama grup</span><input value={randomPrefix} onChange={(event) => setRandomPrefix(event.target.value)} maxLength={80} /></label><label className="rc-field"><span>Jumlah grup</span><input type="number" min="1" max="100" step="1" value={randomCount} onChange={(event) => setRandomCount(event.target.value)} /></label></div><button type="button" className="rc-button rc-button-secondary mt-3 w-full" onClick={randomize} disabled={randomizing || activeStudents.length === 0}>{randomizing ? 'Membagi…' : <><Shuffle size={16} aria-hidden="true" /> Acak siswa aktif</>}</button></div>
        </div>
        <form onSubmit={save} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2"><label className="rc-field"><span>Nama grup</span><input required value={name} onChange={(event) => setName(event.target.value)} maxLength={180} /></label><label className="rc-field"><span>Deskripsi</span><input value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} /></label></div>
          <fieldset><legend className="text-sm font-extrabold text-slate-900">Anggota grup ({selectedMembers.length})</legend><p className="mt-1 text-xs leading-5 text-slate-500">Siswa yang dipilih akan dipindahkan dari assignment group lain pada batch ini.</p><div className="mt-3 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100">{activeStudents.length === 0 ? <p className="p-4 text-sm text-slate-500">Belum ada siswa aktif.</p> : activeStudents.map((student) => { const profile = profileOf(student); const checked = selectedMembers.includes(profile.id); return <label key={String(student.id)} className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50"><input type="checkbox" className="h-4 w-4 accent-teal-700" checked={checked} onChange={() => toggleMember(profile.id)} /><span className="min-w-0"><span className="block truncate font-bold text-slate-800">{profile.full_name || profile.username || profile.id}</span><span className="block truncate text-xs text-slate-500">{text(student.group_name) || 'Belum ada grup'}</span></span></label>; })}</div></fieldset>
          <div className="flex flex-wrap gap-3"><button type="submit" className="rc-button rc-button-primary" disabled={saving || deleting}>{saving ? 'Menyimpan…' : <><Save size={16} aria-hidden="true" /> Simpan grup</>}</button>{selected && <button type="button" className="rc-button rc-button-secondary" disabled={saving || deleting} onClick={remove}>{deleting ? 'Menghapus…' : <><Trash2 size={16} aria-hidden="true" /> Hapus grup</>}</button>}</div>
        </form>
      </div>
    </section>
  );
}
