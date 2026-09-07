'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Save, ShieldCheck, UserMinus } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Student = Record<string, unknown>;

function profileOf(student: Student): { id: string; full_name?: string; username?: string } {
  const profile = student.v2_profiles;
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) return { id: String(student.profile_id ?? '') };
  return { id: String(student.profile_id ?? ''), ...(profile as Record<string, unknown>) } as { id: string; full_name?: string; username?: string };
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function jsonObject(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '{}';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '{}';
  }
}

export function BootcampMembershipManager({ workspaceId, students }: { workspaceId: string; students: Student[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(() => String(students[0]?.id ?? ''));
  const selected = useMemo(() => students.find((student) => String(student.id) === selectedId) ?? null, [selectedId, students]);
  const [fullName, setFullName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupWaLink, setGroupWaLink] = useState('');
  const [isLeader, setIsLeader] = useState(false);
  const [credentialNo, setCredentialNo] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');
  const [attendanceJson, setAttendanceJson] = useState('{}');
  const [plusPointsJson, setPlusPointsJson] = useState('{}');
  const [role, setRole] = useState('member');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const profile = selected ? profileOf(selected) : { id: '' };
    setFullName(text(profile.full_name));
    setGroupName(text(selected?.group_name));
    setGroupWaLink(text(selected?.group_wa_link));
    setIsLeader(selected?.is_leader === true);
    setCredentialNo(text(selected?.credential_no));
    setCertificateUrl(text(selected?.certificate_url));
    setAttendanceJson(jsonObject(selected?.attendance));
    setPlusPointsJson(jsonObject(selected?.plus_points));
    setRole(text(selected?.role) || 'member');
    setError(null);
    setMessage(null);
  }, [selected]);

  if (students.length === 0) return null;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const profile = profileOf(selected);
      let attendance: unknown;
      let plusPoints: unknown;
      try {
        attendance = JSON.parse(attendanceJson);
        plusPoints = JSON.parse(plusPointsJson);
      } catch {
        throw new Error('Absensi dan plus points harus berupa JSON yang valid.');
      }
      if (!attendance || typeof attendance !== 'object' || Array.isArray(attendance)) {
        throw new Error('Absensi harus berupa JSON object.');
      }
      if (!plusPoints || typeof plusPoints !== 'object' || Array.isArray(plusPoints)) {
        throw new Error('Plus points harus berupa JSON object.');
      }
      const membershipResponse = await fetch(`/api/v2/memberships/${encodeURIComponent(String(selected.id))}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ workspaceId, groupName, groupWaLink, isLeader, credentialNo, certificateUrl, attendance, plusPoints, role }),
      });
      const membershipPayload = await membershipResponse.json() as { success?: boolean; error?: string };
      if (!membershipResponse.ok || !membershipPayload.success) throw new Error(membershipPayload.error || 'Membership tidak dapat diperbarui.');
      const profileResponse = await fetch(`/api/v2/profiles/${encodeURIComponent(profile.id)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ fullName }),
      });
      const profilePayload = await profileResponse.json() as { success?: boolean; error?: string };
      if (!profileResponse.ok || !profilePayload.success) throw new Error(profilePayload.error || 'Nama siswa tidak dapat diperbarui.');
      setMessage('Profile, grup, dan akses siswa berhasil diperbarui.');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Data siswa tidak dapat diperbarui.');
    } finally {
      setSaving(false);
    }
  }

  async function removeAccess() {
    if (!selected || removing) return;
    if (!window.confirm('Cabut akses siswa dari batch ini? Histori nilai, absensi, dan akun Auth tetap disimpan.')) return;
    setRemoving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/v2/memberships/${encodeURIComponent(String(selected.id))}`, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ workspaceId }),
      });
      const payload = await response.json() as { success?: boolean; error?: string };
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Akses siswa tidak dapat dicabut.');
      setMessage('Akses batch dicabut tanpa menghapus akun Auth atau histori siswa.');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Akses siswa tidak dapat dicabut.');
    } finally {
      setRemoving(false);
    }
  }

  return (
    <section className="rc-card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6"><div><p className="rc-eyebrow">Roster & akses</p><h2 className="mt-1 font-extrabold text-slate-950">Profile, grup, dan credential</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Cabut akses secara soft-revoke agar nilai, absensi, dan histori pembelajaran tetap utuh.</p></div><span className="rc-stat-icon bg-teal-50 text-teal-700"><ShieldCheck size={19} aria-hidden="true" /></span></div>
      {error && <p role="alert" className="mx-5 mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 sm:mx-6">{error}</p>}
      {message && <p role="status" className="mx-5 mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 sm:mx-6"><CheckCircle2 size={17} aria-hidden="true" />{message}</p>}
      <form onSubmit={save} className="grid gap-6 p-5 lg:grid-cols-[minmax(220px,0.65fr)_minmax(0,1.35fr)] sm:p-6">
        <label className="rc-field"><span>Pilih siswa</span><span className="rc-input-wrap"><select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} aria-label="Pilih siswa">{students.map((student) => { const profile = profileOf(student); return <option key={String(student.id)} value={String(student.id)}>{profile.full_name || profile.username || profile.id}</option>; })}</select></span></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="rc-field sm:col-span-2"><span>Nama siswa</span><span className="rc-input-wrap"><input value={fullName} onChange={(event) => setFullName(event.target.value)} required maxLength={180} /></span></label><label className="rc-field"><span>Nama grup</span><span className="rc-input-wrap"><input value={groupName} onChange={(event) => setGroupName(event.target.value)} maxLength={180} /></span></label><label className="rc-field"><span>Status akses</span><span className="rc-input-wrap"><select value={role} onChange={(event) => setRole(event.target.value)}><option value="member">Aktif</option><option value="student">Student</option><option value="removed">Dicabut</option></select></span></label><label className="rc-field"><span>Link WhatsApp grup</span><span className="rc-input-wrap"><input type="url" value={groupWaLink} onChange={(event) => setGroupWaLink(event.target.value)} placeholder="https://chat.whatsapp.com/..." maxLength={2000} /></span></label><label className="rc-field"><span>Credential number</span><span className="rc-input-wrap"><input value={credentialNo} onChange={(event) => setCredentialNo(event.target.value)} maxLength={120} /></span></label><label className="rc-field"><span>Link sertifikat</span><span className="rc-input-wrap"><input type="url" value={certificateUrl} onChange={(event) => setCertificateUrl(event.target.value)} maxLength={2000} /></span></label><label className="rc-field sm:col-span-2"><span>Riwayat absensi (JSON)</span><span className="rc-input-wrap"><textarea className="font-mono text-xs" value={attendanceJson} onChange={(event) => setAttendanceJson(event.target.value)} rows={4} spellCheck={false} aria-describedby="attendance-help" /></span><small id="attendance-help">Contoh: {'{"2026-09-10":"P","2026-09-17":"A"}'}. Gunakan status yang sudah dipakai sistem lama.</small></label><label className="rc-field sm:col-span-2"><span>Plus points (JSON)</span><span className="rc-input-wrap"><textarea className="font-mono text-xs" value={plusPointsJson} onChange={(event) => setPlusPointsJson(event.target.value)} rows={3} spellCheck={false} aria-describedby="plus-points-help" /></span><small id="plus-points-help">Contoh: {'{"bonus":5}'}. Nilai disimpan sebagai histori, bukan menghitung ulang nilai akhir.</small></label><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 sm:col-span-2"><input type="checkbox" className="h-4 w-4 accent-teal-700" checked={isLeader} onChange={(event) => setIsLeader(event.target.checked)} /> Jadikan ketua grup (ketua lain pada grup yang sama akan dinonaktifkan)</label></div>
        <div className="flex flex-wrap gap-3 lg:col-start-2"><button type="submit" className="rc-button rc-button-primary" disabled={saving || removing}>{saving ? 'Menyimpan…' : <><Save size={17} aria-hidden="true" /> Simpan profile & akses</>}</button><button type="button" className="rc-button rc-button-secondary" disabled={saving || removing || role === 'removed'} onClick={removeAccess}>{removing ? 'Mencabut…' : <><UserMinus size={17} aria-hidden="true" /> Cabut akses batch</>}</button></div>
      </form>
    </section>
  );
}
