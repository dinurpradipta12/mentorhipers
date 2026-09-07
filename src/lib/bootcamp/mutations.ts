import 'server-only';

import { randomInt } from 'node:crypto';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { BootcampInputError, parseSubmissionGradeUpdate } from './grade-input';
import {
  parseBootcampAnnouncementId,
  parseBootcampAnnouncementInput,
} from './announcement-input';
import {
  BootcampGroupInputError,
  parseBootcampGroupId,
  parseBootcampGroupInput,
} from './group-input';
import {
  parseBootcampQuizTemplateId,
  parseBootcampQuizTemplateInput,
} from './template-input';
import {
  BootcampSubmissionInputError,
  parseBootcampAssignmentSubmission,
  type BootcampAssignmentSubmissionInput,
} from './submissions';
import {
  parseBootcampMembershipPatch,
  parseBootcampProfileName,
} from './membership-input';
import { BootcampCurriculumInputError, parseBootcampCurriculumInput } from './curriculum-input';

export { BootcampInputError, isBootcampUuid, parseSubmissionGradeUpdate } from './grade-input';
export {
  BootcampAnnouncementInputError,
  parseBootcampAnnouncementId,
  parseBootcampAnnouncementInput,
} from './announcement-input';
export { BootcampGroupInputError, parseBootcampGroupId, parseBootcampGroupInput } from './group-input';
export { BootcampQuizTemplateInputError, parseBootcampQuizTemplateId, parseBootcampQuizTemplateInput } from './template-input';
export { BootcampSubmissionInputError, parseBootcampAssignmentSubmission } from './submissions';
export {
  BootcampMembershipInputError,
  parseBootcampMembershipPatch,
  parseBootcampProfileName,
} from './membership-input';
export { BootcampCurriculumInputError, parseBootcampCurriculumInput } from './curriculum-input';

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

const BATCH_STATUSES = new Set(['draft', 'active', 'completed', 'archived', 'inactive']);

type ParsedBatchInput = {
  name: string;
  description: string | null;
  status: string;
  maxMembers: string | null;
  startDate: string | null;
  endDate: string | null;
  schedules: SafeSchedule[];
};

function optionalDate(value: unknown, label: string): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new BootcampInputError(`${label} harus menggunakan format YYYY-MM-DD.`);
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new BootcampInputError(`${label} tidak valid.`);
  }
  return value;
}

function parseBatchInput(value: unknown): ParsedBatchInput {
  const input = record(value);
  const name = text(input.name, 'Nama batch', 180);
  const statusValue = input.status === undefined ? 'active' : text(input.status, 'Status batch', 32).toLowerCase();
  if (!BATCH_STATUSES.has(statusValue)) throw new BootcampInputError('Status batch tidak valid.');

  const rawMaxMembers = input.maxMembers;
  let maxMembers: string | null = null;
  if (rawMaxMembers !== null && rawMaxMembers !== undefined && rawMaxMembers !== '') {
    const normalized = typeof rawMaxMembers === 'number'
      ? Number.isSafeInteger(rawMaxMembers) ? String(rawMaxMembers) : ''
      : text(rawMaxMembers, 'Kapasitas siswa', 12);
    if (!/^\d{1,6}$/.test(normalized) || Number(normalized) < 0) throw new BootcampInputError('Kapasitas siswa harus berupa angka non-negatif.');
    maxMembers = normalized;
  }

  const startDate = optionalDate(input.startDate, 'Tanggal mulai');
  const endDate = optionalDate(input.endDate, 'Tanggal selesai');
  if (startDate && endDate && startDate > endDate) throw new BootcampInputError('Tanggal selesai tidak boleh sebelum tanggal mulai.');

  const schedules = input.schedules === undefined ? [] : parseSchedules(input.schedules);
  return {
    name,
    description: optionalText(input.description, 'Deskripsi batch', 10_000),
    status: statusValue,
    maxMembers,
    startDate,
    endDate,
    schedules,
  };
}

const BATCH_SELECT = 'id, name, description, status, type, max_members, start_date, end_date, schedules, created_at, updated_at';

export async function createBootcampBatch(value: unknown): Promise<Record<string, unknown>> {
  const parsed = parseBatchInput(value);
  const { data, error } = await getSupabaseAdminClient()
    .from('v2_workspaces')
    .insert({
      name: parsed.name,
      description: parsed.description,
      status: parsed.status,
      type: 'batch',
      max_members: parsed.maxMembers,
      start_date: parsed.startDate,
      end_date: parsed.endDate,
      schedules: parsed.schedules,
    })
    .select(BATCH_SELECT)
    .single();
  if (error || !data) throw new Error('Unable to create Bootcamp batch.');
  return data as Record<string, unknown>;
}

export async function updateBootcampBatch(workspaceIdValue: unknown, value: unknown): Promise<Record<string, unknown>> {
  const workspaceId = uuid(workspaceIdValue, 'Batch');
  const parsed = parseBatchInput(value);
  await assertBatch(workspaceId);
  const { data, error } = await getSupabaseAdminClient()
    .from('v2_workspaces')
    .update({
      name: parsed.name,
      description: parsed.description,
      status: parsed.status,
      max_members: parsed.maxMembers,
      start_date: parsed.startDate,
      end_date: parsed.endDate,
      schedules: parsed.schedules,
    })
    .eq('id', workspaceId)
    .eq('type', 'batch')
    .select(BATCH_SELECT)
    .maybeSingle();
  if (error) throw new Error('Unable to update Bootcamp batch.');
  if (!data) throw new BootcampNotFoundError();
  return data as Record<string, unknown>;
}

function isPublishedCurriculum(value: unknown): boolean {
  return ['true', 't', '1', 'yes'].includes(String(value ?? '').toLowerCase());
}

