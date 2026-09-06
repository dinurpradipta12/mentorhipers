import { redirect } from 'next/navigation';

export default function LegacyLoginRedirect() {
  redirect('/ruang-sosmed/login');
}
