import { NextResponse } from 'next/server';
import { assertCurrentAdmin } from '@/lib/auth/context';
import {
  BootcampGroupInputError,
  BootcampNotFoundError,
  createBootcampAssignmentGroups,
  listBootcampAssignmentGroups,
} from '@/lib/bootcamp/mutations';

function responseForError(error: unknown, fallback: string) {
  if (error instanceof BootcampGroupInputError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (error instanceof BootcampNotFoundError) return NextResponse.json({ success: false, error: 'Batch Bootcamp tidak ditemukan.' }, { status: 404 });
  if (error instanceof Error && error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Akses administrator diperlukan.' }, { status: 403 });
  return NextResponse.json({ success: false, error: fallback }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    await assertCurrentAdmin();
    const workspaceId = new URL(request.url).searchParams.get('workspaceId');
    const groups = await listBootcampAssignmentGroups(workspaceId);
    return NextResponse.json({ success: true, groups });
  } catch (error) {
    return responseForError(error, 'Grup Bootcamp tidak dapat dimuat.');
  }
}

export async function POST(request: Request) {
  try {
    const viewer = await assertCurrentAdmin();
    const groups = await createBootcampAssignmentGroups(viewer.id, await request.json());
    return NextResponse.json({ success: true, groups }, { status: 201 });
  } catch (error) {
    return responseForError(error, 'Grup Bootcamp tidak dapat dibuat.');
  }
}
