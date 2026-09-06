import Link from 'next/link';
import { ArrowRight, BookOpen, CalendarDays, GraduationCap, Users, Video } from 'lucide-react';
import { EmptyState } from '@/components/app/EmptyState';
import { PageHeader } from '@/components/app/PageHeader';
import { StatusBadge } from '@/components/app/StatusBadge';
import type { Viewer } from '@/lib/auth/context';
import type { BootcampBatch, BootcampMembership } from '@/lib/bootcamp/queries';

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function BatchCard({ batch, students, href, actionLabel }: { batch: BootcampBatch; students: number; href: string; actionLabel: string }) {
  const startDate = formatDate(batch.start_date);
  const endDate = formatDate(batch.end_date);
  const period = startDate && endDate ? `${startDate} — ${endDate}` : startDate || endDate || 'Periode belum diatur';

  return (
    <article className="rc-card group flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700"><GraduationCap aria-hidden="true" size={24} /></span>
        <StatusBadge status={batch.status} />
      </div>
      <div className="mt-6 flex-1 space-y-2">
        <h2 className="text-lg font-extrabold tracking-tight text-slate-950">{batch.name}</h2>
        <p className="line-clamp-2 text-sm leading-6 text-slate-500">{batch.description || 'Deskripsi batch belum diatur.'}</p>
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-3 border-y border-slate-100 py-4 text-xs text-slate-500">
        <div className="flex items-center gap-2"><CalendarDays aria-hidden="true" size={15} className="text-teal-600" /><span className="line-clamp-2">{period}</span></div>
        <div className="flex items-center gap-2"><Users aria-hidden="true" size={15} className="text-teal-600" /><span>{students} peserta</span></div>
      </dl>
      <Link href={href} className="mt-5 inline-flex items-center justify-between rounded-xl px-1 text-sm font-bold text-teal-700 transition group-hover:text-teal-800">
        {actionLabel}<ArrowRight aria-hidden="true" size={18} />
      </Link>
    </article>
  );
}

export function WorkspaceChooser({ viewer }: { viewer: Viewer }) {
  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Ruang Campus"
        title="Pilih ruang kerja Anda"
        description="Kelola Bootcamp yang sudah berjalan atau bangun pengalaman Webinar LMS publik yang terpisah dan aman."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Link href="/ruang-sosmed/batch" className="rc-selection-card group">
          <span className="rc-selection-icon bg-teal-50 text-teal-700"><GraduationCap aria-hidden="true" size={29} /></span>
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Workspace 01</p>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">Bootcamp Workspace</h2>
            <p className="text-sm leading-6 text-slate-500">Batch, siswa, materi, tugas, penilaian, absensi, grup, dan pengumuman yang tersambung dengan data lama.</p>
          </div>
          <span className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-teal-700">Buka Bootcamp <ArrowRight aria-hidden="true" size={18} /></span>
        </Link>
        <Link href="/admin/webinars" className="rc-selection-card group">
          <span className="rc-selection-icon bg-violet-50 text-violet-700"><Video aria-hidden="true" size={29} /></span>
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">Workspace 02</p>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">Webinar LMS</h2>
            <p className="text-sm leading-6 text-slate-500">Susun pembelajaran publik dengan section, lesson, video, resource, preview, dan link pendek yang stabil.</p>
          </div>
          <span className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-violet-700">Kelola Webinar <ArrowRight aria-hidden="true" size={18} /></span>
        </Link>
      </div>
      <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500">Masuk sebagai {viewer.fullName || viewer.email || 'administrator'}. Data lama yang tidak termasuk ruang belajar aktif tetap disimpan sebagai arsip.</p>
    </section>
  );
}

export function BootcampDashboard({
  viewer,
  batches,
  memberships,
  studentCounts,
}: {
  viewer: Viewer;
  batches: BootcampBatch[];
  memberships: BootcampMembership[];
  studentCounts: Map<string, number>;
}) {
  const memberWorkspaceIds = new Set(memberships.map((membership) => membership.workspace_id));
  const visibleBatches = viewer.isAdmin ? batches : batches.filter((batch) => memberWorkspaceIds.has(batch.id));
  const greeting = viewer.fullName?.split(' ')[0] || 'selamat datang';

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow={viewer.isAdmin ? 'Admin workspace' : 'Ruang belajar saya'}
        title={viewer.isAdmin ? 'Bootcamp Workspace' : `Halo, ${greeting}`}
        description={viewer.isAdmin ? 'Pantau batch aktif dan lanjutkan pengelolaan pembelajaran tanpa mengubah data historis.' : 'Lanjutkan materi, cek tugas, nilai, jadwal, dan aktivitas Bootcamp Anda.'}
        action={viewer.isAdmin ? <Link href="/ruang-sosmed/batch" className="rc-button rc-button-primary">Kelola batch <ArrowRight aria-hidden="true" size={17} /></Link> : undefined}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rc-stat-card"><span className="rc-stat-icon bg-teal-50 text-teal-700"><GraduationCap size={20} aria-hidden="true" /></span><div><p>Batch tersedia</p><strong>{visibleBatches.length}</strong></div></div>
        <div className="rc-stat-card"><span className="rc-stat-icon bg-indigo-50 text-indigo-700"><BookOpen size={20} aria-hidden="true" /></span><div><p>{viewer.isAdmin ? 'Peserta tercatat' : 'Keanggotaan aktif'}</p><strong>{viewer.isAdmin ? Array.from(studentCounts.values()).reduce((sum, count) => sum + count, 0) : memberships.length}</strong></div></div>
        <div className="rc-stat-card sm:col-span-2 xl:col-span-1"><span className="rc-stat-icon bg-amber-50 text-amber-700"><CalendarDays size={20} aria-hidden="true" /></span><div><p>Data historis</p><strong>Tetap utuh</strong></div></div>
      </div>

      {visibleBatches.length === 0 ? (
        <EmptyState icon={<BookOpen size={28} />} title={viewer.isAdmin ? 'Belum ada batch Bootcamp' : 'Anda belum terdaftar di batch'} description={viewer.isAdmin ? 'Buat batch melalui menu Bootcamp setelah migrasi keamanan diterapkan.' : 'Hubungi admin jika Anda seharusnya sudah terdaftar pada batch tertentu.'} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleBatches.map((batch) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              students={studentCounts.get(batch.id) ?? 0}
              href={viewer.isAdmin ? `/ruang-sosmed/batch/${batch.id}` : `/ruang-sosmed/${batch.id}`}
              actionLabel={viewer.isAdmin ? 'Kelola batch' : 'Buka kelas'}
            />
          ))}
        </div>
      )}
    </section>
  );
}
