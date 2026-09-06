import { NextResponse } from 'next/server';
import { assertCurrentAdmin } from '@/lib/auth/context';
import {
  BootcampGradeAuditUnavailableError,
  BootcampInputError,
  BootcampNotFoundError,
  updateBootcampSubmissionGrade,
} from '@/lib/bootcamp/mutations';

type Context = { params: Promise<{ id: string }> };

function responseForError(error: unknown) {
  if (error instanceof BootcampInputError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (error instanceof BootcampNotFoundError) return NextResponse.json({ success: false, error: 'Submission Bootcamp tidak ditemukan.' }, { status: 404 });
  if (error instanceof BootcampGradeAuditUnavailableError) return NextResponse.json({ success: false, error: 'Audit grading belum dimigrasikan ke database target.' }, { status: 503 });
  if (error instanceof Error && error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Akses administrator diperlukan.' }, { status: 403 });
  return NextResponse.json({ success: false, error: 'Nilai submission tidak dapat diperbarui.' }, { status: 500 });
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const viewer = await assertCurrentAdmin();
    const { id } = await params;
    const payload = await request.json();
    const input = payload && typeof payload === 'object' && !Array.isArray(payload)
      ? { ...(payload as Record<string, unknown>), submissionId: id }
      : payload;
    const submission = await updateBootcampSubmissionGrade(viewer.id, input);
    return NextResponse.json({ success: true, submission });
  } catch (error) {
    return responseForError(error);
  }
}
