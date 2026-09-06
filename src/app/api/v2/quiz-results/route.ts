import { NextResponse } from 'next/server';
import { getCurrentViewer } from '@/lib/auth/context';
import {
  BootcampInputError,
  BootcampQuizWorkflowUnavailableError,
  submitBootcampQuizResult,
} from '@/lib/bootcamp/mutations';

function responseForError(error: unknown) {
  if (error instanceof BootcampInputError) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
  if (error instanceof BootcampQuizWorkflowUnavailableError) {
    return NextResponse.json(
      { success: false, error: 'Workflow quiz belum tersedia di database target.' },
      { status: 503 },
    );
  }
  return NextResponse.json({ success: false, error: 'Quiz tidak dapat dikumpulkan.' }, { status: 500 });
}

export async function POST(request: Request) {
  const viewer = await getCurrentViewer();
  if (!viewer) {
    return NextResponse.json({ success: false, error: 'Login diperlukan.' }, { status: 401 });
  }

  try {
    const result = await submitBootcampQuizResult(await request.json());
    return NextResponse.json({ success: true, resultId: result.resultId, score: result.score }, { status: 201 });
  } catch (error) {
    return responseForError(error);
  }
}
