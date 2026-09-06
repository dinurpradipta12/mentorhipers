import 'server-only';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { BootcampInputError, parseSubmissionGradeUpdate } from './grade-input';

export { BootcampInputError, isBootcampUuid, parseSubmissionGradeUpdate } from './grade-input';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,40}$/;

export class BootcampNotFoundError extends Error {
  constructor() {
    super('BOOTCAMP_NOT_FOUND');
    this.name = 'BootcampNotFoundError';
  }
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BootcampInputError('Data permintaan tidak valid.');
  return value as Record<string, unknown>;
}

function uuid(value: unknown, label: string): string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) throw new BootcampInputError(`${label} tidak valid.`);
  return value;
}

function text(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== 'string') throw new BootcampInputError(`${label} wajib diisi.`);
  const normalized = value.trim();
  if (!normalized) throw new BootcampInputError(`${label} wajib diisi.`);
  if (normalized.length > maxLength) throw new BootcampInputError(`${label} terlalu panjang.`);
  return normalized;
}

function optionalText(value: unknown, label: string, maxLength: number): string | null {
  if (value === null || value === undefined || value === '') return null;
  return text(value, label, maxLength);
}

async function assertBatch(workspaceId: string): Promise<void> {
  const { data, error } = await getSupabaseAdminClient()
    .from('v2_workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('type', 'batch')
    .maybeSingle();
  if (error) throw new Error('Unable to verify Bootcamp batch.');
  if (!data) throw new BootcampNotFoundError();
}

async function createMembership(workspaceId: string, profileId: string): Promise<void> {
  const admin = getSupabaseAdminClient();
  const { data: existing, error: existingError } = await admin
    .from('v2_memberships')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('profile_id', profileId)
    .maybeSingle();
  if (existingError) throw new Error('Unable to verify student membership.');
  if (existing) throw new BootcampInputError('Siswa sudah terdaftar pada batch ini.');

  const { error } = await admin.from('v2_memberships').insert({
    workspace_id: workspaceId,
    profile_id: profileId,
    role: 'student',
  });
  if (error) throw new Error('Unable to add student to Bootcamp batch.');
}

type RegisterExistingStudent = {
  kind: 'existing';
  workspaceId: string;
  profileId: string;
};

type RegisterNewStudent = {
  kind: 'new';
  workspaceId: string;
  fullName: string;
  username: string;
  email: string;
  password: string;
};

function parseRegistrationInput(value: unknown): RegisterExistingStudent | RegisterNewStudent {
  const input = record(value);
  const workspaceId = uuid(input.workspaceId, 'Batch');
  const profileId = optionalText(input.profileId, 'Profil siswa', 64);
  if (profileId) return { kind: 'existing', workspaceId, profileId: uuid(profileId, 'Profil siswa') };

  const fullName = text(input.fullName, 'Nama siswa', 180);
  const username = text(input.username, 'Username', 40).toLowerCase();
  if (!USERNAME_PATTERN.test(username)) throw new BootcampInputError('Username hanya boleh berisi huruf, angka, titik, garis bawah, atau strip.');
  const email = text(input.email, 'Email siswa', 254).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw new BootcampInputError('Email siswa tidak valid.');
  const password = text(input.password, 'Kata sandi', 256);
  if (password.length < 8) throw new BootcampInputError('Kata sandi baru minimal 8 karakter.');
  return { kind: 'new', workspaceId, fullName, username, email, password };
}

/**
 * Link an existing Auth/profile account, or create one deliberately with the
 * student email supplied by an administrator. No synthetic domain or browser
 * password storage is used.
 */
export async function registerBootcampStudent(input: unknown): Promise<{ profileId: string; created: boolean }> {
  const parsed = parseRegistrationInput(input);
  await assertBatch(parsed.workspaceId);
  const admin = getSupabaseAdminClient();

  if (parsed.kind === 'existing') {
    const { data: profile, error } = await admin.from('v2_profiles').select('id').eq('id', parsed.profileId).maybeSingle();
    if (error) throw new Error('Unable to verify student profile.');
    if (!profile) throw new BootcampInputError('Profil siswa tidak ditemukan.');
    await createMembership(parsed.workspaceId, parsed.profileId);
    return { profileId: parsed.profileId, created: false };
  }

  const [usernameResult, emailResult] = await Promise.all([
    admin.from('v2_profiles').select('id').eq('username', parsed.username).maybeSingle(),
    admin.from('v2_profiles').select('id').eq('email', parsed.email).maybeSingle(),
  ]);
  if (usernameResult.error || emailResult.error) throw new Error('Unable to verify existing student.');
  if (usernameResult.data || emailResult.data) throw new BootcampInputError('Username atau email sudah terhubung ke siswa lain. Gunakan profileId untuk mendaftarkan akun yang ada.');

  let createdUserId: string | null = null;
  try {
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: parsed.email,
      password: parsed.password,
      email_confirm: true,
      user_metadata: { full_name: parsed.fullName, username: parsed.username },
    });
    if (authError || !authData.user) throw new BootcampInputError('Akun Auth siswa tidak dapat dibuat. Periksa apakah email sudah dipakai.');
    createdUserId = authData.user.id;

    const { error: profileError } = await admin.from('v2_profiles').insert({
      id: createdUserId,
      full_name: parsed.fullName,
      username: parsed.username,
      email: parsed.email,
      role: 'student',
    });
    if (profileError) throw new Error('Unable to create student profile.');
    await createMembership(parsed.workspaceId, createdUserId);
    return { profileId: createdUserId, created: true };
  } catch (error) {
    // Auth and database writes cannot share one transaction. Compensate only
    // for the fresh user created in this request; never touch a legacy user.
    if (createdUserId) {
      await admin.from('v2_profiles').delete().eq('id', createdUserId);
      await admin.auth.admin.deleteUser(createdUserId);
    }
    throw error;
  }
}

