'use client';

import { LoginForm } from '@/components/auth/LoginForm';

/** See LoginContentMobile: retained only so an older import cannot resurrect
 * the previous localStorage administrator bypass. */
export default function LoginContentDesktop() {
  return <LoginForm nextPath="/ruang-sosmed" />;
}
