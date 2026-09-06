type PublicSupabaseConfig = {
  url: string;
  anonKey: string;
};

function required(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Supabase configuration is missing: set ${name} before starting or building Ruang Campus.`,
    );
  }

  return value;
}

export function getPublicSupabaseConfig(): PublicSupabaseConfig {
  const url = required('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = required('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error('invalid protocol');
    }
  } catch {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP(S) URL.');
  }

  return { url, anonKey };
}

export function getServiceRoleKey(): string {
  return required('SUPABASE_SERVICE_ROLE_KEY');
}
