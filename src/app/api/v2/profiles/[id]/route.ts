import { NextResponse } from 'next/server';
import { assertCurrentAdmin } from '@/lib/auth/context';
import {
  BootcampMembershipInputError,
  BootcampNotFoundError,
  renameBootcampProfile,
} from '@/lib/bootcamp/mutations';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const viewer = await assertCurrentAdmin();
    const { id } = await params;
    const profile = await renameBootcampProfile(viewer.id, id, await request.json());
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    if (error instanceof BootcampMembershipInputError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    if (error instanceof BootcampNotFoundError) return NextResponse.json({ success: false, error: 'Profil siswa tidak ditemukan.' }, { status: 404 });
    if (error instanceof Error && error.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Akses administrator diperlukan.' }, { status: 403 });
    return NextResponse.json({ success: false, error: 'Profil siswa tidak dapat diperbarui.' }, { status: 500 });
  }
}
