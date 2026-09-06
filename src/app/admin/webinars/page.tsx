export const dynamic = 'force-dynamic';

import { AppShell } from '@/components/app/AppShell';
import { WebinarAdminList } from '@/components/webinars/WebinarAdminList';
import { getCurrentViewer } from '@/lib/auth/context';
import { listAdminWebinars } from '@/lib/webinars/repository';

export default async function WebinarsPage() {
  const viewer = await getCurrentViewer();
  if (!viewer?.isAdmin) return null;
  const webinars = await listAdminWebinars();
  return <AppShell viewer={viewer} active="webinars"><WebinarAdminList webinars={webinars} /></AppShell>;
}
