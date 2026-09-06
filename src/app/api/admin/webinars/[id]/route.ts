import { NextResponse } from 'next/server';
import { assertCurrentAdmin } from '@/lib/auth/context';
import { archiveWebinar, getAdminWebinar, updateWebinar } from '@/lib/webinars/repository';
import { apiError } from '../_response';

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Context) {
  try {
    await assertCurrentAdmin();
    const { id } = await params;
    return NextResponse.json({ webinar: await getAdminWebinar(id) });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const viewer = await assertCurrentAdmin();
    const { id } = await params;
    return NextResponse.json({ webinar: await updateWebinar(id, viewer.id, await request.json()) });
  } catch (error) {
    return apiError(error);
  }
}

/** Archiving is intentionally used instead of destructive webinar deletion. */
export async function DELETE(_: Request, { params }: Context) {
  try {
    const viewer = await assertCurrentAdmin();
    const { id } = await params;
    return NextResponse.json({ webinar: await archiveWebinar(id, viewer.id) });
  } catch (error) {
    return apiError(error);
  }
}