type AssignmentContext = {
  input: BootcampAssignmentSubmissionInput;
  actorId: string;
  assignmentGroupId: string | null;
  groupProfileIds: string[];
};

async function resolveAssignmentContext(actorIdValue: unknown, inputValue: unknown): Promise<AssignmentContext> {
  const actorId = uuid(actorIdValue, 'Siswa');
  const input = parseBootcampAssignmentSubmission(inputValue);
  const admin = getSupabaseAdminClient();

  const [membershipResult, curriculumResult] = await Promise.all([
    admin
      .from('v2_memberships')
      .select('id, group_name, role')
      .eq('workspace_id', input.workspaceId)
      .eq('profile_id', actorId)
      .maybeSingle(),
    admin
      .from('v2_curriculums')
      .select('id, workspace_id, type, is_published, assignment_group_id')
      .eq('id', input.curriculumId)
      .eq('workspace_id', input.workspaceId)
      .maybeSingle(),
  ]);
  if (membershipResult.error || curriculumResult.error) throw new Error('Unable to verify Bootcamp assignment.');
  if (!membershipResult.data || membershipResult.data.role === 'removed' || !curriculumResult.data || !isPublishedCurriculum(curriculumResult.data.is_published)) {
    throw new BootcampSubmissionInputError('Tugas tidak tersedia untuk akun atau batch ini.');
  }

  const type = String(curriculumResult.data.type ?? '').toLowerCase();
  if (type === 'post_test' || type === 'quiz') {
    throw new BootcampSubmissionInputError('Post-test harus dikumpulkan melalui alur quiz.');
  }

  const curriculumGroupId = typeof curriculumResult.data.assignment_group_id === 'string'
    ? curriculumResult.data.assignment_group_id
    : null;
  const assignmentGroupId = curriculumGroupId;
  let groupProfileIds: string[] = [];

  if (curriculumGroupId) {
    const { data: group, error: groupError } = await admin
      .from('v2_assignment_groups')
      .select('id, workspace_id')
      .eq('id', curriculumGroupId)
      .eq('workspace_id', input.workspaceId)
      .maybeSingle();
    if (groupError) throw new Error('Unable to verify Bootcamp assignment group.');
    if (!group) throw new BootcampSubmissionInputError('Grup tugas tidak tersedia pada batch ini.');

    const { data: groupMembers, error: groupMembersError } = await admin
      .from('v2_assignment_group_members')
      .select('profile_id')
      .eq('group_id', curriculumGroupId);
    if (groupMembersError) throw new Error('Unable to verify Bootcamp assignment group members.');
    const candidateProfileIds = (groupMembers ?? [])
      .map((row) => row.profile_id)
      .filter((profileId): profileId is string => typeof profileId === 'string' && UUID_PATTERN.test(profileId));
    const { data: enrolledMembers, error: enrolledMembersError } = candidateProfileIds.length === 0
      ? { data: [], error: null }
      : await admin
        .from('v2_memberships')
        .select('profile_id, role')
        .eq('workspace_id', input.workspaceId)
        .in('profile_id', candidateProfileIds);
    if (enrolledMembersError) throw new Error('Unable to verify enrolled Bootcamp group members.');
    groupProfileIds = (enrolledMembers ?? [])
      .filter((row) => row.role !== 'removed')
      .map((row) => row.profile_id)
      .filter((profileId): profileId is string => typeof profileId === 'string' && UUID_PATTERN.test(profileId));
    if (!groupProfileIds.includes(actorId)) {
      throw new BootcampSubmissionInputError('Anda bukan anggota grup tugas ini.');
    }
  } else if ((type === 'challenge' || type === 'group_assignment') && typeof membershipResult.data.group_name === 'string' && membershipResult.data.group_name.trim()) {
    const { data: groupMembers, error: groupMembersError } = await admin
      .from('v2_memberships')
      .select('profile_id, role')
      .eq('workspace_id', input.workspaceId)
      .eq('group_name', membershipResult.data.group_name);
    if (groupMembersError) throw new Error('Unable to verify Bootcamp group members.');
    groupProfileIds = (groupMembers ?? [])
      .filter((row) => row.role !== 'removed')
      .map((row) => row.profile_id)
      .filter((profileId): profileId is string => typeof profileId === 'string' && UUID_PATTERN.test(profileId));
  }

  return { input, actorId, assignmentGroupId, groupProfileIds };
}

/**
 * Store a student assignment through the Auth-bound SSR client. The browser
 * supplies only a URL; ownership, membership, publication, and group scope
 * are resolved here. Group copies are deliberately best-effort and are made
 * with the server client after the leader submission has been accepted, so a
 * copy failure never removes the original student work.
 */
