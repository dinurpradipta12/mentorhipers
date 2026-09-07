'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  BarChart4,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  ExternalLink,
  Layout,
  MessageSquareText,
  PlayCircle,
  Trophy,
  Users,
  UsersRound,
  Zap,
} from 'lucide-react';
import { EmptyState } from '@/components/app/EmptyState';
import { StatusBadge } from '@/components/app/StatusBadge';
import { AssignmentSubmissionForm } from '@/components/bootcamp/AssignmentSubmissionForm';
import { BootcampAnnouncementManager } from '@/components/bootcamp/BootcampAnnouncementManager';
import { BootcampCurriculumManager } from '@/components/bootcamp/BootcampCurriculumManager';
import { BootcampGroupManager } from '@/components/bootcamp/BootcampGroupManager';
import { BootcampMembershipManager } from '@/components/bootcamp/BootcampMembershipManager';
import { QuizAttemptForm } from '@/components/bootcamp/QuizAttemptForm';
import { SubmissionGradeEditor } from '@/components/bootcamp/SubmissionGradeEditor';
import type { Viewer } from '@/lib/auth/context';
import { normalizeSchedules } from '@/lib/bootcamp/schedules';
import type { BootcampAssignmentGroup, BootcampBatch, BootcampMembership } from '@/lib/bootcamp/types';

type WorkspaceData = {
  batch: BootcampBatch;
  membership: BootcampMembership | null;
  curriculum: Array<Record<string, unknown>>;
  announcements: Array<Record<string, unknown>>;
  submissions: Array<Record<string, unknown>>;
  quizResults: Array<Record<string, unknown>>;
  students: Array<Record<string, unknown>>;
  assignmentGroups: BootcampAssignmentGroup[];
};

type TabId = 'students' | 'learning' | 'board' | 'assignments' | 'grades' | 'attendance';

