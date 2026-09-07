import { NextResponse } from 'next/server';
import { assertCurrentAdmin } from '@/lib/auth/context';
import {
  BootcampGroupInputError,
  BootcampNotFoundError,
  deleteBootcampAssignmentGroup,
  updateBootcampAssignmentGroup,
} from '@/lib/bootcamp/mutations';

function responseForError(error: unknown, fallback: string) {
  if (error instanceof BootcampGroupInputError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (error instanceof BootcampNotFoundError) return NextResponse.json({ success: false, error: 'Grup Bootcamp tidak ditemukan.' }, { status: 404 });
  if (error instanceof Error && error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Akses administrator diperlukan.' }, { status: 403 });
  return NextResponse.json({ success: false, error: fallback }, { status: 500 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertCurrentAdmin();
    const { id } = await params;
    const group = await updateBootcampAssignmentGroup(id, await request.json());
    return NextResponse.json({ success: true, group });
  } catch (error) {
    return responseForError(error, 'Grup Bootcamp tidak dapat diperbarui.');
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertCurrentAdmin();
    const { id } = await params;
    const payload = await request.json() as { workspaceId?: unknown };
    await deleteBootcampAssignmentGroup(id, payload.workspaceId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return responseForError(error, 'Grup Bootcamp tidak dapat dihapus.');
  }
}
