import { NextResponse } from 'next/server';
import { getCurrentViewer } from '@/lib/auth/context';
import {
  BootcampSubmissionInputError,
  submitBootcampAssignment,
} from '@/lib/bootcamp/mutations';

function responseForError(error: unknown) {
  if (error instanceof BootcampSubmissionInputError) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
  return NextResponse.json({ success: false, error: 'Tugas tidak dapat dikumpulkan.' }, { status: 500 });
}

export async function POST(request: Request) {
  const viewer = await getCurrentViewer();
  if (!viewer) {
    return NextResponse.json({ success: false, error: 'Login diperlukan.' }, { status: 401 });
  }

  try {
    const result = await submitBootcampAssignment(viewer.id, await request.json());
    return NextResponse.json({
      success: true,
      submission: result.submission,
      clonedCount: result.clonedCount,
    }, { status: 201 });
  } catch (error) {
    return responseForError(error);
  }
}
