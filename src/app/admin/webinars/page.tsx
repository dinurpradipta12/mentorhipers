export const dynamic = 'force-dynamic';

import { AppShell } from '@/components/app/AppShell';
import { WebinarAdminList } from '@/components/webinars/WebinarAdminList';
import { getCurrentViewer } from '@/lib/auth/context';
import { listAdminWebinars } from '@/lib/webinars/repository';

export default async function WebinarsPage() {
  const [viewer, webinars] = await Promise.all([getCurrentViewer(), listAdminWebinars()]);
  if (!viewer) return null;
  return <AppShell viewer={viewer} active="webinars"><WebinarAdminList webinars={webinars} /></AppShell>;
}
