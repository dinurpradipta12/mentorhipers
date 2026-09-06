import Link from 'next/link';
import { Award, BookOpen, CalendarDays, CheckCircle2, ClipboardCheck, ClipboardList, ExternalLink, MessageSquareText, Trophy, Users, UsersRound } from 'lucide-react';
import { EmptyState } from '@/components/app/EmptyState';
import { PageHeader } from '@/components/app/PageHeader';
import { StatusBadge } from '@/components/app/StatusBadge';
import { SubmissionGradeEditor } from '@/components/bootcamp/SubmissionGradeEditor';
import type { Viewer } from '@/lib/auth/context';
import { normalizeSchedules, type BootcampBatch, type BootcampMembership } from '@/lib/bootcamp/queries';

type WorkspaceData = {
  batch: BootcampBatch;
  membership: BootcampMembership | null;
  curriculum: Array<Record<string, unknown>>;
  announcements: Array<Record<string, unknown>>;
  submissions: Array<Record<string, unknown>>;
  quizResults: Array<Record<string, unknown>>;
  students: Array<Record<string, unknown>>;
};

function formatDate(value: unknown) {
  if (typeof value !== 'string' || !value) return 'Belum dijadwalkan';
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? 'Belum dijadwalkan' : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function curriculumKind(type: unknown) {
  const normalized = String(type ?? 'material');
  if (normalized === 'post_test') return 'Post-test';
  if (normalized === 'challenge' || normalized === 'group_assignment') return 'Challenge';
  if (normalized.includes('assignment')) return 'Tugas';
  return 'Materi';
}

function scoreLabel(value: unknown) {
  const score = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(score) ? `${score}/100` : 'Belum dinilai';
}

function recordEntries(value: unknown): Array<[string, unknown]> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  return Object.entries(value as Record<string, unknown>);
}

