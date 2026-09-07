import { NextResponse } from 'next/server';
import { assertCurrentAdmin } from '@/lib/auth/context';
import {
  BootcampInputError,
  BootcampNotFoundError,
  updateBootcampBatch,
} from '@/lib/bootcamp/mutations';

function responseForError(error: unknown) {
  if (error instanceof BootcampInputError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (error instanceof BootcampNotFoundError) return NextResponse.json({ success: false, error: 'Batch Bootcamp tidak ditemukan.' }, { status: 404 });
  if (error instanceof Error && error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Akses administrator diperlukan.' }, { status: 403 });
  return NextResponse.json({ success: false, error: 'Batch Bootcamp tidak dapat diperbarui.' }, { status: 500 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertCurrentAdmin();
    const { id } = await params;
    const batch = await updateBootcampBatch(id, await request.json());
    return NextResponse.json({ success: true, batch });
  } catch (error) {
    return responseForError(error);
  }
}
