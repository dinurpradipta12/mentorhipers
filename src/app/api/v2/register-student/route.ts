import { NextResponse } from 'next/server';
import { assertCurrentAdmin } from '@/lib/auth/context';
import { BootcampInputError, BootcampNotFoundError, registerBootcampStudent } from '@/lib/bootcamp/mutations';

function responseForError(error: unknown) {
  if (error instanceof BootcampInputError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (error instanceof BootcampNotFoundError) return NextResponse.json({ success: false, error: 'Batch Bootcamp tidak ditemukan.' }, { status: 404 });
  if (error instanceof Error && error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Akses administrator diperlukan.' }, { status: 403 });
  return NextResponse.json({ success: false, error: 'Pendaftaran siswa tidak dapat diproses.' }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    await assertCurrentAdmin();
    const student = await registerBootcampStudent(await request.json());
    return NextResponse.json({ success: true, userId: student.profileId, created: student.created }, { status: 201 });
  } catch (error) {
    return responseForError(error);
  }
}