export type SafeSchedule = {
  title: string;
  date: string | null;
  time: string | null;
  meet_link: string | null;
};

function parseMeetingLink(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  const candidate = text(value, 'Link meeting', 2_000);
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('unsafe');
    return url.toString();
  } catch {
    throw new BootcampInputError('Link meeting harus berupa URL HTTPS yang valid.');
  }
}

export function parseSchedules(value: unknown): SafeSchedule[] {
  if (!Array.isArray(value) || value.length > 200) throw new BootcampInputError('Jadwal harus berupa daftar dengan maksimal 200 pertemuan.');
  return value.map((item, index) => {
    const schedule = record(item);
    const date = optionalText(schedule.date, `Tanggal jadwal ${index + 1}`, 40);
    if (date && Number.isNaN(new Date(date).getTime())) throw new BootcampInputError(`Tanggal jadwal ${index + 1} tidak valid.`);
    return {
      title: text(schedule.title, `Judul jadwal ${index + 1}`, 180),
      date,
      time: optionalText(schedule.time, `Waktu jadwal ${index + 1}`, 40),
      meet_link: parseMeetingLink(schedule.meet_link),
    };
  });
}

export async function updateBootcampSchedules(workspaceIdValue: unknown, schedulesValue: unknown): Promise<SafeSchedule[]> {
  const workspaceId = uuid(workspaceIdValue, 'Batch');
  const schedules = parseSchedules(schedulesValue);
  await assertBatch(workspaceId);
  const { error } = await getSupabaseAdminClient().from('v2_workspaces').update({ schedules }).eq('id', workspaceId).eq('type', 'batch');
  if (error) throw new Error('Unable to update Bootcamp schedules.');
  return schedules;
}

export class BootcampGradeAuditUnavailableError extends Error {
  constructor() {
    super('BOOTCAMP_GRADE_AUDIT_UNAVAILABLE');
    this.name = 'BootcampGradeAuditUnavailableError';
  }
}

function isMissingGradeAudit(error: { code?: string; message?: string } | null): boolean {
  return error?.code === 'PGRST202' || error?.code === '42883' || /record_bootcamp_submission_grade|bootcamp_grade_audit_logs/i.test(error?.message ?? '');
}

/**
 * The SQL function locks the target submission, writes its before/after audit
 * row, then updates it in one database transaction. There is deliberately no
 * fallback direct update when the audit migration is absent.
 */
export async function updateBootcampSubmissionGrade(actorId: string, value: unknown): Promise<Record<string, unknown>> {
  const parsed = parseSubmissionGradeUpdate(value);
  await assertBatch(parsed.workspaceId);
  const admin = getSupabaseAdminClient();
  const { error } = await admin.rpc('record_bootcamp_submission_grade', {
    p_workspace_id: parsed.workspaceId,
    p_submission_id: parsed.submissionId,
    p_actor_id: uuid(actorId, 'Administrator'),
    p_set_grade: parsed.setGrade,
    p_grade: parsed.grade,
    p_set_status: parsed.setStatus,
    p_status: parsed.status,
    p_set_feedback: parsed.setFeedback,
    p_feedback: parsed.feedback,
    p_set_criteria_scores: parsed.setCriteriaScores,
    p_criteria_scores: parsed.criteriaScores,
    p_reason: parsed.reason,
  });
  if (error) {
    if (isMissingGradeAudit(error)) throw new BootcampGradeAuditUnavailableError();
    throw new Error('Unable to update Bootcamp submission grade.');
  }

  const { data, error: readError } = await admin
    .from('v2_submissions')
    .select('id, workspace_id, profile_id, curriculum_id, status, grade, mentor_feedback, criteria_scores, graded_at')
    .eq('id', parsed.submissionId)
    .eq('workspace_id', parsed.workspaceId)
    .maybeSingle();
  if (readError) throw new Error('Unable to read updated Bootcamp submission.');
  if (!data) throw new BootcampNotFoundError();
  return data as Record<string, unknown>;
}