export async function submitBootcampAssignment(actorIdValue: unknown, inputValue: unknown): Promise<{ submission: Record<string, unknown>; clonedCount: number }> {
  const context = await resolveAssignmentContext(actorIdValue, inputValue);
  const supabase = await createServerSupabaseClient();
  const { data: submission, error: submissionError } = await supabase
    .from('v2_submissions')
    .insert({
      curriculum_id: context.input.curriculumId,
      profile_id: context.actorId,
      workspace_id: context.input.workspaceId,
      file_link: context.input.fileLink,
      assignment_group_id: context.assignmentGroupId,
    })
    .select('id, curriculum_id, profile_id, workspace_id, file_link, status, grade, mentor_feedback, is_feedback_read, created_at, criteria_scores, is_cloned, assignment_group_id')
    .single();
  if (submissionError || !submission) {
    if (submissionError?.code === '42501' || /policy|membership|published/i.test(submissionError?.message ?? '')) {
      throw new BootcampSubmissionInputError('Tugas tidak tersedia untuk akun atau batch ini.');
    }
    throw new Error('Unable to save Bootcamp assignment.');
  }

  const cloneTargets = context.groupProfileIds.filter((profileId) => profileId !== context.actorId);
  if (cloneTargets.length === 0) return { submission: submission as Record<string, unknown>, clonedCount: 0 };

  const admin = getSupabaseAdminClient();
  const { data: existingClones, error: existingCloneError } = await admin
    .from('v2_submissions')
    .select('profile_id')
    .eq('cloned_from_submission_id', submission.id);
  if (existingCloneError) {
    console.error('Bootcamp group submission clone lookup failed.');
    return { submission: submission as Record<string, unknown>, clonedCount: 0 };
  }
  const existingProfileIds = new Set((existingClones ?? []).map((row) => row.profile_id));
  const newCloneTargets = cloneTargets.filter((profileId) => !existingProfileIds.has(profileId));
  if (newCloneTargets.length === 0) return { submission: submission as Record<string, unknown>, clonedCount: 0 };

  const { error: cloneError } = await admin.from('v2_submissions').insert(newCloneTargets.map((profileId) => ({
    curriculum_id: context.input.curriculumId,
    profile_id: profileId,
    workspace_id: context.input.workspaceId,
    file_link: context.input.fileLink,
    status: 'pending',
    is_cloned: true,
    cloned_from_submission_id: submission.id,
    submitted_by_profile_id: context.actorId,
    assignment_group_id: context.assignmentGroupId,
  })));
  if (cloneError) {
    console.error('Bootcamp group submission clone failed.');
    return { submission: submission as Record<string, unknown>, clonedCount: 0 };
  }
  return { submission: submission as Record<string, unknown>, clonedCount: newCloneTargets.length };
}

export async function markBootcampFeedbackRead(actorIdValue: unknown, submissionIdValue: unknown): Promise<void> {
  const actorId = uuid(actorIdValue, 'Siswa');
  const submissionId = uuid(submissionIdValue, 'Submission');
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('v2_submissions')
    .update({ is_feedback_read: true })
    .eq('id', submissionId)
    .eq('profile_id', actorId)
    .select('id')
    .maybeSingle();
  if (error) throw new Error('Unable to mark Bootcamp feedback as read.');
  if (!data) throw new BootcampNotFoundError();
}

