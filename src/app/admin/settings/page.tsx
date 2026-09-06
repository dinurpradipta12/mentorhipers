import { AppShell } from '@/components/app/AppShell';
import { getCurrentViewer } from '@/lib/auth/context';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const viewer = await getCurrentViewer();
  if (!viewer) return null;
  return <AppShell viewer={viewer} active="settings"><section className="space-y-6"><div><p className="rc-eyebrow">Settings</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Pengaturan Ruang Campus</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Identitas pengguna diverifikasi oleh Supabase Auth. Otorisasi admin berasal dari role database, bukan localStorage browser.</p></div><section className="rc-card max-w-2xl p-6"><h2 className="text-lg font-extrabold text-slate-950">Akun administrator</h2><dl className="mt-5 divide-y divide-slate-100 text-sm"><div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between"><dt className="font-semibold text-slate-500">Nama</dt><dd className="font-bold text-slate-800">{viewer.fullName || 'Belum diatur'}</dd></div><div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between"><dt className="font-semibold text-slate-500">Email</dt><dd className="font-bold text-slate-800">{viewer.email || 'Tidak tersedia'}</dd></div><div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between"><dt className="font-semibold text-slate-500">Role</dt><dd className="font-bold text-slate-800">{viewer.platformRoles.join(', ') || viewer.legacyProfileRole || 'Belum ditetapkan'}</dd></div></dl></section></section></AppShell>;
}
