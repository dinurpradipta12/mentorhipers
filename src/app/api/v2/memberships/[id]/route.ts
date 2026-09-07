import { NextResponse } from 'next/server';
import { assertCurrentAdmin } from '@/lib/auth/context';
import {
  BootcampMembershipInputError,
  BootcampNotFoundError,
  removeBootcampMembership,
  updateBootcampMembership,
} from '@/lib/bootcamp/mutations';

function responseForError(error: unknown, fallback: string) {
  if (error instanceof BootcampMembershipInputError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (error instanceof BootcampNotFoundError) return NextResponse.json({ success: false, error: 'Membership Bootcamp tidak ditemukan.' }, { status: 404 });
  if (error instanceof Error && error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Akses administrator diperlukan.' }, { status: 403 });
  return NextResponse.json({ success: false, error: fallback }, { status: 500 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const viewer = await assertCurrentAdmin();
    const { id } = await params;
    const membership = await updateBootcampMembership(viewer.id, id, await request.json());
    return NextResponse.json({ success: true, membership });
  } catch (error) {
    return responseForError(error, 'Membership Bootcamp tidak dapat diperbarui.');
  }
}

/** Revoke access without deleting the membership history or Auth profile. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const viewer = await assertCurrentAdmin();
    const { id } = await params;
    const payload = await request.json() as { workspaceId?: unknown };
    await removeBootcampMembership(viewer.id, id, payload.workspaceId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return responseForError(error, 'Akses siswa tidak dapat dicabut.');
  }
}