async function createMembership(workspaceId: string, profileId: string): Promise<void> {
  const admin = getSupabaseAdminClient();
  const { data: existing, error: existingError } = await admin
    .from('v2_memberships')
    .select('id, role')
    .eq('workspace_id', workspaceId)
    .eq('profile_id', profileId)
    .maybeSingle();
  if (existingError) throw new Error('Unable to verify student membership.');
  if (existing) {
    if (existing.role === 'removed') {
      const { error: restoreError } = await admin
        .from('v2_memberships')
        .update({ role: 'member' })
        .eq('id', existing.id)
        .eq('workspace_id', workspaceId);
      if (restoreError) throw new Error('Unable to restore student membership.');
      return;
    }
    throw new BootcampInputError('Siswa sudah terdaftar pada batch ini.');
  }

  const { error } = await admin.from('v2_memberships').insert({
    workspace_id: workspaceId,
    profile_id: profileId,
    role: 'member',
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

type BootcampGroupRecord = Record<string, unknown> & {
  members: Array<{ profile_id: string }>;
};

async function getActiveGroupProfileIds(workspaceId: string, profileIds: string[]): Promise<string[]> {
  if (profileIds.length === 0) return [];
  const { data, error } = await getSupabaseAdminClient()
    .from('v2_memberships')
    .select('profile_id, role')
    .eq('workspace_id', workspaceId)
    .in('profile_id', profileIds);
  if (error) throw new Error('Unable to verify Bootcamp group students.');
  const active = new Set((data ?? [])
    .filter((row) => row.role !== 'removed')
    .map((row) => row.profile_id)
    .filter((profileId): profileId is string => typeof profileId === 'string' && UUID_PATTERN.test(profileId)));
  const missing = profileIds.filter((profileId) => !active.has(profileId));
  if (missing.length > 0) throw new BootcampGroupInputError('Semua siswa grup harus terdaftar aktif pada batch ini.');
  return profileIds;
}

async function getGroup(workspaceId: string, groupId: string): Promise<Record<string, unknown> & { name: string }> {
  const { data, error } = await getSupabaseAdminClient()
    .from('v2_assignment_groups')
    .select('id, workspace_id, name, description, created_by, created_at')
    .eq('id', groupId)
    .eq('workspace_id', workspaceId)
    .maybeSingle();
  if (error) throw new Error('Unable to verify Bootcamp assignment group.');
  if (!data || typeof data.name !== 'string') throw new BootcampNotFoundError();
  return data as Record<string, unknown> & { name: string };
}

async function syncBootcampGroupMembers(
  workspaceId: string,
  groupId: string,
  previousName: string,
  nextName: string,
  profileIds: string[],
): Promise<void> {
  const admin = getSupabaseAdminClient();
  const { data: currentRows, error: currentError } = await admin
    .from('v2_assignment_group_members')
    .select('profile_id')
    .eq('group_id', groupId);
  if (currentError) throw new Error('Unable to read current Bootcamp group members.');
  const currentIds = (currentRows ?? [])
    .map((row) => row.profile_id)
    .filter((profileId): profileId is string => typeof profileId === 'string' && UUID_PATTERN.test(profileId));
  await getActiveGroupProfileIds(workspaceId, profileIds);

  const { data: workspaceGroups, error: groupsError } = await admin
    .from('v2_assignment_groups')
    .select('id')
    .eq('workspace_id', workspaceId);
  if (groupsError) throw new Error('Unable to read Bootcamp assignment groups.');
  const otherGroupIds = (workspaceGroups ?? [])
    .map((row) => row.id)
    .filter((id): id is string => typeof id === 'string' && id !== groupId && UUID_PATTERN.test(id));

  // A profile has at most one active assignment group at a time. Removing the
  // mapping from another group changes only the group roster; submissions and
  // grading history remain untouched in their original tables.
  if (otherGroupIds.length > 0 && profileIds.length > 0) {
    const { error: moveError } = await admin
      .from('v2_assignment_group_members')
      .delete()
      .in('group_id', otherGroupIds)
      .in('profile_id', profileIds);
    if (moveError) throw new Error('Unable to move Bootcamp group students.');
  }

  const { error: clearError } = await admin
    .from('v2_assignment_group_members')
    .delete()
    .eq('group_id', groupId);
  if (clearError) throw new Error('Unable to replace Bootcamp group members.');

  if (profileIds.length > 0) {
    const { error: insertError } = await admin
      .from('v2_assignment_group_members')
      .insert(profileIds.map((profileId) => ({ group_id: groupId, profile_id: profileId })));
    if (insertError) throw new Error('Unable to save Bootcamp group members.');
  }

  const selectedIds = new Set(profileIds);
  const removedIds = currentIds.filter((profileId) => !selectedIds.has(profileId));
  if (removedIds.length > 0) {
    const { error: clearGroupNameError } = await admin
      .from('v2_memberships')
      .update({ group_name: null, is_leader: false })
      .eq('workspace_id', workspaceId)
      .eq('group_name', previousName)
      .in('profile_id', removedIds);
    if (clearGroupNameError) throw new Error('Unable to clear previous Bootcamp group assignment.');
  }

  if (profileIds.length > 0) {
    const { error: updateGroupNameError } = await admin
      .from('v2_memberships')
      .update({ group_name: nextName })
      .eq('workspace_id', workspaceId)
      .in('profile_id', profileIds);
    if (updateGroupNameError) throw new Error('Unable to update Bootcamp group assignment.');
  }
}

async function insertBootcampGroup(
  actorId: string,
  workspaceId: string,
  name: string,
  description: string | null,
  profileIds: string[],
): Promise<BootcampGroupRecord> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from('v2_assignment_groups')
    .insert({ workspace_id: workspaceId, name, description, created_by: actorId })
    .select('id, workspace_id, name, description, created_by, created_at')
    .single();
  if (error || !data) throw new Error('Unable to create Bootcamp assignment group.');
  try {
    await syncBootcampGroupMembers(workspaceId, String(data.id), '', name, profileIds);
  } catch (error) {
    await admin.from('v2_assignment_groups').delete().eq('id', data.id).eq('workspace_id', workspaceId);
    throw error;
  }
  return { ...data as Record<string, unknown>, members: profileIds.map((profileId) => ({ profile_id: profileId })) };
}

function shuffleProfileIds(profileIds: string[]): string[] {
  const shuffled = [...profileIds];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export async function listBootcampAssignmentGroups(workspaceIdValue: unknown): Promise<BootcampGroupRecord[]> {
  const workspaceId = uuid(workspaceIdValue, 'Batch');
  await assertBatch(workspaceId);
  const admin = getSupabaseAdminClient();
  const { data: groups, error: groupsError } = await admin
    .from('v2_assignment_groups')
    .select('id, workspace_id, name, description, created_by, created_at')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true });
  if (groupsError) throw new Error('Unable to load Bootcamp assignment groups.');
  const groupIds = (groups ?? []).map((group) => group.id).filter((id): id is string => typeof id === 'string' && UUID_PATTERN.test(id));
  const { data: memberRows, error: membersError } = groupIds.length === 0
    ? { data: [], error: null }
    : await admin
      .from('v2_assignment_group_members')
      .select('group_id, profile_id')
      .in('group_id', groupIds);
  if (membersError) throw new Error('Unable to load Bootcamp group members.');
  const byGroup = new Map<string, Array<{ profile_id: string }>>();
  for (const row of memberRows ?? []) {
    if (typeof row.group_id !== 'string' || typeof row.profile_id !== 'string' || !UUID_PATTERN.test(row.profile_id)) continue;
    const list = byGroup.get(row.group_id) ?? [];
    list.push({ profile_id: row.profile_id });
    byGroup.set(row.group_id, list);
  }
  return (groups ?? []).map((group) => ({
    ...group as Record<string, unknown>,
    members: byGroup.get(String(group.id)) ?? [],
  }));
}

export async function createBootcampAssignmentGroups(actorIdValue: unknown, value: unknown): Promise<BootcampGroupRecord[]> {
  const actorId = uuid(actorIdValue, 'Administrator');
  const parsed = parseBootcampGroupInput(value);
  await assertBatch(parsed.workspaceId);
  if (parsed.mode === 'manual') {
    return [await insertBootcampGroup(actorId, parsed.workspaceId, parsed.name as string, parsed.description, parsed.profileIds)];
  }

  let profileIds = parsed.profileIds;
  if (profileIds.length === 0) {
    const { data, error } = await getSupabaseAdminClient()
      .from('v2_memberships')
      .select('profile_id, role')
      .eq('workspace_id', parsed.workspaceId);
    if (error) throw new Error('Unable to load Bootcamp students for random grouping.');
    profileIds = (data ?? [])
      .filter((row) => row.role !== 'removed')
      .map((row) => row.profile_id)
      .filter((profileId): profileId is string => typeof profileId === 'string' && UUID_PATTERN.test(profileId));
  } else {
    await getActiveGroupProfileIds(parsed.workspaceId, profileIds);
  }
  if (profileIds.length < (parsed.groupCount ?? 0)) {
    throw new BootcampGroupInputError('Jumlah siswa aktif harus minimal sama dengan jumlah grup.');
  }

  const shuffled = shuffleProfileIds(profileIds);
  const groupCount = parsed.groupCount as number;
  const buckets = Array.from({ length: groupCount }, () => [] as string[]);
  shuffled.forEach((profileId, index) => buckets[index % groupCount].push(profileId));
  const created: BootcampGroupRecord[] = [];
  try {
    for (let index = 0; index < buckets.length; index += 1) {
      created.push(await insertBootcampGroup(actorId, parsed.workspaceId, `${parsed.prefix} ${index + 1}`, parsed.description, buckets[index]));
    }
  } catch (error) {
    const admin = getSupabaseAdminClient();
    for (const group of created) {
      const createdGroupName = typeof group.name === 'string' ? group.name : null;
      const createdProfileIds = group.members.map((member) => member.profile_id);
      if (createdGroupName && createdProfileIds.length > 0) {
        await admin
          .from('v2_memberships')
          .update({ group_name: null, is_leader: false })
          .eq('workspace_id', parsed.workspaceId)
          .eq('group_name', createdGroupName)
          .in('profile_id', createdProfileIds);
      }
      await admin.from('v2_assignment_group_members').delete().eq('group_id', group.id);
      await admin.from('v2_assignment_groups').delete().eq('id', group.id).eq('workspace_id', parsed.workspaceId);
    }
    throw error;
  }
  return created;
}

export async function updateBootcampAssignmentGroup(groupIdValue: unknown, value: unknown): Promise<BootcampGroupRecord> {
  const groupId = parseBootcampGroupId(groupIdValue);
  const parsed = parseBootcampGroupInput(value);
  await assertBatch(parsed.workspaceId);
  if (parsed.mode !== 'manual' || !parsed.name) throw new BootcampGroupInputError('Perubahan grup harus menggunakan mode manual.');
  const current = await getGroup(parsed.workspaceId, groupId);
  await syncBootcampGroupMembers(parsed.workspaceId, groupId, current.name, parsed.name, parsed.profileIds);
  const { data, error } = await getSupabaseAdminClient()
    .from('v2_assignment_groups')
    .update({ name: parsed.name, description: parsed.description })
    .eq('id', groupId)
    .eq('workspace_id', parsed.workspaceId)
    .select('id, workspace_id, name, description, created_by, created_at')
    .maybeSingle();
  if (error) throw new Error('Unable to update Bootcamp assignment group.');
  if (!data) throw new BootcampNotFoundError();
  return { ...data as Record<string, unknown>, members: parsed.profileIds.map((profileId) => ({ profile_id: profileId })) };
}

export async function deleteBootcampAssignmentGroup(groupIdValue: unknown, workspaceIdValue: unknown): Promise<void> {
  const groupId = parseBootcampGroupId(groupIdValue);
  const workspaceId = uuid(workspaceIdValue, 'Batch');
  await assertBatch(workspaceId);
  const current = await getGroup(workspaceId, groupId);
  const admin = getSupabaseAdminClient();
  const [curriculumResult, submissionResult, memberResult] = await Promise.all([
    admin.from('v2_curriculums').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId).eq('assignment_group_id', groupId),
    admin.from('v2_submissions').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId).eq('assignment_group_id', groupId),
    admin.from('v2_assignment_group_members').select('profile_id').eq('group_id', groupId),
  ]);
  if (curriculumResult.error || submissionResult.error || memberResult.error) throw new Error('Unable to verify Bootcamp group history.');
  if ((curriculumResult.count ?? 0) > 0 || (submissionResult.count ?? 0) > 0) {
    throw new BootcampGroupInputError('Grup memiliki curriculum atau histori submission dan tidak dapat dihapus.');
  }
  const profileIds = (memberResult.data ?? []).map((row) => row.profile_id).filter((profileId): profileId is string => typeof profileId === 'string' && UUID_PATTERN.test(profileId));
  if (profileIds.length > 0) {
    const { error: clearError } = await admin.from('v2_memberships').update({ group_name: null, is_leader: false }).eq('workspace_id', workspaceId).eq('group_name', current.name).in('profile_id', profileIds);
    if (clearError) throw new Error('Unable to clear Bootcamp group assignment.');
  }
  const { error: deleteMembersError } = await admin.from('v2_assignment_group_members').delete().eq('group_id', groupId);
  if (deleteMembersError) throw new Error('Unable to delete Bootcamp group members.');
  const { data, error } = await admin.from('v2_assignment_groups').delete().eq('id', groupId).eq('workspace_id', workspaceId).select('id').maybeSingle();
  if (error) throw new Error('Unable to delete Bootcamp assignment group.');
  if (!data) throw new BootcampNotFoundError();
}

