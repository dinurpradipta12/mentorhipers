import { NextResponse } from 'next/server';
import { assertCurrentAdmin } from '@/lib/auth/context';
import { setWebinarStatus } from '@/lib/webinars/repository';
import { parseStatus } from '@/lib/webinars/validation';
import { apiError } from '../../_response';

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  try {
    const viewer = await assertCurrentAdmin();
    const { id } = await params;
    const payload = await request.json() as { status?: unknown };
    return NextResponse.json({ webinar: await setWebinarStatus(id, viewer.id, parseStatus(payload.status)) });
  } catch (error) {
    return apiError(error);
  }
}
