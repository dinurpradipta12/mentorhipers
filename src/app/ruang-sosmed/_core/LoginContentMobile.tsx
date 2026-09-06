'use client';

import { LoginForm } from '@/components/auth/LoginForm';

/**
 * Compatibility entry point for the retired visual shell. It intentionally
 * delegates to the secure server-backed login form: no fake account, browser
 * admin marker, username-domain guessing, or localStorage authorization.
 */
export default function LoginContentMobile() {
  return <LoginForm nextPath="/ruang-sosmed" />;
}
