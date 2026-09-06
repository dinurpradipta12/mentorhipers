import 'server-only';

export function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!configured) {
    throw new Error('Application configuration is missing: set NEXT_PUBLIC_APP_URL.');
  }

  try {
    const parsed = new URL(configured);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error('invalid protocol');
    }
    return parsed.origin;
  } catch {
    throw new Error('NEXT_PUBLIC_APP_URL must be a valid HTTP(S) URL.');
  }
}
