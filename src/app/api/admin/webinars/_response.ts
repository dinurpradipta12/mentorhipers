import { NextResponse } from 'next/server';
import { InputError } from '@/lib/webinars/validation';
import { WebinarNotFoundError, WebinarSchemaUnavailableError } from '@/lib/webinars/repository';

export function apiError(error: unknown) {
  if (error instanceof InputError) return NextResponse.json({ error: error.message }, { status: 400 });
  if (error instanceof WebinarNotFoundError) return NextResponse.json({ error: 'Webinar tidak ditemukan.' }, { status: 404 });
  if (error instanceof WebinarSchemaUnavailableError) return NextResponse.json({ error: 'Webinar LMS belum dimigrasikan ke database target.' }, { status: 503 });
  if (error instanceof Error && error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Akses administrator diperlukan.' }, { status: 403 });
  return NextResponse.json({ error: 'Permintaan tidak dapat diproses.' }, { status: 500 });
}