const ANNOUNCEMENT_SELECT = 'id, workspace_id, creator_id, category, title, summary, content, image_url, reactions, is_pinned, created_at, updated_at, gallery_images';

export async function listBootcampAnnouncements(workspaceIdValue: unknown): Promise<Array<Record<string, unknown>>> {
  const workspaceId = uuid(workspaceIdValue, 'Batch');
  await assertBatch(workspaceId);
  const { data, error } = await getSupabaseAdminClient()
    .from('v2_announcements')
    .select(ANNOUNCEMENT_SELECT)
    .eq('workspace_id', workspaceId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw new Error('Unable to load Bootcamp announcements.');
  return (data ?? []) as Array<Record<string, unknown>>;
}

export async function createBootcampAnnouncement(actorIdValue: unknown, value: unknown): Promise<Record<string, unknown>> {
  const actorId = uuid(actorIdValue, 'Administrator');
  const parsed = parseBootcampAnnouncementInput(value);
  await assertBatch(parsed.workspaceId);
  const { data, error } = await getSupabaseAdminClient()
    .from('v2_announcements')
    .insert({
      workspace_id: parsed.workspaceId,
      creator_id: actorId,
      category: parsed.category,
      title: parsed.title,
      summary: parsed.summary,
      content: parsed.content,
      image_url: parsed.imageUrl,
      gallery_images: parsed.galleryImages,
      is_pinned: parsed.isPinned,
    })
    .select(ANNOUNCEMENT_SELECT)
    .single();
  if (error || !data) throw new Error('Unable to create Bootcamp announcement.');
  return data as Record<string, unknown>;
}

export async function updateBootcampAnnouncement(announcementIdValue: unknown, value: unknown): Promise<Record<string, unknown>> {
  const announcementId = parseBootcampAnnouncementId(announcementIdValue);
  const parsed = parseBootcampAnnouncementInput(value);
  await assertBatch(parsed.workspaceId);
  const { data, error } = await getSupabaseAdminClient()
    .from('v2_announcements')
    .update({
      category: parsed.category,
      title: parsed.title,
      summary: parsed.summary,
      content: parsed.content,
      image_url: parsed.imageUrl,
      gallery_images: parsed.galleryImages,
      is_pinned: parsed.isPinned,
    })
    .eq('id', announcementId)
    .eq('workspace_id', parsed.workspaceId)
    .select(ANNOUNCEMENT_SELECT)
    .maybeSingle();
  if (error) throw new Error('Unable to update Bootcamp announcement.');
  if (!data) throw new BootcampNotFoundError();
  return data as Record<string, unknown>;
}

export async function deleteBootcampAnnouncement(announcementIdValue: unknown, workspaceIdValue: unknown): Promise<void> {
  const announcementId = parseBootcampAnnouncementId(announcementIdValue);
  const workspaceId = uuid(workspaceIdValue, 'Batch');
  await assertBatch(workspaceId);
  const { data, error } = await getSupabaseAdminClient()
    .from('v2_announcements')
    .delete()
    .eq('id', announcementId)
    .eq('workspace_id', workspaceId)
    .select('id')
    .maybeSingle();
  if (error) throw new Error('Unable to delete Bootcamp announcement.');
  if (!data) throw new BootcampNotFoundError();
}

const QUIZ_TEMPLATE_SELECT = 'id, title, description, category, questions_json, created_at, updated_at';

export async function createBootcampQuizTemplate(value: unknown): Promise<Record<string, unknown>> {
  const parsed = parseBootcampQuizTemplateInput(value);
  const { data, error } = await getSupabaseAdminClient()
    .from('v2_quiz_templates')
    .insert({
      title: parsed.title,
      description: parsed.description,
      category: parsed.category,
      questions_json: parsed.questionsJson,
    })
    .select(QUIZ_TEMPLATE_SELECT)
    .single();
  if (error || !data) throw new Error('Unable to create Bootcamp quiz template.');
  return data as Record<string, unknown>;
}

export async function updateBootcampQuizTemplate(templateIdValue: unknown, value: unknown): Promise<Record<string, unknown>> {
  const templateId = parseBootcampQuizTemplateId(templateIdValue);
  const parsed = parseBootcampQuizTemplateInput(value);
  const { data, error } = await getSupabaseAdminClient()
    .from('v2_quiz_templates')
    .update({
      title: parsed.title,
      description: parsed.description,
      category: parsed.category,
      questions_json: parsed.questionsJson,
      updated_at: new Date().toISOString(),
    })
    .eq('id', templateId)
    .select(QUIZ_TEMPLATE_SELECT)
    .maybeSingle();
  if (error) throw new Error('Unable to update Bootcamp quiz template.');
  if (!data) throw new BootcampNotFoundError();
  return data as Record<string, unknown>;
}

export async function deleteBootcampQuizTemplate(templateIdValue: unknown): Promise<void> {
  const templateId = parseBootcampQuizTemplateId(templateIdValue);
  const { data, error } = await getSupabaseAdminClient()
    .from('v2_quiz_templates')
    .delete()
    .eq('id', templateId)
    .select('id')
    .maybeSingle();
  if (error) throw new Error('Unable to delete Bootcamp quiz template.');
  if (!data) throw new BootcampNotFoundError();
}

const MEMBERSHIP_SELECT = 'id, workspace_id, profile_id, group_name, group_wa_link, is_leader, attendance, plus_points, credential_no, certificate_url, role';

export async function updateBootcampMembership(actorIdValue: unknown, membershipIdValue: unknown, value: unknown): Promise<Record<string, unknown>> {
  uuid(actorIdValue, 'Administrator');
  const membershipId = uuid(membershipIdValue, 'Membership');
  const parsed = parseBootcampMembershipPatch(value);
  await assertBatch(parsed.workspaceId);
  const admin = getSupabaseAdminClient();
  const { data: current, error: currentError } = await admin
    .from('v2_memberships')
    .select(MEMBERSHIP_SELECT)
    .eq('id', membershipId)
    .eq('workspace_id', parsed.workspaceId)
    .maybeSingle();
  if (currentError) throw new Error('Unable to verify Bootcamp membership.');
  if (!current) throw new BootcampNotFoundError();

  const patch: Record<string, unknown> = {};
  if (Object.prototype.hasOwnProperty.call(parsed, 'role')) patch.role = parsed.role;
  if (Object.prototype.hasOwnProperty.call(parsed, 'groupName')) patch.group_name = parsed.groupName;
  if (Object.prototype.hasOwnProperty.call(parsed, 'groupWaLink')) patch.group_wa_link = parsed.groupWaLink;
  if (Object.prototype.hasOwnProperty.call(parsed, 'isLeader')) patch.is_leader = parsed.isLeader;
  if (Object.prototype.hasOwnProperty.call(parsed, 'credentialNo')) patch.credential_no = parsed.credentialNo;
  if (Object.prototype.hasOwnProperty.call(parsed, 'certificateUrl')) patch.certificate_url = parsed.certificateUrl;
  if (Object.prototype.hasOwnProperty.call(parsed, 'attendance')) patch.attendance = parsed.attendance;
  if (Object.prototype.hasOwnProperty.call(parsed, 'plusPoints')) patch.plus_points = parsed.plusPoints;

  const finalGroupName = Object.prototype.hasOwnProperty.call(parsed, 'groupName') ? parsed.groupName : current.group_name;
  if (parsed.isLeader === true) {
    const leaderQuery = admin
      .from('v2_memberships')
      .update({ is_leader: false })
      .eq('workspace_id', parsed.workspaceId)
      .neq('id', membershipId);
    const { error: leaderError } = finalGroupName === null || finalGroupName === undefined
      ? await leaderQuery.is('group_name', null)
      : await leaderQuery.eq('group_name', finalGroupName);
    if (leaderError) throw new Error('Unable to update the previous Bootcamp group leader.');
  }

  const { data, error } = await admin
    .from('v2_memberships')
    .update(patch)
    .eq('id', membershipId)
    .eq('workspace_id', parsed.workspaceId)
    .select(MEMBERSHIP_SELECT)
    .maybeSingle();
  if (error) throw new Error('Unable to update Bootcamp membership.');
  if (!data) throw new BootcampNotFoundError();
  return data as Record<string, unknown>;
}

/**
 * Removing a student is a soft access change. The membership row, grades,
 * attendance, and group history stay intact under role=removed and can be
 * restored by registering the same profile again.
 */
export async function removeBootcampMembership(actorIdValue: unknown, membershipIdValue: unknown, workspaceIdValue: unknown): Promise<void> {
  uuid(actorIdValue, 'Administrator');
  const membershipId = uuid(membershipIdValue, 'Membership');
  const workspaceId = uuid(workspaceIdValue, 'Batch');
  await assertBatch(workspaceId);
  const { data, error } = await getSupabaseAdminClient()
    .from('v2_memberships')
    .update({ role: 'removed' })
    .eq('id', membershipId)
    .eq('workspace_id', workspaceId)
    .select('id')
    .maybeSingle();
  if (error) throw new Error('Unable to remove Bootcamp access.');
  if (!data) throw new BootcampNotFoundError();
}

export async function renameBootcampProfile(actorIdValue: unknown, profileIdValue: unknown, value: unknown): Promise<Record<string, unknown>> {
  uuid(actorIdValue, 'Administrator');
  const profileId = uuid(profileIdValue, 'Profil siswa');
  const { fullName } = parseBootcampProfileName(value);
  const { data, error } = await getSupabaseAdminClient()
    .from('v2_profiles')
    .update({ full_name: fullName })
    .eq('id', profileId)
    .select('id, full_name, username, avatar_url')
    .maybeSingle();
  if (error) throw new Error('Unable to rename Bootcamp profile.');
  if (!data) throw new BootcampNotFoundError();
  return data as Record<string, unknown>;
}

const CURRICULUM_SELECT = 'id, workspace_id, title, description, content_rich, type, module_name, due_date, video_url, quiz_data, assets_json, is_published, points_weight, grading_mode, created_at, assignment_group_id';

function curriculumRow(value: Record<string, unknown>): Record<string, unknown> {
  return value;
}

export async function createBootcampCurriculum(value: unknown): Promise<Record<string, unknown>> {
  const parsed = parseBootcampCurriculumInput(value);
  await assertBatch(parsed.workspaceId);
  if (parsed.assignmentGroupId) {
    const { data: group, error: groupError } = await getSupabaseAdminClient()
      .from('v2_assignment_groups')
      .select('id')
      .eq('id', parsed.assignmentGroupId)
      .eq('workspace_id', parsed.workspaceId)
      .maybeSingle();
    if (groupError) throw new Error('Unable to verify assignment group.');
    if (!group) throw new BootcampCurriculumInputError('Grup assignment tidak ditemukan pada batch ini.');
  }
  const { data, error } = await getSupabaseAdminClient()
    .from('v2_curriculums')
    .insert({
      workspace_id: parsed.workspaceId,
      title: parsed.title,
      description: parsed.description,
      content_rich: parsed.contentRich,
      type: parsed.type,
      module_name: parsed.moduleName,
      due_date: parsed.dueDate,
      video_url: parsed.videoUrl,
      quiz_data: parsed.quizData,
      assets_json: parsed.assetsJson,
      is_published: parsed.isPublished ? 't' : 'f',
      points_weight: parsed.pointsWeight,
      grading_mode: parsed.gradingMode,
      assignment_group_id: parsed.assignmentGroupId,
    })
    .select(CURRICULUM_SELECT)
    .single();
  if (error || !data) throw new Error('Unable to create Bootcamp curriculum.');
  return curriculumRow(data as Record<string, unknown>);
}

export async function updateBootcampCurriculum(curriculumIdValue: unknown, value: unknown): Promise<Record<string, unknown>> {
  const curriculumId = uuid(curriculumIdValue, 'Curriculum');
  const parsed = parseBootcampCurriculumInput(value);
  await assertBatch(parsed.workspaceId);
  if (parsed.assignmentGroupId) {
    const { data: group, error: groupError } = await getSupabaseAdminClient()
      .from('v2_assignment_groups')
      .select('id')
      .eq('id', parsed.assignmentGroupId)
      .eq('workspace_id', parsed.workspaceId)
      .maybeSingle();
    if (groupError) throw new Error('Unable to verify assignment group.');
    if (!group) throw new BootcampCurriculumInputError('Grup assignment tidak ditemukan pada batch ini.');
  }
  const { data, error } = await getSupabaseAdminClient()
    .from('v2_curriculums')
    .update({
      title: parsed.title,
      description: parsed.description,
      content_rich: parsed.contentRich,
      type: parsed.type,
      module_name: parsed.moduleName,
      due_date: parsed.dueDate,
      video_url: parsed.videoUrl,
      quiz_data: parsed.quizData,
      assets_json: parsed.assetsJson,
      is_published: parsed.isPublished ? 't' : 'f',
      points_weight: parsed.pointsWeight,
      grading_mode: parsed.gradingMode,
      assignment_group_id: parsed.assignmentGroupId,
    })
    .eq('id', curriculumId)
    .eq('workspace_id', parsed.workspaceId)
    .select(CURRICULUM_SELECT)
    .maybeSingle();
  if (error) throw new Error('Unable to update Bootcamp curriculum.');
  if (!data) throw new BootcampNotFoundError();
  return curriculumRow(data as Record<string, unknown>);
}

/** Do not delete curriculum that already has student history. */
export async function deleteBootcampCurriculum(curriculumIdValue: unknown, workspaceIdValue: unknown): Promise<void> {
  const curriculumId = uuid(curriculumIdValue, 'Curriculum');
  const workspaceId = uuid(workspaceIdValue, 'Batch');
  await assertBatch(workspaceId);
  const admin = getSupabaseAdminClient();
  const [submissionResult, quizResult] = await Promise.all([
    admin.from('v2_submissions').select('id', { count: 'exact', head: true }).eq('curriculum_id', curriculumId).eq('workspace_id', workspaceId),
    admin.from('v2_quiz_results').select('id', { count: 'exact', head: true }).eq('curriculum_id', curriculumId).eq('workspace_id', workspaceId),
  ]);
  if (submissionResult.error || quizResult.error) throw new Error('Unable to verify curriculum history.');
  if ((submissionResult.count ?? 0) > 0 || (quizResult.count ?? 0) > 0) {
    throw new BootcampCurriculumInputError('Curriculum memiliki histori siswa dan tidak dapat dihapus. Ubah menjadi tidak dipublikasikan.');
  }
  const { data, error } = await admin
    .from('v2_curriculums')
    .delete()
    .eq('id', curriculumId)
    .eq('workspace_id', workspaceId)
    .select('id')
    .maybeSingle();
  if (error) throw new Error('Unable to delete Bootcamp curriculum.');
  if (!data) throw new BootcampNotFoundError();
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

export class BootcampQuizWorkflowUnavailableError extends Error {
  constructor() {
    super('BOOTCAMP_QUIZ_WORKFLOW_UNAVAILABLE');
    this.name = 'BootcampQuizWorkflowUnavailableError';
  }
}

function isMissingQuizWorkflow(error: { code?: string; message?: string } | null): boolean {
  return error?.code === 'PGRST202' || error?.code === 'PGRST205' || error?.code === '42P01' || error?.code === '42883' || /submit_bootcamp_quiz_result|relation .*v2_quiz_results.*does not exist/i.test(error?.message ?? '');
}

type QuizSubmission = {
  workspaceId: string;
  curriculumId: string;
  answers: Record<string, string | number | boolean | null>;
};

function parseQuizAnswers(value: unknown): Record<string, string | number | boolean | null> {
  const answers = record(value);
  const entries = Object.entries(answers);
  if (entries.length > 200) throw new BootcampInputError('Jawaban quiz terlalu banyak.');

  const normalized: Record<string, string | number | boolean | null> = {};
  for (const [key, answer] of entries) {
    if (!/^\d{1,3}$/.test(key)) throw new BootcampInputError('Format jawaban quiz tidak valid.');
    if (answer === null || typeof answer === 'boolean') {
      normalized[key] = answer;
      continue;
    }
    if (typeof answer === 'number') {
      if (!Number.isInteger(answer) || !Number.isSafeInteger(answer)) throw new BootcampInputError('Nilai jawaban quiz tidak valid.');
      normalized[key] = answer;
      continue;
    }
    if (typeof answer !== 'string' || answer.length > 10_000) throw new BootcampInputError('Jawaban quiz terlalu panjang.');
    normalized[key] = answer;
  }
  return normalized;
}

function parseQuizSubmission(value: unknown): QuizSubmission {
  const input = record(value);
  return {
    workspaceId: uuid(input.workspaceId, 'Batch'),
    curriculumId: uuid(input.curriculumId, 'Quiz'),
    answers: parseQuizAnswers(input.answers),
  };
}

/**
 * Submit a quiz through the authenticated Supabase SSR client. The database
 * function owns the answer key, one-attempt rule, score calculation, and
 * post-test grading-matrix sync; the browser can never provide a score.
 */
export async function submitBootcampQuizResult(value: unknown): Promise<{ resultId: string; score: number }> {
  const parsed = parseQuizSubmission(value);
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc('submit_bootcamp_quiz_result', {
    p_workspace_id: parsed.workspaceId,
    p_curriculum_id: parsed.curriculumId,
    p_answers: parsed.answers,
  });
  if (error) {
    if (isMissingQuizWorkflow(error)) throw new BootcampQuizWorkflowUnavailableError();
    if (/already been submitted|already submitted/i.test(error.message)) throw new BootcampInputError('Quiz ini sudah pernah dikumpulkan.');
    if (/membership|published quiz|Authenticated student/i.test(error.message)) throw new BootcampInputError('Quiz tidak tersedia untuk akun atau batch ini.');
    throw new Error('Unable to submit Bootcamp quiz.');
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== 'object') throw new Error('Unable to read Bootcamp quiz result.');
  const resultId = (row as Record<string, unknown>).result_id;
  const score = (row as Record<string, unknown>).score;
  if (typeof resultId !== 'string' || typeof score !== 'number') throw new Error('Unable to read Bootcamp quiz result.');
  return { resultId, score };
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