function formatDate(value: unknown) {
  if (typeof value !== 'string' || !value) return 'Belum dijadwalkan';
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? 'Belum dijadwalkan'
    : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
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

function profileOf(student: Record<string, unknown>) {
  const value = student.v2_profiles;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { full_name: 'Profil tanpa nama', username: '—' };
  const profile = value as Record<string, unknown>;
  return {
    full_name: typeof profile.full_name === 'string' ? profile.full_name : 'Profil tanpa nama',
    username: typeof profile.username === 'string' ? profile.username : '—',
  };
}

function PanelHeading({ icon, eyebrow, title, description }: { icon: React.ReactNode; eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-6 sm:px-8">
      <div>
        {eyebrow && <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-500">{eyebrow}</p>}
        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">{title}</h2>
        {description && <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600">{icon}</span>
    </div>
  );
}

function TabButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-2xl px-5 py-3 text-xs font-black transition-all sm:px-7 sm:py-4 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
    >
      {icon}
      {label}
    </button>
  );
}

export function BootcampWorkspaceView({ viewer, data }: { viewer: Viewer; data: WorkspaceData }) {
  const schedules = normalizeSchedules(data.batch.schedules);
  const activeStudents = data.students.filter((student) => student.role !== 'removed');
  const lessonCount = data.curriculum.filter((item) => item.type === 'material').length;
  const assessmentCount = data.curriculum.length - lessonCount;
  const completedCount = data.submissions.filter((item) => item.status === 'completed').length + data.quizResults.length;
  const attendanceCount = Object.values(data.membership?.attendance ?? {}).filter((value) => value === 'P').length;
  const [activeTab, setActiveTab] = useState<TabId>(viewer.isAdmin ? 'students' : 'learning');

  const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode }> = viewer.isAdmin
    ? [
        { id: 'students', label: 'Siswa & Grup', icon: <Users size={16} /> },
        { id: 'learning', label: 'Materi LMS', icon: <PlayCircle size={16} /> },
        { id: 'board', label: 'Community Board', icon: <Layout size={16} /> },
        { id: 'assignments', label: 'Kelola Tugas', icon: <ClipboardList size={16} /> },
        { id: 'grades', label: 'Grading Matrix', icon: <BarChart4 size={16} /> },
        { id: 'attendance', label: 'Absensi', icon: <CheckCircle2 size={16} /> },
      ]
    : [
        { id: 'learning', label: 'Learning Journey', icon: <PlayCircle size={16} /> },
        { id: 'board', label: 'Community Board', icon: <Layout size={16} /> },
        { id: 'assignments', label: 'My Assignments', icon: <ClipboardList size={16} /> },
        { id: 'grades', label: 'My Results', icon: <BarChart4 size={16} /> },
        { id: 'attendance', label: 'My Attendance', icon: <CheckCircle2 size={16} /> },
      ];

  return (
    <section className="space-y-8 pb-8 sm:space-y-10">
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-sky-500 via-blue-600 to-blue-950 px-6 py-8 text-white shadow-2xl shadow-blue-900/20 sm:rounded-[2.75rem] sm:px-10 sm:py-10 xl:px-12">
        <div className="pointer-events-none absolute -left-24 -top-32 h-80 w-80 rounded-full bg-white/10 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-36 -right-20 h-96 w-96 rounded-full bg-sky-300/20 blur-[100px]" />
        <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/ruang-sosmed/batch" aria-label="Kembali ke daftar batch" className="grid h-10 w-10 place-items-center rounded-2xl border border-white/15 bg-white/10 transition hover:bg-white/20"><ArrowLeft size={18} /></Link>
              <span className="rounded-full bg-blue-700/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white">{viewer.isAdmin ? 'Cohort Management' : 'Student Portal'}</span>
            </div>
            <div>
              <h1 className="max-w-4xl text-3xl font-black tracking-tight sm:text-4xl xl:text-5xl">{data.batch.name}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">{data.batch.description || 'Ruang pembelajaran Bootcamp.'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-blue-100/80 sm:text-sm">
              <span className="inline-flex items-center gap-2"><Zap size={14} className="text-sky-200" />{data.batch.status === 'active' ? 'Ongoing Batch' : 'Batch selesai'}</span>
              <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:block" />
              <span className="inline-flex items-center gap-2"><Users size={14} className="text-sky-200" />{activeStudents.length}{data.batch.max_members ? `/${data.batch.max_members}` : ''} peserta</span>
              <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:block" />
              <span className="inline-flex items-center gap-2"><Clock size={14} className="text-sky-200" />{formatDate(data.batch.start_date)} — {formatDate(data.batch.end_date)}</span>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-3 xl:mb-1"><StatusBadge status={data.batch.status} /><Link href="/ruang-sosmed/batch" className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-xs font-black text-white transition hover:bg-white/20">Semua batch</Link></div>
        </div>
      </header>

      <div className="-mx-1 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Navigasi batch">
        <div className="mx-auto flex w-max gap-1 rounded-[2rem] border border-slate-100 bg-white/90 p-2 shadow-xl shadow-slate-200/50 backdrop-blur-xl">{tabs.map((tab) => <TabButton key={tab.id} active={activeTab === tab.id} icon={tab.icon} label={tab.label} onClick={() => setActiveTab(tab.id)} />)}</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rc-stat-card"><span className="rc-stat-icon bg-blue-50 text-blue-700"><BookOpen size={20} /></span><div><p>Materi</p><strong>{lessonCount}</strong></div></div>
        <div className="rc-stat-card"><span className="rc-stat-icon bg-violet-50 text-violet-700"><ClipboardList size={20} /></span><div><p>Assessment</p><strong>{assessmentCount}</strong></div></div>
        <div className="rc-stat-card"><span className="rc-stat-icon bg-amber-50 text-amber-700"><CheckCircle2 size={20} /></span><div><p>{viewer.isAdmin ? 'Peserta aktif' : 'Selesai'}</p><strong>{viewer.isAdmin ? activeStudents.length : completedCount}</strong></div></div>
        <div className="rc-stat-card"><span className="rc-stat-icon bg-rose-50 text-rose-700"><CalendarDays size={20} /></span><div><p>{viewer.isAdmin ? 'Jadwal' : 'Kehadiran'}</p><strong>{viewer.isAdmin ? schedules.length : attendanceCount}</strong></div></div>
      </div>

      {activeTab === 'learning' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
          <section className="rc-card overflow-hidden"><PanelHeading icon={<BookOpen size={21} />} title="Materi & assessment" description="Konten yang dapat diakses dalam batch ini." />{data.curriculum.length === 0 ? <EmptyState icon={<BookOpen size={27} />} title="Belum ada materi" description="Admin dapat menambahkan materi dan assessment." /> : <ul className="divide-y divide-slate-100">{data.curriculum.map((item) => { const videoUrl = safeExternalUrl(item.video_url); return <li key={String(item.id)} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:px-8"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600"><BookOpen aria-hidden="true" size={18} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-900">{String(item.title ?? 'Tanpa judul')}</h3><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">{curriculumKind(item.type)}</span></div><p className="mt-1 line-clamp-2 text-sm text-slate-500">{String(item.description ?? item.module_name ?? 'Tidak ada deskripsi.')}</p><p className="mt-2 text-xs font-medium text-slate-400">Deadline: {formatDate(item.due_date)}</p></div>{videoUrl && <a href={videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 sm:self-center">Buka video <ExternalLink aria-hidden="true" size={14} /></a>}</li>; })}</ul>}</section>
          <aside className="space-y-6"><section className="rc-card p-6"><div className="flex items-center gap-3"><span className="rc-stat-icon bg-indigo-50 text-indigo-700"><CalendarDays size={19} /></span><div><h2 className="font-extrabold text-slate-950">Jadwal kelas</h2><p className="text-xs text-slate-500">Pertemuan mendatang</p></div></div><div className="mt-5 space-y-3">{schedules.length === 0 ? <p className="text-sm text-slate-500">Jadwal belum tersedia.</p> : schedules.slice(0, 4).map((schedule, index) => <div key={`${schedule.title}-${index}`} className="rounded-2xl bg-slate-50 p-3"><p className="text-sm font-bold text-slate-800">{schedule.title}</p><p className="mt-1 text-xs text-slate-500">{formatDate(schedule.date)}{schedule.time ? ` · ${schedule.time}` : ''}</p>{safeExternalUrl(schedule.meet_link) && <a href={safeExternalUrl(schedule.meet_link)!} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-bold text-blue-700">Buka meeting</a>}</div>)}</div></section><section className="rc-card p-6"><div className="flex items-center gap-3"><span className="rc-stat-icon bg-amber-50 text-amber-700"><MessageSquareText size={19} /></span><div><h2 className="font-extrabold text-slate-950">Pengumuman</h2><p className="text-xs text-slate-500">Info dari mentor</p></div></div><div className="mt-5 space-y-3">{data.announcements.length === 0 ? <p className="text-sm text-slate-500">Belum ada pengumuman.</p> : data.announcements.slice(0, 3).map((announcement) => <article key={String(announcement.id)} className="rounded-2xl border border-slate-100 p-3"><p className="text-sm font-bold text-slate-800">{String(announcement.title ?? 'Pengumuman')}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{String(announcement.summary ?? announcement.content ?? '')}</p></article>)}</div></section></aside>
        </div>
      )}

      {activeTab === 'students' && viewer.isAdmin && <div className="space-y-6"><section className="rc-card overflow-hidden"><PanelHeading icon={<Users size={21} />} eyebrow="Bootcamp roster" title="Active students" description="Akun dan profile tetap terhubung ke Auth yang sudah ada." />{activeStudents.length === 0 ? <EmptyState icon={<Users size={27} />} title="Belum ada siswa" description="Pendaftaran siswa akan memakai akun Auth yang telah ada." /> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-[0.14em] text-slate-500"><tr><th className="px-6 py-4 sm:px-8">Siswa</th><th className="px-6 py-4 sm:px-8">Grup</th><th className="px-6 py-4 sm:px-8">Credential</th><th className="px-6 py-4 sm:px-8">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{activeStudents.map((student) => { const profile = profileOf(student); return <tr key={String(student.id)} className="transition hover:bg-slate-50/70"><td className="px-6 py-4 sm:px-8"><p className="font-bold text-slate-800">{profile.full_name}</p><p className="mt-1 text-xs text-slate-500">{profile.username}</p></td><td className="px-6 py-4 text-slate-600 sm:px-8">{String(student.group_name ?? 'Belum dikelompokkan')}</td><td className="px-6 py-4 text-slate-600 sm:px-8">{String(student.credential_no ?? '—')}</td><td className="px-6 py-4 sm:px-8"><span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700"><Trophy size={14} /> Terdaftar</span></td></tr>; })}</tbody></table></div>}</section><BootcampGroupManager workspaceId={data.batch.id} groups={data.assignmentGroups} students={data.students} /></div>}

      {activeTab === 'board' && (viewer.isAdmin ? <BootcampAnnouncementManager workspaceId={data.batch.id} announcements={data.announcements} /> : <section className="rc-card overflow-hidden"><PanelHeading icon={<MessageSquareText size={21} />} title="Community Board" description="Informasi terbaru dari mentor dan admin." /><div className="space-y-3 p-6 sm:p-8">{data.announcements.length === 0 ? <EmptyState icon={<MessageSquareText size={27} />} title="Belum ada pengumuman" description="Pengumuman batch akan muncul di sini." /> : data.announcements.map((announcement) => <article key={String(announcement.id)} className="rounded-2xl border border-slate-200 p-5"><p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">{String(announcement.category ?? 'announcement')}</p><h3 className="mt-2 font-extrabold text-slate-900">{String(announcement.title ?? 'Pengumuman')}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{String(announcement.content ?? announcement.summary ?? '')}</p></article>)}</div></section>)}

      {activeTab === 'assignments' && (viewer.isAdmin ? <div className="space-y-6"><BootcampCurriculumManager workspaceId={data.batch.id} curriculum={data.curriculum} /><section className="rc-card p-6 sm:p-8"><div className="flex items-center gap-3"><span className="rc-stat-icon bg-blue-50 text-blue-700"><ClipboardList size={20} /></span><div><h2 className="font-extrabold text-slate-950">Assignment coverage</h2><p className="text-sm text-slate-500">{assessmentCount} assessment tersimpan di batch ini.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Total materi</p><p className="mt-1 text-2xl font-black text-slate-900">{lessonCount}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Assessment</p><p className="mt-1 text-2xl font-black text-slate-900">{assessmentCount}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Submission</p><p className="mt-1 text-2xl font-black text-slate-900">{data.submissions.length}</p></div></div></section></div> : <AssignmentSubmissionForm workspaceId={data.batch.id} curriculum={data.curriculum} submissions={data.submissions} />)}

      {activeTab === 'grades' && (viewer.isAdmin ? <div className="space-y-6"><section className="rc-card overflow-hidden"><PanelHeading icon={<Award size={21} />} eyebrow="Read-only historical matrix" title="Grading matrix" description="Skor dan status yang sudah tersimpan ditampilkan apa adanya. Nilai historis tidak dihitung ulang." />{data.students.length === 0 ? <EmptyState icon={<UsersRound size={27} />} title="Belum ada peserta untuk dinilai" description="Matriks akan memakai submission dan hasil quiz historis ketika peserta tersedia." /> : <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3 sm:p-8">{data.students.map((student) => { const profile = profileOf(student); const profileId = String(student.profile_id); const submissions = data.submissions.filter((submission) => String(submission.profile_id) === profileId); const quizResults = data.quizResults.filter((result) => String(result.profile_id) === profileId); const gradedSubmissions = submissions.filter((submission) => Number.isFinite(Number(submission.grade))); const feedbackCount = submissions.filter((submission) => Boolean(submission.mentor_feedback)).length; return <article key={String(student.id)} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-extrabold text-slate-900">{profile.full_name}</h3><p className="mt-1 text-xs text-slate-500">{profile.username} · {String(student.group_name ?? 'Tanpa grup')}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{submissions.length} tugas</span></div><dl className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Tugas dinilai</dt><dd className="mt-1 text-lg font-extrabold text-slate-900">{gradedSubmissions.length}/{submissions.length}</dd></div><div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Post-test</dt><dd className="mt-1 text-lg font-extrabold text-slate-900">{quizResults.length}</dd></div><div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Feedback</dt><dd className="mt-1 text-lg font-extrabold text-slate-900">{feedbackCount}</dd></div><div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Hadir</dt><dd className="mt-1 text-lg font-extrabold text-slate-900">{recordEntries(student.attendance).filter(([, value]) => value === 'P').length}</dd></div></dl><div className="mt-4 flex flex-wrap gap-2">{gradedSubmissions.slice(0, 3).map((submission) => <span key={String(submission.id)} className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-800">{scoreLabel(submission.grade)}</span>)}{quizResults.slice(0, 2).map((result) => <span key={String(result.id)} className="rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-800">Quiz {scoreLabel(result.score)}</span>)}{gradedSubmissions.length === 0 && quizResults.length === 0 && <span className="text-xs text-slate-400">Belum ada nilai tersimpan.</span>}</div></article>; })}</div>}</section><SubmissionGradeEditor workspaceId={data.batch.id} submissions={data.submissions} curriculum={data.curriculum} /></div> : <section className="rc-card overflow-hidden"><PanelHeading icon={<BarChart4 size={21} />} title="Hasil pembelajaran saya" description="Nilai, status, feedback, dan quiz result yang tersimpan." /><div className="grid gap-6 p-6 lg:grid-cols-2 sm:p-8"><div><h3 className="text-sm font-extrabold text-slate-950">Submission tersimpan</h3><div className="mt-3 space-y-3">{data.submissions.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Belum ada submission.</p> : data.submissions.map((submission) => { const curriculum = data.curriculum.find((item) => String(item.id) === String(submission.curriculum_id)); const fileUrl = safeExternalUrl(submission.file_link); return <article key={String(submission.id)} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold text-slate-900">{String(curriculum?.title ?? 'Tugas')}</p><p className="mt-1 text-xs text-slate-500">Status: {String(submission.status ?? 'belum diproses')}</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-800">{scoreLabel(submission.grade)}</span></div>{Boolean(submission.mentor_feedback) && <p className="mt-3 whitespace-pre-wrap rounded-xl bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-950"><span className="font-extrabold">Feedback mentor: </span>{String(submission.mentor_feedback)}</p>}{fileUrl && <a href={fileUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-700">Buka submission <ExternalLink size={13} aria-hidden="true" /></a>}</article>; })}</div></div><div><h3 className="text-sm font-extrabold text-slate-950">Hasil post-test</h3><div className="mt-3 space-y-3">{data.quizResults.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Belum ada hasil quiz.</p> : data.quizResults.map((result) => { const curriculum = data.curriculum.find((item) => String(item.id) === String(result.curriculum_id)); return <article key={String(result.id)} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"><div className="min-w-0"><p className="truncate font-bold text-slate-900">{String(curriculum?.title ?? 'Post-test')}</p><p className="mt-1 text-xs text-slate-500">{formatDate(result.created_at)}</p></div><span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-extrabold text-indigo-800">{scoreLabel(result.score)}</span></article>; })}</div></div></div></section>)}

      {activeTab === 'attendance' && (viewer.isAdmin ? <div className="space-y-6"><section className="rc-card overflow-hidden"><PanelHeading icon={<CheckCircle2 size={21} />} title="Riwayat absensi" description="Data attendance tetap dibaca dari histori Bootcamp yang sudah tersimpan." /><div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 sm:p-8">{activeStudents.map((student) => { const profile = profileOf(student); const present = recordEntries(student.attendance).filter(([, value]) => value === 'P').length; const total = recordEntries(student.attendance).length; return <article key={String(student.id)} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-extrabold text-slate-900">{profile.full_name}</h3><p className="mt-1 text-xs text-slate-500">{profile.username}</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">{present}/{total}</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${total ? Math.min(100, (present / total) * 100) : 0}%` }} /></div></article>; })}</div></section><BootcampMembershipManager workspaceId={data.batch.id} students={data.students} /></div> : <section className="rc-card overflow-hidden"><PanelHeading icon={<CheckCircle2 size={21} />} title="Absensi saya" description="Status attendance yang tersimpan pada membership Bootcamp Anda." /><div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3 sm:p-8">{recordEntries(data.membership?.attendance).length === 0 ? <EmptyState icon={<CalendarDays size={27} />} title="Absensi belum dicatat" description="Riwayat kehadiran akan muncul setelah admin mengisinya." /> : recordEntries(data.membership?.attendance).map(([date, status]) => <div key={date} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"><span className="font-semibold text-slate-700">{date}</span><span className="font-extrabold text-slate-900">{String(status)}</span></div>)}</div></section>)}

      {!viewer.isAdmin && activeTab === 'learning' && <QuizAttemptForm workspaceId={data.batch.id} curriculum={data.curriculum} completedCurriculumIds={data.quizResults.map((result) => String(result.curriculum_id))} />}
    </section>
  );
}
