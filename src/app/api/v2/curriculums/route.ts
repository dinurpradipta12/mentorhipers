import { NextResponse } from 'next/server';
import { assertCurrentAdmin } from '@/lib/auth/context';
import { BootcampCurriculumInputError, BootcampNotFoundError, createBootcampCurriculum } from '@/lib/bootcamp/mutations';

function responseForError(error: unknown) {
  if (error instanceof BootcampCurriculumInputError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (error instanceof BootcampNotFoundError) return NextResponse.json({ success: false, error: 'Batch Bootcamp tidak ditemukan.' }, { status: 404 });
  if (error instanceof Error && error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Akses administrator diperlukan.' }, { status: 403 });
  return NextResponse.json({ success: false, error: 'Curriculum Bootcamp tidak dapat dibuat.' }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    await assertCurrentAdmin();
    const curriculum = await createBootcampCurriculum(await request.json());
    return NextResponse.json({ success: true, curriculum }, { status: 201 });
  } catch (error) {
    return responseForError(error);
  }
}
