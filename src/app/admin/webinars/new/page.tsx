import { AppShell } from '@/components/app/AppShell';
import { WebinarCreateForm } from '@/components/webinars/WebinarCreateForm';
import { getCurrentViewer } from '@/lib/auth/context';

export default async function NewWebinarPage() {
  const viewer = await getCurrentViewer();
  if (!viewer) return null;
  return <AppShell viewer={viewer} active="webinars"><WebinarCreateForm /></AppShell>;
}
