import { NextResponse } from 'next/server';
import { assertCurrentAdmin } from '@/lib/auth/context';
import {
  BootcampAnnouncementInputError,
  BootcampNotFoundError,
  createBootcampAnnouncement,
  listBootcampAnnouncements,
} from '@/lib/bootcamp/mutations';

function responseForError(error: unknown, fallback: string) {
  if (error instanceof BootcampAnnouncementInputError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (error instanceof BootcampNotFoundError) return NextResponse.json({ success: false, error: 'Batch Bootcamp tidak ditemukan.' }, { status: 404 });
  if (error instanceof Error && error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Akses administrator diperlukan.' }, { status: 403 });
  return NextResponse.json({ success: false, error: fallback }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    await assertCurrentAdmin();
    const workspaceId = new URL(request.url).searchParams.get('workspaceId');
    const announcements = await listBootcampAnnouncements(workspaceId);
    return NextResponse.json({ success: true, announcements });
  } catch (error) {
    return responseForError(error, 'Pengumuman Bootcamp tidak dapat dimuat.');
  }
}

export async function POST(request: Request) {
  try {
    const viewer = await assertCurrentAdmin();
    const announcement = await createBootcampAnnouncement(viewer.id, await request.json());
    return NextResponse.json({ success: true, announcement }, { status: 201 });
  } catch (error) {
    return responseForError(error, 'Pengumuman Bootcamp tidak dapat dibuat.');
  }
}
