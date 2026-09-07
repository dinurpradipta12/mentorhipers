import { NextResponse } from 'next/server';
import { assertCurrentAdmin } from '@/lib/auth/context';
import {
  BootcampQuizTemplateInputError,
  createBootcampQuizTemplate,
} from '@/lib/bootcamp/mutations';
import { getQuizTemplates } from '@/lib/bootcamp/queries';

function responseForError(error: unknown, fallback: string) {
  if (error instanceof BootcampQuizTemplateInputError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (error instanceof Error && error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Akses administrator diperlukan.' }, { status: 403 });
  return NextResponse.json({ success: false, error: fallback }, { status: 500 });
}

export async function GET() {
  try {
    await assertCurrentAdmin();
    return NextResponse.json({ success: true, templates: await getQuizTemplates() });
  } catch (error) {
    return responseForError(error, 'Template quiz tidak dapat dimuat.');
  }
}

export async function POST(request: Request) {
  try {
    await assertCurrentAdmin();
    const template = await createBootcampQuizTemplate(await request.json());
    return NextResponse.json({ success: true, template }, { status: 201 });
  } catch (error) {
    return responseForError(error, 'Template quiz tidak dapat dibuat.');
  }
}
