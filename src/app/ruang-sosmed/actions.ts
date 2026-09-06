'use server';

import { assertCurrentAdmin } from '@/lib/auth/context';
import {
  BootcampGradeAuditUnavailableError,
  BootcampInputError,
  isBootcampUuid,
  registerBootcampStudent,
  updateBootcampSchedules,
  updateBootcampSubmissionGrade,
} from '@/lib/bootcamp/mutations';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

function resultForError(error: unknown, fallback: string) {
  if (error instanceof BootcampInputError) return { success: false as const, error: error.message };
  if (error instanceof BootcampGradeAuditUnavailableError) return { success: false as const, error: 'Audit grading belum dimigrasikan ke database target.' };
  if (error instanceof Error && error.message === 'FORBIDDEN') return { success: false as const, error: 'Akses administrator diperlukan.' };
  return { success: false as const, error: fallback };
}

/**
 * Compatibility server action for Bootcamp administration. A new account must
 * include a real email; existing students are linked by profileId.
 */
export async function registerStudentAction(data: {
  workspaceId: string;
  profileId?: string;
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
}) {
  try {
    await assertCurrentAdmin();
    const student = await registerBootcampStudent(data);
    return { success: true as const, userId: student.profileId, created: student.created };
  } catch (error) {
    return resultForError(error, 'Pendaftaran siswa tidak dapat diproses.');
  }
}

export async function updateWorkspaceSchedulesAction(workspaceId: string, schedules: unknown) {
  try {
    await assertCurrentAdmin();
    return { success: true as const, schedules: await updateBootcampSchedules(workspaceId, schedules) };
  } catch (error) {
    return resultForError(error, 'Jadwal tidak dapat diperbarui.');
  }
}

/** Explicit grading path. The database RPC records before/after state first;
 * it never recalculates historic final grades. */
export async function updateSubmissionGradeAction(data: Record<string, unknown>) {
  try {
    const viewer = await assertCurrentAdmin();
    return { success: true as const, submission: await updateBootcampSubmissionGrade(viewer.id, data) };
  } catch (error) {
    return resultForError(error, 'Nilai submission tidak dapat diperbarui.');
  }
}

type NotificationInput = {
  profileId: string;
  workspaceId?: string;
  title: string;
  message: string;
  type: 'material' | 'assignment' | 'grade' | 'feedback' | 'announcement';
  link?: string;
};

function safeNotificationText(value: string, label: string, maxLength: number): string {
  const text = value.trim();
  if (!text || text.length > maxLength) throw new BootcampInputError(`${label} tidak valid.`);
  return text;
}

function safeLink(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('unsafe');
    return url.toString();
  } catch {
    throw new BootcampInputError('Link notifikasi harus berupa URL HTTPS yang valid.');
  }
}

export async function createNotificationAction(data: NotificationInput) {
  try {
    await assertCurrentAdmin();
    if (!isBootcampUuid(data.profileId) || (data.workspaceId && !isBootcampUuid(data.workspaceId))) throw new BootcampInputError('Target notifikasi tidak valid.');
    if (!['material', 'assignment', 'grade', 'feedback', 'announcement'].includes(data.type)) throw new BootcampInputError('Tipe notifikasi tidak valid.');
    const { error } = await getSupabaseAdminClient().from('v2_notifications').insert({
      profile_id: data.profileId,
      workspace_id: data.workspaceId ?? null,
      title: safeNotificationText(data.title, 'Judul', 180),
      message: safeNotificationText(data.message, 'Pesan', 10_000),
      type: data.type,
      link: safeLink(data.link),
    });
    if (error) throw new Error('Unable to create notification.');
    return { success: true as const };
  } catch (error) {
    return resultForError(error, 'Notifikasi tidak dapat dibuat.');
  }
}
