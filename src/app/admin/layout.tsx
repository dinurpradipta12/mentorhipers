import { redirect } from 'next/navigation';
import { getCurrentViewer } from '@/lib/auth/context';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getCurrentViewer();
  if (!viewer) redirect('/ruang-sosmed/login?next=%2Fadmin%2Fwebinars');
  if (!viewer.isAdmin) redirect('/ruang-sosmed');
  return children;
}
