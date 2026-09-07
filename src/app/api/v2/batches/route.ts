import { NextResponse } from 'next/server';
import { assertCurrentAdmin } from '@/lib/auth/context';
import { BootcampInputError, createBootcampBatch } from '@/lib/bootcamp/mutations';

function responseForError(error: unknown) {
  if (error instanceof BootcampInputError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (error instanceof Error && error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Akses administrator diperlukan.' }, { status: 403 });
  return NextResponse.json({ success: false, error: 'Batch Bootcamp tidak dapat dibuat.' }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    await assertCurrentAdmin();
    const batch = await createBootcampBatch(await request.json());
    return NextResponse.json({ success: true, batch }, { status: 201 });
  } catch (error) {
    return responseForError(error);
  }
}
