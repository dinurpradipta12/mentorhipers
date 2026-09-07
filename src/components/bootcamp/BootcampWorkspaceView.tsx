'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  BarChart4,
  BellRing,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  ExternalLink,
  Layout,
  MessageSquareText,
  Pencil,
  PlayCircle,
  Plus,
  Send,
  Settings2,
  UserPlus,
  Users,
  UsersRound,
  Zap,
} from 'lucide-react';
import { EmptyState } from '@/components/app/EmptyState';
import { StatusBadge } from '@/components/app/StatusBadge';
import { WorkspaceModal } from '@/components/app/WorkspaceModal';
import { AssignmentSubmissionForm } from '@/components/bootcamp/AssignmentSubmissionForm';
import { BootcampAnnouncementManager } from '@/components/bootcamp/BootcampAnnouncementManager';
import { BootcampCurriculumManager } from '@/components/bootcamp/BootcampCurriculumManager';
import { BootcampGroupManager } from '@/components/bootcamp/BootcampGroupManager';
import { BootcampMembershipManager } from '@/components/bootcamp/BootcampMembershipManager';
import { BootcampStudentRegistrationForm } from '@/components/bootcamp/BootcampStudentRegistrationForm';
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
type ModalId = 'register' | 'groups' | 'membership' | 'curriculum' | 'announcement' | 'grading' | 'submission' | 'quiz' | null;

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

function videoSource(value: unknown): { kind: 'iframe' | 'video' | 'link'; url: string } | null {
  const safeUrl = safeExternalUrl(value);
  if (!safeUrl) return null;
  const url = new URL(safeUrl);
  const hostname = url.hostname.toLowerCase().replace(/^www\./, '');

  if (hostname === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    if (id) return { kind: 'iframe', url: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` };
  }
  if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
    const segments = url.pathname.split('/').filter(Boolean);
    const id = url.searchParams.get('v') || (['embed', 'shorts'].includes(segments[0]) ? segments[1] : null);
    if (id) return { kind: 'iframe', url: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` };
  }
  if (hostname === 'vimeo.com' || hostname === 'player.vimeo.com') {
    const id = url.pathname.split('/').filter(Boolean).find((segment) => /^\d+$/.test(segment));
    if (id) return { kind: 'iframe', url: `https://player.vimeo.com/video/${id}` };
  }
  if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) return { kind: 'video', url: safeUrl };
  return { kind: 'link', url: safeUrl };
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
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { full_name: 'Profil tanpa nama', username: '—' };
  }
  const profile = value as Record<string, unknown>;
  return {
    full_name: typeof profile.full_name === 'string' ? profile.full_name : 'Profil tanpa nama',
    username: typeof profile.username === 'string' ? profile.username : '—',
  };
}

