import { NextResponse } from 'next/server';
import { assertCurrentAdmin } from '@/lib/auth/context';
import {
  BootcampAnnouncementInputError,
  BootcampNotFoundError,
  deleteBootcampAnnouncement,
  updateBootcampAnnouncement,
} from '@/lib/bootcamp/mutations';

function responseForError(error: unknown, fallback: string) {
  if (error instanceof BootcampAnnouncementInputError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (error instanceof BootcampNotFoundError) return NextResponse.json({ success: false, error: 'Pengumuman Bootcamp tidak ditemukan.' }, { status: 404 });
  if (error instanceof Error && error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Akses administrator diperlukan.' }, { status: 403 });
  return NextResponse.json({ success: false, error: fallback }, { status: 500 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertCurrentAdmin();
    const { id } = await params;
    const announcement = await updateBootcampAnnouncement(id, await request.json());
    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    return responseForError(error, 'Pengumuman Bootcamp tidak dapat diperbarui.');
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertCurrentAdmin();
    const { id } = await params;
    const payload = await request.json() as { workspaceId?: unknown };
    await deleteBootcampAnnouncement(id, payload.workspaceId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return responseForError(error, 'Pengumuman Bootcamp tidak dapat dihapus.');
  }
}
