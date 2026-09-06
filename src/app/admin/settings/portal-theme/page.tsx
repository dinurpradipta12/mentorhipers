import { redirect } from 'next/navigation';

export default function LegacyPortalThemeRedirect() {
  redirect('/admin/settings');
}
