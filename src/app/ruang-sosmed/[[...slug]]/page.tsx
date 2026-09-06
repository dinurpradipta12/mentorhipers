export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { RetiredAgencyFeature } from '@/components/agency/RetiredFeature';
import { AppShell } from '@/components/app/AppShell';
import { LoginForm } from '@/components/auth/LoginForm';
import { BootcampDashboard, WorkspaceChooser } from '@/components/bootcamp/BootcampDashboard';
import { BootcampWorkspaceView } from '@/components/bootcamp/BootcampWorkspaceView';
import { QuizTemplatesView } from '@/components/quiz/QuizTemplatesView';
import { getCurrentViewer } from '@/lib/auth/context';
import { getBootcampOverview, getBootcampWorkspace, getQuizTemplates } from '@/lib/bootcamp/queries';

function routePath(slug: string[]) {
  return `/ruang-sosmed${slug.length ? `/${slug.map(encodeURIComponent).join('/')}` : ''}`;
}

function safeNext(value: string | undefined) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/ruang-sosmed';
}

function LoginPage({ nextPath, error }: { nextPath: string; error?: string }) {
  return (
    <main className="rc-login-page">
      <section className="hidden min-h-dvh flex-col justify-between bg-slate-950 p-10 text-white lg:flex">
        <Link href="/" className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-500 text-lg font-black">RC</span><span><span className="block font-extrabold tracking-tight">Ruang Campus</span><span className="text-xs text-slate-400">Platform Edukasi LMS Sosmed</span></span></Link>
        <div className="max-w-md"><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Belajar terarah</p><h1 className="mt-4 text-5xl font-extrabold leading-tight tracking-tight">Satu ruang untuk perjalanan belajar yang nyata.</h1><p className="mt-6 leading-7 text-slate-300">Akses materi, tugas, nilai, absensi, dan komunitas Bootcamp dari akun Supabase Auth Anda yang sudah ada.</p></div>
        <p className="text-xs text-slate-400">Ruang Campus — Platform Edukasi LMS Sosmed</p>
      </section>
      <section className="flex min-h-dvh items-center justify-center bg-[#f7fafc] px-5 py-10 sm:px-8">
        <div className="w-full max-w-md"><Link href="/" className="mb-10 flex items-center gap-3 lg:hidden"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-600 text-lg font-black text-white">RC</span><span><span className="block font-extrabold text-slate-950">Ruang Campus</span><span className="text-xs text-slate-500">Platform Edukasi LMS Sosmed</span></span></Link><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700"><LockKeyhole aria-hidden="true" size={23} /></span><h2 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-950">Masuk ke ruang belajar</h2><p className="mt-2 text-sm leading-6 text-slate-500">Gunakan username atau email yang telah terhubung dengan akun Anda.</p><div className="mt-7"><LoginForm nextPath={nextPath} error={error} /></div></div><p className="mt-6 text-center text-xs leading-5 text-slate-500">Tidak ada akun baru yang dibuat saat login. Jika tidak dapat masuk, hubungi administrator Bootcamp.</p></div>
      </section>
    </main>
  );
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const [{ slug = [] }, query] = await Promise.all([params, searchParams]);

  if (slug[0] === 'agency') return <RetiredAgencyFeature />;

  if (slug[0] === 'login') {
    const viewer = await getCurrentViewer();
    const nextPath = safeNext(query.next);
    if (viewer) redirect(nextPath);
    return <LoginPage nextPath={nextPath} error={query.error} />;
  }

  const viewer = await getCurrentViewer();
  const currentPath = routePath(slug);
  if (!viewer) redirect(`/ruang-sosmed/login?next=${encodeURIComponent(currentPath)}`);

  if (slug.length === 0) {
    return <AppShell viewer={viewer} active="dashboard">{viewer.isAdmin ? <WorkspaceChooser viewer={viewer} /> : <BootcampDashboard viewer={viewer} {...await getBootcampOverview(viewer)} />}</AppShell>;
  }

  if (slug[0] === 'batch') {
    if (!viewer.isAdmin) redirect('/ruang-sosmed');
    if (!slug[1]) return <AppShell viewer={viewer} active="bootcamp"><BootcampDashboard viewer={viewer} {...await getBootcampOverview(viewer)} /></AppShell>;
    const data = await getBootcampWorkspace(viewer, slug[1]);
    if (!data) notFound();
    return <AppShell viewer={viewer} active="bootcamp"><div className="mb-6"><Link href="/ruang-sosmed/batch" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950"><ArrowLeft aria-hidden="true" size={17} /> Semua batch</Link></div><BootcampWorkspaceView viewer={viewer} data={data} /></AppShell>;
  }

  if (slug[0] === 'admin' && slug[1] === 'templates') {
    if (!viewer.isAdmin) redirect('/ruang-sosmed');
    return <AppShell viewer={viewer} active="templates"><QuizTemplatesView templates={await getQuizTemplates()} /></AppShell>;
  }

  if (slug.length === 1) {
    const data = await getBootcampWorkspace(viewer, slug[0]);
    if (!data) notFound();
    return <AppShell viewer={viewer} active="bootcamp"><BootcampWorkspaceView viewer={viewer} data={data} /></AppShell>;
  }

  notFound();
}
