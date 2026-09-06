import { NextResponse } from 'next/server';
import { assertCurrentAdmin } from '@/lib/auth/context';
import { uploadWebinarFile } from '@/lib/webinars/repository';
import { InputError } from '@/lib/webinars/validation';
import { apiError } from '../../_response';

type Context = { params: Promise<{ id: string }> };
const kinds = new Set(['cover', 'thumbnail', 'video', 'resource']);

export async function POST(request: Request, { params }: Context) {
  try {
    const viewer = await assertCurrentAdmin();
    const { id } = await params;
    const form = await request.formData();
    const kind = form.get('kind');
    const file = form.get('file');
    if (typeof kind !== 'string' || !kinds.has(kind) || !(file instanceof File)) throw new InputError('File upload tidak valid.');
    return NextResponse.json({ upload: await uploadWebinarFile(id, viewer.id, kind as 'cover' | 'thumbnail' | 'video' | 'resource', file) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
