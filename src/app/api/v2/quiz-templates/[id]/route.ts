import { NextResponse } from 'next/server';
import { assertCurrentAdmin } from '@/lib/auth/context';
import {
  BootcampNotFoundError,
  BootcampQuizTemplateInputError,
  deleteBootcampQuizTemplate,
  updateBootcampQuizTemplate,
} from '@/lib/bootcamp/mutations';

function responseForError(error: unknown, fallback: string) {
  if (error instanceof BootcampQuizTemplateInputError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (error instanceof BootcampNotFoundError) return NextResponse.json({ success: false, error: 'Template quiz tidak ditemukan.' }, { status: 404 });
  if (error instanceof Error && error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Akses administrator diperlukan.' }, { status: 403 });
  return NextResponse.json({ success: false, error: fallback }, { status: 500 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertCurrentAdmin();
    const { id } = await params;
    const template = await updateBootcampQuizTemplate(id, await request.json());
    return NextResponse.json({ success: true, template });
  } catch (error) {
    return responseForError(error, 'Template quiz tidak dapat diperbarui.');
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertCurrentAdmin();
    const { id } = await params;
    await deleteBootcampQuizTemplate(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return responseForError(error, 'Template quiz tidak dapat dihapus.');
  }
}