function PanelHeading({ icon, eyebrow, title, description, action }: {
  icon: React.ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-slate-100 px-6 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-8">
      <div className="flex min-w-0 items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600">{icon}</span>
        <div>
          {eyebrow && <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-500">{eyebrow}</p>}
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">{title}</h2>
          {description && <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function TabButton({ active, icon, label, onClick }: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-2xl px-5 py-3 text-xs font-black transition-all sm:px-7 sm:py-4 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
    >
      {icon}{label}
    </button>
  );
}

function ManagementCard({ icon, title, description, label, onClick, tone = 'blue' }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  label: string;
  onClick: () => void;
  tone?: 'blue' | 'violet' | 'amber';
}) {
  const toneClass = {
    blue: 'bg-blue-50 text-blue-700',
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
  }[tone];
  return (
    <article className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/50">
      <span className={`grid h-11 w-11 place-items-center rounded-2xl ${toneClass}`}>{icon}</span>
      <h3 className="mt-4 font-extrabold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      <button type="button" onClick={onClick} className="mt-4 inline-flex items-center gap-2 text-xs font-black text-blue-700 transition hover:text-blue-950">
        {label}<ArrowLeft className="rotate-180" size={14} aria-hidden="true" />
      </button>
    </article>
  );
}

export function BootcampWorkspaceView({ viewer, data }: { viewer: Viewer; data: WorkspaceData }) {
  const schedules = normalizeSchedules(data.batch.schedules);
  const activeStudents = data.students.filter((student) => student.role !== 'removed');
  const materials = data.curriculum.filter((item) => item.type === 'material');
  const assessments = data.curriculum.filter((item) => item.type !== 'material');
  const completedCount = data.submissions.filter((item) => item.status === 'completed').length + data.quizResults.length;
  const attendanceCount = Object.values(data.membership?.attendance ?? {}).filter((value) => value === 'P').length;
  const [activeTab, setActiveTab] = useState<TabId>(viewer.isAdmin ? 'students' : 'learning');
  const [activeModal, setActiveModal] = useState<ModalId>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState(() => String(materials[0]?.id ?? ''));
  const selectedLesson = materials.find((item) => String(item.id) === selectedLessonId) ?? materials[0] ?? null;
  const selectedVideo = videoSource(selectedLesson?.video_url);
  const closeModal = useCallback(() => setActiveModal(null), []);

  function manageStudent(studentId?: string) {
    setSelectedStudentId(studentId ?? null);
    setActiveModal('membership');
  }

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
          <div className="relative z-10 flex flex-wrap items-center gap-3 xl:mb-1">
            <StatusBadge status={data.batch.status} />
            {viewer.isAdmin && <button type="button" onClick={() => setActiveModal('register')} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-black text-blue-800 shadow-lg shadow-blue-950/10 transition hover:bg-blue-50"><UserPlus size={16} aria-hidden="true" /> Tambah siswa</button>}
            {viewer.isAdmin && <button type="button" onClick={() => setActiveModal('curriculum')} className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-black text-white transition hover:bg-white/20"><Plus size={16} aria-hidden="true" /> Materi LMS</button>}
          </div>
        </div>
      </header>

      <div className="-mx-1 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Navigasi batch">
        <div className="mx-auto flex w-max gap-1 rounded-[2rem] border border-slate-100 bg-white/90 p-2 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
          {tabs.map((tab) => <TabButton key={tab.id} active={activeTab === tab.id} icon={tab.icon} label={tab.label} onClick={() => setActiveTab(tab.id)} />)}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rc-stat-card"><span className="rc-stat-icon bg-blue-50 text-blue-700"><BookOpen size={20} /></span><div><p>Materi</p><strong>{materials.length}</strong></div></div>
        <div className="rc-stat-card"><span className="rc-stat-icon bg-violet-50 text-violet-700"><ClipboardList size={20} /></span><div><p>Assessment</p><strong>{assessments.length}</strong></div></div>
        <div className="rc-stat-card"><span className="rc-stat-icon bg-amber-50 text-amber-700"><CheckCircle2 size={20} /></span><div><p>{viewer.isAdmin ? 'Peserta aktif' : 'Selesai'}</p><strong>{viewer.isAdmin ? activeStudents.length : completedCount}</strong></div></div>
        <div className="rc-stat-card"><span className="rc-stat-icon bg-rose-50 text-rose-700"><CalendarDays size={20} /></span><div><p>{viewer.isAdmin ? 'Jadwal' : 'Kehadiran'}</p><strong>{viewer.isAdmin ? schedules.length : attendanceCount}</strong></div></div>
      </div>

      {activeTab === 'students' && viewer.isAdmin && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rc-card overflow-hidden">
            <PanelHeading icon={<Users size={21} />} eyebrow="Bootcamp roster" title="Active students" description="Daftar ringkas siswa. Perubahan profile dan akses dibuka dalam modal agar halaman tetap fokus." action={<button type="button" onClick={() => setActiveModal('register')} className="rc-button rc-button-primary"><UserPlus size={16} aria-hidden="true" /> Tambah siswa</button>} />
            {activeStudents.length === 0 ? <EmptyState icon={<Users size={27} />} title="Belum ada siswa" description="Daftarkan profile lama atau buat akun Auth siswa melalui tombol Tambah siswa." /> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.14em] text-slate-500"><tr><th className="px-6 py-4 sm:px-8">Siswa</th><th className="px-6 py-4">Grup</th><th className="px-6 py-4">Credential</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right sm:px-8">Aksi</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeStudents.map((student) => {
                      const profile = profileOf(student);
                      return <tr key={String(student.id)} className="transition hover:bg-slate-50/70"><td className="px-6 py-4 sm:px-8"><p className="font-bold text-slate-800">{profile.full_name}</p><p className="mt-1 text-xs text-slate-500">{profile.username}</p></td><td className="px-6 py-4 text-slate-600">{String(student.group_name ?? 'Belum dikelompokkan')}</td><td className="px-6 py-4 text-slate-600">{String(student.credential_no ?? '—')}</td><td className="px-6 py-4"><span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700"><CheckCircle2 size={14} /> Aktif</span></td><td className="px-6 py-4 text-right sm:px-8"><button type="button" onClick={() => manageStudent(String(student.id))} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 transition hover:border-blue-300 hover:text-blue-700"><Pencil size={14} aria-hidden="true" /> Kelola</button></td></tr>;
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <aside className="space-y-4">
            <ManagementCard icon={<UsersRound size={20} />} title="Kelola grup" description="Atur anggota, ketua, dan tautan WhatsApp grup." label="Buka pengaturan grup" onClick={() => setActiveModal('groups')} tone="violet" />
            <ManagementCard icon={<Settings2 size={20} />} title="Profile & credential" description="Ubah profile, credential, sertifikat, plus points, dan akses siswa." label="Kelola data siswa" onClick={() => manageStudent()} />
            <div className="rounded-[1.75rem] bg-slate-950 p-5 text-white"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Kapasitas batch</p><p className="mt-3 text-3xl font-black">{activeStudents.length}<span className="text-base text-slate-500">/{data.batch.max_members || '∞'}</span></p><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-sky-400" style={{ width: `${data.batch.max_members ? Math.min(100, (activeStudents.length / Number(data.batch.max_members)) * 100) : 0}%` }} /></div></div>
          </aside>
        </div>
      )}

      {activeTab === 'learning' && (
        <div className="space-y-6">
          <section className="rc-card overflow-hidden">
            <PanelHeading icon={<PlayCircle size={21} />} eyebrow="Learning journey" title="Materi LMS" description="Pilih lesson dari Course Journey. Pengelolaan konten tetap berada di modal terpisah." action={viewer.isAdmin ? <button type="button" onClick={() => setActiveModal('curriculum')} className="rc-button rc-button-primary"><Plus size={16} aria-hidden="true" /> Kelola materi</button> : undefined} />
            {materials.length === 0 ? <EmptyState icon={<BookOpen size={27} />} title="Belum ada materi" description={viewer.isAdmin ? 'Tambahkan materi melalui tombol Kelola materi.' : 'Materi akan muncul setelah dipublikasikan mentor.'} /> : (
              <div className="grid xl:grid-cols-[minmax(0,1.5fr)_360px]">
                <div className="min-w-0 border-b border-slate-100 p-5 sm:p-8 xl:border-b-0 xl:border-r">
                  <div className="relative aspect-video overflow-hidden rounded-[1.75rem] bg-slate-950 shadow-xl shadow-slate-950/15">
                    {selectedVideo?.kind === 'iframe' && <iframe className="h-full w-full" src={selectedVideo.url} title={`Video ${String(selectedLesson?.title ?? 'materi')}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
                    {selectedVideo?.kind === 'video' && <video className="h-full w-full bg-black" controls preload="metadata" src={selectedVideo.url} aria-label={`Video ${String(selectedLesson?.title ?? 'materi')}`} />}
                    {(!selectedVideo || selectedVideo.kind === 'link') && <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white"><span className="grid h-16 w-16 place-items-center rounded-full bg-white/10"><PlayCircle size={32} aria-hidden="true" /></span><p className="mt-4 font-extrabold">{selectedVideo ? 'Video dibuka pada sumber eksternal' : 'Video belum tersedia'}</p>{selectedVideo?.kind === 'link' && <a href={selectedVideo.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-black text-slate-950">Buka video <ExternalLink size={14} aria-hidden="true" /></a>}</div>}
                  </div>
                  <p className="mt-6 text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">{String(selectedLesson?.module_name ?? 'Course lesson')}</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{String(selectedLesson?.title ?? 'Materi')}</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{String(selectedLesson?.description ?? selectedLesson?.content_rich ?? 'Belum ada deskripsi lesson.')}</p>
                </div>
                <aside className="min-w-0 bg-slate-50/70 p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Course journey</p><h3 className="mt-1 font-extrabold text-slate-950">{materials.length} lesson</h3></div>{viewer.isAdmin && <button type="button" onClick={() => setActiveModal('curriculum')} aria-label="Tambah atau kelola materi" className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><Plus size={17} aria-hidden="true" /></button>}</div>
                  <div className="mt-5 space-y-2">
                    {materials.map((item, index) => {
                      const id = String(item.id);
                      const active = String(selectedLesson?.id) === id;
                      return <button key={id} type="button" onClick={() => setSelectedLessonId(id)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${active ? 'border-blue-200 bg-white shadow-sm' : 'border-transparent hover:border-slate-200 hover:bg-white/70'}`}><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-black ${active ? 'bg-blue-600 text-white' : 'bg-white text-slate-500'}`}>{String(index + 1).padStart(2, '0')}</span><span className="min-w-0 flex-1"><span className={`block truncate text-sm font-extrabold ${active ? 'text-blue-950' : 'text-slate-700'}`}>{String(item.title ?? 'Tanpa judul')}</span><span className="mt-1 block truncate text-[11px] text-slate-400">{String(item.module_name ?? 'Lesson')}</span></span>{active && <PlayCircle className="shrink-0 text-blue-600" size={17} aria-hidden="true" />}</button>;
                    })}
                  </div>
                </aside>
              </div>
            )}
          </section>
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rc-card p-6"><div className="flex items-center gap-3"><span className="rc-stat-icon bg-indigo-50 text-indigo-700"><CalendarDays size={19} /></span><div><h2 className="font-extrabold text-slate-950">Jadwal kelas</h2><p className="text-xs text-slate-500">Pertemuan mendatang</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{schedules.length === 0 ? <p className="text-sm text-slate-500">Jadwal belum tersedia.</p> : schedules.slice(0, 4).map((schedule, index) => <div key={`${schedule.title}-${index}`} className="rounded-2xl bg-slate-50 p-3"><p className="text-sm font-bold text-slate-800">{schedule.title}</p><p className="mt-1 text-xs text-slate-500">{formatDate(schedule.date)}{schedule.time ? ` · ${schedule.time}` : ''}</p>{safeExternalUrl(schedule.meet_link) && <a href={safeExternalUrl(schedule.meet_link)!} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-bold text-blue-700">Buka meeting</a>}</div>)}</div></section>
            <section className="rc-card p-6"><div className="flex items-center gap-3"><span className="rc-stat-icon bg-amber-50 text-amber-700"><MessageSquareText size={19} /></span><div><h2 className="font-extrabold text-slate-950">Pengumuman</h2><p className="text-xs text-slate-500">Info dari mentor</p></div></div><div className="mt-5 space-y-3">{data.announcements.length === 0 ? <p className="text-sm text-slate-500">Belum ada pengumuman.</p> : data.announcements.slice(0, 3).map((announcement) => <article key={String(announcement.id)} className="rounded-2xl border border-slate-100 p-3"><p className="text-sm font-bold text-slate-800">{String(announcement.title ?? 'Pengumuman')}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{String(announcement.summary ?? announcement.content ?? '')}</p></article>)}</div></section>
          </div>
          {!viewer.isAdmin && assessments.some((item) => item.type === 'post_test') && <section className="flex flex-col gap-4 rounded-[2rem] bg-indigo-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-300">Post-test</p><h2 className="mt-1 text-xl font-black">Uji pemahaman materi</h2><p className="mt-1 text-sm text-indigo-200">Post-test dibuka dalam modal agar perjalanan belajar tidak terputus.</p></div><button type="button" onClick={() => setActiveModal('quiz')} className="rc-button bg-white text-indigo-950 hover:bg-indigo-50"><PlayCircle size={17} aria-hidden="true" /> Kerjakan post-test</button></section>}
        </div>
      )}

      {activeTab === 'board' && (
        <section className="rc-card overflow-hidden">
          <PanelHeading icon={<MessageSquareText size={21} />} eyebrow="Community board" title="Pengumuman batch" description="Informasi terbaru dari mentor dan admin ditampilkan sebagai daftar yang mudah dipindai." action={viewer.isAdmin ? <button type="button" onClick={() => setActiveModal('announcement')} className="rc-button rc-button-primary"><BellRing size={16} aria-hidden="true" /> Kelola pengumuman</button> : undefined} />
          <div className="grid gap-4 p-6 md:grid-cols-2 sm:p-8">
            {data.announcements.length === 0 ? <div className="md:col-span-2"><EmptyState icon={<MessageSquareText size={27} />} title="Belum ada pengumuman" description={viewer.isAdmin ? 'Buat pengumuman melalui tombol Kelola pengumuman.' : 'Pengumuman batch akan muncul di sini.'} /></div> : data.announcements.map((announcement) => <article key={String(announcement.id)} className="rounded-[1.5rem] border border-slate-200 p-5 transition hover:border-blue-200 hover:shadow-sm"><div className="flex items-center justify-between gap-3"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-600">{String(announcement.category ?? 'announcement')}</p>{announcement.is_pinned === true && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700">Pinned</span>}</div><h3 className="mt-3 font-extrabold text-slate-900">{String(announcement.title ?? 'Pengumuman')}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{String(announcement.content ?? announcement.summary ?? '')}</p></article>)}
          </div>
        </section>
      )}

      {activeTab === 'assignments' && (
        <section className="rc-card overflow-hidden">
          <PanelHeading icon={<ClipboardList size={21} />} eyebrow={viewer.isAdmin ? 'Assessment management' : 'Student assignments'} title={viewer.isAdmin ? 'Tugas & post-test' : 'My assignments'} description={viewer.isAdmin ? 'Daftar assessment tetap ringkas; editor dibuka hanya ketika diperlukan.' : 'Pilih tugas yang ingin dikerjakan, lalu kirim melalui modal submission.'} action={viewer.isAdmin ? <button type="button" onClick={() => setActiveModal('curriculum')} className="rc-button rc-button-primary"><Plus size={16} aria-hidden="true" /> Kelola tugas</button> : assessments.length > 0 ? <button type="button" onClick={() => setActiveModal('submission')} className="rc-button rc-button-primary"><Send size={16} aria-hidden="true" /> Kumpulkan tugas</button> : undefined} />
          {assessments.length === 0 ? <EmptyState icon={<ClipboardList size={27} />} title="Belum ada assessment" description={viewer.isAdmin ? 'Tambahkan assignment, challenge, atau post-test melalui Kelola tugas.' : 'Tugas akan muncul setelah dipublikasikan mentor.'} /> : (
            <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3 sm:p-8">
              {assessments.map((item) => {
                const type = String(item.type ?? 'assignment');
                const relatedSubmissions = data.submissions.filter((submission) => String(submission.curriculum_id) === String(item.id));
                const relatedQuiz = data.quizResults.filter((result) => String(result.curriculum_id) === String(item.id));
                return <article key={String(item.id)} className="flex flex-col rounded-[1.5rem] border border-slate-200 p-5"><div className="flex items-start justify-between gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-50 text-violet-700"><ClipboardList size={19} aria-hidden="true" /></span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">{curriculumKind(type)}</span></div><h3 className="mt-4 font-extrabold text-slate-950">{String(item.title ?? 'Tanpa judul')}</h3><p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-500">{String(item.description ?? 'Tidak ada deskripsi.')}</p><div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs"><span className="text-slate-500">Deadline: {formatDate(item.due_date)}</span><span className="font-black text-slate-800">{type === 'post_test' ? relatedQuiz.length : relatedSubmissions.length} {viewer.isAdmin ? 'hasil' : 'terkirim'}</span></div>{!viewer.isAdmin && <button type="button" onClick={() => setActiveModal(type === 'post_test' ? 'quiz' : 'submission')} className="mt-4 rc-button rc-button-secondary w-full">{type === 'post_test' ? <><PlayCircle size={16} aria-hidden="true" /> Kerjakan post-test</> : <><Send size={16} aria-hidden="true" /> Buka submission</>}</button>}</article>;
              })}
            </div>
          )}
          {viewer.isAdmin && <div className="grid gap-3 border-t border-slate-100 bg-slate-50/70 p-6 sm:grid-cols-3 sm:px-8"><div className="rounded-2xl bg-white p-4"><p className="text-xs text-slate-500">Materi</p><p className="mt-1 text-2xl font-black text-slate-900">{materials.length}</p></div><div className="rounded-2xl bg-white p-4"><p className="text-xs text-slate-500">Assessment</p><p className="mt-1 text-2xl font-black text-slate-900">{assessments.length}</p></div><div className="rounded-2xl bg-white p-4"><p className="text-xs text-slate-500">Submission</p><p className="mt-1 text-2xl font-black text-slate-900">{data.submissions.length}</p></div></div>}
        </section>
      )}

      {activeTab === 'grades' && (viewer.isAdmin ? (
        <section className="rc-card overflow-hidden">
          <PanelHeading icon={<Award size={21} />} eyebrow="Read-only historical matrix" title="Grading matrix" description="Skor tersimpan ditampilkan apa adanya. Form penilaian dibuka dalam modal dan tidak menghitung ulang nilai historis." action={<button type="button" onClick={() => setActiveModal('grading')} className="rc-button rc-button-primary"><Pencil size={16} aria-hidden="true" /> Buka penilaian</button>} />
          {data.students.length === 0 ? <EmptyState icon={<UsersRound size={27} />} title="Belum ada peserta untuk dinilai" description="Matriks akan memakai submission dan hasil quiz historis ketika peserta tersedia." /> : (
            <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3 sm:p-8">
              {data.students.map((student) => {
                const profile = profileOf(student);
                const profileId = String(student.profile_id);
                const studentSubmissions = data.submissions.filter((submission) => String(submission.profile_id) === profileId);
                const quizResults = data.quizResults.filter((result) => String(result.profile_id) === profileId);
                const gradedSubmissions = studentSubmissions.filter((submission) => Number.isFinite(Number(submission.grade)));
                const feedbackCount = studentSubmissions.filter((submission) => Boolean(submission.mentor_feedback)).length;
                return <article key={String(student.id)} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-extrabold text-slate-900">{profile.full_name}</h3><p className="mt-1 text-xs text-slate-500">{profile.username} · {String(student.group_name ?? 'Tanpa grup')}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{studentSubmissions.length} tugas</span></div><dl className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Tugas dinilai</dt><dd className="mt-1 text-lg font-extrabold text-slate-900">{gradedSubmissions.length}/{studentSubmissions.length}</dd></div><div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Post-test</dt><dd className="mt-1 text-lg font-extrabold text-slate-900">{quizResults.length}</dd></div><div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Feedback</dt><dd className="mt-1 text-lg font-extrabold text-slate-900">{feedbackCount}</dd></div><div className="rounded-xl bg-slate-50 p-3"><dt className="text-slate-500">Hadir</dt><dd className="mt-1 text-lg font-extrabold text-slate-900">{recordEntries(student.attendance).filter(([, value]) => value === 'P').length}</dd></div></dl><div className="mt-4 flex flex-wrap gap-2">{gradedSubmissions.slice(0, 3).map((submission) => <span key={String(submission.id)} className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-800">{scoreLabel(submission.grade)}</span>)}{quizResults.slice(0, 2).map((result) => <span key={String(result.id)} className="rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-800">Quiz {scoreLabel(result.score)}</span>)}{gradedSubmissions.length === 0 && quizResults.length === 0 && <span className="text-xs text-slate-400">Belum ada nilai tersimpan.</span>}</div></article>;
              })}
            </div>
          )}
        </section>
      ) : (
        <section className="rc-card overflow-hidden">
          <PanelHeading icon={<BarChart4 size={21} />} title="Hasil pembelajaran saya" description="Nilai, status, feedback, dan quiz result yang tersimpan." />
          <div className="grid gap-6 p-6 lg:grid-cols-2 sm:p-8">
            <div><h3 className="text-sm font-extrabold text-slate-950">Submission tersimpan</h3><div className="mt-3 space-y-3">{data.submissions.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Belum ada submission.</p> : data.submissions.map((submission) => { const curriculum = data.curriculum.find((item) => String(item.id) === String(submission.curriculum_id)); const fileUrl = safeExternalUrl(submission.file_link); return <article key={String(submission.id)} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold text-slate-900">{String(curriculum?.title ?? 'Tugas')}</p><p className="mt-1 text-xs text-slate-500">Status: {String(submission.status ?? 'belum diproses')}</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-800">{scoreLabel(submission.grade)}</span></div>{Boolean(submission.mentor_feedback) && <p className="mt-3 whitespace-pre-wrap rounded-xl bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-950"><span className="font-extrabold">Feedback mentor: </span>{String(submission.mentor_feedback)}</p>}{fileUrl && <a href={fileUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-700">Buka submission <ExternalLink size={13} aria-hidden="true" /></a>}</article>; })}</div></div>
            <div><h3 className="text-sm font-extrabold text-slate-950">Hasil post-test</h3><div className="mt-3 space-y-3">{data.quizResults.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Belum ada hasil quiz.</p> : data.quizResults.map((result) => { const curriculum = data.curriculum.find((item) => String(item.id) === String(result.curriculum_id)); return <article key={String(result.id)} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"><div className="min-w-0"><p className="truncate font-bold text-slate-900">{String(curriculum?.title ?? 'Post-test')}</p><p className="mt-1 text-xs text-slate-500">{formatDate(result.created_at)}</p></div><span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-extrabold text-indigo-800">{scoreLabel(result.score)}</span></article>; })}</div></div>
          </div>
        </section>
      ))}

      {activeTab === 'attendance' && (viewer.isAdmin ? (
        <section className="rc-card overflow-hidden">
          <PanelHeading icon={<CheckCircle2 size={21} />} title="Riwayat absensi" description="Data attendance dibaca dari histori Bootcamp. Editor detail dibuka dalam modal siswa." action={<button type="button" onClick={() => manageStudent()} className="rc-button rc-button-primary"><Pencil size={16} aria-hidden="true" /> Kelola absensi</button>} />
          {activeStudents.length === 0 ? <EmptyState icon={<CalendarDays size={27} />} title="Belum ada siswa" description="Riwayat kehadiran akan muncul setelah siswa terdaftar." /> : <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 sm:p-8">{activeStudents.map((student) => { const profile = profileOf(student); const present = recordEntries(student.attendance).filter(([, value]) => value === 'P').length; const total = recordEntries(student.attendance).length; return <button key={String(student.id)} type="button" onClick={() => manageStudent(String(student.id))} className="rounded-2xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-extrabold text-slate-900">{profile.full_name}</h3><p className="mt-1 text-xs text-slate-500">{profile.username}</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">{present}/{total}</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${total ? Math.min(100, (present / total) * 100) : 0}%` }} /></div><p className="mt-3 text-xs font-bold text-blue-700">Klik untuk kelola</p></button>; })}</div>}
        </section>
      ) : (
        <section className="rc-card overflow-hidden">
          <PanelHeading icon={<CheckCircle2 size={21} />} title="Absensi saya" description="Status attendance yang tersimpan pada membership Bootcamp Anda." />
          <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3 sm:p-8">{recordEntries(data.membership?.attendance).length === 0 ? <div className="sm:col-span-2 lg:col-span-3"><EmptyState icon={<CalendarDays size={27} />} title="Absensi belum dicatat" description="Riwayat kehadiran akan muncul setelah admin mengisinya." /></div> : recordEntries(data.membership?.attendance).map(([date, status]) => <div key={date} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"><span className="font-semibold text-slate-700">{date}</span><span className="font-extrabold text-slate-900">{String(status)}</span></div>)}</div>
        </section>
      ))}

      {viewer.isAdmin && <>
        <WorkspaceModal open={activeModal === 'register'} title="Tambah siswa" onClose={closeModal} width="medium"><BootcampStudentRegistrationForm workspaceId={data.batch.id} batchName={data.batch.name} /></WorkspaceModal>
        <WorkspaceModal open={activeModal === 'groups'} title="Kelola grup siswa" onClose={closeModal} width="wide"><BootcampGroupManager workspaceId={data.batch.id} groups={data.assignmentGroups} students={data.students} /></WorkspaceModal>
        <WorkspaceModal open={activeModal === 'membership'} title="Kelola profile dan akses siswa" onClose={closeModal} width="wide"><BootcampMembershipManager key={selectedStudentId ?? 'membership-manager'} workspaceId={data.batch.id} students={data.students} initialStudentId={selectedStudentId} /></WorkspaceModal>
        <WorkspaceModal open={activeModal === 'curriculum'} title="Kelola materi, tugas, dan post-test" onClose={closeModal} width="wide"><BootcampCurriculumManager workspaceId={data.batch.id} curriculum={data.curriculum} /></WorkspaceModal>
        <WorkspaceModal open={activeModal === 'announcement'} title="Kelola pengumuman batch" onClose={closeModal} width="wide"><BootcampAnnouncementManager workspaceId={data.batch.id} announcements={data.announcements} /></WorkspaceModal>
        <WorkspaceModal open={activeModal === 'grading'} title="Penilaian submission" onClose={closeModal} width="wide"><SubmissionGradeEditor workspaceId={data.batch.id} submissions={data.submissions} curriculum={data.curriculum} /></WorkspaceModal>
      </>}

      {!viewer.isAdmin && <>
        <WorkspaceModal open={activeModal === 'submission'} title="Kumpulkan tugas" onClose={closeModal} width="large"><AssignmentSubmissionForm workspaceId={data.batch.id} curriculum={data.curriculum} submissions={data.submissions} /></WorkspaceModal>
        <WorkspaceModal open={activeModal === 'quiz'} title="Kerjakan post-test" onClose={closeModal} width="large"><QuizAttemptForm workspaceId={data.batch.id} curriculum={data.curriculum} completedCurriculumIds={data.quizResults.map((result) => String(result.curriculum_id))} /></WorkspaceModal>
      </>}
    </section>
  );
}
