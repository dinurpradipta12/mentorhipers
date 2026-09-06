import { NextResponse } from 'next/server';
import { assertCurrentAdmin } from '@/lib/auth/context';
import { createWebinar, listAdminWebinars } from '@/lib/webinars/repository';
import { apiError } from './_response';

export async function GET() {
  try {
    await assertCurrentAdmin();
    return NextResponse.json({ webinars: await listAdminWebinars() });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const viewer = await assertCurrentAdmin();
    const webinar = await createWebinar(viewer.id, await request.json());
    return NextResponse.json({ webinar }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
