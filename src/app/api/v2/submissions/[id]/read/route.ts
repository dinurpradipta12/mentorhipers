import { NextResponse } from 'next/server';
import { getCurrentViewer } from '@/lib/auth/context';
import {
  BootcampInputError,
  BootcampNotFoundError,
  markBootcampFeedbackRead,
} from '@/lib/bootcamp/mutations';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const viewer = await getCurrentViewer();
  if (!viewer) {
    return NextResponse.json({ success: false, error: 'Login diperlukan.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await markBootcampFeedbackRead(viewer.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof BootcampNotFoundError) {
      return NextResponse.json({ success: false, error: 'Submission tidak ditemukan.' }, { status: 404 });
    }
    if (error instanceof BootcampInputError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Status feedback tidak dapat diperbarui.' }, { status: 500 });
  }
}
