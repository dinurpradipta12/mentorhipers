import { NextResponse } from 'next/server';
import { assertCurrentAdmin } from '@/lib/auth/context';
import { BootcampInputError, BootcampNotFoundError, updateBootcampSchedules } from '@/lib/bootcamp/mutations';

function responseForError(error: unknown) {
  if (error instanceof BootcampInputError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (error instanceof BootcampNotFoundError) return NextResponse.json({ success: false, error: 'Batch Bootcamp tidak ditemukan.' }, { status: 404 });
  if (error instanceof Error && error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Akses administrator diperlukan.' }, { status: 403 });
  return NextResponse.json({ success: false, error: 'Jadwal tidak dapat diperbarui.' }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    await assertCurrentAdmin();
    const payload = await request.json() as { workspaceId?: unknown; schedules?: unknown };
    const schedules = await updateBootcampSchedules(payload.workspaceId, payload.schedules);
    return NextResponse.json({ success: true, schedules });
  } catch (error) {
    return responseForError(error);
  }
}
