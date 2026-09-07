import { NextResponse } from 'next/server';
import { assertCurrentAdmin } from '@/lib/auth/context';
import {
  BootcampCurriculumInputError,
  BootcampNotFoundError,
  deleteBootcampCurriculum,
  updateBootcampCurriculum,
} from '@/lib/bootcamp/mutations';

function responseForError(error: unknown, fallback: string) {
  if (error instanceof BootcampCurriculumInputError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (error instanceof BootcampNotFoundError) return NextResponse.json({ success: false, error: 'Curriculum Bootcamp tidak ditemukan.' }, { status: 404 });
  if (error instanceof Error && error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Akses administrator diperlukan.' }, { status: 403 });
  return NextResponse.json({ success: false, error: fallback }, { status: 500 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertCurrentAdmin();
    const { id } = await params;
    const curriculum = await updateBootcampCurriculum(id, await request.json());
    return NextResponse.json({ success: true, curriculum });
  } catch (error) {
    return responseForError(error, 'Curriculum Bootcamp tidak dapat diperbarui.');
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertCurrentAdmin();
    const { id } = await params;
    const payload = await request.json() as { workspaceId?: unknown };
    await deleteBootcampCurriculum(id, payload.workspaceId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return responseForError(error, 'Curriculum Bootcamp tidak dapat dihapus.');
  }
}
