import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  Bell,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Search,
  Settings,
  Shapes,
  Video,
} from 'lucide-react';
import type { Viewer } from '@/lib/auth/context';

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  id: string;
};

const adminNavigation: NavItem[] = [
  { id: 'dashboard', href: '/ruang-sosmed', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bootcamp', href: '/ruang-sosmed/batch', label: 'Bootcamp', icon: GraduationCap },
  { id: 'webinars', href: '/admin/webinars', label: 'Webinar LMS', icon: Video },
  { id: 'templates', href: '/ruang-sosmed/admin/templates', label: 'Quiz Templates', icon: Shapes },
  { id: 'settings', href: '/admin/settings', label: 'Settings', icon: Settings },
];

const studentNavigation: NavItem[] = [
  { id: 'dashboard', href: '/ruang-sosmed', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bootcamp', href: '/ruang-sosmed', label: 'Bootcamp', icon: BookOpen },
];

function Initials({ name }: { name: string | null }) {
  const initial = name?.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return <span aria-hidden="true">{initial || 'RC'}</span>;
}

export function AppShell({
  viewer,
  active,
  children,
}: {
  viewer: Viewer;
  active: string;
  children: ReactNode;
}) {
  const navigation = viewer.isAdmin ? adminNavigation : studentNavigation;
  const displayName = viewer.fullName || viewer.email || 'Pengguna Ruang Campus';

  return (
    <div className="min-h-dvh bg-[#f7fafc] text-slate-950">
      <aside className="rc-sidebar">
        <Link href="/ruang-sosmed" className="flex items-center gap-3 px-3 py-2" aria-label="Ruang Campus dashboard">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-600 text-lg font-black text-white shadow-sm">RC</span>
          <span>
            <span className="block text-sm font-extrabold tracking-tight text-slate-950">Ruang Campus</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">LMS Sosmed</span>
          </span>
        </Link>
        <nav aria-label="Navigasi utama" className="mt-10 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const selected = item.id === active;
            return (
              <Link key={item.id} href={item.href} className={`rc-nav-item ${selected ? 'rc-nav-item-active' : ''}`} aria-current={selected ? 'page' : undefined}>
                <Icon aria-hidden="true" size={19} strokeWidth={2.2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-3xl border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs font-bold text-teal-900">Butuh bantuan?</p>
          <p className="mt-1 text-xs leading-5 text-teal-700">Gunakan pusat pembelajaran untuk melanjutkan perjalananmu.</p>
        </div>
      </aside>

      <main className="min-h-dvh pl-0 lg:pl-[264px]">
        <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur lg:px-10">
          <label className="hidden max-w-md flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-400 md:flex">
            <Search aria-hidden="true" size={17} />
            <input aria-label="Pencarian" placeholder="Cari kelas, materi, atau webinar" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
          </label>
          <div className="ml-auto flex items-center gap-3">
            <button type="button" aria-label="Notifikasi" className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
              <Bell size={19} aria-hidden="true" />
            </button>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-900">{displayName}</p>
              <p className="text-xs text-slate-500">{viewer.isAdmin ? 'Administrator' : 'Peserta Bootcamp'}</p>
            </div>
            {viewer.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={viewer.avatarUrl} alt="Avatar profil" className="h-10 w-10 rounded-full border border-slate-200 object-cover" />
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-xs font-black text-white"><Initials name={viewer.fullName} /></span>
            )}
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="hidden rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-950 sm:block">Keluar</button>
            </form>
          </div>
        </header>
        <div className="mx-auto w-full max-w-[1600px] px-5 py-8 pb-24 sm:px-8 lg:px-10 lg:py-10">{children}</div>
      </main>

      <nav className="rc-mobile-nav" aria-label="Navigasi mobile">
        {navigation.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const selected = item.id === active;
          return (
            <Link key={item.id} href={item.href} className={`rc-mobile-nav-item ${selected ? 'rc-mobile-nav-item-active' : ''}`} aria-current={selected ? 'page' : undefined}>
              <Icon size={19} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