export function BootcampWorkspaceView({ viewer, data }: { viewer: Viewer; data: WorkspaceData }) {
  const schedules = normalizeSchedules(data.batch.schedules);
  const lessonCount = data.curriculum.filter((item) => item.type === 'material').length;
  const assessmentCount = data.curriculum.length - lessonCount;
  const completedCount = data.submissions.filter((item) => item.status === 'completed').length + data.quizResults.length;
  const attendanceCount = Object.values(data.membership?.attendance ?? {}).filter((value) => value === 'P').length;

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow={viewer.isAdmin ? 'Bootcamp management' : 'Bootcamp saya'}
        title={data.batch.name}
        description={data.batch.description || 'Ruang pembelajaran Bootcamp.'}
        action={<StatusBadge status={data.batch.status} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rc-stat-card"><span className="rc-stat-icon bg-teal-50 text-teal-700"><BookOpen size={20} /></span><div><p>Materi</p><strong>{lessonCount}</strong></div></div>
        <div className="rc-stat-card"><span className="rc-stat-icon bg-violet-50 text-violet-700"><ClipboardList size={20} /></span><div><p>Assessment</p><strong>{assessmentCount}</strong></div></div>
        <div className="rc-stat-card"><span className="rc-stat-icon bg-amber-50 text-amber-700"><CheckCircle2 size={20} /></span><div><p>{viewer.isAdmin ? 'Peserta' : 'Selesai'}</p><strong>{viewer.isAdmin ? data.students.length : completedCount}</strong></div></div>
        <div className="rc-stat-card"><span className="rc-stat-icon bg-rose-50 text-rose-700"><CalendarDays size={20} /></span><div><p>{viewer.isAdmin ? 'Jadwal' : 'Kehadiran'}</p><strong>{viewer.isAdmin ? schedules.length : attendanceCount}</strong></div></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
        <section className="rc-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
            <div><h2 className="font-extrabold text-slate-950">Materi & assessment</h2><p className="mt-1 text-sm text-slate-500">Konten yang dapat diakses dalam batch ini.</p></div>
            <BookOpen aria-hidden="true" className="text-teal-700" size={21} />
          </div>
          {data.curriculum.length === 0 ? <EmptyState icon={<BookOpen size={27} />} title="Belum ada materi" description="Admin dapat menambahkan materi dan assessment setelah jalur migrasi keamanan aktif." /> : (
            <ul className="divide-y divide-slate-100">
              {data.curriculum.map((item) => {
                const videoUrl = safeExternalUrl(item.video_url);
                return <li key={String(item.id)} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600"><BookOpen aria-hidden="true" size={18} /></span>
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-900">{String(item.title ?? 'Tanpa judul')}</h3><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">{curriculumKind(item.type)}</span></div><p className="mt-1 line-clamp-2 text-sm text-slate-500">{String(item.description ?? item.module_name ?? 'Tidak ada deskripsi.')}</p><p className="mt-2 text-xs font-medium text-slate-400">Deadline: {formatDate(item.due_date)}</p></div>
                  {videoUrl && <a href={videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-teal-300 hover:text-teal-700 sm:self-center">Buka video <ExternalLink aria-hidden="true" size={14} /></a>}
                </li>;
              })}
            </ul>
          )}
        </section>

        <aside className="space-y-6">
          <section className="rc-card p-5 sm:p-6"><div className="flex items-center gap-3"><span className="rc-stat-icon bg-indigo-50 text-indigo-700"><CalendarDays size={19} /></span><div><h2 className="font-extrabold text-slate-950">Jadwal kelas</h2><p className="text-xs text-slate-500">Pertemuan mendatang</p></div></div><div className="mt-5 space-y-3">{schedules.length === 0 ? <p className="text-sm text-slate-500">Jadwal belum tersedia.</p> : schedules.slice(0, 4).map((schedule, index) => <div key={`${schedule.title}-${index}`} className="rounded-2xl bg-slate-50 p-3"><p className="text-sm font-bold text-slate-800">{schedule.title}</p><p className="mt-1 text-xs text-slate-500">{formatDate(schedule.date)}{schedule.time ? ` · ${schedule.time}` : ''}</p>{safeExternalUrl(schedule.meet_link) && <a href={safeExternalUrl(schedule.meet_link)!} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-bold text-teal-700">Buka meeting</a>}</div>)}</div></section>
          <section className="rc-card p-5 sm:p-6"><div className="flex items-center gap-3"><span className="rc-stat-icon bg-amber-50 text-amber-700"><MessageSquareText size={19} /></span><div><h2 className="font-extrabold text-slate-950">Pengumuman</h2><p className="text-xs text-slate-500">Info dari mentor</p></div></div><div className="mt-5 space-y-3">{data.announcements.length === 0 ? <p className="text-sm text-slate-500">Belum ada pengumuman.</p> : data.announcements.slice(0, 3).map((announcement) => <article key={String(announcement.id)} className="rounded-2xl border border-slate-100 p-3"><p className="text-sm font-bold text-slate-800">{String(announcement.title ?? 'Pengumuman')}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{String(announcement.summary ?? announcement.content ?? '')}</p></article>)}</div></section>
        </aside>
      </div>

      {!viewer.isAdmin && (
        <section className="rc-card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
            <span className="rc-stat-icon bg-teal-50 text-teal-700"><ClipboardCheck size={19} aria-hidden="true" /></span>
            <div><h2 className="font-extrabold text-slate-950">Pembelajaran & penilaian saya</h2><p className="mt-1 text-sm text-slate-500">Nilai, status, dan feedback yang tersimpan tetap ditampilkan tanpa menghitung ulang nilai historis.</p></div>
          </div>
          <div className="grid gap-3 border-b border-slate-100 p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Grup</p><p className="mt-1 font-extrabold text-slate-900">{data.membership?.group_name || 'Belum ditetapkan'}</p>{data.membership?.is_leader && <p className="mt-1 text-xs font-bold text-teal-700">Ketua grup</p>}</div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Credential</p><p className="mt-1 font-extrabold text-slate-900">{data.membership?.credential_no || 'Belum tersedia'}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Kehadiran tercatat</p><p className="mt-1 font-extrabold text-slate-900">{recordEntries(data.membership?.attendance).filter(([, value]) => value === 'P').length} hadir</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Plus points</p><p className="mt-1 font-extrabold text-slate-900">{recordEntries(data.membership?.plus_points).length} catatan</p>{safeExternalUrl(data.membership?.certificate_url) && <a href={safeExternalUrl(data.membership?.certificate_url)!} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-teal-700">Buka sertifikat <ExternalLink size={13} aria-hidden="true" /></a>}</div>
          </div>
          <div className="grid gap-6 p-5 lg:grid-cols-2 sm:p-6">
            <section>
              <h3 className="text-sm font-extrabold text-slate-950">Tugas & feedback mentor</h3>
              <div className="mt-3 space-y-3">{data.submissions.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Belum ada submission yang tersimpan.</p> : data.submissions.map((submission) => {
                const curriculum = data.curriculum.find((item) => String(item.id) === String(submission.curriculum_id));
                const fileUrl = safeExternalUrl(submission.file_link);
                const criteriaCount = recordEntries(submission.criteria_scores).length;
                return <article key={String(submission.id)} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold text-slate-900">{String(curriculum?.title ?? 'Tugas')}</p><p className="mt-1 text-xs text-slate-500">Status: {String(submission.status ?? 'belum diproses')}</p></div><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-extrabold text-teal-800">{scoreLabel(submission.grade)}</span></div>{Boolean(submission.mentor_feedback) && <p className="mt-3 whitespace-pre-wrap rounded-xl bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-950"><span className="font-extrabold">Feedback mentor: </span>{String(submission.mentor_feedback)}</p>}<div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">{criteriaCount > 0 && <span>{criteriaCount} kriteria dinilai</span>}{fileUrl && <a href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-teal-700">Buka submission <ExternalLink size={13} aria-hidden="true" /></a>}</div></article>;
              })}</div>
            </section>
            <section>
              <h3 className="text-sm font-extrabold text-slate-950">Hasil post-test</h3>
              <div className="mt-3 space-y-3">{data.quizResults.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Belum ada hasil quiz yang tersimpan.</p> : data.quizResults.map((result) => {
                const curriculum = data.curriculum.find((item) => String(item.id) === String(result.curriculum_id));
                return <article key={String(result.id)} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"><div className="min-w-0"><p className="truncate font-bold text-slate-900">{String(curriculum?.title ?? 'Post-test')}</p><p className="mt-1 text-xs text-slate-500">{formatDate(result.created_at)}</p></div><span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-extrabold text-indigo-800">{scoreLabel(result.score)}</span></article>;
              })}</div>
              <h3 className="mt-6 text-sm font-extrabold text-slate-950">Absensi & poin</h3>
              <div className="mt-3 space-y-2">{recordEntries(data.membership?.attendance).length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Absensi belum dicatat.</p> : recordEntries(data.membership?.attendance).slice(0, 8).map(([date, status]) => <div key={date} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"><span className="font-semibold text-slate-700">{date}</span><span className="font-extrabold text-slate-900">{String(status)}</span></div>)}</div>
            </section>
          </div>
        </section>
      )}


      {viewer.isAdmin && (
        <section className="rc-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div><p className="rc-eyebrow">Read-only historical matrix</p><h2 className="mt-1 font-extrabold text-slate-950">Matriks penilaian tersimpan</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">Menampilkan skor dan status yang sudah tersimpan. Nilai akhir serta ranking tidak dihitung ulang karena konfigurasi bobot authoritative belum ditemukan di database.</p></div>
            <span className="rc-stat-icon bg-violet-50 text-violet-700"><Award size={19} aria-hidden="true" /></span>
          </div>
          {data.students.length === 0 ? <EmptyState icon={<UsersRound size={27} />} title="Belum ada peserta untuk dinilai" description="Matriks akan memakai submission dan hasil quiz historis ketika peserta tersedia." /> : <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3 sm:p-6">{data.students.map((student) => {
            const profile = student.v2_profiles as { full_name?: string; username?: string } | null;
            const profileId = String(student.profile_id);
            const submissions = data.submissions.filter((submission) => String(submission.profile_id) === profileId);
            const quizResults = data.quizResults.filter((result) => String(result.profile_id) === profileId);
            const gradedSubmissions = submissions.filter((submission) => Number.isFinite(Number(submission.grade)));
            const feedbackCount = submissions.filter((submission) => Boolean(submission.mentor_feedback)).length;
            return <article key={String(student.id)} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-extrabold text-slate-900">{profile?.full_name || 'Profil tanpa nama'}</h3><p className="mt-1 text-xs text-slate-500">{profile?.username || 'Tanpa username'} · {String(student.group_name ?? 'Tanpa grup')}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{submissions.length} tugas</span></div><dl className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Tugas dinilai</dt><dd className="mt-1 text-lg font-extrabold text-slate-900">{gradedSubmissions.length}/{submissions.length}</dd></div><div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Post-test</dt><dd className="mt-1 text-lg font-extrabold text-slate-900">{quizResults.length}</dd></div><div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Feedback</dt><dd className="mt-1 text-lg font-extrabold text-slate-900">{feedbackCount}</dd></div><div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Hadir</dt><dd className="mt-1 text-lg font-extrabold text-slate-900">{recordEntries(student.attendance).filter(([, value]) => value === 'P').length}</dd></div></dl><div className="mt-4 flex flex-wrap gap-2">{gradedSubmissions.slice(0, 3).map((submission) => <span key={String(submission.id)} className="rounded-lg bg-teal-50 px-2 py-1 text-[11px] font-bold text-teal-800">{scoreLabel(submission.grade)}</span>)}{quizResults.slice(0, 2).map((result) => <span key={String(result.id)} className="rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-800">Quiz {scoreLabel(result.score)}</span>)}{gradedSubmissions.length === 0 && quizResults.length === 0 && <span className="text-xs text-slate-400">Belum ada nilai tersimpan.</span>}</div></article>;
          })}</div>}
        </section>
      )}


      {viewer.isAdmin && <SubmissionGradeEditor workspaceId={data.batch.id} submissions={data.submissions} curriculum={data.curriculum} />}


      {viewer.isAdmin && <section className="rc-card overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6"><div><h2 className="font-extrabold text-slate-950">Daftar siswa</h2><p className="mt-1 text-sm text-slate-500">Akun dan profile siswa tetap terhubung ke Auth yang ada.</p></div><Link href="/ruang-sosmed/batch" className="text-sm font-bold text-teal-700">Kelola batch</Link></div>{data.students.length === 0 ? <EmptyState icon={<Users size={27} />} title="Belum ada siswa" description="Pendaftaran siswa akan memakai akun Auth yang telah ada atau dibuat server-side." /> : <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4">Siswa</th><th className="px-6 py-4">Grup</th><th className="px-6 py-4">Credential</th><th className="px-6 py-4">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{data.students.map((student) => { const profile = student.v2_profiles as { full_name?: string; username?: string } | null; return <tr key={String(student.id)}><td className="px-6 py-4"><p className="font-bold text-slate-800">{profile?.full_name || 'Profil tanpa nama'}</p><p className="mt-1 text-xs text-slate-500">{profile?.username || '—'}</p></td><td className="px-6 py-4 text-slate-600">{String(student.group_name ?? 'Belum dikelompokkan')}</td><td className="px-6 py-4 text-slate-600">{String(student.credential_no ?? '—')}</td><td className="px-6 py-4"><span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700"><Trophy size={14} /> Terdaftar</span></td></tr>; })}</tbody></table></div>}</section>}
    </section>
  );
}
